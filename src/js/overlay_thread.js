
/***
 *     _   _ _____ _____ _    _   _____ _   _ ______ _____  ___ ______ 
 *    | | | |_   _|  ___| |  | | |_   _| | | || ___ \  ___|/ _ \|  _  \
 *    | | | | | | | |__ | |  | |   | | | |_| || |_/ / |__ / /_\ \ | | |
 *    | | | | | | |  __|| |/\| |   | | |  _  ||    /|  __||  _  | | | |
 *    \ \_/ /_| |_| |___\  /\  /   | | | | | || |\ \| |___| | | | |/ / 
 *     \___/ \___/\____/ \/  \/    \_/ \_| |_/\_| \_\____/\_| |_/___/                                                                   
 */


// this function says "Do we have the thread from the bg yet? If not, wait. If so, proceed.
function doThreadTab() 
{
	tabmode = "thread";
	$("#thread_tab_img").attr("src", "images/chat_blue.png");
	$("#trending_tab_img").attr("src", "images/trending_gray.png");
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", "images/clock_gray.png");
	$("#profile_tab_img").attr("src", "images/user_gray.png");
	
	$("#utility_div").show();
	$("#header_div_top").text("Comment thread");
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).show();
	
	$("#main_div_" + currentURLhash).text("");
	
	if(isValidURLFormation(currentURL))
	{
		if((typeof thread_jo === "undefined" || thread_jo === null) && bg.threadstatus !== 0) // overlay has been loaded, but thread is still being retrieved
		{
			var url_at_function_call = currentURL;
			// wait for thread to load
			$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Retrieving thread...</div>");//OK
			gotThread_wedge_for_ntj(url_at_function_call);
			// the difference between this wedge and the other one is that this one does not animate (or two animations would be happening on top of each other)
		}
		else if(thread_jo === null && bg.threadstatus === 0) // overlay has loaded but thread_jo is null -- this happens when using the inspector, and possibly other scenarios
		{
			var main_div_string = "<div style=\"padding:20px\">Could not display thread.<br>";
			main_div_string = main_div_string + "		Try switching tabs or reloading the page, then clicking the WORDS button again.</div>"; // , hostname must contain a \".\" and lack a \":\".
			$("#main_div_" + currentURLhash).html(main_div_string);//OK
		}
		else if(thread_jo !== null && bg.threadstatus === 0) 
		{
			gotThread();
		}
	}
	else // not a valid URL formation
	{
		beginindex = 0;
		$("#comment_submission_form_div_" + currentURLhash).hide();
		var main_div_string = "<div style=\"padding:20px\">Commenting for non-websites is currently disabled.<br>";
		main_div_string = main_div_string + "		(URL must start with \"http\".)</div>"; // , hostname must contain a \".\" and lack a \":\".
		$("#main_div_" + currentURLhash).html(main_div_string);//OK
	}
}

