
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
	$("div#words_div #thread_tab_link").html("<img src=\"" + chrome.extension.getURL("images/chat_blue.png") + "\"></img>");
	$("div#words_div #trending_tab_link").html("<img src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></img>");
	updateNotificationTabLinkImage();
	$("div#words_div #profile_tab_link").html("<img src=\"" + chrome.extension.getURL("images/user_gray.png") + "\"></img>");
	
	$("div#words_div #utility_div").show();
	$("div#words_div #header_div_top").html("Comment thread");
	$("div#words_div #header_div_top").show();
	$("div#words_div #comment_submission_form_div_" + currentURLhash).show();
	
	$("div#words_div #main_div_" + currentURLhash).html("");
	
	if(isValidURLFormation(currentURL))
	{
		if(typeof thread_jo === "undefined" || thread_jo === null)
		{
			var url_at_function_call = currentURL;
			// wait for thread to load
			$("div#words_div #main_div_" + currentURLhash).html("Retrieving thread... <img style=\"padding:10px;vertical-align:middle\" src=\"images/ajaxSnake.gif\">");
			gotThread_wedge_for_ntj(url_at_function_call);
			// the difference between this wedge and the other one is that this one does not animate (or two animations would be happening on top of each other)
		}
		else 
		{
			gotThread();
		}
	}
	else // not a valid URL formation
	{
		beginindex = 0;
		$("div#words_div #comment_submission_form_div_" + currentURLhash).hide();
		var main_div_string = "<div class=\"no-comments-div\">Commenting for non-websites is currently disabled.<br>";
		main_div_string = main_div_string + "		(URL must start with \"http\".)"; // , hostname must contain a \".\" and lack a \":\".
		main_div_string = main_div_string + "</div>";
		$("div#words_div #main_div_" + currentURLhash).html(main_div_string);
	}
}

