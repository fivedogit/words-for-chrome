
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
	$("#thread_tab_img").attr("src", chrome.extension.getURL("images/chat_gray.png"));
	$("#feed_tab_img").attr("src", chrome.extension.getURL("images/earth_gray.png"));
	$("#trending_tab_img").attr("src",  chrome.extension.getURL("images/trending_gray.png"));
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src",  chrome.extension.getURL("images/clock_gray.png"));
	$("#profile_tab_img").attr("src",  chrome.extension.getURL("images/user_gray.png"));
	chrome.runtime.sendMessage({method: "getVersion"}, function(response) {
		  $("#utility_header_td").text("About WORDS (version " + response.version + ")");
	});
	
	
	$("#utility_message_td").hide();
	$("#utility_csf_td").hide();
	
	$("#footer_div").html("");
	
	var aboutmessage = "";
	aboutmessage = aboutmessage + "<table>";
	aboutmessage = aboutmessage + "	<tr>";
	aboutmessage = aboutmessage + "		<td style=\"text-align:left;padding:10px\">";
	aboutmessage = aboutmessage + "<span style=\"font-size:14px;font-weight:bold\">Better comments everywhere</span><br><br>";
	aboutmessage = aboutmessage + "Web commenting is broken. Too many accounts/logins, too many trolls, not enough privacy, too much censorship.<br><br>";
	aboutmessage = aboutmessage + "Together we can fix it.";
	aboutmessage = aboutmessage + "		</td>";
	aboutmessage = aboutmessage + "		<td rowspan=2 style=\"padding:35px\">";
	aboutmessage = aboutmessage + "<table><tr><td><img src=\"" + chrome.extension.getURL("images/happy_noanimation.gif") + "\" style=\"border:1px solid black\"></img></td></tr><tr><td style=\"font-style:italic\">fivedogit, the developer.<br>Actual face.</td></tr></table>";
	aboutmessage = aboutmessage + "		</td>";
	aboutmessage = aboutmessage + "	</tr>";
	aboutmessage = aboutmessage + "	<tr>";
	aboutmessage = aboutmessage + "		<td style=\"text-align:left;border-top:1px solid #ddd;padding:10px\">";
	aboutmessage = aboutmessage + "<span style=\"font-size:14px;font-weight:bold\">Ways you can help:</span><br><br>";
	aboutmessage = aboutmessage + "1. Write a comment. Seriously.<br>";
	aboutmessage = aboutmessage + "2. Share WORDS: ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_facebook_link\">Facebook</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_twitter_link\">Twitter</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_googleplus_link\">G+</a> - ";
	aboutmessage = aboutmessage + "<a href=\"#\" id=\"share_to_tumblr_link\">Tumblr</a>";
	aboutmessage = aboutmessage + "<br>";
	aboutmessage = aboutmessage + "3. Rate 5 stars <a href=\"#\" id=\"rate_5_stars_link\">here</a><br>";
	aboutmessage = aboutmessage + "4. Report bugs to <a href=\"#\" id=\"fivedogit_link\">@fivedogit</a><br>";
	aboutmessage = aboutmessage + "5. Donate Bitcoins to keep the servers running ";
	aboutmessage = aboutmessage + "<a style=\"margin-left:6px;\" href=\"#\" id=\"coinbase_2_link\" >$2</a>";
	aboutmessage = aboutmessage + "<a style=\"margin-left:6px;\" href=\"#\" id=\"coinbase_5_link\" >$5</a>";
	aboutmessage = aboutmessage + "<a style=\"margin-left:6px;\" href=\"#\" id=\"coinbase_10_link\" >$10</a>";
	aboutmessage = aboutmessage + "<a style=\"margin-left:6px;\" href=\"#\" id=\"coinbase_20_link\" >$20</a>";
	aboutmessage = aboutmessage + "<a style=\"margin-left:6px;\" href=\"#\" id=\"coinbase_50_link\" >$50</a>";
	aboutmessage = aboutmessage + "<a style=\"margin-left:6px;\" href=\"#\" id=\"coinbase_100_link\" >$100</a>";
	aboutmessage = aboutmessage + "		</td>";
	aboutmessage = aboutmessage + "	</tr>";
	aboutmessage = aboutmessage + "	<tr>";
	aboutmessage = aboutmessage + "		<td colspan=2 style=\"text-align:left;border-top:1px solid #ddd;padding:10px\">";
	aboutmessage = aboutmessage + "WORDS DOES NOT TRACK and is open source for verification. The code is available here:<br><br>";
	aboutmessage = aboutmessage + "github.com/fivedogit/words-backend<br>";
	aboutmessage = aboutmessage + "github.com/fivedogit/words-for-chrome<br><br>";
	aboutmessage = aboutmessage + "Enjoy! Follow <a href=\"#\" id=\"words4chrome_link\">@words4chrome</a> or me, <a href=\"#\" id=\"fivedogit_link2\">@fivedogit</a>. Feedback welcome!";
	aboutmessage = aboutmessage + "		</td>";
	aboutmessage = aboutmessage + "	</tr>";
	aboutmessage = aboutmessage + "</table>";
	$("#main_div_" + currentURLhash).html(aboutmessage); //OK
	
	// don't think I need this. All the <a>s here have click handlers