// this function says "We finally received the thread from the backend. Is the tabmode still "thread"? If so, show the thread. If not, do nothing (i.e. stop)."
function gotThread()
{
	$("#main_div_" + currentURLhash).text("");
	if (tabmode === "thread")
	{
		var url_to_use = getSmartCutURL(thread_jo.significant_designation, 60);
		var happy = "";
		happy = happy + "<img id=\"google_favicon_img_" + currentURLhash + "\" src=\"images/ajaxSnake.gif\"> "
		if(thread_jo.combined_or_separated === "combined")
			happy = happy + "<img id=\"combined_img\" src=\"images/combined_icon.png\"> ";
		else
			happy = happy + "<img id=\"separated_img\" src=\"images/separated_icon.png\"> ";
		happy = happy + "<span id=\"url_span_" + currentURLhash + "\" style=\"font-family:arial;font-size:12px\"></span> ";
		happy = happy + "<span id=\"has_user_liked_span\"><img id=\"pagelike_img\" src=\"images/star_grayscale_16x16.png\"></span> <span style=\"color:green\" id=\"num_pagelikes_span\"></span>";
		
		
		// like/dislike indicator here
		$("#header_div_top").html(happy);//OK
		$("#google_favicon_img_" + currentURLhash).attr("src", "http://www.google.com/s2/favicons?domain=" + thread_jo.significant_designation);
		$("#url_span_" + currentURLhash).text(url_to_use);
		
		var likepage_method = "likeHostname";
		var haveilikedpage_method = "haveILikedThisHostname";
		var which_like_type = "hostname";
		if(thread_jo.combined_or_separated === "separated")
		{
			likepage_method = "likeHPQSP";
			haveilikedpage_method = "haveILikedThisHPQSP";
			which_like_type = "hpqsp";
		}
		
		getPageLikes(which_like_type);
		
		$("#pagelike_img").click(
	 			function () {
	 				$("#pagelike_img").attr("src", "images/ajaxSnake.gif");
	 				$.ajax({
    			        type: 'GET',
    			        url: endpoint,
    			        data: {
    			        	email: docCookies.getItem("email"),
    			        	this_access_token: docCookies.getItem("this_access_token"),
    			            method: likepage_method,
    			            url: currentURL
    			        },
    			        dataType: 'json',
    			        async: true,
    			        success: function (data, status) {
    			        	if(data.response_status === "success")
    			        	{
    			        		$("#pagelike_img").attr("src", "images/star_16x16.png");
    			        		if(thread_jo.combined_or_separated === "separated")	
    			        			displayMessage("Page liked.", "black");
    			        		else
    			        			displayMessage("Site liked.", "black");
    			        		getPageLikes(which_like_type);
    			        	}
    			        	else if(data.response_status === "error")
    			        	{
    			        		$("#pagelike_img").attr("src", "images/star_grayscale_16x16.png");
    			        		displayMessage(data.message, "red", "message_div_" + currentURLhash, 5);
    			        		if(data.error_code && data.error_code === "0000")
    			        		{
    			        			displayMessage("Your login has expired. Please relog.", "red");
    			        			docCookies.removeItem("email"); 
    			        			docCookies.removeItem("this_access_token");
    			        			bg.user_jo = null;
    			        			displayAsLoggedOut();
    			        		}
    			        	}	
    			        },
    			        error: function (XMLHttpRequest, textStatus, errorThrown) {
    			        	$("#pagelike_img").attr("src", "images/star_grayscale_16x16.png");
    			        	displayMessage("Unable to like page. (ajax)", "red", "message_div_" + currentURLhash);
    			        	console.log(textStatus, errorThrown);
    			        }
    				});
	 				return false;
	 			});
	 	
		if(bg.user_jo !== null)
		{
			$.ajax({
				type: 'GET',
		        url: endpoint,
		        data: {
		            method: haveilikedpage_method,
		            url: currentURL,
		            email: docCookies.getItem("email"),
		            this_access_token: docCookies.getItem("this_access_token")
		        },
		        dataType: 'json',
		        async: true,
		        success: function (data, status) {
		        	if (data.response_status === "error")
		        	{
		        		$("#has_user_liked_span").text("err");
		        	}
		        	else if (data.response_status === "success")
		        	{
		        		if(data.response_value === true)
		        			$("#pagelike_img").attr("src","images/star_16x16.png");
		        	}
		        },
		        error: function (XMLHttpRequest, textStatus, errorThrown) {
		        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
		            console.log(textStatus, errorThrown);
		        } 
			});
		}
		
	 	$("#pagelike_img").mouseover(
	 			function () {
	 				if($("#pagelike_img").attr("src").indexOf("grayscale") == -1) // this is the yellow star, not the grayscale one
	 					$("#tab_tooltip_td").text("You've liked this");
	 				else
	 					$("#tab_tooltip_td").text("Like this page");
	 				return false;
	 			});

	 	$("#pagelike_img").mouseout(
	 			function () {
	 				if(tabmode === "thread")
	 					$("#tab_tooltip_td").text("Comments");
	 				else if(tabmode === "trending")
	 					$("#tab_tooltip_td").text("Trending");
	 				else if(tabmode === "notifications")
	 					$("#tab_tooltip_td").text("Notifications");
	 				else if(tabmode === "profile")
	 					$("#tab_tooltip_td").text("Profile/Settings");
	 				return false;
	 			});
		
		$("#combined_img").click(
				function () {
					$.ajax({
				        type: 'GET',
				        url: endpoint,
				        data: {
				            method: "separateHostname",
				            url: currentURL,
				            email: docCookies.getItem("email"),
				            this_access_token: docCookies.getItem("this_access_token")
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		// if someone clicks this without proper admin credentials to separate the hostname, just fail silently as if nothing happened.
				        	}
				        	else if (data.response_status === "success")
				        	{
				        		displayMessage("hostname separated", "red", "message_div_" + currentURLhash);
				        	}
				        },
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
				            console.log(textStatus, errorThrown);
				        } 
					});
				});
		
		$("#combined_img").mouseover(
	 			function () {
	 				$("#tab_tooltip_td").text("Combined threads");
	 				return false;
	 			});

	 	$("#combined_img").mouseout(
	 			function () {
	 				if(tabmode === "thread")
	 					$("#tab_tooltip_td").text("Comments");
	 				else if(tabmode === "trending")
	 					$("#tab_tooltip_td").text("Trending");
	 				else if(tabmode === "notifications")
	 					$("#tab_tooltip_td").text("Notifications");
	 				else if(tabmode === "profile")
	 					$("#tab_tooltip_td").text("Profile/Settings");
	 				return false;
	 			});
	 	
	 	$("#separated_img").mouseover(
	 			function () {
	 				$("#tab_tooltip_td").text("Separated threads");
	 				return false;
	 			});

	 	$("#separated_img").mouseout(
	 			function () {
	 				if(tabmode === "thread")
	 					$("#tab_tooltip_td").text("Comments");
	 				else if(tabmode === "trending")
	 					$("#tab_tooltip_td").text("Trending");
	 				else if(tabmode === "notifications")
	 					$("#tab_tooltip_td").text("Notifications");
	 				else if(tabmode === "profile")
	 					$("#tab_tooltip_td").text("Profile/Settings");
	 				return false;
	 			});
		beginindex = 0;
		endindex = 8;
		prepareGetAndPopulateThreadPortion();
	}
}

