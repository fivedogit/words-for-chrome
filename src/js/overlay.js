
var bg = chrome.extension.getBackgroundPage();
var thread_jo = bg.t_jo; 
var curentURLhash;
var currentURL;
var currentHostname;
var scrollable = 0;
var beginindex;
var endindex;
var email;
var this_access_token;
var threadstatus = 0; // notloading, loading
var tabmode = "thread";

//when the overlay's html page has loaded, do this
document.addEventListener('DOMContentLoaded', function () {
	 chrome.tabs.getSelected(null, function(tab) {
		 currentURL = tab.url;
		 currentURLhash = fromDecimalToOtherBase(62,hashFnv32a(tab.url));
		 initializeBaseHTML();
		 //currentTabID = tab.id;
		 currentHostname = currentURL.substring(currentURL.indexOf("://") + 3, currentURL.indexOf("/", currentURL.indexOf("://") + 3));
		 if (currentHostname.indexOf(".", currentHostname.indexOf(".")+1) === -1) // only has one "." assume www.
			 currentHostname = "www." + currentHostname;
		 updateLogstat(); // checks user credentials, updates logstat and comment form toggles accordingly
		 doThreadTab();
	 });
});

/***
 *      _      ____   _____  _____ _______    _______   __  __ ______ _______ _    _  ____  _____   _____ 
 *     | |    / __ \ / ____|/ ____|__   __|/\|__   __| |  \/  |  ____|__   __| |  | |/ __ \|  __ \ / ____|
 *     | |   | |  | | |  __| (___    | |  /  \  | |    | \  / | |__     | |  | |__| | |  | | |  | | (___  
 *     | |   | |  | | | |_ |\___ \   | | / /\ \ | |    | |\/| |  __|    | |  |  __  | |  | | |  | |\___ \ 
 *     | |___| |__| | |__| |____) |  | |/ ____ \| |    | |  | | |____   | |  | |  | | |__| | |__| |____) |
 *     |______\____/ \_____|_____/   |_/_/    \_\_|    |_|  |_|______|  |_|  |_|  |_|\____/|_____/|_____/ 
 *                                                                                                        
 *                                                                                                        
 */

// This is the first function run when this overlay is activated by the button.
// It is possible that the user object has not been retrieved yet, in which case, this will show a logged out state.
// Three reasons this should never happen:
// 1. In theory, the service should be fast enough to always have loaded before the user could even be capable of clicking the button
// 2. In practice, hardly anyone is going to click the activation button instantly when they visit a new page
// 3. After the first bg.user_jo load, bg.user_jo will be refreshed each time. Only deleted if logged out.

function updateLogstat()
{
	var e = docCookies.getItem("email");
	var tat = docCookies.getItem("this_access_token");
	if(e === null || tat === null)
	{
		docCookies.removeItem("email"); 
		docCookies.removeItem("this_access_token");
		bg.user_jo = null;
	}	
	
	if (bg.user_jo !== null)
	{
		if (typeof bg.user_jo.overlay_size !== "undefined" && bg.user_jo.overlay_size !== null)
		{
			$("body").css("width", bg.user_jo.overlay_size + "px");
		}
		updateNotificationTabLinkImage();
		displayLogstatAsLoggedIn();
	}
	else
	{
		displayLogstatAsLoggedOut();
	}
}

