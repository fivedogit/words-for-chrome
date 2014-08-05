
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
	$("#thread_tab_img").attr("src", chrome.extension.getURL("images/chat_blue.png"));
	$("#trending_tab_img").attr("src", chrome.extension.getURL("images/trending_gray.png"));
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", chrome.extension.getURL("images/clock_gray.png"));
	$("#profile_tab_img").attr("src", chrome.extension.getURL("images/user_gray.png"));
	
	$("#utility_header_td").text("Comment thread");
	$("#utility_message_td").hide();
	$("#utility_csf_td").show();
	
	$("#main_div_" + currentURLhash).text("");
	
	if(isValidURLFormation(currentURL))
	{
		if(chrome.tabs) // this is the overlay
		{
			if((typeof thread_jo === "undefined" || thread_jo === null))// && bg.threadstatus !== 0) // overlay has been loaded, but thread is still being retrieved
			{
				var url_at_function_call = currentURL;
				// wait for thread to load
				$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Retrieving thread... <img id=\"google_favicon_img_" + currentURLhash + "\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>");//OK
				gotThread_wedge_for_ntj(url_at_function_call);
				// the difference between this wedge and the other one is that this one does not animate (or two animations would be happening on top of each other)
			}
			/*
			else if(thread_jo === null && bg.threadstatus === 0) // overlay has loaded but thread_jo is null -- this happens when using the inspector, and possibly other scenarios
			{
				var main_div_string = "<div style=\"padding:20px\">Could not display thread.<br>";
				main_div_string = main_div_string + "		Try switching tabs or reloading the page, then clicking the WORDS button again.</div>"; // , hostname must contain a \".\" and lack a \":\".
				$("#main_div_" + currentURLhash).html(main_div_string);//OK
			}*/
			else if(thread_jo !== null && bg.threadstatus === 0) 
			{
				gotThread();
			}
		}
		else // this is the embedded widget
		{
			gotThread();
		}
	}
	else // not a valid URL formation
	{
		beginindex = 0;
		$("#utility_csf_td").hide();
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
		happy = happy + "<table style=\"margin-left:auto;margin-right:auto;width:auto;border:0px solid red\">";
		happy = happy + "	<tr>";
		happy = happy + "		<td style=\"padding-right:3px\">";
		happy = happy + "<img id=\"google_favicon_img_" + currentURLhash + "\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"> ";
		happy = happy + "		</td>";
		happy = happy + "		<td style=\"padding-right:3px\">";
		if(thread_jo.combined_or_separated === "combined")
			happy = happy + "<img id=\"separated_or_combined_img\" src=\"" + chrome.extension.getURL("images/combined_icon.png") + "\"> ";
		else
			happy = happy + "<img id=\"separated_or_combined_img\" src=\"" + chrome.extension.getURL("images/separated_icon.png") + "\"> ";
		happy = happy + "		</td>";
		happy = happy + "		<td style=\"padding-right:3px\">";
		happy = happy + "<span id=\"url_span_" + currentURLhash + "\" style=\"font-family:arial;font-size:12px;padding-right:6px;\"></span>";
		happy = happy + "		</td>";
		happy = happy + "		<td style=\"padding-right:3px\">";
		happy = happy + "<img id=\"follow_img\" src=\"" + chrome.extension.getURL("images/follow_off_12x16.png") + "\" style=\"padding-right:6px;\">";
		happy = happy + "		</td>";
		happy = happy + "		<td style=\"padding-right:3px\">";
		happy = happy + "<img id=\"pagelike_img\" src=\"" + chrome.extension.getURL("images/star_grayscale_16x16.png") + "\" style=\"padding-right:1px;\">";
		happy = happy + "		</td>";
		happy = happy + "		<td>";
		happy = happy + "<span style=\"color:green\" id=\"num_pagelikes_span\"></span>";
		happy = happy + "		</td>";
		
		if(thread_jo.combined_or_separated === "separated" && user_jo !== null && typeof user_jo.permission_level !== "undefined" 
			&& user_jo.permission_level !== null && user_jo.permission_level === "admin")
		{
			happy = happy + "		<td style=\"padding-left:3px\">";
			happy = happy + " <input style=\"width:24px\" id=\"sqsp\"> <a href=\"#\" id=\"set_sqsp\">s</a>";
			happy = happy + "		</td>";
		}	
		happy = happy + "	</tr>";
		happy = happy + "</table>";
		
		// like/dislike indicator here
		$("#utility_header_td").html(happy);//OK
		
		
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
		
		$("#pagelike_img").click( function (event) { event.preventDefault();
			var prev = $("#pagelike_img").attr("src");
			$("#pagelike_img").attr("src", chrome.extension.getURL("images/ajaxSnake.gif"));
			$.ajax({
				type: 'GET',
				url: endpoint,
				data: {
					screenname: screenname, 
					this_access_token: this_access_token,
					method: likepage_method,
					url: currentURL
				},
				dataType: 'json',
				async: true,
				success: function (data, status) {
					if(data.response_status === "success")
					{
						$("#pagelike_img").attr("src", chrome.extension.getURL("images/star_16x16.png"));
						if(thread_jo.combined_or_separated === "separated")	
							displayMessage("Page liked.", "black");
						else
							displayMessage("Site liked.", "black");
						getPageLikes(which_like_type);
					}
					else if(data.response_status === "error")
					{
						$("#pagelike_img").attr("src", prev);
						displayMessage(data.message, "red", "utility_message_td", 5);
						if(data.error_code && data.error_code === "0000")
						{
							displayMessage("Your login has expired. Please relog.", "red");
							user_jo = null;
							displayAsLoggedOut();
						}
					}	
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					$("#pagelike_img").attr("src", prev);
					displayMessage("Unable to like page. (ajax)", "red", "utility_message_td");
					console.log(textStatus, errorThrown);
				}
			});
		});
	 	
		if(user_jo !== null)
		{
			$.ajax({
				type: 'GET',
		        url: endpoint,
		        data: {
		            method: haveilikedpage_method,
		            url: currentURL,
		            screenname: screenname, 
		            this_access_token: this_access_token
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
		        		if(data.response_value === true)
		        			$("#pagelike_img").attr("src", chrome.extension.getURL("images/star_16x16.png"));
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
		            method: "amIFollowingThisPage",
		            url: currentURL,
		            screenname: screenname, 
		            this_access_token: this_access_token
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
		        		if(data.response_value === true)
		        			$("#follow_img").attr("src", chrome.extension.getURL("images/follow_on_12x16.png"));
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
	 	
		$("#follow_img").mouseover(
	 			function () {
	 				if($("#follow_img").attr("src").indexOf("off") != -1)
	 					$("#tab_tooltip_td").text("Follow this page");
	 				else
	 					$("#tab_tooltip_td").text("Unfollow this page");
	 				return false;
	 			});

	 	$("#follow_img").mouseout(
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
	 	
	 	$("#follow_img").click( function (event) { event.preventDefault();
	 		var previous_src = $("#follow_img").attr("src");
	 		$("#follow_img").attr("src", "images/ajaxSnake.gif");
	 		if(previous_src.indexOf("off") != -1)
	 		{	
	 			$.ajax({
	 				type: 'GET',
	 				url: endpoint,
	 				data: {
	 					screenname: screenname, 
	 					this_access_token: this_access_token,
	 					method: "followPage",
	 					url: currentURL
	 				},
	 				dataType: 'json',
	 				async: true,
	 				success: function (data, status) {
	 					if(data.response_status === "success")
	 					{
	 						$("#follow_img").attr("src", chrome.extension.getURL("images/follow_on_12x16.png"));
	 						displayMessage("You are now following this page.", "black");
	 					}
	 					else if(data.response_status === "error")
	 					{
	 						$("#follow_img").attr("src", previous_src);
	 						displayMessage("Unable to follow page. " + data.message, "red");
	 					}	
	 				},
	 				error: function (XMLHttpRequest, textStatus, errorThrown) {
	 					$("#follow_img").attr("src", previous_src);
	 					displayMessage("Unable to follow page. (AJAX)", "red");
	 					console.log(textStatus, errorThrown);
	 				}
	 			});
	 		}
	 		else
	 		{
	 			$.ajax({
	 				type: 'GET',
	 				url: endpoint,
	 				data: {
	 					screenname: screenname, 
	 					this_access_token: this_access_token,
	 					method: "unfollowPage",
	 					url: currentURL
	 				},
	 				dataType: 'json',
	 				async: true,
	 				success: function (data, status) {
	 					if(data.response_status === "success")
	 					{
	 						$("#follow_img").attr("src", chrome.extension.getURL("images/follow_off_12x16.png"));
	 						displayMessage("You are no longer following this page.", "black");
	 					}
	 					else if(data.response_status === "error")
	 					{
	 						$("#follow_img").attr("src", previous_src);
	 						displayMessage("Unable to unfollow page. " + data.message, "red");
	 					}	
	 				},
	 				error: function (XMLHttpRequest, textStatus, errorThrown) {
	 					$("#follow_img").attr("src", previous_src);
	 					displayMessage("Unable to unfollow page. (ajax)", "red", "utility_message_td");
	 					console.log(textStatus, errorThrown);
	 				}
	 			});
	 		}	
	 	});
	 	
	 	
	 	if(user_jo !== null && typeof user_jo.permission_level !== "undefined" && user_jo.permission_level !== null && user_jo.permission_level === "admin")
	 	{
	 		$("#separated_or_combined_img").click( function (event) { event.preventDefault();
	 			//alert($("#separated_or_combined_img").attr("src"));
	 			if($("#separated_or_combined_img").attr("src").indexOf("combined") != -1)
	 			{	
	 				$.ajax({
	 					type: 'GET',
	 					url: endpoint,
	 					data: {
	 						method: "separateHostname",
	 						url: currentURL,
	 						screenname: screenname, 
	 						this_access_token: this_access_token
	 					},
	 					dataType: 'json',
	 					async: true,
	 					success: function (data, status) {
	 						if (data.response_status === "error")
	 						{
	 							// if someone clicks this without proper admin credentials, just fail silently as if nothing happened.
	 						}
	 						else if (data.response_status === "success")
	 						{
	 							displayMessage("Hostname separated.", "red", "utility_message_td");
	 							$("#separated_or_combined_img").attr("src", chrome.extension.getURL("images/separated_icon.png"));
	 						}
	 					},
	 					error: function (XMLHttpRequest, textStatus, errorThrown) {
	 						// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
	 						console.log(textStatus, errorThrown);
	 					} 
	 				});
	 			}
	 			else // the img source is separated
	 			{
	 				$.ajax({
	 					type: 'GET',
	 					url: endpoint,
	 					data: {
	 						method: "combineHostname",
	 						url: currentURL,
	 						screenname: screenname, 
	 						this_access_token: this_access_token
	 					},
	 					dataType: 'json',
	 					async: true,
	 					success: function (data, status) {
	 						if (data.response_status === "error")
	 						{
	 							// if someone clicks this without proper admin credentials, just fail silently as if nothing happened.
	 						}
	 						else if (data.response_status === "success")
	 						{
	 							displayMessage("Hostname combined.", "red", "utility_message_td");
	 							$("#separated_or_combined_img").attr("src", chrome.extension.getURL("images/combined_icon.png"));
	 						}
	 					},
	 					error: function (XMLHttpRequest, textStatus, errorThrown) {
	 						// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
	 						console.log(textStatus, errorThrown);
	 					} 
	 				});
	 			}	
	 		});
	 		
	 		$("#set_sqsp").click( function (event) { event.preventDefault();
	 			//alert("sending " + currentURL);
	 			$.ajax({
	 				type: 'GET',
	 				url: endpoint,
	 				data: {
	 					method: "setSignificantQSP",
	 					url: currentURL,
	 					sqsp: $("#sqsp").val(),
	 					screenname: screenname, 
	 					this_access_token: this_access_token
	 				},
	 				dataType: 'json',
	 				async: true,
	 				success: function (data, status) {
	 					if (data.response_status === "error")
	 					{
	 						displayMessage(data.message, "red", "utility_message_td");
	 					}
	 					else if (data.response_status === "success")
	 					{
	 						displayMessage("sqsp set", "red", "utility_message_td");
	 					}
	 				},
	 				error: function (XMLHttpRequest, textStatus, errorThrown) {
	 					// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
	 					displayMessage("AJAX error", "red", "utility_message_td");
	 					console.log(textStatus, errorThrown);
	 				} 
	 			});
	 		});
		}
		
		$("#separated_or_combined_img").mouseover(
	 			function () {
	 				if($("#separated_or_combined_img").attr("src").indexOf("combined") !== -1)
	 					$("#tab_tooltip_td").text("Combined threads");
	 				else
	 					$("#tab_tooltip_td").text("Separated threads");
	 			});

	 	$("#separated_or_combined_img").mouseout(
	 			function () {
	 				if(tabmode === "thread")
	 					$("#tab_tooltip_td").text("Comments");
	 				else if(tabmode === "trending")
	 					$("#tab_tooltip_td").text("Trending");
	 				else if(tabmode === "notifications")
	 					$("#tab_tooltip_td").text("Notifications");
	 				else if(tabmode === "profile")
	 					$("#tab_tooltip_td").text("Profile/Settings");
	 			});
		beginindex = 0;
		endindex = 15;
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
        		// fail silently
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
			screenname: screenname, 
			this_access_token: this_access_token,
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


function writeUnifiedCommentContainer(id_to_use, dom_id, action) // main_div_HASH, append/before/after/prepend, etc
{
	var unified = "";
	unified = unified + "<div id=\"container_div_" + id_to_use + "\" style=\"background-color:white;\">";
	unified = unified + "	<div id=\"horizline_div_" + id_to_use + "\" class=\"complete-horiz-line-div\"></div>"; // always shown
	unified = unified + "	<div style=\"padding:6px\">";
	unified = unified + "		<div id=\"message_div_" + id_to_use + "\" style=\"padding:5px 0px 5px 0px;display:none\"></div>"; // hidden unless message displayed
	unified = unified + "		<div id=\"header_div_" + id_to_use + "\" style=\"padding:5px 0px 5px 0px;text-align:left;display:none\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>"; // hidden except for notification page
	unified = unified + "		<div id=\"parent_div_" + id_to_use + "\" style=\"padding:5px 0px 5px 0px;display:none\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>"; //hidden except for notification page
	unified = unified + "		<div id=\"comment_div_" + id_to_use + "\" style=\"border:0px solid black;padding:5px 0px 5px 0px;\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>"; // always shown except for like/dislike on notification page
	unified = unified + "		<div id=\"child_div_" + id_to_use + "\" style=\"padding:5px 0px 0px 0px;display:none\"></div>"; // always hidden except when someone replies on notification page
	unified = unified + "	</div>";
	unified = unified + "</div>";
	if(action === "append")
		$("#" + dom_id).append(unified);
	else if(action === "prepend")
		$("#" + dom_id).prepend(unified);
	else if(action === "after")
		$("#" + dom_id).after(unified);
	else if(action === "before")
		$("#" + dom_id).before(unified);
}

// this function says "Is the thread empty? If so, show empty message. If not, prepare comment divs and then call doThreadItem for each to populate them"
function prepareGetAndPopulateThreadPortion()
{
	if (tabmode === "thread")
	{
		if (typeof thread_jo.children === "undefined" || thread_jo.children === null || thread_jo.children.length === 0)// && bg.threadstatus === 0)
		{
			//alert("Thread had no children");
			var main_div_string = "";
			main_div_string = main_div_string + "<div style=\"padding:25px;font-size:22px;font-weight:bold\">";
			main_div_string = main_div_string + "	There are no comments for this page yet.";
			main_div_string = main_div_string + "	<div style=\"padding-top:25px;font-size:12px;font-style:italic;font-weight:normal\">";
			main_div_string = main_div_string + "	    Try the <a href=\"#\" id=\"supplemental_trending_link\"><img style=\"vertical-align:middle\" src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></a> trending tab.";
			main_div_string = main_div_string + "	</div>";
			main_div_string = main_div_string + "</div>";
			main_div_string = main_div_string + "<div id=\"trending_div\"></div>";
			$("#main_div_" + currentURLhash).html(main_div_string);//OK
			$("#supplemental_trending_link").click( function (event) {	event.preventDefault();
				doTrendingTab();
			});

			drawTrendingTable(currentHostname, 4, "trending_div");
			noteThreadView(true); // was empty
		}
		else // if (bg.threadstatus === 0) // the last thread has come in (with children), now populate
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
			for(var x=beginindex; x < endindex && x < thread_jo.children.length; x++) 
			{
				writeUnifiedCommentContainer(thread_jo.children[x], "main_div_" + currentURLhash, "append");
				doThreadItem(thread_jo.children[x], "comment_div_" + thread_jo.children[x]);
			}
			// if we've reached the end, show "end of comments" message
			if (x < thread_jo.children.length)
			{
				scrollable = 1;
			}
			else if(x === thread_jo.children.length)
			{
				scrollable = 0;
			}
			else
			{
				scrollable = 0;
			}
			
			//$("#main_div_" + currentURLhash).append(thread_div_string);

			noteThreadView(false); // was not empty
		}
	}
	else
	{
		// skipping PGandP bc tabmode changed
	}
}

function doThreadItem(comment_id, dom_id) // type = "initialpop", "newcomment", "reply"
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
        		
        		/*if(tabmode === "notifications") // why would this ever fire in notifications mode? Shouldn't it always call doNotificationItem?
        		{
        			writeComment(container_id, data.item, dom_id, false, true, false); // l/d, delete button (if user authored it), reply
        			$("#" + dom_id).css("margin-left", "60px");
        		}
        		else
        		{*/
        			writeComment(container_id, data.item, dom_id, true, true, true); // l/d, delete button (if user authored it), reply
        			var indent = (data.item.depth-1) * 30;
            		$("#" + dom_id).css("margin-left", indent + "px");
        		//}
        		
        		
        		if(data.item.children && data.item.children.length > 0) // if this is a new reply on the notifications tab, it'll never have children, so no worry here
        		{
        			var tempcomments = data.item.children;
					tempcomments.sort(function(a,b){
						var tsa = fromOtherBaseToDecimal(62, a.substring(0,7));
						var tsb = fromOtherBaseToDecimal(62, b.substring(0,7));
						return tsb - tsa;
					});
					data.item.children = tempcomments;
					for(var y=0; y < data.item.children.length; y++) 
		    		{  
						//alert("going to write a reply comment_id=" + data.children[y] + " and parent_id=" + comment_id);
						writeUnifiedCommentContainer(data.item.children[y], "container_div_" + comment_id, "after");
						doThreadItem(data.item.children[y], "comment_div_" + data.item.children[y]);
		    		}
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

function writeComment(container_id, feeditem_jo, dom_id, drawLikeDislike, drawDelete, drawReply)
{
	var comment_id = feeditem_jo.id; 
	
	// NOTE: I tried changing comment_id to a random string, but it broke the saved text mechanism.
	
	var writeReplyTD = false;
	var tempstr = "";
	var	numvotes = feeditem_jo.likes.length + feeditem_jo.dislikes.length;
	
	if (feeditem_jo.hidden === "true" || feeditem_jo.hidden === true)
	{
		tempstr = tempstr + "<table style=\"border:0px solid orange\">";
		tempstr = tempstr + "	<tr>";
		tempstr = tempstr + "		<td style=\"text-align:middle;vertical-align:top;width:48px;border:0px solid green\">";
		tempstr = tempstr + "			<img style=\"width:32px;height:32px;border-radius:4px\" src=\"" + chrome.extension.getURL("images/48avatar_ghosted.png") + "\">";
		tempstr = tempstr + "		</td>";
		tempstr = tempstr + "		<td style=\"font-style:italic;padding:5px;vertical-align:middle;text-align:left\" >";
		tempstr = tempstr + "			Comment deleted";
		tempstr = tempstr + "		</td>";
		if(user_jo !== null && typeof user_jo.permission_level !== "undefined" && user_jo.permission_level !== null && user_jo.permission_level === "admin")
		{
			tempstr = tempstr + "		   <td style=\"width:10px;padding-left:3px;\"> ";
			tempstr = tempstr + "				<a href=\"#\" id=\"comment_nuke_link_" + comment_id + "\">N!</a> ";
			tempstr = tempstr + "		   </td>";
		}	
		tempstr = tempstr + "	</tr>";
	  	tempstr = tempstr + "</table>"
	  	$("#" + dom_id).parent().css("padding-top", "2px");
	  	$("#" + dom_id).parent().css("padding-bottom", "2px");
		$("#" + dom_id).html(tempstr);//OK
	}
	else
	{	
		// show this user's info
		tempstr = tempstr + "<table style=\"border:0px solid orange\">";
		tempstr = tempstr + "	<tr>";
		tempstr = tempstr + "		<td style=\"vertical-align:top;width:48px;border:0px solid green\"> <!-- avatar, left hand side -->"; 
		tempstr = tempstr + "			<table style=\"border:0px solid red\">";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "						<img style=\"width:48px;height:48px;border-radius:4px;\" alt=\"test\" id=\"author_picture_img_" + comment_id + "\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
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
		tempstr = tempstr + "			<table  style=\"border:0px solid purple\">";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td style=\"vertical-align:middle;text-align:left;border:0px solid black\" > "; 
		tempstr = tempstr + "						<table style=\"width:100%;float:left;border:0px solid brown;vertical-align:middle; border-collapse: separate\">";
		tempstr = tempstr + "							<tr> ";
		tempstr = tempstr + "		  					 	<td style=\"vertical-align:middle;text-align:left;padding-left:5px\">";
		tempstr = tempstr + "		  					 		<a href=\"#\" id=\"screenname_link_" + comment_id + "\"></a> - <span id=\"time_ago_span_" + comment_id + "\" style=\"padding:5px;\"></span>";// + comment_id;
		tempstr = tempstr + "		  					 	</td>";
		tempstr = tempstr + "		   						<td style=\"width:13px;height:19px;color:green;text-align:right;vertical-align:middle;padding-right:3px\" id=\"comment_likes_count_td_" + comment_id + "\"></td>";
		if (drawLikeDislike === true) 
	    {
			tempstr = tempstr + "	       						<td style=\"width:19px;height:19px;vertical-align:middle;\"><img style=\"height:19px;width:19px\" src=\"" + chrome.extension.getURL("images/like_arrow.png") + "\" id=\"like_img_" + comment_id + "\"></td>";
			tempstr = tempstr + "	       						<td style=\"width:19px;height:19px;vertical-align:middle;\"><img style=\"height:19px;width:19px\" src=\"" + chrome.extension.getURL("images/dislike_arrow.png") + "\" id=\"dislike_img_" + comment_id + "\"></td>";
	    }
		tempstr = tempstr + "		   						<td style=\"width:13px;height:19px;color:red;text-align:left;vertical-align:middle;padding-left:3px\" id=\"comment_dislikes_count_td_" + comment_id + "\"></td>";
		
		if (drawDelete === true && (user_jo !== null && user_jo.screenname === feeditem_jo.author_screenname)) // if no user_jo or screennames don't match, hide
		{
			tempstr = tempstr + "		   <td style=\"width:10px;padding-left:3px;\"> ";
			tempstr = tempstr + "				<a href=\"#\" id=\"comment_delete_link_" + comment_id + "\">X</a> ";
			tempstr = tempstr + "		   </td>";
		}
		if(user_jo !== null && typeof user_jo.permission_level !== "undefined" && user_jo.permission_level !== null && user_jo.permission_level === "admin")
		{
			tempstr = tempstr + "		   <td style=\"width:10px;padding-left:3px;\"> ";
			tempstr = tempstr + "				<a href=\"#\" id=\"comment_nuke_link_" + comment_id + "\">N!</a> ";
			tempstr = tempstr + "		   </td>";
		}	
		
		tempstr = tempstr + "							</tr>";
		tempstr = tempstr + "  						</table>";
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td style=\"padding:5px;vertical-align:top;text-align:left;line-height:14px\" id=\"comment_text_td_" + comment_id + "\"> "; //  class=\"comment-text-td\"
	  	tempstr = tempstr + "					</td>";
	  	tempstr = tempstr + "				</tr>";
		if (drawReply === true && feeditem_jo.depth < 6)
	  	{
			tempstr = tempstr + "				<tr id=\"reply_tr_" + comment_id + "\">";
	  		tempstr = tempstr + "					<td style=\"padding:3px;text-align:left\"> ";
	  		tempstr = tempstr + "							<a href=\"#\" id=\"reply_link_" + comment_id + "\"><b>Reply</b></a>";
	  		tempstr = tempstr + "					</td>";
	  		tempstr = tempstr + "				</tr>";
	  		tempstr = tempstr + "				<tr>";
	  		tempstr = tempstr + "					<td id=\"reply_td_" + comment_id + "\" style=\"display:none;\"> ";
	  		writeReplyTD = true;
	  		tempstr = tempstr + "					</td>";
	  		tempstr = tempstr + "				</tr>";
	  	}
		else if(drawReply === true && feeditem_jo.depth === 6)
		{
			tempstr = tempstr + "				<tr id=\"reply_tr_" + comment_id + "\">";
	  		tempstr = tempstr + "					<td style=\"font-style:italic;padding:3px;text-align:left;color:#444444\"> ";
	  		tempstr = tempstr + "						 Thread is at max depth. No more replies allowed.";
	  		tempstr = tempstr + "					</td>";
	  		tempstr = tempstr + "				</tr>";
		}	
	  	tempstr = tempstr + "			</table>";
	  	tempstr = tempstr + "		</td>";
		tempstr = tempstr + "	</tr>";
	  	tempstr = tempstr + "</table>"
	  	
		$("#" + dom_id).html(tempstr);//OK
	  	
	  	if(writeReplyTD === true && tabmode !== "notifications")
	  		writeCommentForm(comment_id, "reply_td_" + comment_id, "message_div_" + comment_id);
	  	else if(writeReplyTD === true && tabmode === "notifications")
	  		writeCommentForm(comment_id, "reply_td_" + comment_id, "message_div_" + container_id); // if any messages, draw them in the parent's message window, as this is comment form appears as a child.
	  	
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
		$("[id=time_ago_span_" + comment_id + "]").text(feeditem_jo.time_ago);
		$("[id=comment_likes_count_td_" + comment_id + "]").text(feeditem_jo.likes.length);
		$("[id=comment_dislikes_count_td_" + comment_id + "]").text(feeditem_jo.dislikes.length);
		
		var linkified_div = getLinkifiedDiv(feeditem_jo.text);
		$("[id=comment_text_td_" + comment_id + "]").html(linkified_div);
		
		chrome.runtime.sendMessage({method: "getSavedText"}, function(response) {
			 var saved_text = response.saved_text;
			 var saved_text_dom_id = response.saved_text_dom_id;
			 var charsleft = 500;
			 if(saved_text_dom_id !== null && saved_text_dom_id === ("comment_textarea_" + comment_id) 
					 && saved_text !== null && saved_text.trim().length > 0)
			 {
				 charsleft = 500 -  saved_text.length;
				 $("#comment_textarea_" + comment_id).text(saved_text);
			 }
			 else	
			 {
				 $("#comment_textarea_" + comment_id).css("color", "#aaa");
				 $("#comment_textarea_" + comment_id).text("Say something...");
			 }
			 $("#charsleft_" + comment_id).text(charsleft);
		 });	 
		
		$("a").click(function(event) {
			if(typeof event.processed === "undefined" || event.processed === null) // prevent this from firing multiple times by setting event.processed = true on first pass
			{
				event.processed = true;
				var c = $(this).attr('class');
				if(c == "newtab")
				{
					var h = $(this).attr('href');
					if(chrome.tabs)
						doNewtabClick(h);
					else
						window.location = h;
				}
			}
		});
		
		if(user_jo !== null)
		{
			$.ajax({
				type: 'GET',
		        url: endpoint,
		        data: {
		            method: "haveILikedThisComment",
		            id: feeditem_jo.id,
		            screenname: screenname, 
		            this_access_token: this_access_token
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
		            screenname: screenname, 
		            this_access_token: this_access_token
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
		        			$("#dislike_img_" + comment_id).attr("src", chrome.extension.getURL("images/dislike_arrow_disliked.png"));
		        	}
		        },
		        error: function (XMLHttpRequest, textStatus, errorThrown) {
		        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
		            console.log(textStatus, errorThrown);
		        } 
			});
		}
		
		
		$("[id=reply_link_" + comment_id + "]").click({value: comment_id}, function(event) { 
			if (user_jo !== null)
			{
				if(!$("#reply_td_" + event.data.value).is(":visible"))
				{
					$("#reply_td_" + event.data.value).show();
					var currtext = $("#comment_textarea_" + event.data.value).val();
					if(currtext !== "Say something...")
				 	{
						// textarea has a scrollbar due to previous text, grow it
						//alert("comment_textarea_" + event.data.value);
						if(has_scrollbar("comment_textarea_" + event.data.value))
						{
							$("#comment_textarea_" + event.data.value).trigger("keyup");
						}
				 	}
				}
				else
				{
					$("#reply_td_" + event.data.value).hide();
				}
			}
			else
			{
				displayMessage("Please login to write a reply.", "red", "message_div_" + event.data.value); // this one is ok since user may be scrolled too far to see message_div
			}
			event.preventDefault();
			event.stopPropagation();
		});

		$("[id=like_img_" + comment_id + "]").click({comment_id: comment_id, container_id: container_id}, function(event) { 
			event.preventDefault();
			likeOrDislikeComment(event.data.comment_id, event.data.container_id, "like"); // id, like or dislike, dom_id
		});
			 
		$("[id=dislike_img_" + comment_id + "]").click({comment_id: comment_id, container_id: container_id}, function(event) { 
			event.preventDefault();
			likeOrDislikeComment(event.data.comment_id, event.data.container_id, "dislike"); // id, like or dislike, dom_id
		});
		
		$("[id=comment_delete_link_" + comment_id + "]").click({value: feeditem_jo.id}, function(event) { 
			event.preventDefault();
			var confirmbox = confirm("Delete comment?\n(This action is permanent.)");
			if (confirmbox === true)
				hideComment(event.data.value);
		});
		
		$("[id=screenname_link_"+ comment_id + "]").click({value: feeditem_jo}, function(event) { 
			event.preventDefault();
			viewProfile(event.data.value.author_screenname);
		});
	}

	if(user_jo !== null && typeof user_jo.permission_level !== "undefined" && user_jo.permission_level !== null && user_jo.permission_level === "admin")
	{
		$("#comment_nuke_link_" + comment_id).click({value: feeditem_jo.id}, function(event) { 
			event.preventDefault();
			var confirmbox = confirm("Nuke comment?\n(This action is permanent and risky.)");
			if (confirmbox === true)
				nukeComment(event.data.value);
		});
	}
	
}

// to submit a comment, we only need to know the id of the parent to which this new comment will be attached, right?

function submitComment(parent, message_element) // submits comment and updates thread
{
	var text = $("#comment_textarea_" + parent).val();
	//alert("submitting comment");
	var parent_to_submit = parent;
	if(parent.length !== 11) // this is a toplevel comment. if toplevel, "parent" should be 8 chars as hashed by hashFnv32a()
		parent_to_submit = currentURL;
	$.ajax({
	    type: 'POST',
	    url: endpoint,
	    data: {
	        method: "addComment",
	        url: currentURL,
	        screenname: screenname,  // do it this way... no need to go get these from cookies again
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
		    	//	displayMessage(data.message, "red", "utility_message_td");
	        	//else
	        	displayMessage(data.message, "red", message_element);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red", message_element);
        			user_jo = null;
        			updateLogstat();
        		}
	        	// on error, leave the comment box open with whatever was in there, char count the same. Just re-enable the submit button.
	        	$("#comment_submission_form_submit_button_" + parent).removeAttr('disabled');
	        	$("#comment_submission_progress_span_" + parent).hide();
	        } 
	        else if(data.response_status === "success")
	        {
	        	$("#comment_submission_progress_span_" + parent).hide();
	        	$("#charsleft_" + parent).text("500");
	        	if(parent.length !== 11) // toplevel
		    	{
		    		$("#comment_submission_form_submit_button_" + parent).removeAttr("disabled");
		    		if(!thread_jo.children) // if the main thread jo was empty before, create it with one item, this new one and empty the main_div to receive it
					{
		    			//alert("Thread had no children. making thread_jo.children out of the new comment.");
						var onechildarray = new Array();
						onechildarray[0] = data.comment.id;
						thread_jo.children = onechildarray; 
						$("#main_div_" + parent).text("");
					}	
		        	else
		        	{
		        		//alert("Thread had children already. Pushing. Maybe it appears at the bottom?");
		        		var temparray = thread_jo.children;
		        		temparray.push(data.comment.id);
		        		thread_jo.children = temparray; 
		        	}
		    	}
	        	
	        	// on success, reset the form stuff
	        	$("#comment_textarea_" + parent).css("height", "30px");			// set it back to normal height
	        	$("#comment_textarea_" + parent).val("Say something..."); // set the default wording
	        	$("#char_count_and_submit_button_div_" + parent).hide();			// hide the charcount and submit area
	        	if(parent.length === 11) // not toplevel
	        		$("#reply_td_" + parent).hide();								// hide the reply area div
	        	$("#comment_textarea_" + parent).css("color", "#aaa");			// reset the text to gray
	        	$("#comment_submission_form_submit_button_" + parent).removeAttr('disabled');
		    	
	        	// on success, remove any saved text
	        	 chrome.runtime.sendMessage({method: "setSavedText", saved_text: null, saved_text_dom_id: null}, function(response) {
					  //alert(response.message);
				 });
	        	
	        	displayMessage("Comment posted.", "black", message_element);
				
	        	if(data.comment.depth === 1) // if the returning comment depth === 1, it's a toplevel on tabmode=thread
	        	{	
	        		writeUnifiedCommentContainer(data.comment.id, "main_div_" + currentURLhash, "prepend");
	        		doThreadItem(data.comment.id, "comment_div_" + data.comment.id);
	        	}
	        	else if(tabmode === "notifications") // this is a reply within notifications tab
	        	{
	        		$("#reply_tr_" + parent).hide();
	        		var indexofC = parent.lastIndexOf("C"); // should always be = 10 (11 chars, last char)
	        		var indent = "30px";
	        		if(message_element.endsWith("R"))
	        		{
	        			//alert("R");
	        			parent = parent.substring(0,indexofC) + "R";
	        			indent = "60px";
	        		}
	        		else if(message_element.endsWith("F"))
	        		{
	        			//alert("F");
	        			parent = parent.substring(0,indexofC) + "F";
	        		}
	        		else if(message_element.endsWith("M"))
	        		{
	        			//alert("M");
	        			parent = parent.substring(0,indexofC) + "M";
	        		}	
	        		
        			var container_id = data.comment.id;
        			$.ajax({
        		        type: 'GET',
        		        url: endpoint,
        		        data: {
        		            method: "getFeedItem",
        		            id: data.comment.id
        		        },
        		        dataType: 'json',
        		        async: true,
        		        success: function (data, status) {
        		        	if(data.response_status === "success")// && tabmode === "thread")
        		        	{
        		        		writeComment(container_id, data.item, "child_div_" + parent, false, true, false); // l/d, delete button (if user authored it), reply
        	        			$("#child_div_" + parent).css("margin-left", indent);
        		        		 // this is a new reply on the notifications tab, it'll never have children, so no worry here
        		        	}
        		        	else
        		        	{ 
        		        		// fail silently
        		        	}	
        		        },
        		        error: function (XMLHttpRequest, textStatus, errorThrown) {
        		        	displayMessage("Unable to retrieve feed item. (AJAX)", "red", "message_div_" + comment_id);
        		        	console.log(textStatus, errorThrown);
        		        }
        			});
        			
	        		$("#child_div_" + parent).show();
	        	}	
	        	else if((data.comment.depth *1) > 1 && tabmode === "thread")
	        	{
	        		// this is all very hackish. Meh. It works.
	        		var parentelem = $("#container_div_" + parent); // this is the dom element of container of the comment we're replying to. always exists
	        		var parentelem_dom_id = parentelem.attr('id');
	        		var parentelem_ml = $("#comment_div_" + parent).css("margin-left");
	        		parentelem_ml = parentelem_ml.substring(0,parentelem_ml.length-2)*1; // remove the "px" and type it to a number
	        		
	        		var successfully_placed = false;
	        		var previouselem = parentelem;
	        		var previouselem_dom_id = parentelem_dom_id;
	        		var currentelem = null;
	        		var currentelem_dom_id = null;
	        		var currentelem_id = null;
	        		var currentelem_ml = null;
	        		//alert("parent_ml (the comment we're replying to (" + parent + ")) was " + parentelem_ml + ", so we're looking for (a) the end (a null dom node) or (b) the first element <=" + parentelem_ml);
	        		while(successfully_placed === false)
	        		{
	        			currentelem = previouselem.next();
	        			currentelem_dom_id = currentelem.attr('id');
	        			if(typeof currentelem_dom_id === "undefined")
	        			{
		        			//alert("there was no current element, attach after previous")
		        			writeUnifiedCommentContainer(data.comment.id, previouselem_dom_id, "after");
	        				doThreadItem(data.comment.id, "comment_div_" + data.comment.id);
	        				successfully_placed = true;
		        		}	
	        			else
	        			{
	        				currentelem_id = currentelem_dom_id.substring(currentelem_dom_id.length - 11, currentelem_dom_id.length);
	        				currentelem_ml = $("#comment_div_" + currentelem_id).css("margin-left");
	        				currentelem_ml = currentelem_ml.substring(0,currentelem_ml.length-2)*1; // remove the "px" and type it to a number
		        			//alert("currentelem_id=" + currentelem_id + " ml=" + currentelem_ml + " parent_ml=" + parentelem_ml);
		        			if(currentelem_ml <= parentelem_ml)
		        			{
		        				//alert("found parent's next sibling, attaching before");
		        				writeUnifiedCommentContainer(data.comment.id, "container_div_" + currentelem_id, "before");
		        				doThreadItem(data.comment.id, "comment_div_" + data.comment.id);
		        				successfully_placed = true;
		        			}
		        			previouselem = currentelem;
		        			previouselem_dom_id = currentelem_dom_id;
	        			}	
	        		}	
	        	}
	        	else
	        	{
	        		alert("erroneous else");
	        	}	
	        }
	    },
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
	    	displayMessage("Ajax error addComment: text=" + textStatus + " and error=" + errorThrown, "red", message_element);
       	 	//$("#comment_submission_form_div_" + parent).hide();
       	 	$("#comment_submission_form_submit_button_" + parent).removeAttr("disabled");
       	 	$("#comment_submission_progress_span_" + parent).hide();
	        console.log(textStatus, errorThrown);
	    }
	});
}

function hideComment(inc_id) 
{
	$.ajax({
	    type: 'GET',
	    url: endpoint,
	    data: {
	        method: "hideComment",
	        id: inc_id,
	        screenname: screenname, 
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
        			user_jo = null;
        			updateLogstat();
        		}
	        }
	        else if (data.response_status === "success")
	        {
	        	displayMessage("Comment hidden.", "black", "message_div_" + inc_id);
	        	if(tabmode === "thread")
	        		doThreadItem(data.comment.id, "comment_div_" + data.comment.id);
	        	if(tabmode === "past")
	        		doPastTab();
	        	if(tabmode === "trending")
	        		doTrendingTab();
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

function nukeComment(inc_id) 
{
	$.ajax({
	    type: 'GET',
	    url: endpoint,
	    data: {
	        method: "nukeComment",
	        id: inc_id,
	        screenname: screenname,  
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
        			user_jo = null;
        			updateLogstat();
        		}
	        }
	        else if (data.response_status === "success")
	        {
	        	displayMessage("Nuke process underway.", "black", "message_div_" + inc_id);
				//doThreadItem(data.comment.id, data.comment.parent, "reply"); < -- why would we try to load what we just nuked?
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

function likeOrDislikeComment(id, container_id, like_or_dislike)
{
	var prev = ""; $("#like_img_" + id).attr("src");
	if(like_or_dislike === "like")
	{
		prev = $("#like_img_" + id).attr("src");
		$("#like_img_" + id).attr("src", chrome.extension.getURL("images/like_snake.gif"));
	}
	else
	{
		prev = $("#dislike_img_" + id).attr("src");
		$("#dislike_img_" + id).attr("src", chrome.extension.getURL("images/dislike_snake.gif"));
	}
	if(user_jo != null)
	{
		$.ajax({
			type: 'GET',
			url: endpoint,
			data: {
				method: "addCommentLikeOrDislike",
				screenname: screenname, 
				this_access_token: this_access_token, 
				id: id,
				like_or_dislike: like_or_dislike
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				if(like_or_dislike === "like")
					$("#like_img_" + id).attr("src", prev);
				else
					$("#dislike_img_" + id).attr("src", prev);
				if (data.response_status === "error") 
				{
					displayMessage(data.message, "red", "message_div_" + container_id);
	            	if(data.error_code && data.error_code === "0000")
	        		{
	        			displayMessage("Your login has expired. Please relog.", "red", "message_div_" + container_id);
	        			user_jo = null;
	        			updateLogstat();
	        		}
					return;
				} 
				else if (data.response_status === "success")
				{
					if (like_or_dislike === "like")
					{
						displayMessage("Like recorded.", "black", "message_div_" + container_id);
						$("#like_img_" + id).attr("src", chrome.extension.getURL("images/like_arrow_liked.png"));
						var like_count = ($("#comment_likes_count_td_" + id).text() * 1) + 1;
						$("#comment_likes_count_td_" + id).text(like_count);
					}
					else
					{	
						displayMessage("Dislike recorded.", "black", "message_div_" + container_id);
						$("#dislike_img_" + id).attr("src", chrome.extension.getURL("images/dislike_arrow_disliked.png"));
						var dislike_count = ($("#comment_dislikes_count_td_" + id).text() * 1) + 1;
						$("#comment_dislikes_count_td_" + id).text(dislike_count);
					}	
				}
				else
				{
					//alert("weird");
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				if(like_or_dislike === "like")
					$("#like_img_" + id).attr("src", chrome.extension.getURL("images/like_arrow.png"));
				else
					$("#dislike_img_" + id).attr("src", chrome.extension.getURL("images/dislike_arrow.png"));
				displayMessage("Ajax error addCommentLikeOrDislike: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + container_id);
				console.log(textStatus, errorThrown);
			} 
		});
	}
	else
	{
		if(like_or_dislike === "like")
			$("#like_img_" + id).attr("src", chrome.extension.getURL("images/like_arrow.png"));
		else
			$("#dislike_img_" + id).attr("src", chrome.extension.getURL("images/dislike_arrow.png"));
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
