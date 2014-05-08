

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
	$("#main_div_" + currentURLhash).css("padding", "20px");
	$("#main_div_" + currentURLhash).text("Loading activity feed... please wait.");
	getNotifications();
}

function getNotifications()
{
	if (typeof bg.user_jo==="undefined" || bg.user_jo === null)
	{
		$("#main_div_" + currentURLhash).css("padding", "20px");
		$("#main_div_" + currentURLhash).text("Log in to view your activity feed.");
	}
	else
	{
		
		if (typeof bg.user_jo.activity_ids === "undefined" || bg.user_jo.activity_ids === null || bg.user_jo.activity_ids.length === 0)
		{
			$("#main_div_" + currentURLhash).css("padding", "20px");
			$("#main_div_" + currentURLhash).text("No activity to display.");
		}
		else
		{
			$("#main_div_" + currentURLhash).css("padding", "0px");
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
	var item_random = makeid();
	var parent_random = makeid();
	var fids = ""; // feed item div string
	if(item_id.endsWith("L") || item_id.endsWith("D"))
	{
		// this call goes and gets the notification item -- the like, dislike or reply to a parent comment.
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
	        	fids = fids + "<table style=\"width:100%\">";
	    		fids = fids + "	<tr>";
	    		fids = fids + "		<td class=\"notification-header-td\" id=\"header_td_" + item_random + "\">";
	        	fids = fids + "			<img src=\"images/ajaxSnake.gif\">";
	        	fids = fids + "		</td>";
	        	fids = fids + "		<td style=\"text-align:right\"><a href=\"#\" id=\"notification_hide_link_" + item_random + "\">hide</a></td>";
	        	fids = fids + "	</tr>";
	        	fids = fids + "</table>";
	        	fids = fids + "<table style=\"width:100%\">";
	    		fids = fids + "	<tr>";
	    		fids = fids + "		<td style=\"width:15px\"></td>";
	    		fids = fids + "		<td class=\"rotated-who-wrote\">";
	    		fids = fids + "			You wrote:";
	    		fids = fids + "		</td>";
	    		fids = fids + "		<td class=\"notification-comment-td\" id=\"notification_comment_td_" + parent_random + "\">";
	    		fids = fids + "			<img src=\"images/ajaxSnake.gif\">";
	    		fids = fids + "		</td>";
	    		fids = fids + "	</tr>";
	    		fids = fids + "</table>";
	    		$("#" + dom_id).html(fids);//FIXME
	        	
	    		var email = docCookies.getItem("email");
	    		var this_access_token = docCookies.getItem("this_access_token");
	    		$("#notification_hide_link_" + data.item.id).click({id: data.item.id, item_random: item_random}, function(event) {
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
    			        		displayMessage(data.message, "red", "header_td_" + event.data.item_random);
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
    			        	$("#header_td_" + event.data.item_random).text("Unable to hide item. (network error)");
    			        	console.log(textStatus, errorThrown);
    			        }
    				});
    				return false;
    			});	
	    		
	    		
	        	if(data.response_status !== "error" && tabmode === "notifications")
	        	{
	        		var url_to_use = data.item.pseudo_url;
        			if(url_to_use.length > 50)
        				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
	        		if(data.item.id.endsWith("L"))
	        		{
	        			var headerstring = "";
	        			headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + item_random + "\"></a> liked your comment: ";
	        			headerstring = headerstring + "<img id=\"google_favicon_" + item_random + "\" src=\"\" style=\"vertical-align:middle\"> <a class=\"newtab\" id=\"pseudo_link_" + item_random + "\" href=\"\"></a>";
	        			$("#header_td_" + item_random).html(headerstring);
	        			$("#screenname_link_" + item_random).html(data.item.author_screenname);
	        			$("#google_favicon_" + item_random).css("src","http://www.google.com/s2/favicons?domain=" + data.item.pseudo_url);
	        			$("#pseudo_link_" + item_random).attr("href", data.item.psuedo_url);
	        			$("#pseudo_link_" + item_random).html(url_to_use);
	        			$("#screenname_link_" + item_random).click({author_screenname: data.item.author_screenname}, function(event) {
	        		 		viewProfile(event.data.author_screenname);
	        		 	});
	        		}
	        		else if(data.item.id.endsWith("D"))
	        		{
	        			$("#header_td_" + data.item.id).html("Someone disliked your comment: <img src=\"http://www.google.com/s2/favicons?domain=" + data.item.pseudo_url + "\"  style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + data.item.pseudo_url + "\">" + url_to_use + "</a>"); // FIXME
	        		}	
	        		else
	        		{
	        			$("#header_td_" + data.item.id).text("Error determining notification item type");
	        			return;
	        		}
	        		$.ajax({
		    	        type: 'GET',
		    	        url: endpoint,
		    	        data: {
		    	            method: "getFeedItem",
		    	            id: data.item.parent
		    	        },
		    	        dataType: 'json',
		    	        async: true,
		    	        success: function (data, status) {
		    	        	// write the comment
		    	        	if(data.response_status === "success" && tabmode === "notifications")
		    	        	{
		    	        		writeComment(data.item, "notification_comment_td_" + parent_random);
		    	        	}
		    	        	else if (data.response_status === "error")
		    	        	{
		    	        		// fail silently?
		    	        	}	
		    	        	else
		    	        	{
		    	        		// didn't even get success/fail response, fail silently?
		    	        	}
		    	        },
		    	        error: function (XMLHttpRequest, textStatus, errorThrown) {
		    	        	$("#header_td_" + removal_target).text("Unable to hide item. (network error)");
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
	else if(item_id.endsWith("C"))
	{
		// get the child
		var activity_jo;
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
	        	if(data.item.hidden === false) // skip entirely if hidden === true
	        	{	
	        		activity_jo = data.item;
		        	fids = fids + "<table style=\"width:100%\">";
		    		fids = fids + "	<tr>";
		    		fids = fids + "		<td class=\"notification-header-td\" id=\"header_td_" + activity_jo.id + "\">";
		        	fids = fids + "			<img src=\"images/ajaxSnake.gif\">";
		        	fids = fids + "		</td>";
		        	fids = fids + "		<td><a href=\"#\" id=\"notification_hide_link_" + activity_jo.id + "\" style=\"text-align:right\">hide</a></td>";
		        	fids = fids + "	</tr>";
		        	fids = fids + "</table>";
		    		fids = fids + "<table>";
		    		fids = fids + "	<tr id=\"parent_tr_" + activity_jo.id + "\" style=\"display:none\">";
		    		fids = fids + "		<td style=\"width:15px\"></td>";
		    		fids = fids + "		<td class=\"rotated-who-wrote\">";
		    		fids = fids + "			You wrote:";
		    		fids = fids + "		</td>";
		    		fids = fids + "		<td class=\"notification-comment-td\" id=\"notification_comment_td_" + parent_random + "\">";
		    		fids = fids + "			<img src=\"images/ajaxSnake.gif\">";
		    		fids = fids + "		</td>";
		    		fids = fids + "	</tr>";
		    		fids = fids + "</table>";
		    		fids = fids + "<table>";
		    		fids = fids + "	<tr>";
		    		fids = fids + "		<td style=\"width:30px\"></td>";
		    		fids = fids + "		<td class=\"rotated-who-wrote\">";
		    		fids = fids + "			They wrote:";
		    		fids = fids + "		</td>";
		    		fids = fids + "		<td class=\"notification-comment-td\" id=\"notification_comment_td_" + activity_jo.id + "\">";
		    		fids = fids + "			<img src=\"images/ajaxSnake.gif\">";
		    		fids = fids + "		</td>";
		    		fids = fids + "	</tr>";
		    		fids = fids + "</table>";
		    		$("#" + dom_id).html(fids); // FIXME
		        	
		    		var email = docCookies.getItem("email");
		    		var this_access_token = docCookies.getItem("this_access_token");
		    		$("#notification_hide_link_" + activity_jo.id).click({value: activity_jo.id}, function(event) {
		    			var removal_target = event.data.value;
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
	    			        },
	    			        error: function (XMLHttpRequest, textStatus, errorThrown) {
	    			        	$("#header_td_" + removal_target).text("Unable to retrieve item. (network error)");
	    			        	console.log(textStatus, errorThrown);
	    			        }
	    				});
	    				return false;
	    			});	
		    		
		        	if(data.response_status === "success" && tabmode === "notifications")
		        	{
		        		// write the comment
		        		writeComment(activity_jo, "notification_comment_td_" + activity_jo.id);
		        		var parent_is_a_comment = false;
		        		var current_user_authored_parent_comment = false;
		        		if(activity_jo.parent.indexOf(".") == -1) // only retrieve and write the parent if the parent is a comment
		        		{	
		        			parent_is_a_comment = true;
		        			// get the parent
			        		$.ajax({
			        	        type: 'GET',
			        	        url: endpoint,
			        	        data: {
			        	            method: "getFeedItem",
			        	            id: activity_jo.parent
			        	        },
			        	        dataType: 'json',
			        	        async: true,
			        	        success: function (data, status) {
			        	        	if(data.response_status === "success" && tabmode === "notifications")
			        	        	{
			        	        		// if the parent is hidden, we don't know if this is a reply or mention. Must check text of child for mention
			        	        		var reply_or_mention = "reply"; //default to reply
			        	        		if(data.item.hidden === true)
			        	        		{
			        	        			if(activity_jo.text.indexOf("@" + bg.user_jo.screenname) !== -1)
			        	        				reply_or_mention = "mention"; // we don't know for sure this wasn't a reply... but we at least know it's a mention
			        	        		}
			        	        		else
			        	        		{
			        	        			if(data.item.author_screenname === bg.user_jo.screenname)
			        	        				reply_or_mention = "reply"; // current user wrote the parent... this is a reply. may also be a mention, but we default to reply here.
			        	        		}	
			        	        		
			        	        		// this check is meant to determine whether this reply is a reply to the current user or a reply that mentioned the current user.
			        	        		if(reply_or_mention === "reply")
			        	        		{	
			        	        			$("#parent_tr_" + activity_jo.id).show();
			        	        			current_user_authored_parent_comment = true;
			        	        			var url_to_use = data.item.pseudo_url;
				                			if(url_to_use.length > 50)
				                				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
				                			$("#header_td_" + activity_jo.id).html("<a href=\"#\" id=\"screenname_link_" + activity_jo.id + "\">" + activity_jo.author_screenname + "</a> replied to you" + " - <img src=\"http://www.google.com/s2/favicons?domain=" + data.item.pseudo_url + "\" style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + data.item.pseudo_url + "\">" + url_to_use + "</a>");// FIXME
				                			$("#screenname_link_" + activity_jo.id).click(function() {
				    	        		 		viewProfile(activity_jo.author_screenname);
				    	        		 	});
				        	        		writeComment(data.item, "notification_comment_td_" + parent_random);
			        	        		}
			        	        		else
			        	        		{
			        	        			$("#parent_tr_" + activity_jo.id).hide();
			        	        			var url_to_use = data.item.pseudo_url;
			        	        			if(url_to_use.length > 50)
			        	        				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
			        	        			parent_is_a_comment = false;
			        	        			$("#header_td_" + activity_jo.id).html("<a href=\"#\" id=\"screenname_link_" + activity_jo.id + "\">" + activity_jo.author_screenname + "</a> mentioned you" + " - <img src=\"http://www.google.com/s2/favicons?domain=" + data.item.pseudo_url + "\" style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + data.item.pseudo_url + "\">" + url_to_use + "</a>");// FIXME
			        	        			current_user_authored_parent_comment = false;
			        	        		}
			        	        	}
			        	        	else
			        	        	{
			        	        		//alert("did not get parent item successfully");
			        	        	}	
			        	        },
			        	        error: function (XMLHttpRequest, textStatus, errorThrown) {
			        	        	$("#header_td_" + activity_jo.id).text("Unable to retreive parent comment and write header. (network error)");
			        	        	$("#notification_comment_td_" + activity_jo.id).text("Unable to retreive parent comment. (network error)");
			        	        	console.log(textStatus, errorThrown);
			        	        } 
			        		});
		        		}
		        		else // if the comment was toplevel, then this is obviously a mention and not a reply
		        		{
		        			$("#parent_tr_" + activity_jo.id).hide();
		        			var url_to_use = data.item.pseudo_url;
		        			if(url_to_use.length > 50)
		        				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
		        			parent_is_a_comment = false;
		        			$("#header_td_" + activity_jo.id).html("<a href=\"#\" id=\"screenname_link_" + activity_jo.id + "\">" + activity_jo.author_screenname + "</a> mentioned you" + " - <img src=\"http://www.google.com/s2/favicons?domain=" + data.item.pseudo_url + "\" style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + data.item.pseudo_url + "\">" + url_to_use + "</a>");// FIXME
		        			current_user_authored_parent_comment = false;
		        		}	
		        	}
		        	else
		        	{
		        		//alert("error child id=" + item_id + " message=" + data.message);
		        	}
	        	}
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	$("#notification_child_div_" + item_id).text("Unable to retreive item. (network error)");
	        	console.log(textStatus, errorThrown);
	        } 
		});
	}	
	else
	{
		displayMessage("error: feed item structure invalid. item_id=" + item_id, "red", "message_div_" + currentURLhash);
	}	
}

