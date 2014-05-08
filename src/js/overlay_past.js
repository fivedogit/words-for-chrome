
// view past                                                                                                          

function doPastTab()
{
	tabmode = "past";
	$("#thread_tab_img").attr("src", "images/chat_gray.png");
	$("#trending_tab_img").attr("src", "images/trending_gray.png");
	$("#notifications_tab_img").attr("src", "images/flag_gray.png");
	$("#past_tab_img").attr("src", "images/clock_blue.png");
	$("#profile_tab_img").attr("src", "images/user_gray.png");
	
	$("#header_div_top").text("Your past comments");
	$("#utility_div").show();
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	$("#main_div_" + currentURLhash).css("padding", "20px");
	$("#main_div_" + currentURLhash).html("<span id=\"loading_past_comments_span\">Loading your past comments... please wait.</span>");//OK
	beginindex = 0;
	endindex = 8;
	getPastComments();
}

function getPastComments()
{
	if (typeof bg.user_jo==="undefined" || bg.user_jo === null)
	{
		$("#main_div_" + currentURLhash).css("padding", "20px");
		$("#main_div_" + currentURLhash).text("Log in to view your past comments.");
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
	            	$("#loading_past_comments_span").text("Error retrieving past comments.");
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
	            		$("#main_div_" + currentURLhash).css("padding", "0px");
	            		$("#loading_past_comments_span").hide();
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
	            		$("#loading_past_comments_span").text("No past comments.");
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
        	fids = fids + "<table style=\"width:100%\">";
    		fids = fids + "	<tr>";
    		fids = fids + "		<td style=\"text-align:left\" id=\"pastcomment_header_td_" + data.item.id + "\">";
    		fids = fids + "			<img src=\"images/ajaxSnake.gif\">";
        	fids = fids + "		</td>";
        	fids = fids + "	</tr>";
        	fids = fids + "</table>";
    		fids = fids + "<table>";
    		fids = fids + "	<tr>";
    		fids = fids + "		<td class=\"rotated-who-wrote\">";
    		fids = fids + "			You wrote:";
    		fids = fids + "		</td>";
    		fids = fids + "		<td id=\"pastcomment_body_td_" + data.item.id + "\">";
    		fids = fids + "			<img src=\"images/ajaxSnake.gif\">";
    		fids = fids + "		</td>";
    		fids = fids + "	</tr>";
    		fids = fids + "</table>";
    		$("#" + dom_id).html(fids);//FIXME
    		var url_to_use = data.item.pseudo_url;
			if(url_to_use.length > 50)
				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
			$("#pastcomment_header_td_" + data.item.id).html("<img src=\"http://www.google.com/s2/favicons?domain=" + data.item.pseudo_url + "\" style=\"vertical-align:middle\"> <a class=\"newtab\" href=\"" + data.item.pseudo_url + "\">" + url_to_use + "</a>");//FIXME
    		writeComment(data.item, "pastcomment_body_td_" + data.item.id);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	$("#notification_child_div_" + item_id).text("Unable to retreive item. (network error)");
        	console.log(textStatus, errorThrown);
        } 
	});
}
