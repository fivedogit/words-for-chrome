/* This software is copyrighted.
 * It is open source, but the code is not free to use or redistribute. Sorry. 
 */

var user_jo;
var thread_jo;
var currentURL;
var currentURLhash;
var email;
var this_access_token;
var scrollable = 0;
var tabmode = "thread";

function elementInViewport(el) {
	  var top = el.offsetTop;
	  var left = el.offsetLeft;
	  var width = el.offsetWidth;
	  var height = el.offsetHeight;

	  while(el.offsetParent) {
	    el = el.offsetParent;
	    top += el.offsetTop;
	    left += el.offsetLeft;
	  }

	  return (
	    top >= window.pageYOffset &&
	    left >= window.pageXOffset &&
	    (top + height) <= (window.pageYOffset + window.innerHeight) &&
	    (left + width) <= (window.pageXOffset + window.innerWidth)
	  );
	}

chrome.extension.onMessage.addListener(function(request, sender, callback)
{
	currentURLhash = fromDecimalToOtherBase(62,hashFnv32a(request.currentURL));
	currentURL = request.currentURL;
	if(request.user_jo !== null)
	{
		email = request.email;
		this_access_token = request.this_access_token;
	}	
	user_jo = request.user_jo;
	thread_jo = request.thread_jo;
	if (request.action === "embedWORDS")
	{
		var alreadyfound = false;
		var elem = document.getElementById("comments-container"); // the document is finished, find the comments-container
		if(typeof elem !== "undefined" && elem !== null)
		{	
			elem.innerHTML = ""; // blank it.
			document.getElementById("comments-container").setAttribute("id", "words_div");
		}
		else
		{
			elem = document.getElementById("words_div");
		}
		
		if(!alreadyfound && elementInViewport(elem)) // when found for the first time...
		{
			alreadyfound = true;
			initializeView();
			doThreadTab();
		}	
		
		window.onscroll = function(){  // when scrolling, look for it
			if(!alreadyfound && elementInViewport(elem)) // when found for the first time...
			{
				alreadyfound = true;
				initializeView();
				doThreadTab();
			}	
		};
		return;
	}
});			

