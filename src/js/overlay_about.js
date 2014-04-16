
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
	$("#thread_tab_link").html("<img src=\"" + chrome.extension.getURL("images/chat_gray.png") + "\"></img>");
	$("#trending_tab_link").html("<img src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></img>");
	$("#notification_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag_gray.png") + "\"></img>");
	$("#profile_tab_link").html("<img src=\"" + chrome.extension.getURL("images/user_gray.png") + "\"></img>");
	var details = chrome.app.getDetails();
    var version = details.version;
	$("#header_div_top").html("About Words (version " + version + ")");
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	var aboutmessage = "";
	aboutmessage = aboutmessage + "<div style=\"text-align:left;font-size:12px;padding:20px\">";
	
	aboutmessage = aboutmessage + "<p style=\"font-size:14px;font-weight:bold\">Better comments everywhere</p>";
	aboutmessage = aboutmessage + "<p>Web commenting is broken. Too many logins, too much noise, too many trolls, not enough privacy, too much censorship.";
	aboutmessage = aboutmessage + "<p>Words is an advanced, open-source web commenting utility that fixes these problems. It is built into the browser itself and has several advantages over page-embedded comments:</p>";
	aboutmessage = aboutmessage + "<ol>";
	aboutmessage = aboutmessage + "<li>Ubiquitous</li>";
	aboutmessage = aboutmessage + "<li>Uniform</li>";
	aboutmessage = aboutmessage + "<li>Centralized</li>";
	aboutmessage = aboutmessage + "<li>Anonymous</li>";
	aboutmessage = aboutmessage + "<li>Independent</li>";
	aboutmessage = aboutmessage + "</ol>";
	aboutmessage = aboutmessage + "<p>Words DOES NOT TRACK and is OPEN SOURCE for verification. The code is available here:</p>";

	aboutmessage = aboutmessage + "<p>github.com/fivedogit/words-backend<br>";
	aboutmessage = aboutmessage + "github.com/fivedogit/words-for-chrome</p>";
	
	aboutmessage = aboutmessage + "<p>More info here:</p>";
	aboutmessage = aboutmessage + "<p>http://goo.gl/VNs0DP</p>";

	aboutmessage = aboutmessage + "<p>Enjoy! Follow me on Twitter <a href=\"#\" id=\"at_twitter_link\">@fivedogit</a>. Feedback welcome!</p>";
	aboutmessage = aboutmessage + "<hr>";
	aboutmessage = aboutmessage + "Spread the Words! ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_facebook_link\">Facebook</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_twitter_link\">Twitter</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_googleplus_link\">G+</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_tumblr_link\">Tumblr</a>";
	if(typeof bg.user_jo !== undefined && bg.user_jo !== null && bg.user_jo.email !== "undefined" && bg.user_jo.email !== null && bg.user_jo.email.endsWith("@gmail.com"))
		aboutmessage = aboutmessage + " - <a href=\"#\" id=\"invite_with_gmail_link\">Gmail</a> ";
 		
	aboutmessage = aboutmessage + "</div>";
	$("#main_div_" + currentURLhash).html(aboutmessage);
	
	$("#at_twitter_link").click( function() {
		chrome.tabs.create({url:"http://www.twitter.com/fivedogit"});
	});
	
	$("#share_to_facebook_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					//"https://www.facebook.com/dialog/apprequests?app_id=271212039709142&message=Words%20for%20Chrome%20is%20fixing%20web%20commenting.%20http%3A%2F%2Fw.ords.co&redirect_uri=http%3A%2F%2Fw.ords.co"
	 					"https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fw.ords.co"
	 					});
	 				noteUserPromo("facebook", "about");
	 				return false;
	 			});
	 	
	 	$("#share_to_twitter_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"https://twitter.com/intent/tweet?text=Words%20for%20Chrome%20is%20fixing%20web%20commenting&url=http%3A%2F%2Fw.ords.co"
	 					});
	 				noteUserPromo("twitter", "about");
	 				return false;
	 			});
	 	
	 	$("#share_to_googleplus_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"https://plus.google.com/share?url=http%3A%2F%2Fw.ords.co"
	 					});
	 				noteUserPromo("googleplus", "about");
	 				return false;
	 			});
	 	
	 	$("#share_to_tumblr_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fw.ords.co&t=Words%20for%20Chrome%20is%20fixing%20web%20commenting"
	 					});
	 				noteUserPromo("tumblr", "about");
	 				return false;
	 			});
	 	
	 	$("#invite_with_gmail_link").click(
	 			function () {
	 				chrome.tabs.create({url:
	 					"https://mail.google.com/mail/?view=cm&fs=1&su=Words%20for%20Chrome&body=Hey%2C%20I%20found%20this%20interesting%20commenting%20system%20I%20think%20you%20should%20try.%20You%20can%20get%20it%20here%3A%0A%0Ahttp%3A%2F%2Fw.ords.co%0A%0AYou%20can%20also%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%0A%0AEnjoy!"
	 					});
	 				noteUserPromo("gmail", "about");
	 				return false;
	 			});
	
	
}

