
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
	$("#thread_tab_img").attr("src", "images/chat_gray.png");
	$("#trending_tab_img").attr("src", "images/trending_gray.png");
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", "images/clock_gray.png");
	$("#profile_tab_img").attr("src", "images/user_gray.png");
	var details = chrome.app.getDetails();
    var version = details.version;
	$("#header_div_top").text("About WORDS (version " + version + ")");
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	var aboutmessage = "";
	aboutmessage = aboutmessage + "<div style=\"text-align:left;font-size:12px;padding:10px\">";
	
	aboutmessage = aboutmessage + "<p style=\"font-size:14px;font-weight:bold\">Better comments everywhere</p>";
	aboutmessage = aboutmessage + "<p>Web commenting is broken. Too many accounts/logins, too many trolls, not enough privacy, too much censorship.</p>";
	aboutmessage = aboutmessage + "<p>Together we can fix it.</p>";
	aboutmessage = aboutmessage + "<hr>";
	aboutmessage = aboutmessage + "<p  style=\"font-size:14px;font-weight:bold\">Ways you can help:</p>";
	aboutmessage = aboutmessage + "<ol>";
	aboutmessage = aboutmessage + "<li>Write a comment. Seriously.</li>";
	aboutmessage = aboutmessage + "<li>";
	aboutmessage = aboutmessage + "Share WORDS: ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_facebook_link\">Facebook</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_twitter_link\">Twitter</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_googleplus_link\">G+</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_tumblr_link\">Tumblr</a>";
	if(typeof bg.user_jo !== undefined && bg.user_jo !== null && bg.user_jo.email !== "undefined" && bg.user_jo.email !== null && bg.user_jo.email.endsWith("@gmail.com"))
		aboutmessage = aboutmessage + " - <a href=\"#\" id=\"share_to_gmail_link\">Gmail</a> ";
	aboutmessage = aboutmessage + "</li>";
	aboutmessage = aboutmessage + "<li>Rate 5 stars <a href=\"#\" id=\"rate_5_stars_link\">here</a></li>";
	aboutmessage = aboutmessage + "<li>Report bugs to <a href=\"#\" id=\"fivedogit_link\">@fivedogit</a></li>";
	aboutmessage = aboutmessage + "<li>Donate Bitcoins to keep the servers running ";
	aboutmessage = aboutmessage + "<a class=\"newtab\" href=\"https://coinbase.com/checkouts/60199bf8c30fc013dd5ec8f2e39bb566\">$2.50</a> - ";
	aboutmessage = aboutmessage + "<a class=\"newtab\" href=\"https://coinbase.com/checkouts/61112abb012d09699e65c6ec1a632e41\">$5</a> - ";
	aboutmessage = aboutmessage + "<a class=\"newtab\" href=\"https://coinbase.com/checkouts/9413426d693428113687ecbddf94faca\">$10</a> - ";
	aboutmessage = aboutmessage + "<a class=\"newtab\" href=\"https://coinbase.com/checkouts/1e317adfab144ec7378c6a8abda14895\">$20</a> - ";
	aboutmessage = aboutmessage + "<a class=\"newtab\" href=\"https://coinbase.com/checkouts/8c894218504788240c6b75acaf200529\">$50</a> - ";
	aboutmessage = aboutmessage + "<a class=\"newtab\" href=\"https://coinbase.com/checkouts/d1affa653c0a756e53a50c18d6ae274a\">$100</a>";
	aboutmessage = aboutmessage + "</li>";
	aboutmessage = aboutmessage + "</ol>";
	aboutmessage = aboutmessage + "<hr>";
	aboutmessage = aboutmessage + "<p>WORDS DOES NOT TRACK and is open source for verification. The code is available here:</p>";
	aboutmessage = aboutmessage + "<p>github.com/fivedogit/words-backend<br>";
	aboutmessage = aboutmessage + "github.com/fivedogit/words-for-chrome</p>";
	aboutmessage = aboutmessage + "<p>Enjoy! Follow <a href=\"#\" id=\"words4chrome_link\">@words4chrome</a> or me, <a href=\"#\" id=\"fivedogit_link2\">@fivedogit</a>. Feedback welcome!</p>";
	aboutmessage = aboutmessage + "</div>";
	$("#main_div_" + currentURLhash).html(aboutmessage); //OK
	
	$("a").click(function(event) {
		if(typeof event.processed === "undefined" || event.processed === null) // prevent this from firing multiple times by setting event.processed = true on first pass
		{
			event.processed = true;
			var c = $(this).attr('class');
			if(c == "newtab")
			{
				var h = $(this).attr('href');
				doNewtabClick(h);
			}
		}
	});
	
	if(navigator.userAgent.indexOf("OPR/") !== -1)
		noteImpressionAndCreateHandler("operastore", "about", "rate_5_stars_link", "https://addons.opera.com/en/extensions/details/words/");
	else
		noteImpressionAndCreateHandler("cws", "about", "rate_5_stars_link", "https://chrome.google.com/webstore/detail/words/lgdfecngaioibcmfbfpeeddgkjfdpgij/reviews");
	noteImpressionAndCreateHandler("twitter_persacct", "about", "fivedogit_link", "http://www.twitter.com/fivedogit");
	noteImpressionAndCreateHandler("facebookshare", "about", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
	noteImpressionAndCreateHandler("twittershare", "about", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
 	noteImpressionAndCreateHandler("googleplusshare", "about", "share_to_googleplus_link", "https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com");
 	noteImpressionAndCreateHandler("tumblrshare", "about", "share_to_tumblr_link", "http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people");
 	if(typeof bg.user_jo !== undefined && bg.user_jo !== null && bg.user_jo.email !== "undefined" && bg.user_jo.email !== null && bg.user_jo.email.endsWith("@gmail.com"))
 			noteImpressionAndCreateHandler("gmailshare", "about", "share_to_gmail_link", "https://mail.google.com/mail/?view=cm&fs=1&su=WORDS%20for%20Chrome&body=Hey%2C%20I%20thought%20you%20might%20like%20this.%20It%27s%20a%20new%20kind%20of%20web%20commenting%20system%20that%20protects%20privacy%20and%20keeps%20out%20the%20crazies.%20%0A%0Ahttp%3A%2F%2Fwww.words4chrome.com%0A%0AYou%20can%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%20It%27s%20also%20available%20for%20Opera.%20%0A%0AEnjoy!");
	noteImpressionAndCreateHandler("twitter_persacct", "about", "words4chrome_link", "http://www.twitter.com/words4chrome");
	noteImpressionAndCreateHandler("twitter_persacct", "about", "fivedogit_link2", "http://www.twitter.com/fivedogit");
}