/*
function doEet(request)
{
	thread_jo = request.thread_jo;
	user_jo = request.user_jo;
	var main_div_string = "";
	main_div_string = main_div_string + "<table style=\"background-color:black;width:100%\">";
	main_div_string = main_div_string + "	<td style=\"text-align:left;color:white;vertical-align:middle;padding:6px\">";
	main_div_string = main_div_string + "		<img style=\"width:100px;height:20px;vertical-align:middle;padding-right:8px\" src=\"" + chrome.extension.getURL("images/words_logo_125x24.png") + "\">";
	main_div_string = main_div_string + "		Smarter, safer web comments";
	main_div_string = main_div_string + "	</td>";
	main_div_string = main_div_string + "	<td style=\"text-align:right;color:white;vertical-align:middle;padding:6px\">";
	main_div_string = main_div_string + "		Participate via <img style=\"width:20px;height:20px;vertical-align:middle\" src=\"" + chrome.extension.getURL("images/blank_button.png") + "\"> <img style=\"width:16px;height:16px;vertical-align:middle\" src=\"" + chrome.extension.getURL("images/arrow_ne.png") + "\">";
	main_div_string = main_div_string + "	</td>";
	main_div_string = main_div_string + "</table>";
	if (typeof thread_jo.children === "undefined" || thread_jo.children === null || thread_jo.children.length === 0)
	{
		main_div_string = main_div_string + "<div style=\"padding:25px;font-size:12px;background-color:white;\">";
		main_div_string = main_div_string + "	No comments for this page. Write one!";
		main_div_string = main_div_string + "</div>";
		main_div_string = main_div_string + "<div style=\"text-align:center;font-size:13px;padding-top:10px;padding-bottom:3px;display:none;border-top:1px solid black\" id=\"trending_on_this_site_div\">";
		main_div_string = main_div_string + "	<img src=\"http://www.google.com/s2/favicons?domain=" + currentURL + "\" style=\"vertical-align:middle\"> " + getHost() + " (<span id=\"num_hours_span\"></span> hrs)";
		main_div_string = main_div_string + "</div>";
		main_div_string = main_div_string + "<table id=\"trending_for_this_site_table\" style=\"display:none\">";
		main_div_string = main_div_string + "	<tr>";
		main_div_string = main_div_string + "		<td style=\"width:50%;padding:10px;vertical-align:top;text-align:center;font-weight:bold\">";
		main_div_string = main_div_string + "Most active pages";
		main_div_string = main_div_string + "		</td>";
		main_div_string = main_div_string + "		<td style=\"width:50%;padding:10px;vertical-align:top;text-align:center;font-weight:bold\">";
		main_div_string = main_div_string + "Most liked pages";
		main_div_string = main_div_string + "		</td>";
		main_div_string = main_div_string + "	</tr>";
		main_div_string = main_div_string + "	<tr>";
		main_div_string = main_div_string + "		<td id=\"most_active_pages_on_this_site_td\" style=\"width:50%;padding:6px;vertical-align:top\">";
		main_div_string = main_div_string + "<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">";
		main_div_string = main_div_string + "		</td>";
		main_div_string = main_div_string + "		<td id=\"most_liked_pages_on_this_site_td\" style=\"width:50%;padding:6px;vertical-align:top\">";
		main_div_string = main_div_string + "<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">";
		main_div_string = main_div_string + "		</td>";
		main_div_string = main_div_string + "	</tr>";
		main_div_string = main_div_string + "</table>";
		$("#main_div_" + currentURLhash).html(main_div_string);//OK
		
		$.ajax({
			type: 'GET',
			url: endpoint,
			data: {
				method: "getMostActivePagesForThisHostname",
				url: currentURL // let the backend figure out the hostname, authoritatively
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				if (data.response_status === "success") 
				{
					if(typeof data.trendingactivity_ja == "undefined" || data.trendingactivity_ja == null)
					{
						$("#other_pages_on_this_site_div").hide();
					}
					else
					{
						$("#num_hours_span").text(data.num_hours);
						$("#trending_on_this_site_div").show();
						$("#trending_for_this_site_table").show();
						drawTrendingChart(data, "most_active_pages_on_this_site_td");
					}
				}
				else if (data.response_status === "error") 
				{
					displayMessage(data.message, "red", "message_div_" + currentURLhash);
				}
				else
				{
					displayMessage("getMostActivePagesForThisHostname invalid response", "red", "message_div_" + currentURLhash);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				displayMessage("AJAX error getting trending info.", "red", "message_div_" + currentURLhash);
				console.log(textStatus, errorThrown);
			} 
		});
		
		$.ajax({
			type: 'GET',
			url: endpoint,
			data: {
				method: "getMostLikedPagesForThisHostname",
				url: currentURL // let the backend figure out the hostname, authoritatively
					// for right now, backend is doing 6, 12, 24, 48, but frontend should specify what it wants, right?
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				if (data.response_status === "success") 
				{
					if(typeof data.trendingactivity_ja == "undefined" || data.trendingactivity_ja == null)
					{
						$("#other_pages_on_this_site_div").hide();
					}
					else
					{
						$("#trending_on_this_site_div").show();
						$("#trending_for_this_site_table").show();
						drawTrendingChart(data, "most_liked_pages_on_this_site_td");
					}
				}
				else if (data.response_status === "error") 
				{
					displayMessage(data.message, "red", "message_div_" + currentURLhash);
				}
				else
				{
					displayMessage("getMostLikedPagesForThisHostname invalid response", "red", "message_div_" + currentURLhash);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				displayMessage("AJAX error getting trending info.", "red", "message_div_" + currentURLhash);
				console.log(textStatus, errorThrown);
			} 
		});
		$("#main_div_" + currentURLhash).append("<div style=\"height:17px;background-color:black;color:white\"></div>");
	}
	else
	{
		//alert("Thread had children");
		//var thread_div_string = "";
		var tempcomments = thread_jo.children;
		tempcomments.sort(function(a,b){
			var tsa = fromOtherBaseToDecimal(62, a.substring(0,7));
			var tsb = fromOtherBaseToDecimal(62, b.substring(0,7));
			return tsb - tsa;
		});
		
		thread_jo.children = tempcomments;
		
		
		// loop the comment id list and doThreadItem for each one
		//alert("showing beginindex=" + beginindex + " through " + endindex);
		for(var x=0; x < 5 && x < thread_jo.children.length; x++) 
		{
			doThreadItem(thread_jo.children[x], currentURLhash, "initialpop");
		}
		
		// if we've reached the end, show "end of comments" message
		if (x < thread_jo.children.length)
		{
			// didn't reach end of comments... tell audience to "see more" by clicking button.
			var tempstr = "<div style=\"background-color:black;color:white;padding:6px\">";
			if(thread_jo.children.length - x === 1)
				tempstr = tempstr + (thread_jo.children.length - x) + " more comment... ";
			else
				tempstr = tempstr + (thread_jo.children.length - x) + " more comments... ";
			tempstr = tempstr + "use <img style=\"width:20px;height:20px;vertical-align:middle\" src=\"" + chrome.extension.getURL("images/blank_button.png") + "\"> <img style=\"width:16px;height:16px;vertical-align:middle\" src=\"" + chrome.extension.getURL("images/arrow_ne.png") + "\">";
			tempstr = tempstr + "</div>";
			$("#main_div_" + currentURLhash).append(tempstr);
		}
		else
		{
			var tempstr = "<div style=\"height:17px;background-color:black;color:white;\">";
			tempstr = tempstr + "</div>";
			$("#main_div_" + currentURLhash).append(tempstr);
		}
		
		$("#main_div_" + currentURLhash).prepend(main_div_string);
	}
	
}

function doThreadItem(comment_id, parent, commenttype) // type = "initialpop", "newcomment", "reply"
{
	//alert("doing threaditem2 for comment_id=" + comment_id + " and parent=" + parent);
	if(isValidThreadItemId(comment_id)) // before innerHTMl below, make sure this is a harmless 11-char string of letters and numbers.
	{	
		var comment_div_string = "";
		//var indent = 0;
		var parent_outer_container_div = "main_div_" + parent;
		var parent_comment_div = "";
		
		if(typeof commenttype === "undefined" || commenttype === null || !(commenttype === "initialpop" || commenttype === "newcomment" || commenttype === "reply"))
		{
			if(parent.length != 11) // toplevel "parent" is a 8-length hash of the currentURL set by overlay.js
				commenttype = "newcomment";
			else
				commenttype = "reply";
		}
		
		if(parent.length !== 11) // toplevel "parent" is a 8-length hash of the currentURL set by overlay.js
		{
			//indent = 0;
		}
		else 
		{
			parent_outer_container_div = "comment_outer_container_div_" + parent;
			parent_comment_div = "comment_div_" + parent;
			//indent = ($("#" + parent_comment_div).css("margin-left").replace("px", "")*1) + 25;
		}	
		// This is the main thread item (comment) structure. We have a blank container around the actual visible comment.
		// That's so we can .after, .before, .append and .prepend to both the comment itself (replies) as well 
		// as to the comment container (subsequent or previous comments of the same level)

		if(!$("#comment_outer_container_div_" + comment_id).length) // if the container does not already exist, create it
			comment_div_string = comment_div_string + "<div id=\"comment_outer_container_div_" + comment_id + "\" style=\"background-color:white\">"; //  
		comment_div_string = comment_div_string + "		    <div id=\"complete_horiz_line_div_" + comment_id + "\" style=\"height:1px;border-top: 1px solid #ddd;\"></div>"; // 
		comment_div_string = comment_div_string + "		    <div id=\"message_div_" + comment_id + "\" style=\"padding:5px;font-size:12px;display:none\"></div>"; // 
		comment_div_string = comment_div_string + "				<div id=\"comment_div_" + comment_id + "\" style=\"padding:3px;\">"; // 
		comment_div_string = comment_div_string + "					<span style=\"padding:20px\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></span>";
		comment_div_string = comment_div_string + "				</div>";
		if(!$("#comment_outer_container_div_" + comment_id).length)
			comment_div_string = comment_div_string + "</div>"; // end container div

		if(!$("#comment_outer_container_div_" + comment_id).length) // if the container does not already exist, create it
		{
			if(commenttype === "initialpop") // .append to main_div
			{
				$("#main_div_" + parent).append(comment_div_string);//OK
			}	
			else if(commenttype === "newcomment") // .prepend to main_div
			{
				$("#main_div_" + parent).prepend(comment_div_string);//OK
			}	
			else if(commenttype == "reply") // .after parent comment
			{
				$("#" + parent_outer_container_div).after(comment_div_string);//OK
			}	
			else
			{
				//alert("invalid commenttype");
			}
		}
		else // container already existed. Just insert the new stuff
		{
			$("#comment_outer_container_div_" + comment_id).html(comment_div_string); // container_div already exists, rewrite it //OK
		}	

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
	        	if(data.response_status !== "error")
	        	{
	        		//alert(JSON.stringify(data.item));
	        		$("#comment_div_" + data.item.id).css("margin-left", ((data.item.depth-1) * 25) + "px");
	        		writeComment(data.item, "comment_div_" + data.item.id);
	        		if(data.item.children && data.item.children.length > 0)
	        		{
	        			var tempcomments = data.item.children;
						tempcomments.sort(function(a,b){
							var tsa = fromOtherBaseToDecimal(62, a.substring(0,7));
							var tsb = fromOtherBaseToDecimal(62, b.substring(0,7));
							return tsa - tsb;
						});
						data.item.children = tempcomments;
						for(var y=0; y < data.item.children.length; y++) 
			    		{  
							//alert("going to write a reply comment_id=" + data.children[y] + " and parent_id=" + comment_id);
							doThreadItem(data.item.children[y], comment_id, "reply");
			    		}
	        		}
	        	}
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	displayMessage("Unable to retrieve feed item. (ajax)", "red", "message_div_" + comment_id);
	        	console.log(textStatus, errorThrown);
	        }
		});
	}
}	

function getLinkifiedDiv(text) // also replaces line breaks with br
{
	var linkified_div = document.createElement('div');
	linkified_div.style.textAlign = "left";
	//linkified_div.style.padding = "6px";
	linkified_div.textContent = "";
	var m;
	var re = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	var last_index = 0;
	var matches_found = 0;
	var current_text = "";
	var current_textnode;
	var current_a;
	while (m = re.exec(text)) {
		matches_found = matches_found + 1;
		current_text = text.substring(last_index, m.index);
		if(current_text.indexOf("\n") === -1)
		{
			current_textnode = document.createTextNode(current_text);
			linkified_div.appendChild(current_textnode);
		}
		else
		{
			var arr = current_text.split("\n");
			var chunkcounter = 0;
			while(chunkcounter < arr.length)
			{
				current_textnode = document.createTextNode(arr[chunkcounter]);
				linkified_div.appendChild(current_textnode);
				if(chunkcounter < (arr.length - 1)) // if not the last one
					linkified_div.appendChild(document.createElement('br'));
				chunkcounter++;
			}	
		}	
		current_a = document.createElement('a');
		current_a.href = m[0];
		current_a.textContent = getSmartCutURL(m[0],60); 
		current_a.className = "newtab";
		linkified_div.appendChild(current_a);
		last_index = m.index + m[0].length;
	} 
	if(matches_found === 0)
		current_text = text;
	else
		current_text = text.substring(last_index);
	if(current_text.indexOf("\n") == -1)
	{
		current_textnode = document.createTextNode(current_text);
		linkified_div.appendChild(current_textnode);
	}
	else
	{
		var arr = current_text.split("\n");
		var chunkcounter = 0;
		while(chunkcounter < arr.length)
		{
			current_textnode = document.createTextNode(arr[chunkcounter]);
			linkified_div.appendChild(current_textnode);
			if(chunkcounter < (arr.length - 1)) // if not the last one
				linkified_div.appendChild(document.createElement('br'));
			chunkcounter++;
		}	
	}	
	return linkified_div;
}

function has_scrollbar(elem_id) 
{ 
 elem = document.getElementById(elem_id); 
 if (elem.clientHeight < elem.scrollHeight) 
   return true;
 else 
   return false;
} 

function writeComment(feeditem_jo, dom_id)
{
	//$("#" + dom_id).html(JSON.stringify(feeditem_jo));
	
	var comment_id = feeditem_jo.id; 
	
	if(!isValidThreadItemId(comment_id)) // before using this in innerHTML, make sure it's letters, numbers, ending with "C" and 11 chars long. (i.e. harmless)
		return;

	// NOTE: I tried changing comment_id to a random string, but it broke the saved text mechanism.
	
	var tempstr = "";
	var	numvotes = feeditem_jo.likes.length + feeditem_jo.dislikes.length;
	if (feeditem_jo.hidden === "true" || feeditem_jo.hidden === true)
	{
		tempstr = tempstr + "<table>";
		tempstr = tempstr + "	<tr>";
		tempstr = tempstr + "		<td style=\"vertical-align:top;width:48px;\">";
		tempstr = tempstr + "			<table>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td><img style=\"width:48px;height:48px;border-radius:4px\" src=\"" + chrome.extension.getURL("images/48avatar_ghosted.png") + "\"></td>";
		tempstr = tempstr + "				</tr>";
		tempstr = tempstr + "			</table>";
		tempstr = tempstr + "		</td>";
		tempstr = tempstr + "		<td style=\"padding:5px;vertical-align:middle;text-align:left\" >";
		tempstr = tempstr + "			Comment deleted";
		tempstr = tempstr + "		</td>";
		tempstr = tempstr + "	</tr>";
		tempstr = tempstr + "</table>";
	}
	else
	{
		tempstr = tempstr + "<table>";
		tempstr = tempstr + "	<tr>";
		
		// show this user's info
		tempstr = tempstr + "		<td style=\"vertical-align:top;width:48px;\"> <!-- avatar, left hand side -->"; 
		tempstr = tempstr + "			<table>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "						<img style=\"width:48px;height:48px;border-radius:4px\" id=\"author_picture_img_" + comment_id + "\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";			
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "						<table style=\"width:48px; height:5px; border:1px solid #7c7c7c; border-radius:2px; border-collapse: separate\">"; 
		tempstr = tempstr + "							<tr>";
		tempstr = tempstr + "								<td id=\"author_rating_left_td_" + comment_id + "\" style=\"width:33%;height:3px;border:0px\"></td>";
		tempstr = tempstr + "								<td id=\"author_rating_center_td_" + comment_id + "\" style=\"width:34%;height:3px;border:0px;background-color:blue\"></td>";
		tempstr = tempstr + "								<td id=\"author_rating_right_td_" + comment_id + "\" style=\"width:33%;height:3px;border:0px\"></td>";
	  	tempstr = tempstr + "							</tr>";
	  	tempstr = tempstr + "						</table>"
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";			
		tempstr = tempstr + "			</table>";
		tempstr = tempstr + "		</td>";
		tempstr = tempstr + "		<td> <!-- everything else, right-hand side -->";
		tempstr = tempstr + "			<table>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td style=\"vertical-align:middle;text-align:left;border:0px solid black\" > "; 
		tempstr = tempstr + "						<table style=\"width:100%;float:left;border:0px solid black;vertical-align:middle;\">";
		tempstr = tempstr + "							<tr> ";
		tempstr = tempstr + "		  					 	<td style=\"width:50%;vertical-align:middle\"><span id=\"screenname_span_" + comment_id + "\" style=\"padding:5px;color:blue\"></span> - <span id=\"time_ago_span_" + comment_id + "\" style=\"padding:5px;\"></span></td>";
		tempstr = tempstr + "		  					 	<td style=\"width:100%\"></td>"; // separator
		tempstr = tempstr + "		   						<td style=\"width:13px;height:19px;color:green;text-align:right;vertical-align:middle;padding-right:3px\" id=\"comment_likes_count_td_" + comment_id + "\"></td>";
		tempstr = tempstr + "	       						<td style=\"width:19px;height:19px;vertical-align:middle;\"><img style=\"height:19px;width:19px\" src=\"" + chrome.extension.getURL("images/like_arrow.png") + "\" id=\"like_img_" + comment_id + "\"></td>";
		tempstr = tempstr + "	       						<td style=\"width:19px;height:19px;vertical-align:middle;\"><img style=\"height:19px;width:19px\" src=\"" + chrome.extension.getURL("images/dislike_arrow.png") + "\" id=\"dislike_img_" + comment_id + "\"></td>";
		tempstr = tempstr + "		   						<td style=\"width:13px;height:19px;color:red;text-align:left;vertical-align:middle;padding-left:3px\" id=\"comment_dislikes_count_td_" + comment_id + "\"></td>";
		tempstr = tempstr + "							</tr>";
		tempstr = tempstr + "  						</table>";
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td style=\"padding:5px;vertical-align:top;text-align:left\" id=\"comment_text_td_" + comment_id + "\"> "; //  class=\"comment-text-td\"
	  	tempstr = tempstr + "					</td>";
	  	tempstr = tempstr + "				</tr>";
	  	tempstr = tempstr + "				<tr>";
  		tempstr = tempstr + "					<td style=\"padding:6px;text-align:left\"> ";
  		tempstr = tempstr + "							<a href=\"#\" id=\"reply_link_" + comment_id + "\"><b>Reply</b></a>";
  		tempstr = tempstr + "					</td>";
  		tempstr = tempstr + "				</tr>";
  		tempstr = tempstr + "				<tr>";
  		tempstr = tempstr + "					<td id=\"reply_td_" + comment_id + "\" style=\"display:none;\"> ";
  		tempstr = tempstr + "						<form method=post action=\"#\">";
  		tempstr = tempstr + "							<div style=\"margin-right:auto;margin-left:auto;width:80%;\">"; 
  		tempstr = tempstr + "								<textarea style=\"color:black;width:98%;margin-bottom:2px;border: 1px solid #7c7c7c; border-radius:4px; padding:2px;\" id=\"comment_textarea_" + comment_id + "\"></textarea>";
  		tempstr = tempstr + "								<div id=\"char_count_and_submit_button_div_" + comment_id + "\" style=\"width:100px;height:16px;margin-left:auto;margin-right:0px;vertical-align:middle;display:none;\">";
  		tempstr = tempstr + "									<span id=\"comment_submission_progress_span_" + comment_id + "\" style=\"display:none;padding-right:3px\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></span>"; 
  		tempstr = tempstr + "									<span id=\"charsleft_" + comment_id + "\"></span>";
  		tempstr = tempstr + "									<span><input id=\"comment_submission_form_submit_button_" + comment_id + "\" type=button value=\"Submit\"></input></span>";
  		tempstr = tempstr + "								</div>";
  		tempstr = tempstr + "							</div>";
  		tempstr = tempstr + "						</form>";
  		tempstr = tempstr + "					</td>";
  		tempstr = tempstr + "				</tr>";
	  	tempstr = tempstr + "			</table>";
	  	tempstr = tempstr + "		</td>";
	  	tempstr = tempstr + "	</tr>";
	  	tempstr = tempstr + "</table>"
	}
	
	$("#" + dom_id).html(tempstr);//OK
	$("[id=author_picture_img_" + comment_id + "]").attr("src", feeditem_jo.author_picture);
	var left_percentage = 0;
	var center_percentage = 0;
	var right_percentage = 0;
	var ratingcolor = "blue";
	if(feeditem_jo.author_rating < 0)
	{
		ratingcolor = "red";
		right_percentage = 50;
		center_percentage = (feeditem_jo.author_rating / -5 * 50);
		center_percentage = center_percentage|0;
		left_percentage = 50 - center_percentage;
	}	
	else if(feeditem_jo.author_rating == 0)
	{
		ratingcolor = "blue";
		left_percentage = 49;
		center_percentage = 2;
		right_percentage = 49;
	}	
	else
	{
		ratingcolor = "green";
		left_percentage = 50;
		center_percentage = feeditem_jo.author_rating / 5 * 50;
		center_percentage = center_percentage|0;
		right_percentage = 50 - center_percentage;
	}	
	$("[id=author_rating_left_td_" + comment_id + "]").css("width", left_percentage + "%");
	$("[id=author_rating_center_td_" + comment_id + "]").css("width", center_percentage + "%");
	$("[id=author_rating_center_td_" + comment_id + "]").css("background-color", ratingcolor);
	$("[id=author_rating_right_td_" + comment_id + "]").css("width", right_percentage + "%");
	$("[id=screenname_span_" + comment_id + "]").text(feeditem_jo.author_screenname);
	$("[id=time_ago_span_" + comment_id + "]").text(feeditem_jo.time_ago);
	$("[id=comment_likes_count_td_" + comment_id + "]").text(feeditem_jo.likes.length);
	$("[id=comment_dislikes_count_td_" + comment_id + "]").text(feeditem_jo.dislikes.length);
	
	var linkified_div = getLinkifiedDiv(feeditem_jo.text);
	$("[id=comment_text_td_" + comment_id + "]").html(linkified_div);
	
	if(user_jo !== null)
	{
		$.ajax({
			type: 'GET',
	        url: endpoint,
	        data: {
	            method: "haveILikedThisComment",
	            id: feeditem_jo.id,
	            email: email,
	            this_access_token: this_access_token
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {
	        	if (data.response_status === "error")
	        	{
	        		// fail silently
	        		alert("haveILikedThisComment error " + JSON.stringify(data));
	        	}
	        	else if (data.response_status === "success")
	        	{
	        		if(typeof data.response_value !== "undefined" && data.response_value !== null && data.response_value === true)
	        			$("#like_img_" + comment_id).attr("src", chrome.extension.getURL("images/like_arrow_liked.png"));
	        	}
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
	            console.log(textStatus, errorThrown);
	        } 
		});
		
		$.ajax({
			type: 'GET',
	        url: endpoint,
	        data: {
	            method: "haveIDislikedThisComment",
	            id: feeditem_jo.id,
	            email: email,
	            this_access_token: this_access_token
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {
	        	if (data.response_status === "error")
	        	{
	        		// fail silently
	        		alert("haveIDislikedThisComment error " + JSON.stringify(data));
	        	}
	        	else if (data.response_status === "success")
	        	{
	        		if(typeof data.response_value !== "undefined" && data.response_value !== null && data.response_value === true)
	        			$("#dislike_img_" + comment_id).attr("src", chrome.extension.getURL("images/dislike_arrow_disliked.png"));
	        	}
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
	            console.log(textStatus, errorThrown);
	        } 
		});
	}
	
	$("#reply_link_" + comment_id).click({value: comment_id}, function(event) {
		if(user_jo !== null)
		{
			if(!$("#reply_td_" + event.data.value).is(":visible"))
			{
				$("#reply_td_" + event.data.value).show();
				var currtext = $("#comment_textarea_" + event.data.value).val();
				if(currtext !== "Say something...")
			 	{
					// textarea has a scrollbar due to previous text, grow it
			 		 if(has_scrollbar("comment_textarea_" + event.data.value))
					 {
						 $("#comment_textarea_" + event.data.value).trigger("keyup");
					 }
			 	}
			}
			else
				$("#reply_td_" + event.data.value).hide();
		}
		else
			displayMessage("Please login to write a reply.", "red", "message_div_" + event.data.value); // this one is ok since user may be scrolled too far to see message_div
		event.preventDefault();
	});
	
	createSubmissionFormSubmitButtonClickEvent(comment_id, user_jo);
 	createFocusEventForTextarea(comment_id, user_jo);
 	createBlurEventForTextarea(comment_id);
 	createKeyupEventForTextarea(comment_id, 500);
	
}

function drawTrendingChart(data, dom_id)
{
	
	var mds = "";
	var rand = makeid();
	// did the system find ANY activity at all? In any window? If not, say so.
	if(typeof data.trendingactivity_ja === "undefined" || data.trendingactivity_ja === null)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " No data.";
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
	}	
	// what about for the window we want to see?
	else if(typeof data.trendingactivity_ja === "undefined" || data.trendingactivity_ja === null || data.trendingactivity_ja.length === 0)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " 			No data in the past " + data.num_hours + " hours. ";
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
	}	
	// There is activity in the window we want to see
	else
	{
		var max = 0;
		for(var x = 0; x < data.trendingactivity_ja.length; x++)
		{
			if(data.trendingactivity_ja[x].count > max)
				max = data.trendingactivity_ja[x].count;
		}
		var trendingmap = data.trendingactivity_ja;
		trendingmap.sort(function(a,b){
			return b.count - a.count;
		});
		data.trendingactivity_ja = trendingmap;
		mds = mds + "<table style=\"width:100%;\">";
		for(var x = 0; x < data.trendingactivity_ja.length; x++)
		{
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"text-align:left;padding-top:3px;vertical-align:top;width:16px\">";
			mds = mds + "			<img id=\"google_favicon_img_" + rand + "_" + x + "\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"vertical-align:middle\"> ";
			mds = mds + "		</td>";
			mds = mds + "		<td id=\"page_title_td_" + rand + "_" + x + "\" style=\"text-align:left;padding-top:3px;padding-left:3px;font-size:10px\">";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td id=\"page_url_td_" + rand + "_" + x + "\" colspan=2 style=\"text-align:left;padding-bottom:2px;font-family:'Arial'\">";
			mds = mds + " 			<a id=\"page_url_link_" + rand + "_" + x + "\" class=\"newtab\" href=\"#\"></a>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td colspan=2 style=\"padding-bottom:5px;line-height:10px\">";
			mds = mds + "			<table>";
			mds = mds + "				<tr>";
			mds = mds + "					<td id=\"orange_left_" + rand + "_" + x + "\" style=\"height:10px;border:1px solid black;background-color:orange;width:50%\"></td>";
			mds = mds + "					<td id=\"count_" + rand + "_" + x + "\" style=\"height:10px;text-align:left;padding-left:3px\"></td>";
			mds = mds + "				</tr>";
			mds = mds + "			</table>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
		}	
	}
	mds = mds + "</table>";
	
	$("#" + dom_id).html(mds);//OK
	
	for(var x = 0; x < data.trendingactivity_ja.length; x++)
	{
		// google favicon
		$("#google_favicon_img_" + rand + "_" + x).attr("src", "http://www.google.com/s2/favicons?domain=" + data.trendingactivity_ja[x].pseudo_url);
		
		// title
		if(typeof data.trendingactivity_ja[x].page_title === "undefined" || data.trendingactivity_ja[x].page_title === null || data.trendingactivity_ja[x].page_title === "")
			$("#page_title_td_" + rand + "_" + x).text("Unknown page title");
		else
		{	
			var splittable = data.trendingactivity_ja[x].page_title;
			var split_result = splittable.split(" ");
			var yerma = 0;
			var finalstring = "";
			while(yerma < split_result.length)
			{
				if(split_result[yerma].length > 40)
					finalstring = finalstring + splitString(split_result[yerma]);
				else
					finalstring = finalstring + split_result[yerma] + " ";
				yerma++;
			}	
			$("#page_title_td_" + rand + "_" + x).text(finalstring);
		}
		
		// url/link
		var url_to_use_loc = getSmartCutURL(data.trendingactivity_ja[x].pseudo_url, 36);
		$("#page_url_link_" + rand + "_" + x).attr("href", data.trendingactivity_ja[x].pseudo_url);
		$("#page_url_link_" + rand + "_" + x).text(url_to_use_loc);
		
		// graphic and number
		var left_percentage = data.trendingactivity_ja[x].count / max * 92;
		left_percentage = left_percentage|0;
		var right_percentage = 92 - left_percentage;
		$("#orange_left_" + rand + "_" + x).css("width", left_percentage + "%");
		$("#count_" + rand + "_" + x).text(data.trendingactivity_ja[x].count);
	}
	
	return;
}
*/

