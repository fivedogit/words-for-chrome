//INITIALIZE THE BASE HTML FOR THE WORDS VIEW along with all of its event triggers (mouseover + mouseout + click for each tab button + comment form events focus, blur, submit and keyup (charcount))
 function initializeView()
 {
 	var bs = ""; // body string to be inserted into words_div  (which resides just inside <body>. Why not just use <body>? So this can be used as page injection. Can't override existing body there.
 	bs = bs + "<table style=\"width:100%;background-image:url('" + chrome.extension.getURL("images/outlets2X.png") + "');color:white;border: 1px solid yellow\" class=\"white-links\">";
 		bs = bs + "<tr>";
 			bs = bs + "<td style=\"text-align:left;padding-left:5px;padding-top:5px;\">"; // small words logo td
 			bs = bs + "		<a href=\"#\" id=\"words_logo_link\"><img src=\"" + chrome.extension.getURL("images/words_logo_125x24.png") + "\"></img></a>";
 			bs = bs + "</td>";
 			bs = bs + "<td id=\"logstat_td\"></td>";
 			bs = bs + "<td style=\"text-align:right\">"; // tabs td
 				bs = bs + "<table style=\"width:120px;line-height:14px;margin:2px 2px 2px auto;border:1px solid cyan\">"; // tabs table
 					bs = bs + "<tr>";
 						bs = bs + "<td><a href=\"#\" id=\"thread_tab_link\"><img id=\"thread_tab_img\" src=\"" + chrome.extension.getURL("images/chat_blue.png") + "\"></img></a></td>";
 					    bs = bs + "<td><a href=\"#\" id=\"trending_tab_link\"><img id=\"trending_tab_img\" src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></img></a></td>"; 
 						bs = bs + "<td><a href=\"#\" id=\"notifications_tab_link\"><img id=\"notifications_tab_img\" src=\"" + chrome.extension.getURL("images/flag_gray.png") + "\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"past_tab_link\"><img id=\"past_tab_img\" src=\"" + chrome.extension.getURL("images/clock_gray.png") + "\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"profile_tab_link\"><img id=\"profile_tab_img\" src=\"" + chrome.extension.getURL("images/user_gray.png") + "\"></img></a></td>";
 					bs = bs + "</tr>";
 					bs = bs + "<tr>";
 						bs = bs + "<td colspan=5 id=\"tab_tooltip_td\">Comments</td>";
 					bs = bs + "</tr>";
 				bs = bs + "</table>";
 			bs = bs + "</td>";
 		bs = bs + "</tr>";
 	bs = bs + "</table>";
 	bs = bs + "<div id=\"utility_div_" + currentURLhash + "\" style=\"background-image:url('" + chrome.extension.getURL("images/outlets2X_light.png") + "');padding-top:10px;padding-bottom:10px;border-top: 1px solid #ddd;\">";
 	bs = bs + "	<div id=\"header_div_top\" style=\"font-size:14px;font-weight:bold;display:none;padding-bottom:5px;\"></div>"; // make unique with currentURLhash?
 	bs = bs + "	<div class=\"message-div\" id=\"message_div_" + currentURLhash + "\" style=\"display:none;padding-bottom:5px\"></div>";
 	bs = bs + "	<div id=\"tlcf_div_" + currentURLhash + "\">something</div>";
 	bs = bs + "</div>";
	bs = bs + "<div id=\"main_div_" + currentURLhash + "\"><div style=\"padding:20px\"></div></div>";
	bs = bs + "<div id=\"footer_div\" class=\"white-links\" style=\"background-image:url('" + chrome.extension.getURL("images/outlets2X.png") + "');padding:13px 5px 13px 5px;color:white;\">";
	bs = bs + "</div>";
 	$("#words_div").html(bs);//OK
 
 	writeCommentForm(currentURLhash, "tlcf_div_" + currentURLhash); // id_to_use, target_dom_id
 	
 	$("#words_logo_link").click(
 			function () {
 				doAboutTab();
 				return false;
 			});

 	$("#thread_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Comments");
 				return false;
 			});

 	$("#thread_tab_link").mouseout(
 			function () {
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

 	$("#thread_tab_link").click(
 			function () {
 				doThreadTab();
 				return false;
 			});

 	$("#trending_tab_link").mouseover(
 			function (event) {
 				$("#tab_tooltip_td").text("Trending");
 				event.preventDefault();
 			});

 	$("#trending_tab_link").mouseout(
 			function (event) {
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
 				event.preventDefault();
 			});

 	$("#trending_tab_link").click(
 			function (event) {
 				event.preventDefault();
 				doTrendingTab();
 			});

 	$("#notifications_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Notifications");
 				return false;
 			});

 	$("#notifications_tab_link").mouseout(
 			function () {
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

 	$("#notifications_tab_link").click(
 			function (event) {
 				event.preventDefault();
 				doNotificationsTab();
 			});

	$("#past_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Your past comments");
 				return false;
 			});

 	$("#past_tab_link").mouseout(
 			function () {
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

 	$("#past_tab_link").click(
 			function (event) {
 				event.preventDefault();
 				if(user_jo == null || user_jo.screenname == null)
 					doPastTab();
 				else
 					doPastTab(user_jo.screenname);
 			});
 	
 	$("#profile_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").text("Profile/Settings");
 				return false;
 			});

 	$("#profile_tab_link").mouseout(
 			function () {
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

 	$("#profile_tab_link").click(
 			function (event) {
 				event.preventDefault();
 				if(user_jo == null || user_jo.screenname == null)
 					viewProfile();
 				else
 					viewProfile(user_jo.screenname);
 			});
 	
 	updateLogstat(user_jo);
 }

 
 function writeCommentForm(id_to_use, target_dom_id)
 {
	 var tlcf = "";
	 tlcf = tlcf + "<form method=post action=\"#\">"; 
		tlcf = tlcf + "<div style=\"margin-right:auto;margin-left:auto;width:80%;\" id=\"comment_submission_form_div_" + id_to_use + "\" style=\"padding-top:6px\">"; 
		var saved_text_dom_id = docCookies.getItem("saved_text_dom_id");
		var charsleft = 500;
		if(saved_text_dom_id != null && saved_text_dom_id === ("comment_textarea_" + id_to_use) 
				&& docCookies.getItem("saved_text") != null && docCookies.getItem("saved_text").trim().length > 0)
		{
			var s_text = docCookies.getItem("saved_text");
			tlcf = tlcf + "<textarea class=\"composition-textarea\" style=\"color:black\" id=\"comment_textarea_" + id_to_use + "\">" + s_text + "</textarea>";
			charsleft = 500 -  s_text.length;
		}
		else	
			tlcf = tlcf + "<textarea class=\"composition-textarea\" style=\"height:22px;color:#aaa\" id=\"comment_textarea_" + id_to_use + "\">Say something...</textarea>";
		tlcf = tlcf + "	<div id=\"char_count_and_submit_button_div_" + id_to_use + "\" style=\"width:100px;height:16px;margin-left:auto;margin-right:0px;vertical-align:middle;display:none;margin-bottom:5px\">";
		tlcf = tlcf + "		<span style=\"display:none;padding-right:3px;\" id=\"comment_submission_progress_span_" + id_to_use + "\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></span>";
		tlcf = tlcf + "		<span id=\"charsleft_" + id_to_use + "\" style=\"margin-right:3px\">" + charsleft + "</span> ";
		tlcf = tlcf + "		<span><input id=\"comment_submission_form_submit_button_" + id_to_use + "\" class=\"comment-submit-button\" type=button value=\"Submit\"></input></span>";
		tlcf = tlcf + "	</div>";
		tlcf = tlcf + "</div>";
	tlcf = tlcf + "</form>";	
	$("#" + target_dom_id).html(tlcf);
	
	createSubmissionFormSubmitButtonClickEvent(id_to_use);
 	createFocusEventForTextarea(id_to_use);
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
	welcomearea = welcomearea + "<table style=\"margin-right:auto;margin-left:auto;width:auto;border:1px solid pink;border-spacing:5px;border-collapse:separate;\">";
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
	welcomearea = welcomearea + "	</tr>";
	welcomearea = welcomearea + "</table>";
	$("#logstat_td").html(welcomearea); //OK

	var temphtml = "";
	$("#google_login_img").mouseover( function() {
		temphtml = $("#header_div_top").html();//OK (getter)
		$("#comment_submission_form_div_" + currentURLhash).hide();
		$("#header_div_top").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Google login is used for email verification ONLY.<br>WORDS cannot post on your behalf nor access any non-basic information.<br>Your WORDS identity is separate and anonymous.</span>");//OK
		$("#google_login_img").attr("src", chrome.extension.getURL("images/google_button_24x24_mo.png"));
		$("#tab_tooltip_td").text("Login with Google");
		return false;
	});
	$("#google_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#header_div_top").html(temphtml);//OK
		if(tabmode === "thread")
			$("#comment_submission_form_div_" + currentURLhash).show();
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
		return false;
	});
	
	$("#facebook_login_img").mouseover( function() {
		temphtml = $("#header_div_top").html();//OK (getter)
		$("#comment_submission_form_div_" + currentURLhash).hide();
		$("#header_div_top").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Facebook login is used for email verification ONLY.<br>WORDS cannot post to Facebook nor access any non-basic information.<br>Your WORDS identity is separate and anonymous.</span>");//OK
		$("#facebook_login_img").attr("src", chrome.extension.getURL("images/facebook_button_24x24_mo.png"));
		$("#tab_tooltip_td").text("Login with FB");
		return false;
	});
	$("#facebook_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#header_div_top").html(temphtml);//OK
		if(tabmode === "thread")
			$("#comment_submission_form_div_" + currentURLhash).show();
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
			return false;
	});
	
	
	$("#google_login_link").click(
			function (event) {
				alert("g");
				event.preventDefault();
				var currenttabid;
				chrome.tabs.getSelected(null, function(tab) { 
					alert("got selected");
					currenttabid = tab.id; 
					docCookies.setItem("last_tab_id", currenttabid, 31536e3);
					// at this point, the user has clicked the login button because email/this_access_token didn't exist or wasn't valid
					// (which is why the button was shown in the first place)
					// Right now the user either has the social_access_token and it hasn't expired yet
					// or they have it and it HAS expired
					// or they don't have it at all.
					// NEW: JUST SEND USER TO RECEIVER, NO MATTER WHAT. LET RECEIVER HANDLE ALL ACCESS TOKEN VALIDITY JUDGEMENT AND RETRIEVAL
					alert("creating");
					chrome.tabs.create({url: chrome.extension.getURL('receiver.html') + "?login_type=google"});
				});
			});
	
	$("#facebook_login_link").click(
			function (event) {
				event.preventDefault();
				var currenttabid;
				chrome.tabs.getSelected(null, function(tab) { 
					currenttabid = tab.id; 
					docCookies.setItem("last_tab_id", currenttabid, 31536e3);
					// at this point, the user has clicked the login button because email/this_access_token didn't exist or wasn't valid
					// (which is why the button was shown in the first place)
					// Right now the user either has the social_access_token and it hasn't expired yet
					// or they have it and it HAS expired
					// or they don't have it at all.
					// NEW: JUST SEND USER TO RECEIVER, NO MATTER WHAT. LET RECEIVER HANDLE ALL ACCESS TOKEN VALIDITY JUDGEMENT AND RETRIEVAL
					chrome.tabs.create({url: chrome.extension.getURL('receiver.html') + "?login_type=facebook"});
				});
			});
}

