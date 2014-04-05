
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
	$("div#words_div #thread_tab_link").html("<img src=\"" + chrome.extension.getURL("images/chat_gray.png") + "\"></img>");
	$("div#words_div #trending_tab_link").html("<img src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></img>");
	$("div#words_div #notification_tab_link").html("<img src=\"" + chrome.extension.getURL("images/flag_gray.png") + "\"></img>");
	$("div#words_div #profile_tab_link").html("<img src=\"" + chrome.extension.getURL("images/user_gray.png") + "\"></img>");
	var details = chrome.app.getDetails();
    var version = details.version;
	$("div#words_div #header_div_top").html("About Words (version " + version + ")");
	$("div#words_div #header_div_top").show();
	$("div#words_div #comment_submission_form_div_" + currentURLhash).hide();
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
	
	
	aboutmessage = aboutmessage + "</div>";
	$("div#words_div #main_div_" + currentURLhash).html(aboutmessage);
	$("div#words_div #at_twitter_link").click( function() {
		chrome.tabs.create({url:"http://www.twitter.com/fivedogit"});
	});
	
	
	
}