function getPageLikes(which)
{
	$.ajax({
		type: 'GET',
        url: endpoint,
        data: {
            method: "getPageLikes",
            url: currentURL,
            which: which
        },
        dataType: 'json',
        async: true,
        success: function (data, status) {
        	if (data.response_status === "error")
        	{
        		$("#has_user_liked_span").text("err");
        	}
        	else if (data.response_status === "success")
        	{
        		$("#num_pagelikes_span").text(data.count);
        	}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
            console.log(textStatus, errorThrown);
        } 
	});
}

function noteThreadView(was_empty) //booleans or strings
{
	// function is called in 3 instances after user has clicked button:
	// 1. There were no normal results and getTrendingActivity for the hostname returned nothing
	// 2. There were no normal results and getTrendingActivity for the hostname returned alternatives
	// 3. There were normal results for this page
	// Each of these three calls can be found below in prepareGetAndPopulateThreadPortion
	
	// NOTE: if you follow this AJAX call through Endpoint and ThreadviewItem on the backend,
	// you'll see that the user info is used to increment the user's threadview count only and the URL is not saved in the database. 
	// Only 5 items are recorded: 1. Was the thread empty? 2. Was the user logged in at the time of threadview? 
	// 3. Was the hostname combined or separated? 4. Did the hostname/path have an significant QSPs (like youtube) 5. Were we able to show link alternatives?
	// This information will help us make WORDS better, cus it sucks to, for instance, show empty threads when someone clicks the button.
	// We want to know how often that's happening.
	
	if(typeof was_empty === "boolean" && was_empty === true)
		was_empty = "true";
	else if(typeof was_empty === "boolean" && was_empty === false)
		was_empty = "false";
	else if(typeof was_empty === "string" && was_empty === "true")
		{ }// do nothing
	else if(typeof was_empty === "string" && was_empty === "false")
		{ }// do nothing
	else
		return; // this is bad, unexpected input. do not note threadview
		
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "noteThreadView",
			email: docCookies.getItem("email"),
			this_access_token: docCookies.getItem("this_access_token"),
			url: currentURL,
			was_empty: was_empty
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if(data.response_status === "error")
			{
				// fail silently
			}
			else if(data.response_status === "success")
			{
				// succeed silently
			}	
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			//alert("loginWithGoogle ajax failure");
			console.log(textStatus, errorThrown);
			displayMessage("noteThreadView error (AJAX)", "red");
		} 
	}); 
}

// this function says "Is the thread empty? If so, show empty message. If not, prepare comment divs and then call doThreadItem for each to populate them"
function prepareGetAndPopulateThreadPortion()
{
	if (tabmode === "thread")
	{
		if ((typeof thread_jo.children === "undefined" || thread_jo.children === null || thread_jo.children.length === 0) && bg.threadstatus === 0)
		{
			//alert("Thread had no children");
			var main_div_string = "";
			main_div_string = main_div_string + "<div class=\"no-comments-div\">";
			main_div_string = main_div_string + "		No comments for this page. Write one!";
			main_div_string = main_div_string + "</div>";
			main_div_string = main_div_string + "<div style=\"text-align:center;font-size:13px;padding-top:10px;padding-bottom:3px;display:none;border-top:1px solid black\" id=\"trending_on_this_site_div\"><img src=\"http://www.google.com/s2/favicons?domain=" + currentURL + "\" style=\"vertical-align:middle\"> " + currentHostname + " (48 hrs)</div>";
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
			main_div_string = main_div_string + "<br><img src=\"images/ajaxSnake.gif\" style=\"width:16px;height16px;border:0px\">";
			main_div_string = main_div_string + "		</td>";
			main_div_string = main_div_string + "		<td id=\"most_liked_pages_on_this_site_td\" style=\"width:50%;padding:6px;vertical-align:top\">";
			main_div_string = main_div_string + "<br><img src=\"images/ajaxSnake.gif\" style=\"width:16px;height16px;border:0px\">";
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
							var cutoff_in_hours = 48;
							var choices = [48];
							drawTrendingChart(cutoff_in_hours, data, "most_active_pages_on_this_site_td");
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
							var cutoff_in_hours = 48;
							var choices = [48];
							drawTrendingChart(cutoff_in_hours, data, "most_liked_pages_on_this_site_td");
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
			
			noteThreadView(true); // was empty
		}
		else if (bg.threadstatus === 0) // the last thread has come in (with children), now populate
		{
			//alert("Thread had children");
			var thread_div_string = "";
			var tempcomments = thread_jo.children;
			tempcomments.sort(function(a,b){
				var tsa = fromOtherBaseToDecimal(62, a.substring(0,7));
				var tsb = fromOtherBaseToDecimal(62, b.substring(0,7));
				return tsb - tsa;
			});
			
			thread_jo.children = tempcomments;
			
			// loop the comment id list and doThreadItem for each one
			//alert("showing beginindex=" + beginindex + " through " + endindex);
			for(var x=beginindex; x < endindex && x < thread_jo.children.length; x++) 
			{
				doThreadItem(thread_jo.children[x], currentURLhash, "initialpop");
			}
			
			// if we've reached the end, show "end of comments" message
			if (x < thread_jo.children.length)
				scrollable = 1;
			else if(x === thread_jo.children.length)
			{
				scrollable = 0;
			}
			else
			{
				scrollable = 0;
			}
			
			$("#main_div_" + currentURLhash).append(thread_div_string);

			noteThreadView(false); // was_empty
		}
	}
	else
	{
		// skipping PGandP bc tabmode changed
	}
}