function displayLogstatAsLoggedOut() {
	if (bg.user_jo) {
		displayLogstatAsLoggedIn();
		return;
	}
	var welcomearea = "";
	welcomearea = welcomearea + "<table style=\"border-collapse:collapse;width:80px\">";
	welcomearea = welcomearea + "	<tr>";
	welcomearea = welcomearea + "		<td style=\"text-align:right;padding-right:5px;vertical-align:middle;font-size:14px;color-white;font-face:bold;\">Login:</td>";
	welcomearea = welcomearea + "		<td style=\"width:24px;padding-right:5px;padding-left:5px\"><a href=\"#\" id=\"google_login_link\"><img id=\"google_login_img\" src=\"images/google_button_24x24.png\"></a></td>";
	welcomearea = welcomearea + "		<td style=\"width:24px\"><a href=\"#\" id=\"facebook_login_link\"><img id=\"facebook_login_img\" src=\"images/facebook_button_24x24.png\"></a></td>";
	welcomearea = welcomearea + "	</tr>";
	welcomearea = welcomearea + "</table>";
	$("#logstat_td").html(welcomearea);

	var temphtml = "";
	$("#google_login_img").mouseover( function() {
		temphtml = $("#header_div_top").html();
		$("#comment_submission_form_div_" + currentURLhash).hide();
		$("#header_div_top").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Google login is used for email verification ONLY.<br>Words cannot post on your behalf nor access any non-basic information.<br>Your Words screenname/pic are separate and anonymous.</span>");
		$("#google_login_img").attr("src","images/google_button_24x24_mo.png");
		$("#tab_tooltip_td").html("Login with Google");
		return false;
	});
	$("#google_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#header_div_top").html(temphtml);
		$("#comment_submission_form_div_" + currentURLhash).show();
		$("#google_login_img").attr("src","images/google_button_24x24.png");
		if(tabmode === "thread")
				$("#tab_tooltip_td").html("Comments");
			else if(tabmode === "trending")
				$("#tab_tooltip_td").html("Trending");
			else if(tabmode === "notifications")
				$("#tab_tooltip_td").html("Notifications");
			else if(tabmode === "profile")
				$("#tab_tooltip_td").html("Profile/Settings");
		return false;
	});
	
	$("#facebook_login_img").mouseover( function() {
		temphtml = $("#header_div_top").html();
		$("#comment_submission_form_div_" + currentURLhash).hide();
		$("#header_div_top").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Facebook login is used for email verification ONLY.<br>Words cannot post to Facebook nor access any non-basic information.<br>Your Words screenname/pic are separate and anonymous.</span>");
		$("#facebook_login_img").attr("src","images/facebook_button_24x24_mo.png");
		$("#tab_tooltip_td").html("Login with FB");
		return false;
	});
	$("#facebook_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#header_div_top").html(temphtml);
		$("#comment_submission_form_div_" + currentURLhash).show();
		$("#facebook_login_img").attr("src","images/facebook_button_24x24.png");
		if(tabmode === "thread")
				$("#tab_tooltip_td").html("Comments");
			else if(tabmode === "trending")
				$("#tab_tooltip_td").html("Trending");
			else if(tabmode === "notifications")
				$("#tab_tooltip_td").html("Notifications");
			else if(tabmode === "profile")
				$("#tab_tooltip_td").html("Profile/Settings");
			return false;
	});
	
	
	$("#google_login_link").click(
			function () {
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
					chrome.tabs.create({url: chrome.extension.getURL('receiver.html') + "?login_type=google"});
				});
			});
	
	$("#facebook_login_link").click(
			function () {
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
	if (!bg.user_jo) {
		displayLogstatAsLoggedOut();
		return;
	}
	var welcomearea = "";
	welcomearea = welcomearea + "<table id=\"logstat_centering_table\">";
	welcomearea = welcomearea + "	<tr>";
	welcomearea = welcomearea + "		<td id=\"logstat_logo_td\">";
	welcomearea = welcomearea + "			<span id=\"logged_in_profile_image_span\">";
	welcomearea = welcomearea + "				<img class=\"userpic32 rounded\" src=\"" + bg.user_jo.picture + "\">";
	welcomearea = welcomearea + "			</span>";
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "		<td id=\"logstat_screenname_td\">";
	welcomearea = welcomearea + "			<a href=\"#\" id=\"screenname_link\">" + bg.user_jo.screenname + "</a>";
	if(typeof bg.user_jo.alts !== "undefined" && bg.user_jo.alts != null)
	{
		welcomearea = welcomearea + " <img id=\"alt_dropdown_img\" src=\"images/dropdown_triangle.png\">";
	}	
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "	</tr>";
	welcomearea = welcomearea + "</table>";
	$("#logstat_td").html(welcomearea);
	
	if(typeof bg.user_jo.alts !== "undefined" && bg.user_jo.alts != null)
	{
		$("#alt_dropdown_img").click(
				function () {
					var alts_counter = 0;
					var str = "";
					while(alts_counter < bg.user_jo.alts.length)
					{
						str = str + "<a href=\"#\" id=\"user_" + bg.user_jo.alts[alts_counter].screenname + "_link\">" + bg.user_jo.alts[alts_counter].screenname + "</a> - ";
						alts_counter++;
					}	
					str = str.substring(0, str.length - 2);
					$("#header_div_top").html(str);
					alts_counter = 0;
					while(alts_counter < bg.user_jo.alts.length)
					{
						$("#user_" + bg.user_jo.alts[alts_counter].screenname + "_link").click({altuser: bg.user_jo.alts[alts_counter]},
								function (event) {
									//alert(event.data.altuser.email + " " + event.data.altuser.this_access_token);
									docCookies.setItem("email", event.data.altuser.email, 31536e3);
									docCookies.setItem("this_access_token", event.data.altuser.this_access_token, 31536e3);
									bg.getUser(false); // this is the ONLY synchronous getUser request bc this feature is only accessible by admins anyway
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
				viewProfile(bg.user_jo.screenname);
				return;
			});
}

/***
 *     _   _ _____ _____ _     _____ _______   __ ___  ___ _____ _____ _   _ ___________  _____ 
 *    | | | |_   _|_   _| |   |_   _|_   _\ \ / / |  \/  ||  ___|_   _| | | |  _  |  _  \/  ___|
 *    | | | | | |   | | | |     | |   | |  \ V /  | .  . || |__   | | | |_| | | | | | | |\ `--. 
 *    | | | | | |   | | | |     | |   | |   \ /   | |\/| ||  __|  | | |  _  | | | | | | | `--. \
 *    | |_| | | |  _| |_| |_____| |_  | |   | |   | |  | || |___  | | | | | \ \_/ / |/ / /\__/ /
 *     \___/  \_/  \___/\_____/\___/  \_/   \_/   \_|  |_/\____/  \_/ \_| |_/\___/|___/  \____/ 
 *                                                                                              
 *                                                                                              
 */

function has_scrollbar(elem_id) 
{ 
 elem = document.getElementById(elem_id); 
 if (elem.clientHeight < elem.scrollHeight) 
   return true;
 else 
   return false;
} 

function updateNotificationTabLinkImage()
{
	if (tabmode === "notifications")
		$("#notifications_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag_blue.png") + "\"></img>");
	else if ((typeof bg.user_jo==="undefined") || bg.user_jo === null || bg.user_jo.notification_count === 0)
		$("#notifications_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag_gray.png") + "\"></img>");
	else if (bg.user_jo.notification_count <= 10)
		$("#notifications_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag" + bg.user_jo.notification_count + ".png") + "\"></img>");
	else if (bg.user_jo.notification_count > 10)
		$("#notifications_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag11plus.png") + "\"></img>");
	else
		$("#notifications_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag_gray.png") + "\"></img>");
}

