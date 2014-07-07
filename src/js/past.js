
// view past                                                                                                          

function doPastTab()
{
	tabmode = "past";
	$("#thread_tab_img").attr("src", "images/chat_gray.png");
	$("#trending_tab_img").attr("src", "images/trending_gray.png");
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", "images/clock_blue.png");
	$("#profile_tab_img").attr("src", "images/user_gray.png");
	
	$("#header_div_top").text("Your past comments");
	$("#utility_div").show();
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\" id=\"loading_past_comments_div\">Loading your past comments... please wait.<br><img style=\"margin-top:16px;margin-bottom:16px\" src=\"images/ajaxSnake.gif\"></div>");//OK
	beginindex = 0;
	endindex = 8;
	getPastComments();
}

function getPastComments()
{
	if (typeof bg.user_jo==="undefined" || bg.user_jo === null)
	{
		$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to view your past comments.</div>");//OK
	}
	else
	{
		var email = docCookies.getItem("email");
		var this_access_token = docCookies.getItem("this_access_token");
		$.ajax({
	        type: 'GET',
	        url: endpoint,
	        data: {
	            method: "getMyComments",
	            email: email,             // this can be called with no email
	            this_access_token: this_access_token   // this can be called with no this_access_token, bg.user_jo will just come back erroneous
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {
	            if (data.response_status === "error") 
	            {
	            	$("#loading_past_comments_div").text("Error retrieving past comments.");
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
	            else
	            { 
	            	if(typeof data.comments_ja !== "undefined" && data.comments_ja !== null && data.comments_ja.length > 0)
	            	{
	            		$("#loading_past_comments_div").hide();
	            		var sorted_comments_ja = data.comments_ja;
	            		sorted_comments_ja.sort(function(a,b){
	        				a = fromOtherBaseToDecimal(62, a.substring(0,7));
	        				b = fromOtherBaseToDecimal(62, b.substring(0,7));
	        				return b - a;
	        			});
	            		data.comments_ja = sorted_comments_ja;
	            	
	            		var main_div_string = "";
	            		for(var x=beginindex; x < endindex && x < data.comments_ja.length; x++) 
	        			{
	            			main_div_string = main_div_string + "<div class=\"complete-horiz-line-div\"></div>";
	            			main_div_string = main_div_string + "<div id=\"pastcomment_div_" + x + "\" style=\"padding:5px;text-align:center;" + x + "\"><img src=\"images/ajaxSnake.gif\"></div>";
	            		}
	            		if (x < data.comments_ja.length)
	        				scrollable = 1;
	        			else if(x === data.comments_ja.length)
	        				scrollable = 0;
	        			else
	        				scrollable = 0;
	            		$("#main_div_" + currentURLhash).append(main_div_string);
	            		
	            		for(var x=beginindex; x < endindex && x < data.comments_ja.length; x++) 
	            		{  
	            			doPastCommentItem(data.comments_ja[x], "pastcomment_div_" + x);
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
	        	displayMessage("Ajax alert for getMyComments method.", "red", "message_div_" + currentURLhash);
	            console.log(textStatus, errorThrown);
	        } 
		});
	}
}

function doPastCommentItem(item_id, dom_id)
{
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
        	item_jo = data.item;
        	fids = fids + "<table style=\"width:100%\">";
    		fids = fids + "	<tr>";
    		fids = fids + "		<td style=\"text-align:left;padding-bottom:5px\" id=\"pastcomment_header_td_" + item_random + "\">";
    		fids = fids + "			<img style=\"margin-top:16px;margin-bottom:16px\" src=\"images/ajaxSnake.gif\">";
        	fids = fids + "		</td>";
        	fids = fids + "	</tr>";
        	fids = fids + "</table>";
    		fids = fids + "<table>";
    		fids = fids + "	<tr>";
    		fids = fids + "		<td class=\"rotated-who-wrote\" id=\"you_wrote_" + item_random + "\">";
    		fids = fids + "		</td>";
    		fids = fids + "		<td id=\"pastcomment_body_td_" + item_random + "\">";
    		fids = fids + "			<img style=\"margin-top:16px;margin-bottom:16px\" src=\"images/ajaxSnake.gif\">";
    		fids = fids + "		</td>";
    		fids = fids + "	</tr>";
    		fids = fids + "</table>";
    		$("#" + dom_id).html(fids);//OK
    		var url_to_use = getSmartCutURL(data.item.pseudo_url,50);
    		var headerstring = "";
    		headerstring = headerstring + "<img id=\"google_favicon_" + item_random + "\" src=\"\" style=\"vertical-align:middle\"> <a class=\"newtab\" id=\"pseudo_link_" + item_random + "\" href=\"#\"></a>";
			$("#pastcomment_header_td_" + item_random).html(headerstring);//OK
			$("#google_favicon_" + item_random).css("src","http://www.google.com/s2/favicons?domain=" + item_jo.pseudo_url);
			$("#pseudo_link_" + item_random).attr("href", item_jo.pseudo_url);
			$("#pseudo_link_" + item_random).text(url_to_use);
			$("#you_wrote_" + item_random).text("You wrote:");
    		writeComment(item_jo, "pastcomment_body_td_" + item_random);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	$("#notification_child_div_" + item_id).text("Unable to retreive item. (network error)");
        	console.log(textStatus, errorThrown);
        } 
	});
}
