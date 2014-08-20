function resetTabTooltip()
{
	if(tabmode === "thread")
		$("#tab_tooltip_td").text("Comments for this page");
	else if(tabmode === "feed")
		$("#tab_tooltip_td").text("Comments from all over");
	else if(tabmode === "trending")
		$("#tab_tooltip_td").text("Trending");
	else if(tabmode === "notifications")
		$("#tab_tooltip_td").text("Notifications");
	else if(tabmode === "past")
		$("#tab_tooltip_td").text("Your past comments");
	else if(tabmode === "profile")
		$("#tab_tooltip_td").text("Profile/Settings");
}

//INITIALIZE THE BASE HTML FOR THE WORDS VIEW along with all of its event triggers (mouseover + mouseout + click for each tab button + comment form events focus, blur, submit and keyup (charcount))
 function initializeView()
 {
	 var bs = ""; // body string to be inserted into words_div  (which resides just inside <body>. Why not just use <body>? So this can be used as page injection. Can't override existing body there.
 	 bs = bs + "<table style=\"width:100%;background-image:url('" + chrome.extension.getURL("images/outlets2X.png") + "');color:white;\" class=\"white-links\">";
 		bs = bs + "<tr>";
 			bs = bs + "<td style=\"text-align:left;padding:8px 8px 5px 8px\">"; // small words logo td
 			bs = bs + "		<table style=\"width:auto\"><tr><td style=\"text-align:center\"><a href=\"#\" id=\"words_logo_link\"><img src=\"" + chrome.extension.getURL("images/words_logo_125x24.png") + "\"></img></a></td></tr>";
 			bs = bs + "		<tr><td style=\"text-align:center;line-height:10px\">Smarter, safer web comments</td></tr></table>";
 			//bs = bs + "		<a href=\"#\" id=\"words_logo_link\"><img src=\"" + chrome.extension.getURL("images/words_logo_125x24.png") + "\"></img></a>";
 			bs = bs + "</td>";
 			bs = bs + "<td id=\"logstat_td\" style=\"padding:8px 8px 5px 8px\"></td>";
 			bs = bs + "<td style=\"text-align:right;padding:8px 8px 5px 8px\">"; // tabs td
 				bs = bs + "<table style=\"width:120px;line-height:14px;margin:2px 2px 2px auto;\">"; // tabs table
 					bs = bs + "<tr>";
 						bs = bs + "<td><a href=\"#\" id=\"thread_tab_link\"><img id=\"thread_tab_img\" src=\"" + chrome.extension.getURL("images/chat_blue.png") + "\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"feed_tab_link\"><img id=\"feed_tab_img\" src=\"" + chrome.extension.getURL("images/earth_gray.png") + "\"></img></a></td>";
 					    bs = bs + "<td><a href=\"#\" id=\"trending_tab_link\"><img id=\"trending_tab_img\" src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></img></a></td>"; 
 						bs = bs + "<td><a href=\"#\" id=\"notifications_tab_link\"><img id=\"notifications_tab_img\" src=\"" + chrome.extension.getURL("images/flag_gray.png") + "\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"past_tab_link\"><img id=\"past_tab_img\" src=\"" + chrome.extension.getURL("images/clock_gray.png") + "\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"profile_tab_link\"><img id=\"profile_tab_img\" src=\"" + chrome.extension.getURL("images/user_gray.png") + "\"></img></a></td>";
 					bs = bs + "</tr>";
 					bs = bs + "<tr>";
 						bs = bs + "<td colspan=6 id=\"tab_tooltip_td\">Comments</td>";
 					bs = bs + "</tr>";
 				bs = bs + "</table>";
 			bs = bs + "</td>";
 		bs = bs + "</tr>";
 	bs = bs + "</table>";
 	bs = bs + "<table id=\"utility_table_" + currentURLhash + "\" style=\"background-color:#ddd;border-bottom:1px solid #ccc\">";//background-image:url('" + chrome.extension.getURL("images/outlets2X_light.png") + "')\">";
 	bs = bs + "	<tr><td id=\"utility_header_td\" style=\"font-size:14px;font-weight:bold;padding:8px 0px 8px 0px;\"></td></tr>"; // make unique with currentURLhash?
 	bs = bs + "	<tr><td id=\"utility_message_td\" style=\"padding:0px 0px 8px 0px;display:none\"></td></tr>";
 	bs = bs + "	<tr><td id=\"utility_csf_td\" style=\"padding:0px 0px 8px 0px;vertical-align:middle;\"></td></tr>"; // csf = comment submission form
 	bs = bs + "</table>";
	bs = bs + "<div id=\"main_div_" + currentURLhash + "\"><div style=\"padding:20px\"></div></div>";
	bs = bs + "<div id=\"footer_div\" class=\"white-links\" style=\"background-image:url('" + chrome.extension.getURL("images/outlets2X.png") + "');padding:13px 5px 13px 5px;color:white;\">";
	bs = bs + "</div>";
 	$("#words_div").html(bs);//OK

 	writeCommentForm(currentURLhash, "utility_csf_td", "utility_message_td"); // id_to_use, target_dom_id

 	$("#words_logo_link").click( function (event) {	event.preventDefault();
 				doAboutTab();
 			});

 	$("#thread_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Comments for this page");
 				return false;
 			});

 	$("#thread_tab_link").mouseout(
 			function () {
 				resetTabTooltip();
 				return false;
 			});

 	$("#thread_tab_link").click( function (event) {	event.preventDefault();
 				doThreadTab();
 			});
 	
	$("#feed_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Comments from all over");
 				return false;
 			});

 	$("#feed_tab_link").mouseout(
 			function () {
 				resetTabTooltip();
 				return false;
 			});

 	$("#feed_tab_link").click( function (event) {	event.preventDefault();
 				doFeedTab();
 			});

 	$("#trending_tab_link").mouseover(
 			function (event) {
 				event.preventDefault();
 				$("#tab_tooltip_td").text("Trending");
 			});

 	$("#trending_tab_link").mouseout(
 			function () {
 				resetTabTooltip();
 				return false;
 			});

 	$("#trending_tab_link").click( function (event) {	event.preventDefault();
 				doTrendingTab();
 			});

 	$("#notifications_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Notifications");
 				return false;
 			});

 	$("#notifications_tab_link").mouseout(
 			function () {
 				resetTabTooltip();
 				return false;
 			});

 	$("#notifications_tab_link").click( function (event) {	event.preventDefault();
 				doNotificationsTab();
 				chrome.runtime.sendMessage({method: "redrawButton"}, function(response) {
					  //alert(response.message);
				 });
 			});

	$("#past_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Your past comments");
 				return false;
 			});

 	$("#past_tab_link").mouseout(
 			function () {
 				resetTabTooltip();
 				return false;
 			});

 	$("#past_tab_link").click( function (event) {	event.preventDefault();
 				doPastTab();
 			});
 	
 	$("#profile_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Profile/Settings");
 				return false;
 			});

 	$("#profile_tab_link").mouseout(
 			function () {
 				resetTabTooltip();
 				return false;
 			});

 	$("#profile_tab_link").click( function (event) {	event.preventDefault();
 				if(user_jo === null)
 					viewProfile(null);
 				else
 					viewProfile(user_jo.screenname);
 			});
 	
 	updateLogstat(user_jo);
 	writeFooterMessage();
 }

 
 function writeCommentForm(id_to_use, target_dom_id, message_element)
 {
	 var csf_str = "";
	 var charsleft = 500;
	 csf_str = csf_str + "<form method=post action=\"#\">"; 
		csf_str = csf_str + "<div style=\"margin-right:auto;margin-left:auto;width:80%;\" id=\"comment_submission_form_div_" + id_to_use + "\" style=\"\">"; 
		csf_str = csf_str + "<textarea class=\"composition-textarea\" id=\"comment_textarea_" + id_to_use + "\">Say something...";
		csf_str = csf_str + "</textarea>";
		csf_str = csf_str + "	<div id=\"char_count_and_submit_button_div_" + id_to_use + "\" style=\"width:140px;margin-left:auto;margin-right:0px;vertical-align:middle;display:none;\">";
		csf_str = csf_str + "		<span style=\"display:none;padding-right:6px\" id=\"comment_submission_progress_span_" + id_to_use + "\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></span>";
		csf_str = csf_str + "		<span id=\"charsleft_" + id_to_use + "\" style=\"padding-right:6px\"></span> ";
		csf_str = csf_str + "		<span><input id=\"comment_submission_form_submit_button_" + id_to_use + "\" class=\"standardized-button\" type=button value=\"Submit\"></input></span>";
		csf_str = csf_str + "	</div>";
		csf_str = csf_str + "</div>";
	csf_str = csf_str + "</form>";	
	$("#" + target_dom_id).html(csf_str);

	chrome.runtime.sendMessage({method: "getSavedText"}, function(response) {
		 var saved_text = response.saved_text;
		 var saved_text_dom_id = response.saved_text_dom_id;
		 if(saved_text_dom_id !== null && saved_text_dom_id === ("comment_textarea_" + id_to_use) 
				 && saved_text !== null && saved_text.trim().length > 0)
		 {
			 charsleft = 500 -  saved_text.length;
			 $("#comment_textarea_" + id_to_use).text(saved_text);
		 }
		 else	
		 {
			 $("#comment_textarea_" + id_to_use).css("color", "#aaa");
			 $("#comment_textarea_" + id_to_use).text("Say something...");
		 }
		 $("#charsleft_" + id_to_use).text(charsleft);
	 });
	
	createSubmissionFormSubmitButtonClickEvent(id_to_use, message_element);
 	createFocusEventForTextarea(id_to_use, message_element);
 	createBlurEventForTextarea(id_to_use);
 	createKeyupEventForTextarea(id_to_use, 500);
 	
 	if(charsleft < 500 && has_scrollbar("comment_textarea_" + id_to_use)) // if saved text and scrollbars, grow
 			$("#comment_textarea_" + id_to_use).trigger("keyup");
 }

 
 
