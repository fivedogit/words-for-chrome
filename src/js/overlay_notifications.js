

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
	$("div#words_div #thread_tab_link").html("<img src=\"" + chrome.extension.getURL("images/chat_gray.png") + "\"></img>");
	$("div#words_div #trending_tab_link").html("<img src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></img>");
	$("div#words_div #notifications_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag_blue.png") + "\"></img>");
	$("div#words_div #profile_tab_link").html("<img src=\"" + chrome.extension.getURL("images/user_gray.png") + "\"></img>");

	
	$("div#words_div #header_div_top").html("Notification Feed");
	$("div#words_div #utility_div").show();
	$("div#words_div #header_div_top").show();
	$("div#words_div #comment_submission_form_div_" + currentURLhash).hide();
	$("div#words_div #main_div_" + currentURLhash).html("<div style=\"padding:20px\">Loading activity feed... please wait.<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\"></div>");
	getNotifications();
}

function getNotifications()
{
	if (typeof user_jo==="undefined" || user_jo === null)
	{
		$("div#words_div #main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to view your activity feed.</div>");
	}
	else
	{
		var main_div_string = "";
		if (typeof user_jo.activity_ids === "undefined" || user_jo.activity_ids === null || user_jo.activity_ids.length === 0)
			main_div_string = "<div style=\"padding:20px;\">No activity to display.</div>";
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
				main_div_string = main_div_string + "<div class=\"complete-horiz-line-div\"></div>";
				if(x < user_jo.notification_count)
					main_div_string = main_div_string + "<div id=\"feeditem_div_" + x + "\" style=\"background-color:#fffed6;padding:5px;text-align:left;" + x + "\"></div>";
				else
					main_div_string = main_div_string + "<div id=\"feeditem_div_" + x + "\" style=\"padding:5px;text-align:left;" + x + "\"></div>";
			}  
		}
		$("div#words_div #main_div_" + currentURLhash).html(main_div_string);
		for(var x=0; x < user_jo.activity_ids.length; x++) 
		{  
			doNotificationItem(user_jo.activity_ids[x], "feeditem_div_" + x, "notifications");
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
	            this_access_token: this_access_token   // this can be called with no this_access_token, user_jo will just come back erroneous
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {

	            if (data.response_status === "error") 
	            {
	            	//alert('reset activity count error');
	            	displayMessage(data.message, "red", "message_div_top");
	            }
	            else // on success reset the button image
	            {
	            	user_jo.notification_count = 0;
	            	updateNotificationTabLinkImage();
	            	bg.doButtonGen(); // to avoid the reference to bg, we can just let this update on the next tab view
	            }
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	displayMessage("Ajax alert for resetActivity method.", "red", "message_div_top");
	            console.log(textStatus, errorThrown);
	        } 
		});


	}
}