function displayLogstatAsLoggedIn() {
	if (user_jo === null) {
		displayLogstatAsLoggedOut();
		return;
	}
	var welcomearea = "";
	welcomearea = welcomearea + "<table style=\"margin-right:auto;margin-left:auto;width:auto;border:1px solid pink\">";
	welcomearea = welcomearea + "	<tr>";
	welcomearea = welcomearea + "		<td style=\"width:32px;\">";
	welcomearea = welcomearea + "			<span id=\"logged_in_profile_image_span\">";
	welcomearea = welcomearea + "				<img style=\"height:32px;width:32px;border-radius:4px\" id=\"logged_in_profile_img\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
	welcomearea = welcomearea + "			</span>";
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "		<td id=\"logstat_screenname_td\" style=\"text-align:left;padding-left:3px;\">";
	welcomearea = welcomearea + "			<a href=\"#\" id=\"screenname_link\"></a>";
	
	if(typeof user_jo.alts !== "undefined" && user_jo.alts !== null)
	{
		welcomearea = welcomearea + " <img id=\"alt_dropdown_img\" src=\"" + chrome.extension.getURL("images/dropdown_triangle.png") + "\">";
	}	
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "	</tr>";
	welcomearea = welcomearea + "</table>";
	$("#logstat_td").html(welcomearea);//OK
	$("#screenname_link").text(user_jo.screenname);
	$("#logged_in_profile_img").attr("src", user_jo.picture);
	
	if(typeof user_jo.alts !== "undefined" && user_jo.alts != null)
	{
		$("#alt_dropdown_img").click(
				function () {
					var prev = $("#header_div_top").html();//OK (getter)
					var alts_counter = 0;
					var str = "";
					while(alts_counter < user_jo.alts.length)
					{
						str = str + "<a href=\"#\" id=\"user_" + alts_counter + "_link\"></a> - ";
						alts_counter++;
					}	
					str = str.substring(0, str.length - 2);
					$("#header_div_top").html(str);//OK
					alts_counter = 0;
					while(alts_counter < user_jo.alts.length)
					{
						$("#user_" + alts_counter + "_link").text(user_jo.alts[alts_counter].screenname);
						$("#user_" + alts_counter + "_link").click({altuser: user_jo.alts[alts_counter], prev: prev},
								function (event) {
									$("#header_div_top").html(event.data.prev);//OK
									//alert(event.data.altuser.email + " " + event.data.altuser.this_access_token);
									//bg.getUser(false); // this is the ONLY synchronous getUser request bc this feature is only accessible by admins anyway
									//user_jo = get from background and reload?
									displayLogstatAsLoggedIn();
									return;
								});
						alts_counter++;
					}	
					return;
				});
	}	
	
	$("#screenname_link").click(
			function () {
				viewProfile(user_jo.screenname);
				return;
			});
}
