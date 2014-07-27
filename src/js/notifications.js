

/***
 *     _   _ _____ _____ _    _   _   _ _____ _____ ___________ _____ _____   ___ _____ _____ _____ _   _  _____ 
 *    | | | |_   _|  ___| |  | | | \ | |  _  |_   _|_   _|  ___|_   _/  __ \ / _ \_   _|_   _|  _  | \ | |/  ___|
 *    | | | | | | | |__ | |  | | |  \| | | | | | |   | | | |_    | | | /  \// /_\ \| |   | | | | | |  \| |\ `--. 
 *    | | | | | | |  __|| |/\| | | . ` | | | | | |   | | |  _|   | | | |    |  _  || |   | | | | | | . ` | `--. \
 *    \ \_/ /_| |_| |___\  /\  / | |\  \ \_/ / | |  _| |_| |    _| |_| \__/\| | | || |  _| |_\ \_/ / |\  |/\__/ /
 *     \___/ \___/\____/ \/  \/  \_| \_/\___/  \_/  \___/\_|    \___/ \____/\_| |_/\_/  \___/ \___/\_| \_/\____/ 
 */                                                                                                              

function doNotificationsTab()
{
	tabmode = "notifications";
	$("#thread_tab_img").attr("src", chrome.extension.getURL("images/chat_gray.png"));
	$("#trending_tab_img").attr("src", chrome.extension.getURL("images/trending_gray.png"));
	$("#notifications_tab_img").attr("src", chrome.extension.getURL("images/flag_blue.png"));
	$("#past_tab_img").attr("src", chrome.extension.getURL("images/clock_gray.png"));
	$("#profile_tab_img").attr("src", chrome.extension.getURL("images/user_gray.png"));
	
	$("#utility_header_td").text("Notification Feed");
	
	$("#utility_message_td").hide();
	$("#utility_csf_td").hide();

	$("#footer_div").html("");
	
	$("#main_div_" + currentURLhash).html("");//OK
	getNotifications();
}

function getNotifications()
{
	if (typeof user_jo==="undefined" || user_jo === null)
	{
		$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to view your activity feed.</div>");//OK
	}
	else
	{
		
		if (typeof user_jo.activity_ids === "undefined" || user_jo.activity_ids === null || user_jo.activity_ids.length === 0)
		{
			$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">No activity to display.</div>");//OK
		}
		else
		{
			var sorted_activity_ids = user_jo.activity_ids;
			sorted_activity_ids.sort(function(a,b){
				a = fromOtherBaseToDecimal(62, a.substring(0,7));
				b = fromOtherBaseToDecimal(62, b.substring(0,7));
				return b - a;
			});
			
			for(var x=0; x < sorted_activity_ids.length; x++) 
			{  
				writeUnifiedCommentContainer(sorted_activity_ids[x], "main_div_" + currentURLhash, "append");
				
				if(x < user_jo.notification_count)
				{
					$("#container_div_" + sorted_activity_ids[x]).css("background-color", "#fffed6");
				}	
			}
		}
		for(var x=0; x < user_jo.activity_ids.length; x++) 
		{  
			doNotificationItem(user_jo.activity_ids[x], "comment_div_" + user_jo.activity_ids[x]);
		} 

		// now that the user has viewed this tab, reset activity count to 0
		$.ajax({
	        type: 'GET',
	        url: endpoint,
	        data: {
	            method: "resetActivityCount",
	            email: email,             // this can be called with no email
	            this_access_token: this_access_token   // this can be called with no this_access_token, user_jo will just come back erroneous
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {

	            if (data.response_status === "error") 
	            {
	            	displayMessage(data.message, "red", "utility_message_td");
	            	if(data.error_code && data.error_code === "0000")
	        		{
	        			displayMessage("Your login has expired. Please relog.", "red");
	        			user_jo = null;
	        			updateLogstat();
	        		}
	            }
	            else // on success reset the button image
	            {
	            	user_jo.notification_count = 0;
	            	updateNotificationTabLinkImage();
	            	//bg.doButtonGen(); // to avoid the reference to bg, we can just let this update on the next tab view
	            }
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	displayMessage("Ajax alert for resetActivity method.", "red", "utility_message_td");
	            console.log(textStatus, errorThrown);
	        } 
		});


	}
}

function removeItemFromActivityIds(removal_target)
{
	$.ajax({
        type: 'GET',
        url: endpoint,
        data: {
        	email: email,
        	this_access_token: this_access_token,
            method: "removeItemFromActivityIds",
            id: removal_target
        },
        dataType: 'json',
        async: true,
        success: function (data, status) {
        	if(data.response_status === "success")
        	{
        		// remove it locally, then repopulate the activity notifications page
        		var temp_act_ids = user_jo.activity_ids;
        		for(var x = 0; x < temp_act_ids.length; x++)
        		{
        			if(temp_act_ids[x] === removal_target)
        			{
        				temp_act_ids.splice(x,1);
        				break;
        			}	
        		}	
        		user_jo.activity_ids = temp_act_ids;
        		doNotificationsTab();
        	}
        	else if(data.response_status === "error")
        	{
        		displayMessage(data.message, "red", "message_div_" + item_id);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red", "message_div_" + item_id);
        			user_jo = null;
        			updateLogstat();
        		}
        	}	
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	displayMessage("Unable to hide item. (network error)", "red", "message_div_" + item_id);
        	console.log(textStatus, errorThrown);
        }
	});
}