// this function says "We finally received the thread from the backend. Is the tabmode still "thread"? If so, show the thread. If not, do nothing (i.e. stop)."
function gotThread()
{
	$("div#words_div #main_div_" + currentURLhash).html("");
	if (tabmode === "thread")
	{
		//alert("gotThread and thread_jo=" + JSON.stringify(thread_jo));
		var url_to_use = thread_jo.significant_designation;
		if(url_to_use.endsWith("?"))
			url_to_use = url_to_use.substring(0,url_to_use.length-1);
		if(url_to_use.length > 50 && thread_jo.hostname.length < 50)
			url_to_use = thread_jo.hostname + "/..." + url_to_use.substring(url_to_use.length - (47 - thread_jo.hostname.length));
		else if(url_to_use.length > 50 && thread_jo.hostname.length >= 50)
			url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
			
		var happy = "";
		happy = happy + "<img src=\"http://www.google.com/s2/favicons?domain=" + thread_jo.significant_designation + "\"> "
		if(thread_jo.combined_or_separated === "combined")
			happy = happy + "<img id=\"combined_img\" src=\"images/combined_icon.png\"> ";
		else
			happy = happy + "<img id=\"separated_img\" src=\"images/separated_icon.png\"> ";
		happy = happy + url_to_use + " ";
		if(thread_jo.combined_or_separated === "separated") // can only like separated sites
		{
			happy = happy + "<span id=\"has_user_liked_span\"><img id=\"hpqsplike_img\" src=\"images/star_grayscale_16x16.png\"></span> <span style=\"color:green\" id=\"num_hpqsplikes_span\"></span>";
			
		}
		
		// like/dislike indicator here
		$("div#words_div #header_div_top").html(happy);
		
		if(thread_jo.combined_or_separated === "separated") // can only like separated sites
		{
			$("div#words_div #hpqsplike_img").click(
    	 			function () {
    	 				$.ajax({
        			        type: 'GET',
        			        url: endpoint,
        			        data: {
        			        	email: docCookies.getItem("email"),
        			        	this_access_token: docCookies.getItem("this_access_token"),
        			            method: "likeHPQSP",
        			            url: currentURL
        			        },
        			        dataType: 'json',
        			        async: true,
        			        success: function (data, status) {
        			        	if(data.response_status === "success")
        			        	{
        			        		displayMessage("Page liked.", "black");
        			        		$("div#words_div #hpqsplike_img").attr("src", "images/star_16x16.png");
        			        	}
        			        	else if(data.response_status === "error")
        			        	{
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
        			        	displayMessage("Unable to like page. (ajax)", "red", "message_div_" + currentURLhash);
        			        	console.log(textStatus, errorThrown);
        			        }
        				});
    	 				return false;
    	 			});
    	 	
    	 	$("div#words_div #hpqsplike_img").mouseover(
    	 			function () {
    	 				if($("div#words_div #hpqsplike_img").attr("src").indexOf("grayscale") == -1) // this is the yellow star, not the grayscale one
    	 					$("div#words_div #tab_tooltip_td").html("You've liked this");
    	 				else
    	 					$("div#words_div #tab_tooltip_td").html("Like this page");
    	 				return false;
    	 			});

    	 	$("div#words_div #hpqsplike_img").mouseout(
    	 			function () {
    	 				if(tabmode === "thread")
    	 					$("div#words_div #tab_tooltip_td").html("Comments");
    	 				else if(tabmode === "trending")
    	 					$("div#words_div #tab_tooltip_td").html("Trending");
    	 				else if(tabmode === "notifications")
    	 					$("div#words_div #tab_tooltip_td").html("Notifications");
    	 				else if(tabmode === "profile")
    	 					$("div#words_div #tab_tooltip_td").html("Profile/Settings");
    	 				return false;
    	 			});
			if(bg.user_jo !== null)
			{
				$.ajax({
					type: 'GET',
			        url: endpoint,
			        data: {
			            method: "haveILikedThisHPQSP",
			            url: currentURL,
			            email: docCookies.getItem("email"),
			            this_access_token: docCookies.getItem("this_access_token")
			        },
			        dataType: 'json',
			        async: true,
			        success: function (data, status) {
			        	if (data.response_status === "error")
			        	{
			        		$("#has_user_liked_span").html("err");
			        	}
			        	else if (data.response_status === "success")
			        	{
			        		if(data.response_value === true)
			        			$("#hpqsplike_img").attr("src","images/star_16x16.png");
			        		//else // it should already be gray
			        		//	$("#has_user_liked_span").html("<img id=\"hpqsplike_img\" src=\"images/star_grayscale_16x16.png\">");
			        	}
			        },
			        error: function (XMLHttpRequest, textStatus, errorThrown) {
			        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
			            console.log(textStatus, errorThrown);
			        } 
				});
			}
			$.ajax({
				type: 'GET',
		        url: endpoint,
		        data: {
		            method: "getHPQSPLikes",
		            url: currentURL
		        },
		        dataType: 'json',
		        async: true,
		        success: function (data, status) {
		        	if (data.response_status === "error")
		        	{
		        		$("#has_user_liked_span").html("err");
		        	}
		        	else if (data.response_status === "success")
		        	{
		        		$("#num_hpqsplikes_span").html(data.num_hpqsplikes);
		        	}
		        },
		        error: function (XMLHttpRequest, textStatus, errorThrown) {
		        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
		            console.log(textStatus, errorThrown);
		        } 
			});
		}
		
		$("div#words_div #combined_img").click(
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
				        		
				        		// when separated for the first time, the significant designation becomes the thread's hp
				        		$("div#words_div #header_div_top").html(thread_jo.hp + " <img id=\"separated_img\" src=\"images/separated_icon.png\">");
				        		$("div#words_div #separated_img").mouseover(
				        	 			function () {
				        	 				$("div#words_div #tab_tooltip_td").html("Separated threads");
				        	 				return false;
				        	 			});

				        	 	$("div#words_div #separated_img").mouseout(
				        	 			function () {
				        	 				if(tabmode === "thread")
				        	 					$("div#words_div #tab_tooltip_td").html("Comments");
				        	 				else if(tabmode === "trending")
				        	 					$("div#words_div #tab_tooltip_td").html("Trending");
				        	 				else if(tabmode === "notifications")
				        	 					$("div#words_div #tab_tooltip_td").html("Notifications");
				        	 				else if(tabmode === "profile")
				        	 					$("div#words_div #tab_tooltip_td").html("Profile/Settings");
				        	 				return false;
				        	 			});
				        	}
				        },
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	// if someone clicks this and there's a communication error, just fail silently as if nothing happened.
				            console.log(textStatus, errorThrown);
				        } 
					});
				});
		
		$("div#words_div #combined_img").mouseover(
	 			function () {
	 				$("div#words_div #tab_tooltip_td").html("Combined threads");
	 				return false;
	 			});

	 	$("div#words_div #combined_img").mouseout(
	 			function () {
	 				if(tabmode === "thread")
	 					$("div#words_div #tab_tooltip_td").html("Comments");
	 				else if(tabmode === "trending")
	 					$("div#words_div #tab_tooltip_td").html("Trending");
	 				else if(tabmode === "notifications")
	 					$("div#words_div #tab_tooltip_td").html("Notifications");
	 				else if(tabmode === "profile")
	 					$("div#words_div #tab_tooltip_td").html("Profile/Settings");
	 				return false;
	 			});
	 	
	 	$("div#words_div #separated_img").mouseover(
	 			function () {
	 				$("div#words_div #tab_tooltip_td").html("Separated threads");
	 				return false;
	 			});

	 	$("div#words_div #separated_img").mouseout(
	 			function () {
	 				if(tabmode === "thread")
	 					$("div#words_div #tab_tooltip_td").html("Comments");
	 				else if(tabmode === "trending")
	 					$("div#words_div #tab_tooltip_td").html("Trending");
	 				else if(tabmode === "notifications")
	 					$("div#words_div #tab_tooltip_td").html("Notifications");
	 				else if(tabmode === "profile")
	 					$("div#words_div #tab_tooltip_td").html("Profile/Settings");
	 				return false;
	 			});
		
	 
	 	
		if(currentURL.length > 255)
			displayMessage("Can't comment here. Words does not support URLs > 255 chars. Sorry.", "red", "message_div_" + currentURLhash);
		
		beginindex = 0;
		endindex = 8;
		prepareGetAndPopulateThreadPortion();
	}
}