function doNotificationItem(item_id, dom_id, modewhencalled)
{
	var fids = ""; // feed item div string
	if(item_id.endsWith("L") || item_id.endsWith("D"))
	{
		// this call goes and gets the notification item -- the like, dislike or reply to a parent comment.
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
	        	activity_jo = data;
	        	fids = fids + "<table style=\"width:100%\">";
	    		fids = fids + "	<tr>";
	    		fids = fids + "		<td class=\"notification-header-td\" id=\"header_td_" + activity_jo.id + "\">";
	        	fids = fids + "			<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
	        	fids = fids + "		</td>";
	        	fids = fids + "		<td style=\"text-align:right\"><a href=\"#\" id=\"notification_hide_link_" + activity_jo.id + "\">hide</a></td>";
	        	fids = fids + "	</tr>";
	        	fids = fids + "</table>";
	        	fids = fids + "<table style=\"width:100%\">";
	    		fids = fids + "	<tr>";
	    		fids = fids + "		<td style=\"width:15px\"></td>";
	    		fids = fids + "		<td class=\"rotated-who-wrote\">";
	    		fids = fids + "			You wrote:";
	    		fids = fids + "		</td>";
	    		fids = fids + "		<td class=\"notification-comment-td\" id=\"notification_comment_td_" + activity_jo.parent + "\">";
	    		fids = fids + "			<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
	    		fids = fids + "		</td>";
	    		fids = fids + "	</tr>";
	    		fids = fids + "</table>";
	    		$("div#words_div #" + dom_id).html(fids);
	        	
	    		var email = docCookies.getItem("email");
	    		var this_access_token = docCookies.getItem("this_access_token");
	    		$("div#words_div #notification_hide_link_" + activity_jo.id).click({value: activity_jo.id}, function(event) {
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
    			        		//alert("error");
    			        	}	
    			        },
    			        error: function (XMLHttpRequest, textStatus, errorThrown) {
    			        	$("div#words_div #header_td_" + removal_target).html("Unable to hide item. (network error)");
    			        	console.log(textStatus, errorThrown);
    			        }
    				});
    				return false;
    			});	
	    		
	    		
	        	if(data.response_status !== "error" && tabmode === "notifications")
	        	{
	        		var url_to_use = data.url_when_created;
        			if(url_to_use.length > 50)
        				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
        			// Why? $("div#words_div #header_div_" + activity_jo.id).css("text-align", "left");
	        		if(activity_jo.id.endsWith("L"))
	        		{
	        			$("div#words_div #header_td_" + activity_jo.id).html("<a href=\"#\" id=\"screenname_link_" + activity_jo.id + "\">" + activity_jo.author_screenname + "</a> liked your words: <img src=\"http://www.google.com/s2/favicons?domain=" + data.url_when_created + "\" style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + data.url_when_created + "\">" + url_to_use + "</a>");
	        			$("div#words_div #screenname_link_" + activity_jo.id).click(function() {
	        		 		viewProfile(activity_jo.author_screenname);
	        		 	});
	        		}
	        		else if(activity_jo.id.endsWith("D"))
	        		{
	        			$("div#words_div #header_td_" + activity_jo.id).html("Someone disliked your words: <img src=\"http://www.google.com/s2/favicons?domain=" + data.url_when_created + "\"  style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + activity_jo.url_when_created + "\">" + url_to_use + "</a>");
	        		}	
	        		else
	        		{
	        			$("div#words_div #header_td_" + activity_jo.id).html("Error determining notification item type");
	        			return;
	        		}
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
		    	        	// write the comment
		    	        	if(data.response_status !== "error" && tabmode === "notifications")
		    	        	{
		    	        		writeComment(data);
		    	        	}
		    	        },
		    	        error: function (XMLHttpRequest, textStatus, errorThrown) {
		    	        	$("div#words_div #header_td_" + removal_target).html("Unable to hide item. (network error)");
		    	        	console.log(textStatus, errorThrown);
		    	        } 
		    		});
	        	}	
	        	
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	$("div#words_div #header_td_" + item_id).html("Unable to retrieve like, dislike or reply item. (network error)");
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
	        	activity_jo = data;
	        	fids = fids + "<table style=\"width:100%\">";
	    		fids = fids + "	<tr>";
	    		fids = fids + "		<td class=\"notification-header-td\" id=\"header_td_" + activity_jo.id + "\">";
	        	fids = fids + "			<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
	        	fids = fids + "		</td>";
	        	fids = fids + "		<td><a href=\"#\" id=\"notification_hide_link_" + activity_jo.id + "\" style=\"text-align:right\">hide</a></td>";
	        	fids = fids + "	</tr>";
	        	fids = fids + "</table>";
	    		fids = fids + "<table>";
	    		fids = fids + "	<tr>";
	    		fids = fids + "		<td style=\"width:15px\"></td>";
	    		fids = fids + "		<td class=\"rotated-who-wrote\">";
	    		fids = fids + "			You wrote:";
	    		fids = fids + "		</td>";
	    		fids = fids + "		<td class=\"notification-comment-td\" id=\"notification_comment_td_" + activity_jo.parent + "\">";
	    		fids = fids + "			<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
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
	    		fids = fids + "			<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
	    		fids = fids + "		</td>";
	    		fids = fids + "	</tr>";
	    		fids = fids + "</table>";
	    		$("div#words_div #" + dom_id).html(fids);
	        	
	    		var email = docCookies.getItem("email");
	    		var this_access_token = docCookies.getItem("this_access_token");
	    		$("div#words_div #notification_hide_link_" + activity_jo.id).click({value: activity_jo.id}, function(event) {
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
    			        		//alert("error");
    			        	}	
    			        },
    			        error: function (XMLHttpRequest, textStatus, errorThrown) {
    			        	$("div#words_div #header_td_" + removal_target).html("Unable to retrieve item. (network error)");
    			        	console.log(textStatus, errorThrown);
    			        }
    				});
    				return false;
    			});	
	    		
	    		// FIXME, this is responding as just an object without response_status === "success"
	        	if(data.response_status !== "error" && tabmode === "notifications")
	        	{
	        		// write the comment
	        		writeComment(activity_jo);
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
	        	        	// write header
	        	        	if(data.response_status !== "error" && tabmode === "notifications")
	        	        	{
	        	        		var url_to_use = data.url_when_created;
	                			if(url_to_use.length > 50)
	                				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
	                			// Why? $("div#words_div #header_div_" + activity_jo.id).css("text-align", "left");
	                			$("div#words_div #header_td_" + activity_jo.id).html(
	                					"<a href=\"#\" id=\"screenname_link_" + activity_jo.id + "\">" + activity_jo.author_screenname + "</a> replied to you" 
	                					+ " - <img src=\"http://www.google.com/s2/favicons?domain=" + data.url_when_created + "\" style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + data.url_when_created + "\">" + url_to_use + "</a>");
	                			$("div#words_div #screenname_link_" + activity_jo.id).click(function() {
	    	        		 		viewProfile(activity_jo.author_screenname);
	    	        		 	});
	        	        		writeComment(data);
	        	        	}
	        	        },
	        	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	        	$("div#words_div #header_td_" + activity_jo.id).html("Unable to retreive parent comment and write header. (network error)");
	        	        	$("div#words_div #notification_comment_td_" + activity_jo.id).html("Unable to retreive parent comment. (network error)");
	        	        	console.log(textStatus, errorThrown);
	        	        } 
	        		});
	        	}
	        	else
	        	{
	        		//alert("error child id=" + item_id + " message=" + data.message);
	        	}
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	$("div#words_div #notification_child_div_" + item_id).html("Unable to retreive item. (network error)");
	        	console.log(textStatus, errorThrown);
	        } 
		});
	}	
	else
	{
		displayMessage("error: feed item structure invalid. item_id=" + item_id, "red", "message_div_top");
	}	
}