// item ids are unique. There is only one specific like/dislike/comment in the person's notification array
// parent ids are not. The same parent item can be replied to, liked, disliked, etc, so the reference has to be randomized
function doNotificationItem(item_id, dom_id)
{
	var container_id = item_id;
	// if like/dislike, update header, display parent
	// if reply, update header, display parent and child
	// if mention, update header, display child
	$("#header_div_" + item_id).html("<img style=\"margin-top:16px;margin-bottom:16px\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"><a href=\"#\" id=\"notification_hide_link_" + item_id + "\" style=\"text-align:right\">hide</a>");
	$("#header_div_" + item_id).show();
	
	$("#notification_hide_link_" + item_id).click({id: item_id}, function(event) { event.preventDefault();
		var removal_target = event.data.id;
		removeItemFromActivityIds(removal_target);
	});	
	
	var item_jo = null;
	var parent_jo = null;
	$.ajax({
        type: 'GET',
        url: endpoint,
        data: {
            method: "getFeedItem",
            id: item_id
        },
        dataType: 'json',
        async: true,
        success: function (data, status) {
        	if(data.response_status === "success")
        	{	
        		item_jo = data.item;
        		// note, probably best to just leave the notification in the feed as a hidden comment. 
        		// this is because if someone has a "1" for a notification, click the tab and then there's nothing... that's weird.
        		/*if(item_jo.hidden === true)
        		{
        			//alert("the reply that triggered this activity id is now hidden... just remove from activity_ids"); 
            		$("#container_div_" + item_id).remove();
            		removeItemFromActivityIds(item_id);
        		}	
        		else
        		{*/
        			var url_to_use = getSmartCutURL(data.item.pseudo_url,50);
        			var populate_parent = false;
        			var populate_item = false;
        			var headerstring = "";
            		if(item_id.endsWith("L"))
            		{
            			headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_id + "\">Someone</a> liked your comment: ";
            			populate_parent = true;
            			populate_item = false;
            		}
            		else if(item_id.endsWith("D"))
            		{
            			headerstring = headerstring + "Someone disliked your comment: ";
            			populate_parent = true;
            			populate_item = false;
            		}
            		else if(item_id.endsWith("M"))
            		{
            			headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_id + "\">Someone</a> mentioned you: ";
            			populate_parent = false;
            			populate_item = true;
            		}	
            		else if(item_id.endsWith("R"))
            		{
            			headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_id + "\">Someone</a> replied to you: ";
            			populate_parent = true;
            			populate_item = true;
            		}
            		else if(item_id.endsWith("F"))
            		{
            			headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_id + "\">Someone</a> commented on a page you're following: ";
            			populate_parent = false;
            			populate_item = true;
            		}
            		else
            		{
            			headerstring = headerstring + "Unknown activity item.";
            			populate_parent = false;
            			populate_item = false;
            		}	
            		headerstring = headerstring + "<img id=\"google_favicon_" + item_id + "\" src=\"\" style=\"vertical-align:middle\"> <a class=\"newtab\" id=\"pseudo_link_" + item_id + "\" href=\"#\"></a>";
            		$("#header_div_" + item_id).html(headerstring);//OK
            		$("#header_div_" + item_id).show();
        			$("#google_favicon_" + item_id).attr("src","http://www.google.com/s2/favicons?domain=" + item_jo.pseudo_url);
        			$("#pseudo_link_" + item_id).attr("href", item_jo.pseudo_url);
        			$("#pseudo_link_" + item_id).text(url_to_use);
        			if(!item_id.endsWith("D"))
        			{	
        				$("#screenname_link_" + item_id).text(item_jo.author_screenname);
            			$("#screenname_link_" + item_id).click({author_screenname: item_jo.author_screenname}, function(event) { event.preventDefault();
            		 		viewProfile(event.data.author_screenname);
            		 	});
        			}
        		//}	
        	}
        	else if(data.response_status === "error")
        	{ 
        		//alert("couldn't find this one remove container div?");
        		$("#container_div_" + container_id).remove();
        		removeItemFromActivityIds(item_id);
        	}
        	
        	if(populate_item) // on the notification tab, the "item" (or comment) if drawn, will NEVER have been written by this author.
        	{
        		writeComment(container_id, item_jo, "comment_div_" + item_id, true, false, true); // l/d, delete button, reply 
        		if(populate_parent)
        		{
        			$("#comment_div_" + item_id).css("margin-left", "30px");
        		}
        	}
        	else
        	{
        		$("#comment_div_" + item_id).hide();
        	}	
        	
        	if(populate_parent) // on this notification tab, the parent, if drawn, will ALWAYS have been written by this author.
        	{
        		$("#parent_div_" + item_id).show();
        		$.ajax({
        	        type: 'GET',
        	        url: endpoint,
        	        data: {
        	            method: "getFeedItem",
        	            id: item_jo.parent
        	        },
        	        dataType: 'json',
        	        async: true,
        	        success: function (data, status) {
        	        	parent_jo = data.item;
        	        	if(data.response_status === "success")
        	        	{
        	        		//$("#you_wrote_td_" + parent_random).text("You wrote"); // if we're showing the parent, this is a reply or a like/dislike. 
        	        		writeComment(container_id, parent_jo, "parent_div_" + item_id, false, true, false); // l/d, delete button, reply
        	        	}
        	        },
        	        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	        	console.log(textStatus, errorThrown);
        	        }
        		});
        	}	
        	else
        	{
        		$("#parent_div_" + item_id).hide();
        	}	
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	$("#header_td_" + item_id).text("Unable to retrieve like, dislike or reply item. (network error)");
        	console.log(textStatus, errorThrown);
        } 
	});
}