function noteThreadView(was_empty, showed_alternatives) //booleans or strings
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
	// This information will help us make Words better, cus it sucks to, for instance, show empty threads when someone clicks the button.
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
			was_empty: was_empty,
			showed_alternatives: showed_alternatives
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
		//alert("entering prepareGetAndPopulateThreadPortion");
		/*if(thread_jo.combined_or_separated === "combined")
		{
			$("div#words_div #header_div_top").html(t_jo.hostname + " (combined) - Like site");
		}	
		else
		{
			$("div#words_div #header_div_top").html(t_jo.original_url + " (separated) - Like page");
		}*/	
		
		if ((typeof thread_jo.children === "undefined" || thread_jo.children === null || thread_jo.children.length === 0) && threadstatus === 0)
		{
			//alert("Thread had no children");
			var main_div_string = "";
			main_div_string = main_div_string + "<div class=\"no-comments-div\">";
			main_div_string = main_div_string + "		No comments for this page. Write one!";
			main_div_string = main_div_string + "</div>";
			main_div_string = main_div_string + "<div style=\"text-align:center;font-size:13px;padding-top:10px;padding-bottom:3px;display:none;border-top:1px solid black\" id=\"trending_on_this_site_div\"><img src=\"http://www.google.com/s2/favicons?domain=" + currentURL + "\" style=\"vertical-align:middle\"> " + currentHostname + " (48 hrs)</div>";
			main_div_string = main_div_string + "<div style=\"padding-bottom:10px;padding-left:10px;padding-right:10px;display:none\" id=\"other_pages_on_this_site_div\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></div>";
			$("div#words_div #main_div_" + currentURLhash).html(main_div_string);

			$.ajax({
				type: 'GET',
				url: endpoint,
				data: {
					method: "getTrendingActivity",
					url: currentURL
						// for right now, backend is doing 6, 12, 24, 48, but frontend should specify what it wants, right?
				},
				dataType: 'json',
				async: true,
				success: function (data, status) {
					if (data.response_status === "success") 
					{
						if(typeof data.trendingactivity_jas == "undefined" || data.trendingactivity_jas == null)
						{
							noteThreadView(true, false); // (was_empty, showed_alternatives)
						}
						else
						{
							$("#trending_on_this_site_div").show();
							$("#other_pages_on_this_site_div").show();
							var cutoff_in_hours = 48;
							var choices = [48];
							drawTrendingChart(cutoff_in_hours, choices, data, "other_pages_on_this_site_div");
							noteThreadView(true, true); // (was_empty, showed_alternatives)
						}
					}
					else if (data.response_status === "error") 
					{
						displayMessage(data.message, "red", "message_div_" + currentURLhash);
						return;
					}
					else
					{
						displayMessage("getTrendingActivity invalid response", "red", "message_div_" + currentURLhash);
						return;
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					displayMessage("AJAX error getting trending info.", "red", "message_div_" + currentURLhash);
					console.log(textStatus, errorThrown);
					return;
				} 
			});
			
			
			return;
		}
		else if (threadstatus === 0) // the last thread has come in (with children), now populate
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
			
			$("div#words_div #main_div_" + currentURLhash).append(thread_div_string);

			// deals with links within comments. 
			/*$("a").click(function() {
				 var c = $(this).attr('class');
				 if(c == "newtab")
				 {
					 var h = $(this).attr('href');
					 chrome.tabs.create({url:h});
				 }
			});*/
			
			noteThreadView(false, false); // (was_empty, showed_alternatives)
		}
		
	}
	else
	{
		// skipping PGandP bc tabmode changed
	}
}

