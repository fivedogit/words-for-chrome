
function doFeedTab()
{
	tabmode = "feed";
	$("#thread_tab_img").attr("src", chrome.extension.getURL("images/chat_gray.png"));
	$("#feed_tab_img").attr("src", chrome.extension.getURL("images/earth_blue.png"));
	$("#trending_tab_img").attr("src", chrome.extension.getURL("images/trending_gray.png"));
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", chrome.extension.getURL("images/clock_gray.png"));
	$("#profile_tab_img").attr("src", chrome.extension.getURL("images/user_gray.png"));

	$("#utility_header_td").html("Comments from around the Web<br><span style=\"font-style:italic;color:#444444;font-size:11px;font-weight:normal\">(This will become personalized over time.)</span>"); //OK
	$("#utility_message_td").hide();
	$("#utility_csf_td").hide();
	
	$("#footer_div").html("");
	$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\" id=\"loading_comments_fatw_div\">Loading comments from around the Web... please wait.<br><img style=\"margin-top:16px;margin-bottom:16px\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>");//OK
	//$("#main_div_" + currentURLhash).append("<div id=\"most_recent_comments_div\"></div>");
	drawMostRecentComments(25, "main_div_" + currentURLhash);
}

function drawMostRecentComments(num_to_draw, dom_id)
{
	if (typeof user_jo==="undefined" || user_jo === null)
	{
		$("#loading_comments_fatw_div").text("Log in to view comments from around the Web.");
	}
	else
	{
		$.ajax({
			type: 'GET',
			url: endpoint,
			data: {
				method: "getMostRecentComments" // always gets 25 items since there is a TTL and saved value involved
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				if (data.response_status === "success") 
				{
					$("#loading_comments_fatw_div").remove();
					var mrc_ja = data.mrc;
					
					var sorted_mrc_ja = mrc_ja;
					sorted_mrc_ja.sort(function(a,b){
						a = fromOtherBaseToDecimal(62, a.substring(0,7));
						b = fromOtherBaseToDecimal(62, b.substring(0,7));
						return b - a;
					});
					
					mrc_ja = sorted_mrc_ja;
					
					var x = 0;
					while(x < mrc_ja.length && x < num_to_draw) // num_to_draw just takes the first few. Should never be more than 25.
					{
						writeUnifiedCommentContainer(mrc_ja[x], "main_div_" + currentURLhash, "append");
						doFeedItem(mrc_ja[x], "comment_div_" + mrc_ja[x]);
						x++;
					}	
				}
				else if (data.response_status === "error") 
				{
					$("#loading_comments_fatw_div").text("Error retrieving comments from around the Web.");
	            	displayMessage(data.message, "red", "utility_message_td");
	            	if(data.error_code && data.error_code === "0000")
	        		{
	        			displayMessage("Your login has expired. Please relog.", "red");
	        			user_jo = null;
	        			updateLogstat();
	        		}
				}
				else
				{
					$("#loading_comments_fatw_div").text("Response status neither success or error.");
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				displayMessage("AJAX error getting most active pages info.", "red", "utility_message_td");
				console.log(textStatus, errorThrown);
				return;
			} 
		});
	}
}

function doFeedItem(comment_id, dom_id) // type = "initialpop", "newcomment", "reply"
{
	var container_id = comment_id;
	$.ajax({
        type: 'GET',
        url: endpoint,
        data: {
            method: "getFeedItem",
            id: comment_id
        },
        dataType: 'json',
        async: true,
        success: function (data, status) {
        	if(data.response_status === "success")// && tabmode === "thread")
        	{
        		if(tabmode === "feed") // as these come in, only process them if we're still on the feed tab
        		{	
        			var item_jo = data.item;
            		var url_to_use = getSmartCutURL(data.item.pseudo_url,50);
            		var headerstring = "";
            		headerstring = headerstring + "<a href=\"#\" id=\"screenname_link_" + comment_id + "\">" + data.item.author_screenname + "</a> commented on: ";
            		headerstring = headerstring + "<img id=\"google_favicon_" + comment_id + "\" src=\"\" style=\"vertical-align:middle\"> <a class=\"newtab\" id=\"pseudo_link_" + comment_id + "\" href=\"#\"></a>";
            		$("#header_div_" + comment_id).html(headerstring);//OK
            		$("#header_div_" + comment_id).show();
        			$("#google_favicon_" + comment_id).attr("src","http://www.google.com/s2/favicons?domain=" + item_jo.pseudo_url);
        			$("#pseudo_link_" + comment_id).attr("href", item_jo.pseudo_url);
        			$("#pseudo_link_" + comment_id).text(url_to_use);
        			
            		writeComment(container_id, data.item, dom_id, false, true, false); // l/d, delete button (if user authored it), reply
        		}
        	}
        	else
        	{ 
        		// fail silently
        	}	
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	displayMessage("Unable to retrieve feed item. (ajax)", "red", "message_div_" + comment_id);
        	console.log(textStatus, errorThrown);
        }
	});
}		

