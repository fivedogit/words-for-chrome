
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
	
	$("div#words_div #header_div_top").html("About Words");
	$("div#words_div #header_div_top").show();
	$("div#words_div #comment_submission_form_div_" + currentURLhash).hide();
	var aboutmessage = "";
	aboutmessage = aboutmessage + "<div style=\"text-align:left;font-size:12px;padding:20px\">";
	
	aboutmessage = aboutmessage + "<p style=\"font-size:14px;font-weight:bold\">Better comments everywhere</p>";
	aboutmessage = aboutmessage + "<p>Words is an advanced, open-source web commenting utility. It has several major advantages over page-embedded commenting systems (Disqus, LiveFyre, etc):</p>";
	aboutmessage = aboutmessage + "<ol>";
	aboutmessage = aboutmessage + "<li>Ubiquitous: Comments everywhere</li>";
	aboutmessage = aboutmessage + "<li>Uniform: one login, one interface</li>";
	aboutmessage = aboutmessage + "<li>Centralized: Sticky rep = better UX</li>";
	aboutmessage = aboutmessage + "<li>Anonymous</li>";
	aboutmessage = aboutmessage + "<li>Independent: no site owner control</li>";
	aboutmessage = aboutmessage + "</ol>";
	aboutmessage = aboutmessage + "<p>Words DOES NOT TRACK and is OPEN SOURCE for verification. The code is available here:</p>";

	aboutmessage = aboutmessage + "<p>github.com/schtinky/words<br>";
	aboutmessage = aboutmessage + "github.com/schtinky/words_for_chrome</p>";

	aboutmessage = aboutmessage + "<p>Enjoy! Feedback welcome <a href=\"#\" id=\"at_twitter_link\">@fivedogit</a></p>";
	
	
	aboutmessage = aboutmessage + "</div>";
	$("div#words_div #main_div_" + currentURLhash).html(aboutmessage);
	$("div#words_div #at_twitter_link").click( function() {
		chrome.tabs.create({url:"http://www.twitter.com/fivedogit"});
	});
	
	
	
}