function doThreadItem(comment_id, parent, commenttype) // type = "initialpop", "newcomment", "reply"
{
	//alert("doing threaditem2 for comment_id=" + comment_id + " and parent=" + parent);
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
		indent = ($("div#words_div #" + parent_comment_div).css("margin-left").replace("px", "")*1) + 25;
		//alert("indent=" + indent);
	}	
	// This is the main thread item (comment) structure. We have a blank container around the actual visible comment.
	// That's so we can .after, .before, .append and .prepend to both the comment itself (replies) as well 
	// as to the comment container (subsequent or previous comments of the same level)

	if(!$("div#words_div #comment_outer_container_div_" + comment_id).length) // if the container does not already exist, create it
		comment_div_string = comment_div_string + "<div class=\"comment-outer-container-div\" id=\"comment_outer_container_div_" + comment_id + "\">";
	comment_div_string = comment_div_string + "		    <div class=\"complete-horiz-line-div\" id=\"complete_horiz_line_div_" + comment_id + "\"></div>";
	comment_div_string = comment_div_string + "		    <div class=\"message-div\" id=\"message_div_" + comment_id + "\" style=\"display:none\"></div>";
	comment_div_string = comment_div_string + "				<div class=\"comment-div\" style=\"margin-left:" + indent + "px\" id=\"comment_div_" + comment_id + "\">";
	comment_div_string = comment_div_string + "					<span style=\"padding:20px\">Loading a comment... <img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></span>";
	//comment_div_string = comment_div_string + "			</div>";
	comment_div_string = comment_div_string + "		</div>";
	if(!$("div#words_div #comment_outer_container_div_" + comment_id).length)
		comment_div_string = comment_div_string + "</div>"; // end container div

	if(!$("div#words_div #comment_outer_container_div_" + comment_id).length) // if the container does not already exist, create it
	{
		if(commenttype === "initialpop") // .append to main_div
		{
			$("div#words_div #main_div_" + parent).append(comment_div_string);
		}	
		else if(commenttype === "newcomment") // .prepend to main_div
		{
			$("div#words_div #main_div_" + parent).prepend(comment_div_string);
		}	
		else if(commenttype == "reply") // .after parent comment
		{
			$("div#words_div #" + parent_outer_container_div).after(comment_div_string);
		}	
		else
		{
			alert("invalid commenttype");
		}
	}
	else // container already existed. Just insert the new stuff
	{
		$("div#words_div #comment_outer_container_div_" + comment_id).html(comment_div_string); // container_div already exists, rewrite it
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
        		writeComment(data.item);
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

function writeComment(feeditem_jo)
{
	var tempstr = "";
	//var numvotes = 0;
	//if(feeditem_jo.likes && feeditem_jo.dislikes)
	var	numvotes = feeditem_jo.likes.length + feeditem_jo.dislikes.length;
	if (feeditem_jo.hidden === "true" || feeditem_jo.hidden === true)
	{
		tempstr = tempstr + "<table>";
		tempstr = tempstr + "	<tr>";
		tempstr = tempstr + "		<td class=\"comment-avatar-rating-td\">";
		tempstr = tempstr + "			<table>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td><img class=\"userpic48 rounded\" src=\"images/avatars/48avatar_ghosted.png\"></td>";
		tempstr = tempstr + "				</tr>";
		tempstr = tempstr + "			</table>";
		tempstr = tempstr + "		</td>";
		tempstr = tempstr + "		<td class=\"comment-details-td comment-hidden-td\">";
		tempstr = tempstr + "			Comment hidden";
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
		
		if (feeditem_jo.author_picture.lastIndexOf("avatar", 0) === 0)
			tempstr = tempstr + "					<img class=\"userpic48 rounded\" src=\"images/avatars/48" + feeditem_jo.author_picture + "\">";
    	else // this is a google image with an absolute url
    		tempstr = tempstr + "					<img class=\"userpic48 rounded\" src=\"" + feeditem_jo.author_picture + "\">";
		
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";			
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "						<table class=\"user-rating-table\">";
		tempstr = tempstr + "							<tr>";
		var left_percentage = 0;
		var center_percentage = 0;
		var right_percentage = 0;
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
		tempstr = tempstr + "								<td style=\"width:" + left_percentage + "%;height:3px;border:0px solid black\"></td>";
		tempstr = tempstr + "								<td style=\"width:" + center_percentage + "%;height:3px;border:0px solid black; background-color:" + ratingcolor + "\"></td>";
		tempstr = tempstr + "								<td style=\"width:" + right_percentage + "%;height:3px;border:0px solid black\"></td>";
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
		tempstr = tempstr + "						<a class=\"comment-screenname-link\" href=\"#\" id=\"screenname_link_" + feeditem_jo.id + "\">"  + feeditem_jo.author_screenname + "</a> - ";
		if (feeditem_jo.author_country === "USA")
			tempstr = tempstr + feeditem_jo.author_state + ", ";
		tempstr = tempstr + feeditem_jo.author_country + " - ";
		tempstr = tempstr + feeditem_jo.time_ago;
		tempstr = tempstr + "					</td>";
		
		// show like/dislike (and maybe delete) buttons
		tempstr = tempstr + "					<td> ";
		tempstr = tempstr + "	<table>";
		tempstr = tempstr + "		<tr>";
		tempstr = tempstr + "		   <td class=\"comment-likes-count-td\">" + feeditem_jo.likes.length + "</td>";
		if (tabmode === "thread") 
        {
			tempstr = tempstr + "	       <td class=\"comment-like-image-td\"><img src=\"images/like_arrow.png\" id=\"like_image_" + feeditem_jo.id + "\"></td>";
			tempstr = tempstr + "	       <td class=\"comment-dislike-image-td\"><img src=\"images/dislike_arrow.png\" id=\"dislike_image_" + feeditem_jo.id + "\"></td>";
        }
		tempstr = tempstr + "		   <td class=\"comment-dislikes-count-td\">" + feeditem_jo.dislikes.length + "</td>";
		if ((tabmode === "thread") && (bg.user_jo && bg.user_jo.screenname === feeditem_jo.author_screenname)) // if no bg.user_jo or screennames don't match, hide
		{
			tempstr = tempstr + "		   <td class=\"comment-delete-td\"> ";
			tempstr = tempstr + "				<a href=\"#\" id=\"comment_delete_link_" + feeditem_jo.id + "\">X</a>";
			tempstr = tempstr + "		   </td>";
		}
		
		tempstr = tempstr + "		</tr>";
		tempstr = tempstr + "  	</table>";
		tempstr = tempstr + "					</td>";
		tempstr = tempstr + "				</tr>";
		tempstr = tempstr + "				<tr>";
		tempstr = tempstr + "					<td colspan=2 class=\"comment-text-td\"> ";
	   		 
	  	var text_with_links = replaceURLWithHTMLLinks(feeditem_jo.text);
	  	tempstr = tempstr + text_with_links;
	  	tempstr = tempstr + "					</td>";
	  	tempstr = tempstr + "				</tr>";

	  	// show reply stuff // FIXME Using indent to indicate thread depth is hackish. 
	  	if (tabmode === "thread" && (($("div#words_div #comment_div_" + feeditem_jo.id).css("margin-left").replace("px","")*1) < 125)) // we know this is a 6th level comment if indent value is 125 or greater, don't show reply option
	  	{
	  		tempstr = tempstr + "				<tr>";
	  		tempstr = tempstr + "					<td class=\"comment-reply-link-td\" colspan=2> ";
	  		tempstr = tempstr + "							<a href=\"#\" id=\"reply_link_" + feeditem_jo.id + "\"><b>Reply</b></a>";
	  		tempstr = tempstr + "					</td>";
	  		tempstr = tempstr + "				</tr>";
	  		tempstr = tempstr + "				<tr>";
	  		tempstr = tempstr + "					<td class=\"reply-td\" id=\"reply_td_" + feeditem_jo.id + "\" colspan=2> ";
	  		tempstr = tempstr + "						<form class=\"comment-submission-form\" method=post action=\"#\">";
	  		tempstr = tempstr + "							<div class=\"comment-submission-form-div\">";
	  		var saved_text_dom_id = docCookies.getItem("saved_text_dom_id");
				var charsleft = 500;
		  		if(saved_text_dom_id != null && saved_text_dom_id === ("comment_textarea_" + feeditem_jo.id) 
		  				&& docCookies.getItem("saved_text") != null && docCookies.getItem("saved_text").trim().length > 0)
		  		{
		  			var s_text = docCookies.getItem("saved_text");
		  			tempstr = tempstr + "<textarea class=\"composition-textarea\" style=\"color:black\" id=\"comment_textarea_" + feeditem_jo.id + "\">" + s_text + "</textarea>";
		  			charsleft = 500 -  s_text.length;
		  		}
		  		else	
		  			tempstr = tempstr + "<textarea class=\"composition-textarea\" style=\"height:22px;color:#aaa\" id=\"comment_textarea_" + feeditem_jo.id + "\">Say something...</textarea>";
	  	/*	var saved_text_dom_id = docCookies.getItem("saved_text_dom_id");
	  		if(saved_text_dom_id != null && saved_text_dom_id === ("comment_textarea_" + feeditem_jo.id))
	  			tempstr = tempstr + "<textarea class=\"composition-textarea\" id=\"comment_textarea_" + feeditem_jo.id + "\">" + docCookies.getItem("saved_text") + "</textarea>";
	  		else	
	  			tempstr = tempstr + "<textarea class=\"composition-textarea\" id=\"comment_textarea_" + feeditem_jo.id + "\">Say something...</textarea>";
	  			*/
	  		tempstr = tempstr + "								<div class=\"char-count-and-submit-button-div\" id=\"char_count_and_submit_button_div_" + feeditem_jo.id + "\">";
	  		tempstr = tempstr + "									<span class=\"comment-submission-progress-span\" id=\"comment_submission_progress_span_" + feeditem_jo.id + "\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></span>";
	  		tempstr = tempstr + "									<span id=\"charsleft_" + feeditem_jo.id + "\">" + charsleft + "</span>";
	  		tempstr = tempstr + "									<span><input id=\"comment_submission_form_submit_button_" + feeditem_jo.id + "\" type=button value=\"Submit\"></input></span>";
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
	
	if (tabmode === "thread")
	{
		$("div#words_div #comment_div_" + feeditem_jo.id).html(tempstr);
	}
	else if (tabmode === "notifications")
	{
		$("[id=notification_comment_td_" + feeditem_jo.id + "]").html(tempstr);
	}
	
	$("a").click(function(event) {
		if(typeof event.processed === "undefined" || event.processed === null) // prevent this from firing multiple times by setting event.processed = true on first pass
		{
			event.processed = true;
			var c = $(this).attr('class');
			if(c == "newtab")
			{
				var h = $(this).attr('href');
				chrome.tabs.create({url:h});
			}
		}
		return false;
	});
	
	if (tabmode === "thread")
	{
		$("div#words_div #reply_link_" + feeditem_jo.id).click({value: feeditem_jo.id}, function(event) {
			if (bg.user_jo)
			{
				if(!$("div#words_div #reply_td_" + event.data.value).is(":visible"))
				{
					$("div#words_div #reply_td_" + event.data.value).show();
					var currtext = $("div#words_div #comment_textarea_" + event.data.value).val();
					if(currtext !== "Say something...")
				 	{
				 		$("div#words_div #comment_textarea_" + event.data.value).css("height", getTextAreaHeight($("div#words_div #comment_textarea_" + event.data.value).val().length) + "px");
				 	}
				}
				else
					$("div#words_div #reply_td_" + event.data.value).hide();
			}
			else
				displayMessage("Please login to write a reply.", "red", "message_div_" + event.data.value); // this one is ok since user may be scrolled too far to see message_div
			return false;
		});
			
		createSubmissionFormSubmitButtonClickEvent(feeditem_jo.id);
	 	createFocusEventForTextarea(feeditem_jo.id);
	 	createBlurEventForTextarea(feeditem_jo.id);
	 	createKeyupEventForTextarea(feeditem_jo.id, 500);
		
		$("div#words_div #like_image_" + feeditem_jo.id).click({value: feeditem_jo.id}, function(event) {
			likeOrDislikeComment(event.data.value, "like"); // id, like or dislike, dom_id
			return false;
		});
	 		 
		$("div#words_div #dislike_image_" + feeditem_jo.id).click({value: feeditem_jo.id}, function(event) {
			likeOrDislikeComment(event.data.value, "dislike"); // id, like or dislike, dom_id
			return false;
		});
	 		 
		$("div#words_div #comment_delete_link_" + feeditem_jo.id).click({value: feeditem_jo.id}, function(event) {
			var confirmbox = confirm("Delete comment?\n(This action is permanent.)");
			if (confirmbox === true)
				hideComment(event.data.value);
			return false;
		});
	}
	
	$("[id=screenname_link_"+ feeditem_jo.id + "]").click({value: feeditem_jo}, function(event) {
		viewProfile(event.data.value.author_screenname);
	});
}

// to submit a comment, we only need to know the id of the parent to which this new comment will be attached, right?

function submitComment(parent) // submits comment and updates thread
{
	var text = $("div#words_div #comment_textarea_" + parent).val();
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
	        	displayMessage(data.message, "red", "message_div_" + currentURLhash);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red");
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        			updateLogstat();
        		}
	        	// on error, leave the comment box open with whatever was in there, char count the same. Just re-enable the submit button.
	        	$("div#words_div #comment_submission_form_submit_button_" + parent).removeAttr('disabled');
	        	$("div#words_div #comment_submission_progress_span_" + parent).hide();
	        } 
	        else 
	        {
	        	if(parent.length !== 11) // toplevel
		    	{
		    		$("div#words_div #comment_submission_form_submit_button_" + parent).removeAttr("disabled");
		    		$("div#words_div #comment_submission_progress_span_" + parent).hide();
		    		if(!thread_jo.children) // if the main thread jo was empty before, create it with one item, this new one and empty the main_div to receive it
					{
						var onechildarray = new Array();
						onechildarray[0] = data.comment.id;
						thread_jo.children = onechildarray; 
						$("div#words_div #main_div_" + parent).html("");
					}	
		        	else
		        	{
		        		var temparray = thread_jo.children;
		        		temparray.push(data.comment.id);
		        		thread_jo.children = temparray; 
		        	}
		    	}
	        	
	        	// on success, reset the form stuff
	        	$("div#words_div #comment_textarea_" + parent).css("height", "22px");			// set it back to normal height
	        	$("div#words_div #comment_textarea_" + parent).val("Say something..."); // set the default wording
	        	$("div#words_div #char_count_and_submit_button_div_" + parent).hide();			// hide the charcount and submit area
	        	if(parent.length === 11) // not toplevel
	        		$("div#words_div #reply_td_" + parent).hide();								// hide the reply area div
	        	$("div#words_div #comment_textarea_" + parent).css("color", "#aaa");			// reset the text to gray
	        	$("div#words_div #comment_submission_form_submit_button_" + parent).removeAttr('disabled');
		    	
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
       	 	$("div#words_div #comment_submission_form_div_" + parent).hide();
       	 	$("div#words_div #comment_submission_form_submit_button_" + parent).removeAttr("disabled");
       	 	$("div#words_div #comment_submission_progress_span_" + parent).hide();
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
				doThreadItem(data.comment.id, data.comment.parent, "reply");
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

function likeOrDislikeComment(id, like_or_dislike)
{
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
	setTimeout(function(){if(typeof bg.t_jo!=="undefined"&&bg.t_jo!==null)
	{displayMessage("Thread retrieval error.", "red", "message_div_"+ currentURLhash);return;}},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);},333);
}