// This is the first function run when this overlay is activated by the button.
// It is possible that the user object has not been retrieved yet, in which case, this will show a logged out state.
// Three reasons this should never happen:
// 1. In theory, the service should be fast enough to always have loaded before the user could even be capable of clicking the button
// 2. In practice, hardly anyone is going to click the activation button instantly when they visit a new page
// 3. After the first bg.user_jo load, bg.user_jo will be refreshed each time. Only deleted if logged out.

function updateLogstat()
{
	if (user_jo !== null)
	{
		updateNotificationTabLinkImage();
		displayLogstatAsLoggedIn();
	}
	else
	{
		displayLogstatAsLoggedOut();
	}
}

function displayLogstatAsLoggedOut() {
	if (user_jo !== null) {
		displayLogstatAsLoggedIn();
		return;
	}
	var welcomearea = "";
	welcomearea = welcomearea + "<table style=\"margin-right:auto;margin-left:auto;width:auto;border-spacing:5px;border-collapse:separate;\">";
	welcomearea = welcomearea + "	<tr>";
	welcomearea = welcomearea + "		<td style=\"text-align:right;font-size:14px;font-face:bold;\">";
	welcomearea = welcomearea + " 			Login:";
	welcomearea = welcomearea + " 		</td>";
	welcomearea = welcomearea + "		<td>";
	welcomearea = welcomearea + " 			<a href=\"#\" id=\"google_login_link\"><img id=\"google_login_img\" style=\"width:24px;height:24px\" src=\"" + chrome.extension.getURL("images/google_button_24x24.png") + "\"></a>";
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "		<td>";
	welcomearea = welcomearea + " 			<a href=\"#\" id=\"facebook_login_link\"><img id=\"facebook_login_img\" style=\"width:24px;height:24px\" src=\"" + chrome.extension.getURL("images/facebook_button_24x24.png") + "\"></a>";
	welcomearea = welcomearea + " 		</td>";
	welcomearea = welcomearea + "		<td>";
	welcomearea = welcomearea + " 			<a href=\"#\" id=\"words_login_link\"><img id=\"words_login_img\" style=\"width:24px;height:24px\" src=\"" + chrome.extension.getURL("images/words_button_24x24.png") + "\"></a>";
	welcomearea = welcomearea + " 		</td>";
	welcomearea = welcomearea + "	</tr>";
	welcomearea = welcomearea + "</table>";
	$("#logstat_td").html(welcomearea); //OK

	var temphtml = "";
	$("#google_login_img").mouseover( function() {
		temphtml = $("#utility_header_td").html();//OK (getter)
		$("#utility_csf_td").hide();
		$("#utility_header_td").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Google login is used for email verification ONLY.<br>WORDS cannot post on your behalf nor access any non-basic information.<br>Your WORDS identity is separate and anonymous.</span>");//OK
		$("#google_login_img").attr("src", chrome.extension.getURL("images/google_button_24x24_mo.png"));
		$("#tab_tooltip_td").text("Login with Google");
	});
	$("#google_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#utility_header_td").html(temphtml);//OK
		if(tabmode === "thread")
			$("#utility_csf_td").show();
		$("#google_login_img").attr("src", chrome.extension.getURL("images/google_button_24x24.png"));
		if(tabmode === "thread")
				$("#tab_tooltip_td").text("Comments");
			else if(tabmode === "trending")
				$("#tab_tooltip_td").text("Trending");
			else if(tabmode === "notifications")
				$("#tab_tooltip_td").text("Notifications");
			else if(tabmode === "past")
				$("#tab_tooltip_td").text("Your past comments");
			else if(tabmode === "profile")
				$("#tab_tooltip_td").text("Profile/Settings");
	});
	$("#google_login_link").click(function (event) { event.preventDefault();
			var currenttabid;
			chrome.tabs.getSelected(null, function(tab) { 
				currenttabid = tab.id; 
				chrome.runtime.sendMessage({method: "setLastTabID", last_tab_id: currenttabid}, function(response) {
					//alert(response.message);
				});
				chrome.tabs.create({url: chrome.extension.getURL('receiver.html') + "?login_type=google"});
			});
	});
	
	$("#facebook_login_img").mouseover( function() {
		temphtml = $("#utility_header_td").html();//OK (getter)
		$("#utility_csf_td").hide();
		$("#utility_header_td").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Facebook login is used for email verification ONLY.<br>WORDS cannot post to Facebook nor access any non-basic information.<br>Your WORDS identity is separate and anonymous.</span>");//OK
		$("#facebook_login_img").attr("src", chrome.extension.getURL("images/facebook_button_24x24_mo.png"));
		$("#tab_tooltip_td").text("Login with FB");
	});
	$("#facebook_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#utility_header_td").html(temphtml);//OK
		if(tabmode === "thread")
			$("#utility_csf_td").show();
		$("#facebook_login_img").attr("src", chrome.extension.getURL("images/facebook_button_24x24.png"));
		if(tabmode === "thread")
				$("#tab_tooltip_td").text("Comments");
			else if(tabmode === "trending")
				$("#tab_tooltip_td").text("Trending");
			else if(tabmode === "notifications")
				$("#tab_tooltip_td").text("Notifications");
			else if(tabmode === "past")
				$("#tab_tooltip_td").text("Your past comments");
			else if(tabmode === "profile")
				$("#tab_tooltip_td").text("Profile/Settings");
	});
	$("#facebook_login_link").click(function (event) { event.preventDefault();
			var currenttabid;
			chrome.tabs.getSelected(null, function(tab) { 
				currenttabid = tab.id; 
				chrome.runtime.sendMessage({method: "setLastTabID", last_tab_id: currenttabid}, function(response) {
					//alert(response.message);
				});
				chrome.tabs.create({url: chrome.extension.getURL('receiver.html') + "?login_type=facebook"});
			});
	});
	
	$("#words_login_img").mouseover( function() {
		$("#words_login_img").attr("src", chrome.extension.getURL("images/words_button_24x24_mo.png"));
		$("#tab_tooltip_td").text("Login with WORDS");
		return false;
	});
	$("#words_login_img").mouseout( function() {
		if(tabmode === "thread")
			$("#utility_csf_td").show();
		$("#words_login_img").attr("src", chrome.extension.getURL("images/words_button_24x24.png"));
		if(tabmode === "thread")
				$("#tab_tooltip_td").text("Comments");
			else if(tabmode === "trending")
				$("#tab_tooltip_td").text("Trending");
			else if(tabmode === "notifications")
				$("#tab_tooltip_td").text("Notifications");
			else if(tabmode === "past")
				$("#tab_tooltip_td").text("Your past comments");
			else if(tabmode === "profile")
				$("#tab_tooltip_td").text("Profile/Settings");
			return false;
	});
	$("#words_login_link").click(function (event) { event.preventDefault();
			var currenttabid;
			chrome.tabs.getSelected(null, function(tab) { 
				currenttabid = tab.id; 
				chrome.runtime.sendMessage({method: "setLastTabID", last_tab_id: currenttabid}, function(response) {
				  //alert(response.message);
				});
				chrome.tabs.create({url: chrome.extension.getURL('receiver.html') + "?login_type=words"});
			});
	});
	
	
	
	
}