function isValidThreadItemId(inc_id)
{
	// before innerHTML, make sure this is a harmless 11-char string of letters and numbers ending with the letter C (for "comment").
	if(inc_id.length === 11 && /^[A-Za-z0-9]+C$/.test(inc_id))
		return true;
	return false;
}

function doThreadItem(comment_id, parent, commenttype) // type = "initialpop", "newcomment", "reply"
{
	//alert("doing threaditem2 for comment_id=" + comment_id + " and parent=" + parent);
	if(isValidThreadItemId(comment_id)) // before innerHTMl below, make sure this is a harmless 11-char string of letters and numbers.
	{	
		var comment_div_string = "";
		var indent = 0;
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
			indent = 0;
		}
		else 
		{
			//alert("parent=" + parent);
			parent_outer_container_div = "comment_outer_container_div_" + parent;
			//alert("parent_outer_container_div=" + parent_outer_container_div);
			parent_comment_div = "comment_div_" + parent;
			//alert("getting indent from parent_comment_div=" + parent_comment_div);
			indent = ($("#" + parent_comment_div).css("margin-left").replace("px", "")*1) + 25;
			//alert("indent=" + indent);
		}	
		// This is the main thread item (comment) structure. We have a blank container around the actual visible comment.
		// That's so we can .after, .before, .append and .prepend to both the comment itself (replies) as well 
		// as to the comment container (subsequent or previous comments of the same level)

		if(!$("#comment_outer_container_div_" + comment_id).length) // if the container does not already exist, create it
			comment_div_string = comment_div_string + "<div class=\"comment-outer-container-div\" id=\"comment_outer_container_div_" + comment_id + "\">";
		comment_div_string = comment_div_string + "		    <div class=\"complete-horiz-line-div\" id=\"complete_horiz_line_div_" + comment_id + "\"></div>";
		comment_div_string = comment_div_string + "		    <div class=\"message-div\" id=\"message_div_" + comment_id + "\" style=\"display:none\"></div>";
		comment_div_string = comment_div_string + "				<div class=\"comment-div\" style=\"margin-left:" + indent + "px\" id=\"comment_div_" + comment_id + "\">";
		comment_div_string = comment_div_string + "					<span style=\"padding:20px\"><img src=\"images/ajaxSnake.gif\"></span>";
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
	        	if(data.response_status !== "error" && tabmode === "thread")
	        	{
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

function writeComment(feeditem_jo, dom_id)
{
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
		tempstr = tempstr + "		<td class=\"comment-avatar-rating-td\">";
		tempstr = tempstr + "			<table>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td><img class=\"userpic48 rounded\" src=\"images/48avatar_ghosted.png\"></td>";
		tempstr = tempstr + "				</tr>";
		tempstr = tempstr + "			</table>";
		tempstr = tempstr + "		</td>";
		tempstr = tempstr + "		<td class=\"comment-details-td comment-hidden-td\">";
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
		tempstr = tempstr + "		<td class=\"comment-avatar-rating-td\"> <!-- avatar, left hand side -->";
		tempstr = tempstr + "			<table>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "						<img id=\"author_picture_img_" + comment_id + "\" class=\"userpic48 rounded\" src=\"images/ajaxSnake.gif\">";
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";			
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "						<table class=\"user-rating-table\">";
		tempstr = tempstr + "							<tr>";
		tempstr = tempstr + "								<td id=\"author_rating_left_td_" + comment_id + "\" style=\"width:33%;height:3px;border:0px solid black\"></td>";
		tempstr = tempstr + "								<td id=\"author_rating_center_td_" + comment_id + "\" style=\"width:34%;height:3px;border:0px solid black;background-color:blue\"></td>";
		tempstr = tempstr + "								<td id=\"author_rating_right_td_" + comment_id + "\" style=\"width:33%;height:3px;border:0px solid black\"></td>";
	  	tempstr = tempstr + "							</tr>";
	  	tempstr = tempstr + "						</table>"
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";			
		tempstr = tempstr + "			</table>";
		tempstr = tempstr + "		</td>";
		tempstr = tempstr + "		<td  class=\"comment-details-td\"> <!-- everything else, right-hand side -->";
		tempstr = tempstr + "			<table>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td class=\"comment-screenname-state-country-td\"> ";
		tempstr = tempstr + "						<a class=\"comment-screenname-link\" href=\"#\" id=\"screenname_link_" + comment_id + "\"></a> - ";
		tempstr = tempstr + "						<span id=\"state_country_span_" + comment_id + "\"></span> - ";
		tempstr = tempstr + "						<span id=\"time_ago_span_" + comment_id + "\"></span>";
		tempstr = tempstr + "					</td>";
		
		// show like/dislike (and maybe delete) buttons
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "	<table>";
		tempstr = tempstr + "		<tr> ";
		tempstr = tempstr + "		   <td id=\"comment_likes_count_td_" + comment_id + "\" class=\"comment-likes-count-td\"></td>";
		if (tabmode === "thread") 
        {
			tempstr = tempstr + "	       <td class=\"comment-like-image-td\"><img src=\"images/like_arrow.png\" id=\"like_img_" + comment_id + "\"></td>";
			tempstr = tempstr + "	       <td class=\"comment-dislike-image-td\"><img src=\"images/dislike_arrow.png\" id=\"dislike_img_" + comment_id + "\"></td>";
        }
		tempstr = tempstr + "		   <td id=\"comment_dislikes_count_td_" + comment_id + "\" class=\"comment-dislikes-count-td\"></td>";
		if ((tabmode === "thread" || tabmode === "past") && (bg.user_jo !== null && bg.user_jo.screenname === feeditem_jo.author_screenname)) // if no bg.user_jo or screennames don't match, hide
		{
			tempstr = tempstr + "		   <td class=\"comment-delete-td\"> ";
			tempstr = tempstr + "				<a href=\"#\" id=\"comment_delete_link_" + comment_id + "\">X</a> ";
			tempstr = tempstr + "		   </td>";
		}
		if((tabmode === "thread") && (bg.user_jo !== null && bg.user_jo.screenname === "fivedogit"))
		{
			tempstr = tempstr + "		   <td class=\"comment-nuke-td\"> ";
			tempstr = tempstr + "				<a href=\"#\" id=\"comment_nuke_link_" + comment_id + "\">N!</a> ";
			tempstr = tempstr + "		   </td>";
			tempstr = tempstr + "		   <td class=\"comment-megadownvote-td\"> ";
			tempstr = tempstr + "				<a href=\"#\" id=\"comment_megadownvote_link_" + comment_id + "\">D!</a> ";
			tempstr = tempstr + "		   </td>";
		}	
		
		tempstr = tempstr + "		</tr>";
		tempstr = tempstr + "  	</table>";
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td colspan=2 id=\"comment_text_td_" + comment_id + "\" class=\"comment-text-td\"> ";
	  	tempstr = tempstr + "					</td>";
	  	tempstr = tempstr + "				</tr>";

	  	// show reply stuff  
	  	if (tabmode === "thread" && (($("#comment_div_" + feeditem_jo.id).css("margin-left").replace("px","")*1) < 125)) // we know this is a 6th level comment if indent value is 125 or greater, don't show reply option
	  	{
	  		tempstr = tempstr + "				<tr>";
	  		tempstr = tempstr + "					<td class=\"comment-reply-link-td\" colspan=2> ";
	  		tempstr = tempstr + "							<a href=\"#\" id=\"reply_link_" + comment_id + "\"><b>Reply</b></a>";
	  		tempstr = tempstr + "					</td>";
	  		tempstr = tempstr + "				</tr>";
	  		tempstr = tempstr + "				<tr>";
	  		tempstr = tempstr + "					<td class=\"reply-td\" id=\"reply_td_" + comment_id + "\" colspan=2> ";
	  		tempstr = tempstr + "						<form class=\"comment-submission-form\" method=post action=\"#\">";
	  		tempstr = tempstr + "							<div class=\"comment-submission-form-div\">";
	  		tempstr = tempstr + "								<textarea class=\"composition-textarea\" style=\"color:black\" id=\"comment_textarea_" + comment_id + "\"></textarea>";
	  		tempstr = tempstr + "								<div class=\"char-count-and-submit-button-div\" id=\"char_count_and_submit_button_div_" + comment_id + "\">";
	  		tempstr = tempstr + "									<span class=\"comment-submission-progress-span\" id=\"comment_submission_progress_span_" + comment_id + "\"><img src=\"images/ajaxSnake.gif\"></span>";
	  		tempstr = tempstr + "									<span id=\"charsleft_" + comment_id + "\"></span>";
	  		tempstr = tempstr + "									<span><input id=\"comment_submission_form_submit_button_" + comment_id + "\" type=button value=\"Submit\"></input></span>";
	  		tempstr = tempstr + "								</div>";
	  		tempstr = tempstr + "							</div>";
	  		tempstr = tempstr + "						</form>";
	  		tempstr = tempstr + "					</td>";
	  		tempstr = tempstr + "				</tr>";
	  	}
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
	$("[id=screenname_link_" + comment_id + "]").text(feeditem_jo.author_screenname);
	if (feeditem_jo.author_country === "USA")
		$("[id=state_country_span_" + comment_id + "]").text(feeditem_jo.author_state + ", " + feeditem_jo.author_country);
	else
		$("[id=state_country_span_" + comment_id + "]").text(feeditem_jo.author_country);
	$("[id=time_ago_span_" + comment_id + "]").text(feeditem_jo.time_ago);
	$("[id=comment_likes_count_td_" + comment_id + "]").text(feeditem_jo.likes.length);
	$("[id=comment_dislikes_count_td_" + comment_id + "]").text(feeditem_jo.dislikes.length);
	
	//printURLsAndIndexes(feeditem_jo.text);
	var linkified_div = getLinkifiedDiv(feeditem_jo.text);
	/*var text_with_brs = feeditem_jo.text;
   	text_with_brs =	text_with_brs.replace(/\n/g, '<br />');
  	var text_with_links = replaceURLWithHTMLLinks(text_with_brs);*/
  	//tempstr = tempstr + text_with_links;
	$("[id=comment_text_td_" + comment_id + "]").html(linkified_div);
	//$("[id=comment_text_td_" + comment_id + "]").html(feeditem_jo.text); //OPERA-REVIEW
	
	if(tabmode === "thread")
	{	
		var saved_text_dom_id = docCookies.getItem("saved_text_dom_id");
		var charsleft = 500;
		if(saved_text_dom_id != null && saved_text_dom_id === ("comment_textarea_" + comment_id) 
				&& docCookies.getItem("saved_text") != null && docCookies.getItem("saved_text").trim().length > 0)
		{
			var s_text = docCookies.getItem("saved_text");
			charsleft = 500 -  s_text.length;
			$("#comment_textarea_" + comment_id).text(s_text);
		}
		else	
			$("#comment_textarea_" + comment_id).text("Say something...");
		$("#charsleft_" + comment_id).text(charsleft);
	}
	
	$("a").click(function(event) {
		if(typeof event.processed === "undefined" || event.processed === null) // prevent this from firing multiple times by setting event.processed = true on first pass
		{
			event.processed = true;
			var c = $(this).attr('class');
			if(c == "newtab")
			{
				var h = $(this).attr('href');
				doNewtabClick(h);
			}
		}
	});
	
	if(bg.user_jo !== null)
	{
		$.ajax({
			type: 'GET',
	        url: endpoint,
	        data: {
	            method: "haveILikedThisComment",
	            id: feeditem_jo.id,
	            email: docCookies.getItem("email"),
	            this_access_token: docCookies.getItem("this_access_token")
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {
	        	if (data.response_status === "error")
	        	{
	        		// fail silently
	        	}
	        	else if (data.response_status === "success")
	        	{
	        		if(typeof data.response_value !== "undefined" && data.response_value !== null && data.response_value === true)
	        			$("#like_img_" + comment_id).attr("src", "images/like_arrow_liked.png");
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
	            email: docCookies.getItem("email"),
	            this_access_token: docCookies.getItem("this_access_token")
	        },
	        dataType: 'json',
	        async: true,
	        success: function (data, status) {
	        	if (data.response_status === "error")
	        	{
	        		// fail silently
	        	}
	        	else if (data.response_status === "success")
	        	{
	        		if(typeof data.response_value !== "undefined" && data.response_value !== null && data.response_value === true)
	        			$("#dislike_img_" + comment_id).attr("src", "images/dislike_arrow_disliked.png");
	        	}
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
	            console.log(textStatus, errorThrown);
	        } 
		});
	}
	
	if (tabmode === "thread")
	{
		$("#reply_link_" + comment_id).click({value: comment_id}, function(event) {
			if (bg.user_jo)
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
			return false;
		});
			
		createSubmissionFormSubmitButtonClickEvent(comment_id);
	 	createFocusEventForTextarea(comment_id);
	 	createBlurEventForTextarea(comment_id);
	 	createKeyupEventForTextarea(comment_id, 500);
		
		$("#like_img_" + comment_id).click({value: feeditem_jo.id}, function(event) {
			likeOrDislikeComment(event.data.value, "like"); // id, like or dislike, dom_id
			return false;
		});
	 		 
		$("#dislike_img_" + comment_id).click({value: feeditem_jo.id}, function(event) {
			likeOrDislikeComment(event.data.value, "dislike"); // id, like or dislike, dom_id
			return false;
		});
		
		$("#comment_nuke_link_" + comment_id).click({value: feeditem_jo.id}, function(event) {
			var confirmbox = confirm("Nuke comment?\n(This action is permanent and risky.)");
			if (confirmbox === true)
				nukeComment(event.data.value);
			return false;
		});
		
		$("#comment_megadownvote_link_" + comment_id).click({value: feeditem_jo.id}, function(event) {
			var confirmbox = confirm("Megadownvote comment?\n(This action is permanent.)");
			if (confirmbox === true)
				megadownvoteComment(event.data.value);
			return false;
		});
	}
	
	if (tabmode === "thread" || tabmode === "past")
	{
		$("#comment_delete_link_" + comment_id).click({value: feeditem_jo.id}, function(event) {
			var confirmbox = confirm("Delete comment?\n(This action is permanent.)");
			if (confirmbox === true)
				hideComment(event.data.value);
			return false;
		});
	}
	
	$("[id=screenname_link_"+ comment_id + "]").click({value: feeditem_jo}, function(event) {
		viewProfile(event.data.value.author_screenname);
	});
}

// to submit a comment, we only need to know the id of the parent to which this new comment will be attached, right?

function submitComment(parent) // submits comment and updates thread
{
	var text = $("#comment_textarea_" + parent).val();
	//alert("submitting comment");
	var email = docCookies.getItem("email");
	var this_access_token = docCookies.getItem("this_access_token");
	var parent_to_submit = parent;
	if(parent.length !== 11) // this is a toplevel comment. if toplevel, "parent" should be 8 chars as hashed by hashFnv32a()
		parent_to_submit = currentURL;
	$.ajax({
	    type: 'GET',
	    url: endpoint,
	    data: {
	        method: "addComment",
	        url: currentURL,
	        email: email, // do it this way... no need to go get these from cookies again
            this_access_token: this_access_token, // if the user loaded the page and got this link to click in the first place, these values should be valid
            text: text,
	        parent: parent_to_submit
	    },
	    dataType: 'json',
	    async: true,
	    success: function (data, status) {

	        if (data.response_status === "error") 
	        {
	        	//if (parent_to_submit.indexOf(".") !== -1) // on server-fail of toplevel form comm submission, reenable submit button and remove spinner
		    	//	displayMessage(data.message, "red", "message_div_" + currentURLhash);
	        	//else
	        	displayMessage(data.message, "red", "message_div_" + parent);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red");
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        			updateLogstat();
        		}
	        	// on error, leave the comment box open with whatever was in there, char count the same. Just re-enable the submit button.
	        	$("#comment_submission_form_submit_button_" + parent).removeAttr('disabled');
	        	$("#comment_submission_progress_span_" + parent).hide();
	        } 
	        else 
	        {
	        	if(parent.length !== 11) // toplevel
		    	{
		    		$("#comment_submission_form_submit_button_" + parent).removeAttr("disabled");
		    		$("#comment_submission_progress_span_" + parent).hide();
		    		if(!thread_jo.children) // if the main thread jo was empty before, create it with one item, this new one and empty the main_div to receive it
					{
						var onechildarray = new Array();
						onechildarray[0] = data.comment.id;
						thread_jo.children = onechildarray; 
						$("#main_div_" + parent).text("");
					}	
		        	else
		        	{
		        		var temparray = thread_jo.children;
		        		temparray.push(data.comment.id);
		        		thread_jo.children = temparray; 
		        	}
		    	}
	        	
	        	// on success, reset the form stuff
	        	$("#comment_textarea_" + parent).css("height", "22px");			// set it back to normal height
	        	$("#comment_textarea_" + parent).val("Say something..."); // set the default wording
	        	$("#char_count_and_submit_button_div_" + parent).hide();			// hide the charcount and submit area
	        	if(parent.length === 11) // not toplevel
	        		$("#reply_td_" + parent).hide();								// hide the reply area div
	        	$("#comment_textarea_" + parent).css("color", "#aaa");			// reset the text to gray
	        	$("#comment_submission_form_submit_button_" + parent).removeAttr('disabled');
		    	
	        	docCookies.removeItem("saved_text");		// on success, removed the saved text cookies
	        	docCookies.removeItem("saved_text_dom_id");
	        	
	        	//if(parent.indexOf(".") !== -1) // toplevel
	        	//	displayMessage("Comment posted.", "black", "message_div_" + currentURLhash);
	        	//else 
	        	displayMessage("Comment posted.", "black", "message_div_" + parent);
				
	        	if(parent.length !== 11) // toplevel
					doThreadItem(data.comment.id, parent, "newcomment");
				else
					doThreadItem(data.comment.id, data.comment.parent, "reply");
	        }
	    },
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
	    	displayMessage("Ajax error addComment: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + id);
       	 	$("#comment_submission_form_div_" + parent).hide();
       	 	$("#comment_submission_form_submit_button_" + parent).removeAttr("disabled");
       	 	$("#comment_submission_progress_span_" + parent).hide();
	        console.log(textStatus, errorThrown);
	    }
	});
}

function hideComment(inc_id) // submits comment and updates thread
{
	var email = docCookies.getItem("email");
	var this_access_token = docCookies.getItem("this_access_token");
	$.ajax({
	    type: 'GET',
	    url: endpoint,
	    data: {
	        method: "hideComment",
	        id: inc_id,
	        email: email, 
            this_access_token: this_access_token
	    },
	    dataType: 'json',
	    async: true,
	    success: function (data, status) {

	        if (data.response_status == "error") 
	        {
	        	displayMessage(data.message, "red", "message_div_" + inc_id);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red");
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        			updateLogstat();
        		}
	        }
	        else if (data.response_status === "success")
	        {
	        	displayMessage("Comment hidden.", "black", "message_div_" + inc_id);
	        	if(tabmode === "thread")
	        		doThreadItem(data.comment.id, data.comment.parent, "reply");
	        	if(tabmode === "past")
	        		doPastTab();
	        }
	        else
	        {
	        	//alert("weird");
	        }
	    },
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
	    	displayMessage("Ajax error hideComment: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + inc_id);
	        console.log(textStatus, errorThrown);
	    }
	});
}

function nukeComment(inc_id) // submits comment and updates thread
{
	var email = docCookies.getItem("email");
	var this_access_token = docCookies.getItem("this_access_token");
	$.ajax({
	    type: 'GET',
	    url: endpoint,
	    data: {
	        method: "nukeComment",
	        id: inc_id,
	        email: email, 
            this_access_token: this_access_token
	    },
	    dataType: 'json',
	    async: true,
	    success: function (data, status) {

	        if (data.response_status == "error") 
	        {
	        	displayMessage(data.message, "red", "message_div_" + inc_id);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red");
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        			updateLogstat();
        		}
	        }
	        else if (data.response_status === "success")
	        {
	        	displayMessage("Nuke process underway.", "black", "message_div_" + inc_id);
				doThreadItem(data.comment.id, data.comment.parent, "reply");
	        }
	        else
	        {
	        	//alert("weird");
	        }
	    },
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
	    	displayMessage("Ajax error nukeComment: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + inc_id);
	        console.log(textStatus, errorThrown);
	    }
	});
}

function megadownvoteComment(inc_id) // submits comment and updates thread
{
	var email = docCookies.getItem("email");
	var this_access_token = docCookies.getItem("this_access_token");
	$.ajax({
	    type: 'GET',
	    url: endpoint,
	    data: {
	        method: "megadownvoteComment",
	        id: inc_id,
	        email: email, 
            this_access_token: this_access_token
	    },
	    dataType: 'json',
	    async: true,
	    success: function (data, status) {

	        if (data.response_status == "error") 
	        {
	        	displayMessage(data.message, "red", "message_div_" + inc_id);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red");
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        			updateLogstat();
        		}
	        }
	        else if (data.response_status === "success")
	        {
	        	displayMessage("megadownvoteComment process underway.", "black", "message_div_" + inc_id);
				doThreadItem(data.comment.id, data.comment.parent, "reply");
	        }
	        else
	        {
	        	//alert("weird");
	        }
	    },
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
	    	displayMessage("Ajax error megadownvoteComment: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + inc_id);
	        console.log(textStatus, errorThrown);
	    }
	});
}

