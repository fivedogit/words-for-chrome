

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
	$("#thread_tab_img").attr("src", "images/chat_gray.png");
	$("#trending_tab_img").attr("src", "images/trending_gray.png");
	$("#notifications_tab_img").attr("src", "images/flag_blue.png");
	$("#past_tab_img").attr("src", "images/clock_gray.png");
	$("#profile_tab_img").attr("src", "images/user_gray.png");
	
	$("#header_div_top").text("Notification Feed");
	$("#utility_div").show();
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Loading activity feed... please wait.</div>");//OK
	getNotifications();
}

function getNotifications()
{
	if (typeof bg.user_jo==="undefined" || bg.user_jo === null)
	{
		$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to view your activity feed.</div>");//OK
	}
	else
	{
		
		if (typeof bg.user_jo.activity_ids === "undefined" || bg.user_jo.activity_ids === null || bg.user_jo.activity_ids.length === 0)
		{
			$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">No activity to display.</div>");//OK
		}
		else
		{
			var sorted_activity_ids = bg.user_jo.activity_ids;
			sorted_activity_ids.sort(function(a,b){
				a = fromOtherBaseToDecimal(62, a.substring(0,7));
				b = fromOtherBaseToDecimal(62, b.substring(0,7));
				return b - a;
			});
			var main_div_string = "";
			for(var x=0; x < sorted_activity_ids.length; x++) 
			{   
				main_div_string = main_div_string + "<div class=\"complete-horiz-line-div\"></div>";
				if(x < bg.user_jo.notification_count)
					main_div_string = main_div_string + "<div id=\"feeditem_div_" + x + "\" style=\"background-color:#fffed6;padding:5px;text-align:left;" + x + "\"></div>";
				else
					main_div_string = main_div_string + "<div id=\"feeditem_div_" + x + "\" style=\"padding:5px;text-align:left;" + x + "\"></div>";
			}  
			$("#main_div_" + currentURLhash).html(main_div_string); //OK
		}
		for(var x=0; x < bg.user_jo.activity_ids.length; x++) 
		{  
			doNotificationItem(bg.user_jo.activity_ids[x], "feeditem_div_" + x);
		} 

		// now that the user has viewed this tab, reset activity count to 0
		var email = docCookies.getItem("email");
		var this_access_token = docCookies.getItem("this_access_token");
		$.ajax({
	        type: 'GET',
	        url: endpoint,
	        data: {
	            method: "resetActivityCount",
	            email: email,             // this can be called with no email
	            this_access_token: this_access_token   // this can be called with no this_access_token, bg.user_jo will just come back erroneous
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {

	            if (data.response_status === "error") 
	            {
	            	displayMessage(data.message, "red", "message_div_" + currentURLhash);
	            	if(data.error_code && data.error_code === "0000")
	        		{
	        			displayMessage("Your login has expired. Please relog.", "red");
	        			docCookies.removeItem("email"); 
	        			docCookies.removeItem("this_access_token");
	        			bg.user_jo = null;
	        			updateLogstat();
	        		}
	            }
	            else // on success reset the button image
	            {
	            	bg.user_jo.notification_count = 0;
	            	updateNotificationTabLinkImage();
	            	bg.doButtonGen(); // to avoid the reference to bg, we can just let this update on the next tab view
	            }
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	displayMessage("Ajax alert for resetActivity method.", "red", "message_div_" + currentURLhash);
	            console.log(textStatus, errorThrown);
	        } 
		});


	}
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// item ids are unique. There is only one specific like/dislike/comment in the person's notification array
// parent ids are not. The same parent item can be replied to, liked, disliked, etc, so the reference has to be randomized
function doNotificationItem(item_id, dom_id)
{
	// if like/dislike, update header, display parent
	// if reply, update header, display parent and child
	// if mention, update header, display child
	var email = docCookies.getItem("email");
	var this_access_token = docCookies.getItem("this_access_token");
	
	var item_random = makeid();
	var parent_random = makeid();
	var fids = ""; // feed item div string
	fids = fids + "<table style=\"width:100%\">";
	fids = fids + "	<tr>";
	fids = fids + "		<td class=\"notification-header-td\" id=\"header_td_" + item_random + "\">";
	fids = fids + "			<div style=\"text-align:center\"><img style=\"margin-top:16px;margin-bottom:16px\" src=\"images/ajaxSnake.gif\"></div>";
	fids = fids + "		</td>";
	fids = fids + "		<td><a href=\"#\" id=\"notification_hide_link_" + item_random + "\" style=\"text-align:right\">hide</a></td>";
	fids = fids + "	</tr>";
	fids = fids + "</table>";
	fids = fids + "<table>";
	fids = fids + "	<tr id=\"parent_tr_" + parent_random + "\" style=\"display:none\">";
	fids = fids + "		<td id=\"indent_td_" +  parent_random + "\" style=\"width:0px\"></td>";
	fids = fids + "		<td class=\"rotated-who-wrote\" id=\"you_wrote_td_" + parent_random + "\"></td>";
	fids = fids + "		<td class=\"notification-comment-td\" id=\"notification_comment_td_" + parent_random + "\">";
	fids = fids + "			<img style=\"margin-top:16px;margin-bottom:16px\" src=\"images/ajaxSnake.gif\">";
	fids = fids + "		</td>";
	fids = fids + "	</tr>";
	fids = fids + "</table>";
	fids = fids + "<table>";
	fids = fids + "	<tr id=\"item_tr_" + item_random + "\" style=\"display:none\">";
	fids = fids + "		<td id=\"indent_td_" +  item_random + "\" style=\"width:15px\"></td>";
	fids = fids + "		<td class=\"rotated-who-wrote\" id=\"they_wrote_td_" + item_random + "\"></td>";
	fids = fids + "		<td class=\"notification-comment-td\" id=\"notification_comment_td_" + item_random + "\">";
	fids = fids + "			<img style=\"margin-top:16px;margin-bottom:16px\" src=\"images/ajaxSnake.gif\">";
	fids = fids + "		</td>";
	fids = fids + "	</tr>";
	fids = fids + "</table>";
	$("#" + dom_id).html(fids);//OK
	
	$("#notification_hide_link_" + item_random).click({id: item_id, item_random: item_random}, function(event) {
		var removal_target = event.data.id;
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
	        		var temp_act_ids = bg.user_jo.activity_ids;
	        		for(var x = 0; x < temp_act_ids.length; x++)
	        		{
	        			if(temp_act_ids[x] === removal_target)
	        			{
	        				temp_act_ids.splice(x,1);
	        				break;
	        			}	
	        		}	
	        		bg.user_jo.activity_ids = temp_act_ids;
	        		doNotificationsTab();
	        	}
	        	else if(data.response_status === "error")
	        	{
	        		displayMessage(data.message, "red");
	            	if(data.error_code && data.error_code === "0000")
	        		{
	        			displayMessage("Your login has expired. Please relog.", "red");
	        			docCookies.removeItem("email"); 
	        			docCookies.removeItem("this_access_token");
	        			bg.user_jo = null;
	        			updateLogstat();
	        		}
	        	}	
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	displayMessage("Unable to hide item. (network error)");
	        	console.log(textStatus, errorThrown);
	        }
		});
		return false;
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
        	item_jo = data.item;
        	if(data.response_status === "success")
        	{	
        		var url_to_use = getSmartCutURL(data.item.pseudo_url,50);
    			var populate_parent = false;
    			var populate_item = false;
    			var headerstring = "";
        		if(item_id.endsWith("L"))
        		{
        			headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_random + "\"></a> liked your comment: ";
        			populate_parent = true;
        			populate_item = false;
        		}
        		else if(item_id.endsWith("D"))
        		{
        			headerstring = headerstring + "Someone disliked your comment: ";
        			populate_parent = true;
        			populate_item = false;
        		}
        		else if(item_id.endsWith("C"))
        		{
        			if(item_jo.parent.indexOf(".") !== -1) // parent is not a comment
        				headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_random + "\"></a> <span id=\"repliedto_or_mentioned_span_" + item_random + "\">mentioned</span> you: ";
        			else
        				headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_random + "\"></a> <span id=\"repliedto_or_mentioned_span_" + item_random + "\">replied to or mentioned</span> you: ";
        			populate_parent = true;
        			populate_item = true;
        			if(item_jo.parent.indexOf(".") !== -1) // parent is not a comment
        				populate_parent = false;
        		}
        		headerstring = headerstring + "<img id=\"google_favicon_" + item_random + "\" src=\"\" style=\"vertical-align:middle\"> <a class=\"newtab\" id=\"pseudo_link_" + item_random + "\" href=\"#\"></a>";
    			$("#header_td_" + item_random).html(headerstring);//OK
    			$("#google_favicon_" + item_random).css("src","http://www.google.com/s2/favicons?domain=" + item_jo.pseudo_url);
    			$("#pseudo_link_" + item_random).attr("href", item_jo.pseudo_url);
    			$("#pseudo_link_" + item_random).text(url_to_use);
    			if(!item_id.endsWith("D"))
    			{	
    				$("#screenname_link_" + item_random).text(item_jo.author_screenname);
        			$("#screenname_link_" + item_random).click({author_screenname: item_jo.author_screenname}, function(event) {
        		 		viewProfile(event.data.author_screenname);
        		 	});
    			}
        	}
        	
        	if(populate_item)
        	{
        		$("#item_tr_" + item_random).show();
        		if(item_jo.author_screenname === bg.user_jo.screenname) // did the person mention himself? (this can't be a like/dislike/reply)
        			$("#they_wrote_td_" + item_random).text("You wrote:");
        		else
        			$("#they_wrote_td_" + item_random).text("They wrote:");
        		if(!populate_parent)
        			$("#indent_td_" +  item_random).css("width", "0px"); // if not populating parent (happens with mention only), move item all the way to the left
        		writeComment(item_jo, "notification_comment_td_" + item_random);
        	}
        	if(populate_parent)
        	{
        		$("#parent_tr_" + parent_random).show();
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
        	        		if(item_id.endsWith("C") && parent_jo.hidden === true)
        	        		{
        	        			// parent is hidden. We don't know who wrote it.
        	        			if(item_jo.text.indexOf("@" + bg.user_jo.screenname) !== -1) // treat as a mention, although it may be mention-reply. No way of knowing.
        	        			{
        	        				$("#parent_tr_" + parent_random).hide();
        	        				$("#repliedto_or_mentioned_span_" + item_random).text("mentioned");
        	        			}
        	        			else // no mention, must be a reply.
        	        			{
        	        				$("#repliedto_or_mentioned_span_" + item_random).text("replied to");
        	        				writeComment(parent_jo, "notification_comment_td_" + parent_random);
            	        			$("#you_wrote_td_" + parent_random).text("You wrote:");
        	        			}	
        	        		}	
        	        		else if(item_id.endsWith("C") && (parent_jo.author_screenname === bg.user_jo.screenname))
        	        		{
        	        			// this is a reply... show the parent
        	        			//alert("this user wrote the parent, reply");
        	        			$("#repliedto_or_mentioned_span_" + item_random).text("replied to");
        	        			writeComment(parent_jo, "notification_comment_td_" + parent_random);
        	        			$("#you_wrote_td_" + parent_random).text("You wrote:");
        	        		}	
        	        		else if(item_id.endsWith("C") && (parent_jo.author_screenname !== bg.user_jo.screenname))
        	        		{
        	        			// this is a mention only, hide the parent
        	        			//alert("this user did not write the parent, mention");
        	        			$("#repliedto_or_mentioned_span_" + item_random).text("mentioned");
        	        			$("#parent_tr_" + parent_random).hide();
        	        		}
        	        		else if(item_id.endsWith("C"))
        	        		{
        	        			alert("past valid C options");
        	        		}
        	        		else // this is a like or dislike, show parent
        	        		{
        	        			writeComment(parent_jo, "notification_comment_td_" + parent_random);
        	        			$("#you_wrote_td_" + parent_random).text("You wrote:");
        	        		}	
        	        	}
        	        },
        	        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	        	console.log(textStatus, errorThrown);
        	        }
        		});
        	}	
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	$("#header_td_" + item_id).text("Unable to retrieve like, dislike or reply item. (network error)");
        	console.log(textStatus, errorThrown);
        } 
	});
}