function displayLogstatAsLoggedIn() {
	if (user_jo === null) {
		displayLogstatAsLoggedOut();
		return;
	}
	var welcomearea = "";
	welcomearea = welcomearea + "<table style=\"margin-right:auto;margin-left:auto;width:auto;\">";
	welcomearea = welcomearea + "	<tr>";
	welcomearea = welcomearea + "		<td style=\"width:32px;\">";
	welcomearea = welcomearea + "			<span id=\"logged_in_profile_image_span\">";
	welcomearea = welcomearea + "				<img style=\"height:32px;width:32px;border-radius:4px;\" id=\"logged_in_profile_img\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
	welcomearea = welcomearea + "			</span>";
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "		<td id=\"logstat_screenname_td\" style=\"text-align:left;padding-left:3px;color:white\">";
	welcomearea = welcomearea + "			<a href=\"#\" id=\"screenname_link\"></a>";
	
	if(typeof user_jo.alts !== "undefined" && user_jo.alts !== null)
	{
		welcomearea = welcomearea + " <img id=\"alt_dropdown_img\" src=\"" + chrome.extension.getURL("images/dropdown_triangle.png") + "\"> " + comcount;
	}	
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "	</tr>";
	welcomearea = welcomearea + "</table>";
	$("#logstat_td").html(welcomearea);//OK
	$("#screenname_link").text(user_jo.screenname);
	$("#logged_in_profile_img").attr("src", user_jo.picture);
	
	if(typeof user_jo.alts !== "undefined" && user_jo.alts != null)
	{
		$("#alt_dropdown_img").click(function (event) { event.preventDefault();
		var prev = $("#utility_header_td").html();//OK (getter)
		var alts_counter = 0;
		var str = "";
		while(alts_counter < user_jo.alts.length)
		{
			str = str + "<a href=\"#\" id=\"user_" + alts_counter + "_link\"></a> - ";
			alts_counter++;
		}	
		str = str.substring(0, str.length - 2);
		$("#utility_header_td").html(str);//OK
		alts_counter = 0;
		while(alts_counter < user_jo.alts.length)
		{
			$("#user_" + alts_counter + "_link").text(user_jo.alts[alts_counter].screenname);
			$("#user_" + alts_counter + "_link").click({altuser: user_jo.alts[alts_counter], prev: prev}, function (event) { event.preventDefault();
			$("#utility_header_td").html(event.data.prev);//OK
			//alert("email=" + event.data.altuser.email + " and tat=" + event.data.altuser.this_access_token);
			chrome.runtime.sendMessage({method: "switchUser", screenname: event.data.altuser.screenname, this_access_token: event.data.altuser.this_access_token}, function(response) {
				screenname = response.screenname;
				this_access_token = response.this_access_token;
				user_jo = response.user_jo;
				initializeView();
				doThreadTab();
			});
			return;
			});
			alts_counter++;
		}	
		return;
		});
	}	
	
	$("#screenname_link").click(function (event) { event.preventDefault();
				viewProfile(user_jo.screenname);
			});
}

