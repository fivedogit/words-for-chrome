
/***
 *     _   _ _____ _____ _    _    ___  ______  _____ _   _ _____ 
 *    | | | |_   _|  ___| |  | |  / _ \ | ___ \|  _  | | | |_   _|
 *    | | | | | | | |__ | |  | | / /_\ \| |_/ /| | | | | | | | |  
 *    | | | | | | |  __|| |/\| | |  _  || ___ \| | | | | | | | |  
 *    \ \_/ /_| |_| |___\  /\  / | | | || |_/ /\ \_/ / |_| | | |  
 *     \___/ \___/\____/ \/  \/  \_| |_/\____/  \___/ \___/  \_/  
 *                                                                
 *                                                                
 */

function doAboutTab(message) 
{
	tabmode = "about";
	$("#thread_tab_link").html("<img src=\"images/chat_gray.png\"></img>");
	$("#trending_tab_link").html("<img src=\"images/trending_gray.png\"></img>");
	$("#notification_tab_link").html("<img src=\"images/flag_gray.png\"></img>");
	$("#past_tab_link").html("<img src=\"images/clock_gray.png\"></img>");
	$("#profile_tab_link").html("<img src=\"images/user_gray.png\"></img>");
	var details = chrome.app.getDetails();
    var version = details.version;
	$("#header_div_top").html("About Words (version " + version + ")");
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	var aboutmessage = "";
	aboutmessage = aboutmessage + "<div style=\"text-align:left;font-size:12px;padding:10px\">";
	
	aboutmessage = aboutmessage + "<p style=\"font-size:14px;font-weight:bold\">Better comments everywhere</p>";
	aboutmessage = aboutmessage + "<p>Web commenting is broken. Too many accounts/logins, too much noise, not enough privacy, too much censorship.</p>";
	aboutmessage = aboutmessage + "<p>Together we can fix it.</p>";
	aboutmessage = aboutmessage + "<hr>";
	aboutmessage = aboutmessage + "<p  style=\"font-size:14px;font-weight:bold\">Ways you can help:</p>";
	aboutmessage = aboutmessage + "<ol>";
	aboutmessage = aboutmessage + "<li>Write a comment. Seriously.</li>";
	aboutmessage = aboutmessage + "<li>";
	aboutmessage = aboutmessage + "Share Words: ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_facebook_link\">Facebook</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_twitter_link\">Twitter</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_googleplus_link\">G+</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_tumblr_link\">Tumblr</a>";
	if(typeof bg.user_jo !== undefined && bg.user_jo !== null && bg.user_jo.email !== "undefined" && bg.user_jo.email !== null && bg.user_jo.email.endsWith("@gmail.com"))
		aboutmessage = aboutmessage + " - <a href=\"#\" id=\"invite_with_gmail_link\">Gmail</a> ";
	aboutmessage = aboutmessage + "</li>";
	aboutmessage = aboutmessage + "<li>Rate 5 stars <a href=\"https://chrome.google.com/webstore/detail/words/lgdfecngaioibcmfbfpeeddgkjfdpgij/reviews\">here</a></li>";
	aboutmessage = aboutmessage + "<li>Report bugs to <a href=\"#\" id=\"at_twitter_link\">@fivedogit</a></li>";
	aboutmessage = aboutmessage + "</ol>";
	aboutmessage = aboutmessage + "<hr>";
	aboutmessage = aboutmessage + "<p>Words DOES NOT TRACK and is open source for verification. The code is available here:</p>";
	aboutmessage = aboutmessage + "<p>github.com/fivedogit/words-backend<br>";
	aboutmessage = aboutmessage + "github.com/fivedogit/words-for-chrome</p>";
	aboutmessage = aboutmessage + "<p>More info here:</p>";
	aboutmessage = aboutmessage + "<p>http://goo.gl/VNs0DP</p>";
	aboutmessage = aboutmessage + "<p>Enjoy! Follow <a href=\"#\" id=\"at_words4chrome_link\">@words4chrome</a> or me, <a href=\"#\" id=\"at_fivedogit_link\">@fivedogit</a>. Feedback welcome!</p>";
	aboutmessage = aboutmessage + "</div>";
	$("#main_div_" + currentURLhash).html(aboutmessage);
	
	$("#at_fivedogit_link").click( function() {
		chrome.tabs.create({url:"http://www.twitter.com/fivedogit"});
	});
	$("#at_words4chrome_link").click( function() {
		chrome.tabs.create({url:"http://www.twitter.com/words4chrome"});
	});
	$("#share_to_facebook_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com"
	 					});
	 				notePromo("facebook", "about");
	 				return false;
	 			});
	 	
	 	$("#share_to_twitter_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"https://twitter.com/intent/tweet?text=Words%20for%20Chrome%20is%20fixing%20web%20commenting&url=http%3A%2F%2Fwww.words4chrome.com"
	 					});
	 				notePromo("twitter", "about");
	 				return false;
	 			});
	 	
	 	$("#share_to_googleplus_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com"
	 					});
	 				notePromo("googleplus", "about");
	 				return false;
	 			});
	 	
	 	$("#share_to_tumblr_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=Words%20for%20Chrome%20is%20fixing%20web%20commenting"
	 					});
	 				notePromo("tumblr", "about");
	 				return false;
	 			});
	 	
	 	$("#invite_with_gmail_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"https://mail.google.com/mail/?view=cm&fs=1&su=Words%20for%20Chrome&body=Hey%2C%20I%20found%20this%20interesting%20commenting%20system%20I%20think%20you%20should%20try.%20You%20can%20get%20it%20here%3A%0A%0Ahttp%3A%2F%2Fwww.words4chrome.com%0A%0AYou%20can%20also%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%0A%0AEnjoy!"
	 					});
	 				notePromo("gmail", "about");
	 				return false;
	 			});
	
	
}

