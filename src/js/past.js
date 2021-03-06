
// view past                                                                                                          

function doPastTab()
{
	tabmode = "past";
	$("#thread_tab_img").attr("src", chrome.extension.getURL("images/chat_gray.png"));
	$("#feed_tab_img").attr("src", chrome.extension.getURL("images/earth_gray.png"));
	$("#trending_tab_img").attr("src", chrome.extension.getURL("images/trending_gray.png"));
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", chrome.extension.getURL("images/clock_blue.png"));
	$("#profile_tab_img").attr("src", chrome.extension.getURL("images/user_gray.png"));
	
	$("#utility_header_td").text("Your past comments");
	
	$("#utility_message_td").hide();
	$("#utility_csf_td").hide();
	
	//$("#footer_div").html("");
	
	$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\" id=\"loading_past_comments_div\">Loading your past comments... please wait.<br><img style=\"margin-top:16px;margin-bottom:16px\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>");//OK
	beginindex = 0;
	endindex = 15;
	getPastComments();
}

function getPastComments()
{
	if (typeof user_jo==="undefined" || user_jo === null)
	{
		$("#loading_past_comments_div").html("Log in to view your past comments.");
	}
	else
	{
		$.ajax({
	        type: 'GET',
	        url: endpoint,
	        data: {
	            method: "getMyComments",
	            screenname: screenname,            
	            this_access_token: this_access_token  
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {
	            if (data.response_status === "error") 
	            {
	            	$("#loading_past_comments_div").text("Error retrieving past comments.");
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
	            	
            		if(typeof data.comments_ja !== "undefined" && data.comments_ja !== null && data.comments_ja.length > 0)
	            	{
            			$("#loading_past_comments_div").remove();
	            		var sorted_comments_ja = data.comments_ja;
	            		sorted_comments_ja.sort(function(a,b){
	        				a = fromOtherBaseToDecimal(62, a.substring(0,7));
	        				b = fromOtherBaseToDecimal(62, b.substring(0,7));
	        				return b - a;
	        			});
	            		data.comments_ja = sorted_comments_ja;
	            	
	            		//var main_div_string = "";
	            		for(var x=beginindex; x < endindex && x < data.comments_ja.length; x++) 
	        			{
	            			writeUnifiedCommentContainer(data.comments_ja[x], "main_div_" + currentURLhash, "append");
	            			//main_div_string = main_div_string + "<div class=\"complete-horiz-line-div\"></div>";
	            			//main_div_string = main_div_string + "<div id=\"pastcomment_div_" + x + "\" style=\"padding:5px;text-align:center;" + x + "\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>";
	            		}
	            		if (x < data.comments_ja.length)
	        				scrollable = 1;
	        			else if(x === data.comments_ja.length)
	        				scrollable = 0;
	        			else
	        				scrollable = 0;
	            		//$("#main_div_" + currentURLhash).append(main_div_string);
	            		
	            		for(var x=beginindex; x < endindex && x < data.comments_ja.length; x++) 
	            		{  
	            			doPastCommentItem(data.comments_ja[x], "comment_div_" + data.comments_ja[x]);
	            		}
	            		
	            	}
	            	else
	            	{
	            		$("#loading_past_comments_div").text("No past comments.");
	            	}
	            }
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	$("#main_div_" + currentURLhash).text("");
	        	displayMessage("Ajax alert for getMyComments method.", "red", "utility_message_td");
	            console.log(textStatus, errorThrown);
	        } 
		});
	}
}

function doPastCommentItem(item_id, dom_id)
{
	var container_id = item_id;
	var item_random = makeid();
	var item_jo = null;
	var fids = "";
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
        	if(tabmode === "past") // as these come in, only process them if we're still on the notifications tab
    		{	
        		item_jo = data.item;
            	fids = fids + "<table style=\"width:100%\">";
        		fids = fids + "	<tr>";
        		fids = fids + "		<td style=\"text-align:left;padding-bottom:5px\" id=\"pastcomment_header_td_" + item_random + "\">";
        		fids = fids + "			<img style=\"margin-top:16px;margin-bottom:16px\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
            	fids = fids + "		</td>";
            	fids = fids + "	</tr>";
            	fids = fids + "</table>";
        		fids = fids + "<table>";
        		fids = fids + "	<tr>";
        		fids = fids + "		<td class=\"rotated-who-wrote\" id=\"you_wrote_" + item_random + "\">";
        		fids = fids + "		</td>";
        		fids = fids + "		<td id=\"pastcomment_body_td_" + item_random + "\">";
        		fids = fids + "			<img style=\"margin-top:16px;margin-bottom:16px\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
        		fids = fids + "		</td>";
        		fids = fids + "	</tr>";
        		fids = fids + "</table>";
        		$("#" + dom_id).html(fids);//OK
        		var url_to_use = getSmartCutURL(data.item.pseudo_url,50);
        		var headerstring = "";
        		headerstring = headerstring + "<img id=\"google_favicon_" + item_random + "\" src=\"\" style=\"vertical-align:middle\"> <a class=\"newtab\" id=\"pseudo_link_" + item_random + "\" href=\"#\"></a>";
    			$("#pastcomment_header_td_" + item_random).html(headerstring);//OK
    			$("#google_favicon_" + item_random).attr("src","http://www.google.com/s2/favicons?domain=" + item_jo.pseudo_url);
    			$("#pseudo_link_" + item_random).attr("href", item_jo.pseudo_url);
    			$("#pseudo_link_" + item_random).text(url_to_use);
    			$("#you_wrote_" + item_random).text("You wrote");
        		writeComment(container_id, item_jo, "pastcomment_body_td_" + item_random, false, true, false); // l/d, delete button, reply 
    		}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	$("#notification_child_div_" + item_id).text("Unable to retreive item. (network error)");
        	console.log(textStatus, errorThrown);
        } 
	});
}