function writeFooterMessage() {
	var footerstr = "";
	if(typeof user_jo === "undefined" || user_jo === null)
	{
		footerstr = footerstr + "<a id=\"reg_reminder_link\" style=\"color:#baff00\">Register</span> to be eligible for the next <span style=\"color:#ffde00\">giveaway</span>! Don't miss out!";
		$("#footer_div").html(footerstr);
		$("#reg_reminder_link").click(function (event) { 
			var currenttabid;
			chrome.tabs.getSelected(null, function(tab) { 
				currenttabid = tab.id; 
				chrome.runtime.sendMessage({method: "setLastTabID", last_tab_id: currenttabid}, function(response) {
					//alert(response.message);
				});
				chrome.tabs.create({url: chrome.extension.getURL('receiver.html') + "?login_type=words"});
			});
			return false;
		});
	}	
	else
	{
		if(user_jo.show_footer_messages === true)
		{	
			if(user_jo.email_is_confirmed === false)
			{
				footerstr = footerstr + "<a id=\"confirm_your_email_link\" style=\"color:#baff00\" href=\"#\">Confirm your email address</a> to be eligible for a free iPad!";
				$("#footer_div").html(footerstr);
				$("#confirm_your_email_link").click(function (event) {
					viewProfile(user_jo.screenname);
					return false;
				});
			}
			else if(user_jo.num_comments_authored === 0)
			{
				footerstr = footerstr + "To be eligible for the upcoming iPad drawing, write at least <span style=\"color:#ffde00\">one non-trivial comment</span>.";
				$("#footer_div").html(footerstr);
			}	
			else if(user_jo.shared_via_facebook === false && user_jo.shared_via_twitter === false)
			{
				footerstr = footerstr + "You have 1 prize entry. Earn 2 more by sharing to <a style=\"color:#baff00\" href=\"#\" id=\"share_to_facebook_link\" >Facebook</a> and ";
				footerstr = footerstr + "<a style=\"color:#baff00\" href=\"#\" id=\"share_to_twitter_link\" >Twitter</a>.";
				$("#footer_div").html(footerstr);
				noteImpressionAndCreateHandler("facebookshare", "footer", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
				noteImpressionAndCreateHandler("twittershare", "footer", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
			}	
			else if(user_jo.shared_via_facebook === true && user_jo.shared_via_twitter === false)
			{
				footerstr = footerstr + "You have 2 prize entries. Earn another by sharing to <a style=\"color:#baff00\" href=\"#\" id=\"share_to_twitter_link\" >Twitter</a>.";
				$("#footer_div").html(footerstr);
				noteImpressionAndCreateHandler("twittershare", "footer", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
			}	
			else if(user_jo.shared_via_facebook === false && user_jo.shared_via_twitter === true)
			{
				footerstr = footerstr + "You have 2 prize entries. Earn another by sharing to <a style=\"color:#baff00\" href=\"#\" id=\"share_to_facebook_link\" >Facebook</a>.";
				$("#footer_div").html(footerstr);
				noteImpressionAndCreateHandler("facebookshare", "footer", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
			}	
		}
		else
		{
			// do nothing
		}	
	}	
	/*var randomint = Math.floor(Math.random() * 50);
	if(randomint === 0)
	{
		footerstr = footerstr + "If you get a moment, a <a href=\"#\" id=\"rate_5_stars_link\" style=\"color:#baff00\">five star rating</a> would be greatly appreciated.";
		$("#footer_div").html(footerstr);
		if(navigator.userAgent.indexOf("OPR/") !== -1)
			noteImpressionAndCreateHandler("operastore", "footer", "rate_5_stars_link", "https://addons.opera.com/en/extensions/details/words/");
		else
			noteImpressionAndCreateHandler("cws", "footer", "rate_5_stars_link", "https://chrome.google.com/webstore/detail/words/lgdfecngaioibcmfbfpeeddgkjfdpgij/reviews");
	}	
	else if(randomint === 1)
	{
		footerstr = footerstr + "I want to hear your feedback on <a href=\"#\" id=\"follow_on_facebook_link\" style=\"color:#baff00\">Facebook</a> and <a href=\"#\" id=\"follow_on_twitter_link\" style=\"color:#baff00\">Twitter</a>!";
		$("#footer_div").html(footerstr);
		noteImpressionAndCreateHandler("facebook_apppage", "footer", "follow_on_facebook_link", "https://www.facebook.com/words4chrome");
		noteImpressionAndCreateHandler("twitter_mainacct", "footer", "follow_on_twitter_link", "http://www.twitter.com/words4chrome");
	}
	else if(randomint === 2)
	{
		footerstr = footerstr + "Spread the WORDS! ";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_facebook_link\" >Facebook</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_twitter_link\" >Twitter</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_googleplus_link\" >G+</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_tumblr_link\" >Tumblr</a>";
		$("#footer_div").html(footerstr);
		
		noteImpressionAndCreateHandler("facebookshare", "footer", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
		noteImpressionAndCreateHandler("twittershare", "footer", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
		noteImpressionAndCreateHandler("googleplusshare", "footer", "share_to_googleplus_link", "https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com");
		noteImpressionAndCreateHandler("tumblrshare", "footer", "share_to_tumblr_link", "http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people");
	}
	else if(randomint === 3)
	{
		footerstr = footerstr + "Support WORDS with Bitcoin: ";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_2_link\" >$2</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_5_link\" >$5</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_10_link\" >$10</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_20_link\" >$20</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_50_link\" >$50</a>";
		footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_100_link\" >$100</a>";
		$("#footer_div").html(footerstr);
		noteImpressionAndCreateHandler("coinbase2", "footer", "coinbase_2_link", "https://coinbase.com/checkouts/0dd1fe6c62615d397145ab61ed563851");
		noteImpressionAndCreateHandler("coinbase5", "footer", "coinbase_5_link", "https://coinbase.com/checkouts/61112abb012d09699e65c6ec1a632e41");
		noteImpressionAndCreateHandler("coinbase10", "footer", "coinbase_10_link", "https://coinbase.com/checkouts/9413426d693428113687ecbddf94faca");
		noteImpressionAndCreateHandler("coinbase20", "footer", "coinbase_20_link", "https://coinbase.com/checkouts/1e317adfab144ec7378c6a8abda14895");
		noteImpressionAndCreateHandler("coinbase50", "footer", "coinbase_50_link", "https://coinbase.com/checkouts/8c894218504788240c6b75acaf200529");
		noteImpressionAndCreateHandler("coinbase100", "footer", "coinbase_100_link", "https://coinbase.com/checkouts/d1affa653c0a756e53a50c18d6ae274a");
	}
	else if(randomint === 4)
	{
		footerstr = footerstr + "Remember: <span style=\"color:#ffde00\">Appropriate downvoting</span> is necessary for maintaining quality discussions. Do your part!";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 5)
	{
		footerstr = footerstr + "<span style=\"color:#ffde00\">\"I agree.\"</span> or <span style=\"color:#ffde00\">\"Me too!\"</span> should be upvotes, not comments. Downvote them.";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 6)
	{
		footerstr = footerstr + "Comments with <span style=\"color:#ffde00\">poor punctuation</span> should be downvoted. We're better than that.";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 7)
	{
		footerstr = footerstr + "Name-calling, racism, sexism, etc should be <span style=\"color:#ffde00\">downvoted</span> and otherwise <span style=\"color:#ffde00\">ignored</span>. Don't fuel the fire.";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 8)
	{
		footerstr = footerstr + "Downvotes mean \"This is inappropriate\" and <span style=\"color:#ffde00\">should not</span> be used for mere disagreement.";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 9)
	{
		footerstr = footerstr + "Downvote inappropriate <span style=\"color:#ffde00\">religious</span> or <span style=\"color:#ffde00\">political</span> rants.";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 10)
	{
		footerstr = footerstr + "Users with too many downvotes will be <span style=\"color:#ffde00\">silenced</span> for 7 days and have their existing comments <span style=\"color:#ffde00\">deleted</span>.";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 11)
	{
		footerstr = footerstr + "Trolling is downvote-worthy. <span style=\"color:#ffde00\">So is engaging them.</span>";
		$("#footer_div").html(footerstr);
	}
	else if(randomint === 12)
	{
		footerstr = footerstr + "Downvoting is anonymous. Your username will not be divulged.";
		$("#footer_div").html(footerstr);
	}*/
}