/*	$("a").click(function(event) {  event.preventDefault();
		if(typeof event.processed === "undefined" || event.processed === null) // prevent this from firing multiple times by setting event.processed = true on first pass
		{
			event.processed = true;
			if(chrome.tabs)
			{	
				var c = $(this).attr('class');
				if(c == "newtab")
				{
					var h = $(this).attr('href');
					doNewtabClick(h);
				}
			}
		}
	});*/
	
	if(navigator.userAgent.indexOf("OPR/") !== -1)
		noteImpressionAndCreateHandler("operastore", "about", "rate_5_stars_link", "https://addons.opera.com/en/extensions/details/words/");
	else
		noteImpressionAndCreateHandler("cws", "about", "rate_5_stars_link", "https://chrome.google.com/webstore/detail/words/lgdfecngaioibcmfbfpeeddgkjfdpgij/reviews");
	noteImpressionAndCreateHandler("twitter_persacct", "about", "fivedogit_link", "http://www.twitter.com/fivedogit");
	noteImpressionAndCreateHandler("facebookshare", "about", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
	noteImpressionAndCreateHandler("twittershare", "about", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
 	noteImpressionAndCreateHandler("googleplusshare", "about", "share_to_googleplus_link", "https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com");
 	noteImpressionAndCreateHandler("tumblrshare", "about", "share_to_tumblr_link", "http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people");
 	
	noteImpressionAndCreateHandler("coinbase2", "about", "coinbase_2_link", "https://coinbase.com/checkouts/0dd1fe6c62615d397145ab61ed563851");
	noteImpressionAndCreateHandler("coinbase5", "about", "coinbase_5_link", "https://coinbase.com/checkouts/61112abb012d09699e65c6ec1a632e41");
	noteImpressionAndCreateHandler("coinbase10", "about", "coinbase_10_link", "https://coinbase.com/checkouts/9413426d693428113687ecbddf94faca");
	noteImpressionAndCreateHandler("coinbase20", "about", "coinbase_20_link", "https://coinbase.com/checkouts/1e317adfab144ec7378c6a8abda14895");
	noteImpressionAndCreateHandler("coinbase50", "about", "coinbase_50_link", "https://coinbase.com/checkouts/8c894218504788240c6b75acaf200529");
	noteImpressionAndCreateHandler("coinbase100", "about", "coinbase_100_link", "https://coinbase.com/checkouts/d1affa653c0a756e53a50c18d6ae274a");
 	
 	noteImpressionAndCreateHandler("twitter_mainacct", "about", "words4chrome_link", "http://www.twitter.com/words4chrome");
	noteImpressionAndCreateHandler("twitter_persacct", "about", "fivedogit_link2", "http://www.twitter.com/fivedogit");
	
}

