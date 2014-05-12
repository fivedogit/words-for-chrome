
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
		//alert("e or tat was null");
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
	$("#logstat_td").html(welcomearea); //OK

	var temphtml = "";
	$("#google_login_img").mouseover( function() {
		temphtml = $("#header_div_top").html();//OK (getter)
		$("#comment_submission_form_div_" + currentURLhash).hide();
		$("#header_div_top").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Google login is used for email verification ONLY.<br>Words cannot post on your behalf nor access any non-basic information.<br>Your Words identity is separate and anonymous.</span>");//OK
		$("#google_login_img").attr("src","images/google_button_24x24_mo.png");
		$("#tab_tooltip_td").text("Login with Google");
		return false;
	});
	$("#google_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#header_div_top").html(temphtml);//OK
		if(tabmode === "thread")
			$("#comment_submission_form_div_" + currentURLhash).show();
		$("#google_login_img").attr("src","images/google_button_24x24.png");
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
		$("#header_div_top").html("<span style=\"font-size:12px;font-weight:normal;color:black\"><b>Privacy first!</b> - Facebook login is used for email verification ONLY.<br>Words cannot post to Facebook nor access any non-basic information.<br>Your Words identity is separate and anonymous.</span>");//OK
		$("#facebook_login_img").attr("src","images/facebook_button_24x24_mo.png");
		$("#tab_tooltip_td").text("Login with FB");
		return false;
	});
	$("#facebook_login_img").mouseout( function() {
		// if the login button has been clicked, then the temphtml is wrong, we need to set it to the value BEFORE the value was clicked, which was saved earlier on click event.
		$("#header_div_top").html(temphtml);//OK
		if(tabmode === "thread")
			$("#comment_submission_form_div_" + currentURLhash).show();
		$("#facebook_login_img").attr("src","images/facebook_button_24x24.png");
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
			function () {
				// user has chosen to log in with google, get rid of any existing FB login info to prevent confusing overlaps
				//alert("deleting facebook_access_token bc google login was clicked");
				docCookies.removeItem("facebook_access_token");
				docCookies.removeItem("facebook_access_token_expires");
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
				// user has chosen to log in with facebook, get rid of any existing Google login info to prevent confusing overlaps
				//alert("deleting google_access_token bc google login was clicked");
				docCookies.removeItem("google_access_token");
				docCookies.removeItem("google_access_token_expires");
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
	welcomearea = welcomearea + "				<img class=\"userpic32 rounded\" id=\"logged_in_profile_img\" src=\"images/ajaxSnake.gif\">";
	welcomearea = welcomearea + "			</span>";
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "		<td id=\"logstat_screenname_td\">";
	welcomearea = welcomearea + "			<a href=\"#\" id=\"screenname_link\"></a>";
	if(typeof bg.user_jo.alts !== "undefined" && bg.user_jo.alts != null)
	{
		welcomearea = welcomearea + " <img id=\"alt_dropdown_img\" src=\"images/dropdown_triangle.png\">";
	}	
	welcomearea = welcomearea + "		</td>";
	welcomearea = welcomearea + "	</tr>";
	welcomearea = welcomearea + "</table>";
	$("#logstat_td").html(welcomearea);//OK
	$("#screenname_link").text(bg.user_jo.screenname);
	$("#logged_in_profile_img").attr("src", bg.user_jo.picture);
	
	if(typeof bg.user_jo.alts !== "undefined" && bg.user_jo.alts != null)
	{
		$("#alt_dropdown_img").click(
				function () {
					var prev = $("#header_div_top").html();//OK (getter)
					var alts_counter = 0;
					var str = "";
					while(alts_counter < bg.user_jo.alts.length)
					{
						str = str + "<a href=\"#\" id=\"user_" + alts_counter + "_link\"></a> - ";
						alts_counter++;
					}	
					str = str.substring(0, str.length - 2);
					$("#header_div_top").html(str);//OK
					alts_counter = 0;
					while(alts_counter < bg.user_jo.alts.length)
					{
						$("#user_" + alts_counter + "_link").text(bg.user_jo.alts[alts_counter].screenname);
						$("#user_" + alts_counter + "_link").click({altuser: bg.user_jo.alts[alts_counter], prev: prev},
								function (event) {
									$("#header_div_top").html(event.data.prev);//OK
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
		$("#notifications_tab_img").attr("src","images/flag_blue.png"); 
	else if ((typeof bg.user_jo==="undefined") || bg.user_jo === null || bg.user_jo.notification_count === 0)
		$("#notifications_tab_img").attr("src","images/flag_gray.png"); 
	else if (bg.user_jo.notification_count <= 10)
		$("#notifications_tab_img").attr("src","images/flag" + bg.user_jo.notification_count + ".png");
	else if (bg.user_jo.notification_count > 10)
		$("#notifications_tab_img").attr("src","images/flag11plus.png"); 
	else
		$("#notifications_tab_img").attr("src","images/flag_gray.png"); 
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
	$("#" + dom_id).text(inc_message);
	$("#" + dom_id).show();
	setTimeout(function() { $("#" + dom_id).hide();}, ms);
}


$(window).scroll(function() {
		if ($(window).scrollTop() + $(window).height() === $(document).height()) {
			if (scrollable === 1)
			{
				scrollable = 0;
				beginindex = beginindex + 8; 
				endindex = endindex + 8;
				if(tabmode === "thread")
					prepareGetAndPopulateThreadPortion();
				else if(tabmode === "past")
					getPastComments();
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
 						bs = bs + "<td><a href=\"#\" id=\"thread_tab_link\"><img id=\"thread_tab_img\" src=\"images/chat_blue.png\"></img></a></td>";
 					    bs = bs + "<td><a href=\"#\" id=\"trending_tab_link\"><img id=\"trending_tab_img\" src=\"images/trending_gray.png\"></img></a></td>"; 
 						bs = bs + "<td><a href=\"#\" id=\"notifications_tab_link\"><img id=\"notifications_tab_img\" src=\"images/flag_gray.png\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"past_tab_link\"><img id=\"past_tab_img\" src=\"images/clock_gray.png\"></img></a></td>";
 						bs = bs + "<td><a href=\"#\" id=\"profile_tab_link\"><img id=\"profile_tab_img\" src=\"images/user_gray.png\"></img></a></td>";
 					bs = bs + "</tr>";
 					bs = bs + "<tr>";
 						bs = bs + "<td colspan=5 id=\"tab_tooltip_td\">Comments</td>";
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
 		  		bs = bs + "		<span class=\"comment-submission-progress-span\" id=\"comment_submission_progress_span_" + currentURLhash + "\"><img src=\"images/ajaxSnake.gif\"></span>";
 		  		bs = bs + "		<span id=\"charsleft_" + currentURLhash + "\">" + charsleft + "</span> ";
 		  		bs = bs + "		<span><input id=\"comment_submission_form_submit_button_" + currentURLhash + "\" type=button value=\"Submit\"></input></span>";
 		  		bs = bs + "	</div>";
 				bs = bs + "</div>";
 			bs = bs + "</form>";
 		bs = bs + "</div>";
 	bs = bs + "<div id=\"main_div_" + currentURLhash + "\"><div style=\"padding:20px\"> </div></div>";
 	bs = bs + "<div class=\"footer_div\">";
 	var randomint = Math.floor(Math.random() * 5) + 1
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
 	$("#words_div").html(bs);//OK
 	
 	if(typeof thread_jo !== undefined && thread_jo !== null && typeof thread_jo.children !== "undefined" && thread_jo.children !== null && //thread_jo.children > 5 && 
 			typeof bg.user_jo !== undefined && bg.user_jo !== null && randomint === 1) // if there are more than 5 comments on this page, user is logged in, show this 1/10 threadviews
 	{
 		$("#share_to_facebook_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com"
 	 					});
 	 				notePromo("facebook", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#share_to_twitter_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"https://twitter.com/intent/tweet?text=Words%20for%20Chrome%20is%20fixing%20web%20commenting&url=http%3A%2F%2Fwww.words4chrome.com"
 	 					});
 	 				notePromo("twitter", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#share_to_googleplus_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com"
 	 					});
 	 				notePromo("googleplus", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#share_to_tumblr_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=Words%20for%20Chrome%20is%20fixing%20web%20commenting"
 	 					});
 	 				notePromo("tumblr", "footer");
 	 				return false;
 	 			});
 	 	
 	 	$("#invite_with_gmail_link").click(
 	 			function () {
 	 				chrome.tabs.create({url:
 	 					"https://mail.google.com/mail/?view=cm&fs=1&su=Words%20for%20Chrome&body=Hey%2C%20I%20found%20this%20interesting%20commenting%20system%20I%20think%20you%20should%20try.%20You%20can%20get%20it%20here%3A%0A%0Ahttp%3A%2F%2Fwww.words4chrome.com%0A%0AYou%20can%20also%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%0A%0AEnjoy!"
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
 			function () {
 				$("#tab_tooltip_td").text("Trending");
 				return false;
 			});

 	$("#trending_tab_link").mouseout(
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

 	$("#trending_tab_link").click(
 			function () {
 				doTrendingTab();
 				return false;
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
 			function () {
 				doNotificationsTab();
 				return false;
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
 			function () {
 				if(bg.user_jo == null || bg.user_jo.screenname == null)
 					doPastTab();
 				else
 					doPastTab(bg.user_jo.screenname);
 				return false;
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
				 $("#charsleft_" + event.data.id).text(charlimit - $("#comment_textarea_" + event.data.id).val().length);
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
 			method: "noteConversion",
 			type: "promo",
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
 
 function getSmartCutURL(url_to_use_inc, limit) // cut as www.hostname.com/.../filename.html whenever possible for max readability
 {
	 var url_to_use_loc = url_to_use_inc;
	 //alert("smart cutting with " + url_to_use_loc);
	 if(url_to_use_loc.indexOf("https://") == 0 || url_to_use_loc.indexOf("http://") == 0)
		 url_to_use_loc = url_to_use_loc.substring(url_to_use_loc.indexOf("://")+ 3);
		
	 var hostname = url_to_use_loc.substring(0,url_to_use_loc.indexOf("/")); // pages will always have a slash after the hostname, even if it's just www.hostname.com/
	 
	 if(url_to_use_loc.endsWith("?"))
			url_to_use_loc = url_to_use_loc.substring(0,url_to_use_loc.length-1);
		
		// url cases:
		// 1. is less than limit. use as-is
		// 2. hostname is shorter than limit, url is longer than limit, url has >3 slashes one is trailing -> use host + "/.../" + file method (on 2ndtolast /) -> use default if still too long
		// 3. hostname is shorter than limit, url is longer than limit, url has >3 slashes, none trailing -> use host + "/.../" + file method -> use default if still too long
		// 4. hostname is shorter than limit, url is longer than limit, url has exactly 2 slashes, one is trailing -> use default cutting method
		// 5. hostname is shorter than limit, url is longer than limit, url has exactly 2 slashes, none trailing -> use host + "/.../" + file method -> use default if still too long
		// 6. hostname is shorter than limit, url is longer than limit, url has exactly 1 slash, (www.acceptable.com/waytoolong_...) -> use default method
		// 7. hostname is longer than limit -> use default method
		
		if(url_to_use_loc.length > limit && hostname.length < limit) 
		{
			var use_default_method = false;
			
			if((url_to_use_loc.split("/").length - 1) > 2) //case 2/3: has at least 3 forward slashes
			{
				var has_trailing_slash = false;
				if(url_to_use_loc.substr(url_to_use_loc.length - 1) == "/") //case 2: has trailing slash
				{
					//alert("case 2, hostname ok, >3 slashes with trailing");
					has_trailing_slash = true;
					url_to_use_loc = url_to_use_loc.substring(0,url_to_use_loc.length - 1); // temporarily remove trailing slash
				}
				else
				{
					//alert("case 3, hostname ok, >3 slashes, none trailing");
				}	
				var trythis = hostname + "/.../" + url_to_use_loc.substring(url_to_use_loc.lastIndexOf("/") + 1);
				if(trythis.length <= limit) //case 2/3: is the "smart" cut acceptable? if so, use it
				{
					//alert("case 2/3, smart cut worked!");
					url_to_use_loc = trythis;
					if(has_trailing_slash)
						url_to_use_loc = url_to_use_loc + "/";
				}
				else						//case 2/3: is the "smart" cut still too long? use default
				{
					//alert("case 2/3, smart cut no good. Using default method.");
					use_default_method = true;
				}
				
			}
			else if((url_to_use_loc.split("/").length - 1) == 2) // has exactly 2 forward slashes
			{
				if(url_to_use_loc.substr(url_to_use_loc.length - 1) == "/") //case 4: has trailing slash, this means the url has only one effective slash and is too big, even for hostname + "/..." + file form.
				{
					//alert("case 4: exactly 2 slashes, one trailing, use default method");
					use_default_method = true;
				}
				else //case 5: 2 slashes, no trailing slash
				{	
					//alert("case 5: exactly 2 slashes, none trailing, try smart cut");
					var trythis = hostname + "/.../" + url_to_use_loc.substring(url_to_use_loc.lastIndexOf("/") + 1);
					if(trythis.length <= limit) // case 5: is the "smart" cut acceptable? if so, use it
					{
						//alert("case 5: exactly 2 slashes, none trailing, smart cut worked!");
						url_to_use_loc = trythis;
					}
					else					    // case 5: is the "smart" cut still too long? if so, use default
					{
						//alert("case 5: exactly 2 slashes, none trailing, smart cut no good. Using default method");
						use_default_method = true;
					}
				}
			}	
			else //case 6: has one slash. acceptable hostname, VERY long filename
			{
				//alert("case 6: one slash, ok hostname, very long filename. Use default method.");
				use_default_method = true;
			}

			if(use_default_method === true)
			{
				url_to_use_loc = hostname + "/..." + url_to_use_inc.substring(url_to_use_inc.length - ((limit-3) - hostname.length)); 
			}
		}
		else if(url_to_use_loc.length > limit && hostname.length >= limit) //case 7: special case super long hostname... simply split in half
		{
			//alert("case 7: hostname > limit. Use special chop-in-half method.");
			url_to_use_loc = url_to_use_loc.substring(0,Math.floor(limit/2)) + "..." + url_to_use_loc.substring(url_to_use_loc.length-(Math.floor(limit/2)-3));
		}
		else
		{// case 1
			//alert("case 1, url less than limit");
			// do-nothing case, use url as-is
		}
		return url_to_use_loc;
 }
 
 function doNewtabClick(h)
 {
	 // 	try to find h
	 // 	if(successful)
	 //			open it
	 //		else if(unsuccessful)
	 //			try with newh
	 //			if(unsuccessful)
	 //			{
	 //				open new tab with original url
	 //			}
	 //		}
	 var newh = "";
	 if(h.indexOf("://www.") != -1)
		 newh = h.replace("://www.", "://");
	 else
		 newh = h.replace("://", "://www.");
	 
	 //alert("h=" + h + " and newh=" + newh);
	 var open_tab_id = null;
	 chrome.tabs.query({url: h}, function(tabs) { 
		 for (var i = 0; i < tabs.length; i++) { // try to find h
			 open_tab_id = tabs[i].id;
		 }
		 if(open_tab_id !== null) // found it
			 chrome.tabs.update(open_tab_id,{"active":true}, function(tab) {}); // open the existing tab
		 else // if(open_tab_id === null)  // didn't find h
		 {
			 chrome.tabs.query({url: newh}, function(tabs) {  // try to find newh
				 for (var i = 0; i < tabs.length; i++) {
					 open_tab_id = tabs[i].id;
				 }
				 if((open_tab_id !== null)) // found it
					 chrome.tabs.update(open_tab_id,{"active":true}, function(tab) {}); // open the existing tab
				 else // if(open_tab_id === null)
					 chrome.tabs.create({url:h}); // all else fails, open new tab
			 });
		 }
	 });
 }
 