function displayMessage(inc_message, inc_color, dom_id, s)
{
	if(typeof dom_id === "undefined" || dom_id === null)
		dom_id = "message_div_" + currentURLhash;
	var ms;
	if(s === null || !$.isNumeric(s) ||  Math.floor(s) != s) // not a number or not an integer 
		ms = 3000;
	else
		ms = s * 1000;
	if (typeof inc_color === "undefined" || inc_color === null)
		inc_color = "red";
	$("#" + dom_id).css("color", inc_color);
	$("#" + dom_id).html(inc_message);
	$("#" + dom_id).show();
	setTimeout(function() { $("#" + dom_id).hide();}, ms);
}


$(window).scroll(function() {
	   if ($(window).scrollTop() + $(window).height() === $(document).height()) {
	       if (scrollable === 1)
	       {
	    	  // $("#loading_more_comments_div").show();
	    	   beginindex = beginindex + 8; 
	    	   endindex = endindex + 8;
	    	   prepareGetAndPopulateThreadPortion();
	       }
	   }
 });

 
//INITIALIZE THE BASE HTML FOR THE Words VIEW along with all of its event triggers (mouseover + mouseout + click for each tab button + comment form events focus, blur, submit and keyup (charcount))

 function initializeBaseHTML()
 {
 	var bs = ""; // body string to be inserted into words_div  (which resides just inside <body>. Why not just use <body>? So this can be used as page injection. Can't override existing body there.
 	bs = bs + "<table id=\"logo_logstat_tabs_table\">";
 		bs = bs + "<tr>";
 			bs = bs + "<td id=\"small_words_logo_td\">";
 			bs = bs + "<a href=\"#\" id=\"words_logo_link\"><img src=\"images/words_logo_150x24.png\"></img></a>";
 			bs = bs + "</td>";
 			bs = bs + "<td id=\"logstat_td\"> </td>";
 			bs = bs + "<td id=\"tabs_td\">";
 				bs = bs + "<table id=\"tabs_table\">";
 					bs = bs + "<tr>";
 						bs = bs + "<td><a href=\"#\" id=\"thread_tab_link\"><img src=\"images/chat_blue.png\"></img></a></td>";
 					    bs = bs + "<td><a href=\"#\" id=\"trending_tab_link\"><img src=\"images/trending_gray.png\"></img></a></td>"; 
 						bs = bs + "<td><a href=\"#\" id=\"notifications_tab_link\"><img src=\"images/flag_gray.png\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"profile_tab_link\"><img src=\"images/user_gray.png\"></img></a></td>";
 					bs = bs + "</tr>";
 					bs = bs + "<tr>";
 						bs = bs + "<td colspan=4 id=\"tab_tooltip_td\">Comments</td>";
 					bs = bs + "</tr>";
 					bs = bs + "</table>";
 			bs = bs + "</td>";
 		bs = bs + "</tr>";
 	bs = bs + "</table>";
 	bs = bs + "<div class=\"utility-div\" id=\"utility_div_" + currentURLhash + "\">"; 
 		bs = bs + "<div class=\"message-div\" id=\"message_div_" + currentURLhash + "\" style=\"display:none\"></div>";
 		bs = bs + "<div id=\"header_div_top\" style=\"display:none\"></div>"; // make unique with currentURLhash?
 			bs = bs + "<form class=\"comment-submission-form\" method=post action=\"#\">"; 
 				bs = bs + "<div class=\"comment-submission-form-div\" id=\"comment_submission_form_div_" + currentURLhash + "\" style=\"padding-top:6px\">"; 
 				var saved_text_dom_id = docCookies.getItem("saved_text_dom_id");
 				var charsleft = 500;
 		  		if(saved_text_dom_id != null && saved_text_dom_id === ("comment_textarea_" + currentURLhash) 
 		  				&& docCookies.getItem("saved_text") != null && docCookies.getItem("saved_text").trim().length > 0)
 		  		{
 		  			var s_text = docCookies.getItem("saved_text");
 		  			bs = bs + "<textarea class=\"composition-textarea\" style=\"color:black\" id=\"comment_textarea_" + currentURLhash + "\">" + s_text + "</textarea>";
 		  			charsleft = 500 -  s_text.length;
 		  		}
 		  		else	
 		  			bs = bs + "<textarea class=\"composition-textarea\" style=\"height:22px;color:#aaa\" id=\"comment_textarea_" + currentURLhash + "\">Say something...</textarea>";
 		  		bs = bs + "	<div class=\"char-count-and-submit-button-div\" id=\"char_count_and_submit_button_div_" + currentURLhash + "\">";
 		  		bs = bs + "		<span class=\"comment-submission-progress-span\" id=\"comment_submission_progress_span_" + currentURLhash + "\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></span>";
 		  		bs = bs + "		<span id=\"charsleft_" + currentURLhash + "\">" + charsleft + "</span> ";
 		  		bs = bs + "		<span><input id=\"comment_submission_form_submit_button_" + currentURLhash + "\" type=button value=\"Submit\"></input></span>";
 		  		bs = bs + "	</div>";
 				bs = bs + "</div>";
 			bs = bs + "</form>";
 		bs = bs + "</div>";
 	bs = bs + "<div id=\"main_div_" + currentURLhash + "\"><div style=\"padding:20px\"> </div></div>";
 	bs = bs + "<div class=\"footer_div\">";
 	var randomint = Math.floor(Math.random() * 10) + 1
 	if(typeof thread_jo !== undefined && thread_jo !== null && typeof thread_jo.children !== "undefined" && thread_jo.children !== null && //thread_jo.children > 5 && 
 			typeof bg.user_jo !== undefined && bg.user_jo !== null && randomint === 1) // if there are more than 5 comments on this page, user is logged in, show this 1/10 threadviews
 	{	
 		bs = bs + "SPREAD THE WORDS! ";
 	 	bs = bs + "<a style=\"margin-left:5px\" href=\"#\" id=\"share_to_facebook_link\">Facebook</a> - ";
 	 	bs = bs + "<a href=\"#\" id=\"share_to_twitter_link\">Twitter</a> - ";
 	 	bs = bs + "<a href=\"#\" id=\"share_to_googleplus_link\">G+</a> - ";
 	 	bs = bs + "<a href=\"#\" id=\"share_to_tumblr_link\">Tumblr</a>";
 	 	if(typeof bg.user_jo !== undefined && bg.user_jo !== null && bg.user_jo.email !== "undefined" && bg.user_jo.email !== null && bg.user_jo.email.endsWith("@gmail.com"))
 	 		bs = bs + " - <a href=\"#\" id=\"invite_with_gmail_link\">Gmail</a> ";
 	}
 	bs = bs + "</div>";
 	$("#words_div").html(bs);
 	
 	if(typeof thread_jo !== undefined && thread_jo !== null && typeof thread_jo.children !== "undefined" && thread_jo.children !== null && //thread_jo.children > 5 && 
 			typeof bg.user_jo !== undefined && bg.user_jo !== null && randomint === 1) // if there are more than 5 comments on this page, user is logged in, show this 1/10 threadviews
 	{
 		$("#share_to_facebook_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					//"https://www.facebook.com/dialog/apprequests?app_id=271212039709142&message=Words%20for%20Chrome%20is%20fixing%20web%20commenting.%20http%3A%2F%2Fw.ords.co&redirect_uri=http%3A%2F%2Fw.ords.co"
 	 					"https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fw.ords.co"
 	 					});
 	 				notePromo("facebook", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#share_to_twitter_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"https://twitter.com/intent/tweet?text=Words%20for%20Chrome%20is%20fixing%20web%20commenting&url=http%3A%2F%2Fw.ords.co"
 	 					});
 	 				notePromo("twitter", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#share_to_googleplus_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"https://plus.google.com/share?url=http%3A%2F%2Fw.ords.co"
 	 					});
 	 				notePromo("googleplus", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#share_to_tumblr_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fw.ords.co&t=Words%20for%20Chrome%20is%20fixing%20web%20commenting"
 	 					});
 	 				notePromo("tumblr", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#invite_with_gmail_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"https://mail.google.com/mail/?view=cm&fs=1&su=Words%20for%20Chrome&body=Hey%2C%20I%20found%20this%20interesting%20commenting%20system%20I%20think%20you%20should%20try.%20You%20can%20get%20it%20here%3A%0A%0Ahttp%3A%2F%2Fw.ords.co%0A%0AYou%20can%20also%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%0A%0AEnjoy!"
 	 					});
 	 				notePromo("gmail", "footer");
 	 				return false;
 	 			});
 	}
 	$("#words_logo_link").click(
 			function () {
 				doAboutTab();
 				return false;
 			});

 	$("#thread_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").html("Comments");
 				return false;
 			});

 	$("#thread_tab_link").mouseout(
 			function () {
 				if(tabmode === "thread")
 					$("#tab_tooltip_td").html("Comments");
 				else if(tabmode === "trending")
 					$("#tab_tooltip_td").html("Trending");
 				else if(tabmode === "notifications")
 					$("#tab_tooltip_td").html("Notifications");
 				else if(tabmode === "profile")
 					$("#tab_tooltip_td").html("Profile/Settings");
 				return false;
 			});

 	$("#thread_tab_link").click(
 			function () {
 				doThreadTab();
 				return false;
 			});

 	$("#trending_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").html("Trending");
 				return false;
 			});

 	$("#trending_tab_link").mouseout(
 			function () {
 				if(tabmode === "thread")
 					$("#tab_tooltip_td").html("Comments");
 				else if(tabmode === "trending")
 					$("#tab_tooltip_td").html("Trending");
 				else if(tabmode === "notifications")
 					$("#tab_tooltip_td").html("Notifications");
 				else if(tabmode === "profile")
 					$("#tab_tooltip_td").html("Profile/Settings");
 				return false;
 			});

 	$("#trending_tab_link").click(
 			function () {
 				doTrendingTab();
 				return false;
 			});

 	$("#notifications_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").html("Notifications");
 				return false;
 			});

 	$("#notifications_tab_link").mouseout(
 			function () {
 				if(tabmode === "thread")
 					$("#tab_tooltip_td").html("Comments");
 				else if(tabmode === "trending")
 					$("#tab_tooltip_td").html("Trending");
 				else if(tabmode === "notifications")
 					$("#tab_tooltip_td").html("Notifications");
 				else if(tabmode === "profile")
 					$("#tab_tooltip_td").html("Profile/Settings");
 				return false;
 			});

 	$("#notifications_tab_link").click(
 			function () {
 				doNotificationsTab();
 				return false;
 			});

 	$("#profile_tab_link").mouseover(
 			function () {
 				$("#tab_tooltip_td").html("Profile/Settings");
 				return false;
 			});

 	$("#profile_tab_link").mouseout(
 			function () {
 				if(tabmode === "thread")
 					$("#tab_tooltip_td").html("Comments");
 				else if(tabmode === "trending")
 					$("#tab_tooltip_td").html("Trending");
 				else if(tabmode === "notifications")
 					$("#tab_tooltip_td").html("Notifications");
 				else if(tabmode === "profile")
 					$("#tab_tooltip_td").html("Profile/Settings");
 				return false;
 			});

 	$("#profile_tab_link").click(
 			function () {
 				if(bg.user_jo == null || bg.user_jo.screenname == null)
 					viewProfile();
 				else
 					viewProfile(bg.user_jo.screenname);
 				return false;
 			});

 	createSubmissionFormSubmitButtonClickEvent(currentURLhash); 
 	createFocusEventForTextarea(currentURLhash);
 	createBlurEventForTextarea(currentURLhash);
 	createKeyupEventForTextarea(currentURLhash, 500);
 	
 	if(charsleft < 500 && has_scrollbar("comment_textarea_" + currentURLhash)) // if saved text and scrollbars, grow
 			$("#comment_textarea_" + currentURLhash).trigger("keyup");
 }
 
 /***
  *     _____ ________  ______  ___ _____ _   _ _____   _____ ________  _________   _____ _   _ _____ _   _ _____ _____ 
  *    /  __ \  _  |  \/  ||  \/  ||  ___| \ | |_   _| /  __ \  _  |  \/  || ___ \ |  ___| | | |  ___| \ | |_   _/  ___|
  *    | /  \/ | | | .  . || .  . || |__ |  \| | | |   | /  \/ | | | .  . || |_/ / | |__ | | | | |__ |  \| | | | \ `--. 
  *    | |   | | | | |\/| || |\/| ||  __|| . ` | | |   | |   | | | | |\/| ||  __/  |  __|| | | |  __|| . ` | | |  `--. \
  *    | \__/\ \_/ / |  | || |  | || |___| |\  | | |   | \__/\ \_/ / |  | || |     | |___\ \_/ / |___| |\  | | | /\__/ /
  *     \____/\___/\_|  |_/\_|  |_/\____/\_| \_/ \_/    \____/\___/\_|  |_/\_|.    \____/ \___/\____/\_| \_/ \_/ \____/ 
  *                                                                                                                     
  *                                                                                                                     
  */
 
 function createSubmissionFormSubmitButtonClickEvent(id)
 {
	 $("#comment_submission_form_submit_button_" + id).click({id: id},
			 function (event) {
				 
				 $("#comment_submission_form_submit_button_" + event.data.id).attr("disabled", "disabled");
				 $("#comment_submission_progress_span_" + event.data.id).show();
				 if (bg.user_jo) 
				 {
					 // no need to check for comment rating here. Backend will let the user know on submit.
					 if ($("#comment_textarea_" + event.data.id) && $("#comment_textarea_" + event.data.id).val() != "") 
					 {
						 // event.data.id may be "top", which will be handled in submitComment();
						 submitComment(event.data.id); // the "event.data.id" of this current comment (or hpqsp) will become the "parent" after the jump as it is the parent to which the new comment will be attached
						 // what happens to the visibility of the submission area depends on error/success
					 } 
					 else 
					 {
						 displayMessage("Unable to post empty comment.", "red", "message_div_" + event.data.id);
						 $("#progress_span_" + event.data.id).hide();
						 $("#comment_submission_form_submit_button_" + event.data.id).removeAttr('disabled');
					 }
				 } 
				 else // user isn't logged in. Not sure they're seeing this form in the first place. They shouldn't be.
				 {
					 displayMessage("Unable to post comment. You are not logged in.", "red", "message_div_" + event.data.id); // USER SHOULD NOT SEE THIS MESSAGE. SHOULD BE WARNED OF LOGGEDOUT STATUS MUCH EARLIER
					 $("#progress_span_" + event.data.id).hide();
					 $("#comment_submission_form_submit_button_" + event.data.id).removeAttr('disabled');
				 }
				 return false;
			 });
 }
 
 function createKeyupEventForTextarea(id, charlimit){
	 $("#comment_textarea_" + id).keyup({id: id},
			 function (event) {
				 if(has_scrollbar("comment_textarea_" + event.data.id))
				 {
					 var currentheight = $("#comment_textarea_" + event.data.id).css("height");
					 currentheight = (currentheight.substring(0, currentheight.length - 2)*1) + 17;
					 $("#comment_textarea_" + event.data.id).css("height", currentheight + "px");
					 // still has scrollbar? grow it again. (this happens in a big cut/paste sometimes)
					 if(has_scrollbar("comment_textarea_" + event.data.id))
					 {
						 $("#comment_textarea_" + event.data.id).trigger("keyup");
					 }
				 }
				 if($("#comment_textarea_" + event.data.id).val().length > 500)
					 $("#comment_textarea_" + event.data.id).val($("#comment_textarea_" + event.data.id).val().substring(0,charlimit));
				 $("#charsleft_" + event.data.id).html(charlimit - $("#comment_textarea_" + event.data.id).val().length);
				 docCookies.setItem("saved_text", $("#comment_textarea_" + event.data.id).val(), 31536e3);
				 docCookies.setItem("saved_text_dom_id", "comment_textarea_" + event.data.id, 31536e3);
			 }
	 );
 }
 
 function createBlurEventForTextarea(id)
 {
	 $("#comment_textarea_" + id).blur({id: id},
			function (event) {
				if($("#comment_textarea_" + event.data.id).val() === "") // if the user has written anything, leave the composition + submission area the way it is
				{
					$("#comment_textarea_" + event.data.id).css("height", "22px");			// set it back to normal height
					$("#comment_textarea_" + event.data.id).val("Say something..."); // set the default wording
					$("#char_count_and_submit_button_div_" + event.data.id).hide();			// hide the charcount and submit area
					$("#comment_textarea_" + event.data.id).css("color", "#aaa");			// reset the text to gray
				}
			});
 }
 
 function createFocusEventForTextarea(id)
 {
	 $("#comment_textarea_" + id).focus({id: id},
			 function (event) {
		 
		 if(typeof bg.user_jo !== "undefined" && bg.user_jo !== null && bg.user_jo.rating <= -5)
		 {
			 displayMessage("Unable to compose comment. Your comment rating is too low.", "red", "message_div_" + event.data.id);
			 $("#comment_textarea_" + event.data.id).trigger("blur");
		 }
		 if(typeof bg.user_jo === "undefined" || bg.user_jo === null)
		 {
			 displayMessage("Unable to compose comment. You are not logged in.", "red", "message_div_" + event.data.id);
			 $("#comment_textarea_" + event.data.id).trigger("blur");
		 }
		 else // user logged in and rating ok
		 {	 
			 $("#comment_textarea_" + event.data.id).css("height", "80px");
			 if($("#comment_textarea_" + event.data.id).val() === "Say something...") // only do this if the textarea is currently "blank"
			 {
				 $("#comment_textarea_" + event.data.id).val("");							 // blank it out
			 }
			 else 
			 {
				 if(has_scrollbar("comment_textarea_" + event.data.id)) // it was increased to 80 above, but if it still has a scrollbar, grow it
					 $("#comment_textarea_" + event.data.id).trigger("keyup");
			 } 
				 
			 $("#comment_textarea_" + event.data.id).css("color", "#000"); 				// set the text to black
			 $("#char_count_and_submit_button_div_" + event.data.id).show();					// show the charcount and submit buttons
		 }
	 });
 }
 
 function notePromo(platform, source) //booleans or strings
 {
 	$.ajax({
 		type: 'GET',
 		url: endpoint,
 		data: {
 			method: "notePromo",
 			platform: platform,
 			source: source
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
 			displayMessage("AJAX error noting user promo", "red");
 		} 
 	}); 
 }