function likeOrDislikeComment(id, like_or_dislike)
{
	if(like_or_dislike === "like")
	{
		$("#like_img_" + id).attr("src", "images/like_snake.gif");
		//alert("like snake");
	}
	else
	{
		$("#dislike_img_" + id).attr("src", "images/dislike_snake.gif");
		//alert("dislike snake");
	}
	if (bg.user_jo)
	{
		var email = docCookies.getItem("email");
		var this_access_token = docCookies.getItem("this_access_token");
		$.ajax({
			type: 'GET',
			url: endpoint,
			data: {
				method: "addCommentLikeOrDislike",
				email: email, 
				this_access_token: this_access_token, 
				id: id,
				like_or_dislike: like_or_dislike,
				reason: "generic_like"
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				if(like_or_dislike === "like")
					$("#like_img_" + id).attr("src", "images/like_arrow.png");
				else
					$("#dislike_img_" + id).attr("src", "images/dislike_arrow.png");
				if (data.response_status === "error") 
				{
					displayMessage(data.message, "red", "message_div_" + id);
	            	if(data.error_code && data.error_code === "0000")
	        		{
	        			displayMessage("Your login has expired. Please relog.", "red");
	        			docCookies.removeItem("email"); 
	        			docCookies.removeItem("this_access_token");
	        			bg.user_jo = null;
	        			updateLogstat();
	        		}
					return;
				} 
				else if (data.response_status === "success")
				{
					if (like_or_dislike === "like")
						displayMessage("Like recorded.", "black", "message_div_" + id);
					else
						displayMessage("Dislike recorded.", "black", "message_div_" + id);
					doThreadItem(data.parent.id, data.parent.parent, "reply"); // reload the comment this like is attached to and attach it to the parent's parent
				}
				else
				{
					//alert("weird");
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				displayMessage("Ajax error addCommentLikeOrDislike: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + id);
				console.log(textStatus, errorThrown);
			} 
		});
	}
	else
	{
		displayMessage("Please login first.", "red", "message_div_" + id);
	}		 
}

//this ugly function happens when a user has clicked the activation button before
//the thread has been downloaded from the backend.
//it waits for up to 7 seconds, letting the OTHER wedge animate all along. 
//and then populates the appropriate areas when finished (so long as the URL is still correct)
function gotThread_wedge_for_ntj(url_at_function_call)
{
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{if(url_at_function_call===currentURL){thread_jo = bg.t_jo; gotThread();}return;}
	setTimeout(function(){
		//alert("final");
		if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
		{
			if(url_at_function_call===currentURL)
			{
				thread_jo = bg.t_jo; gotThread();
			}
		}
		else
		{
			if(tabmode === "thread")
			{
				$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Unable to retrieve thread. Your internet connection may be down.</div>");//OK
				displayMessage("Thread retrieval error.", "red", "message_div_"+ currentURLhash);
			}
		}
		return;
	},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);
}
