/* This software is copyrighted.
 * It is open source, but the code is not free to use or redistribute. Sorry. 
 */

var user_jo;
var thread_jo;
var currentURL;
var currentURLhash;
var currentHostname;
var email;
var this_access_token;
var scrollable = 0;
var tabmode = "thread";


function elementInViewport (el) {

    var r, html;
    if ( !el || 1 !== el.nodeType ) { return false; }
    html = document.documentElement;
    r = el.getBoundingClientRect();

    return ( !!r 
      && r.bottom >= 0 
      && r.right >= 0 
      && r.top <= html.clientHeight 
      && r.left <= html.clientWidth 
    );

}

chrome.extension.onMessage.addListener(function(request, sender, callback)
{
	if (request.action === "embedWORDS")
	{
		currentURLhash = fromDecimalToOtherBase(62,hashFnv32a(request.currentURL));
		currentURL = request.currentURL;
		currentHostname = currentURL.substring(currentURL.indexOf("://") + 3, currentURL.indexOf("/", currentURL.indexOf("://") + 3));
		if (currentHostname.indexOf(".", currentHostname.indexOf(".")+1) === -1) // only has one "." assume www.
			 currentHostname = "www." + currentHostname;

		if(request.user_jo !== null)
		{
			email = request.email;
			this_access_token = request.this_access_token;
		}	
		user_jo = request.user_jo;
		thread_jo = request.thread_jo;
		var alreadyfound = false;
		
		var elem = null;
		elem = document.getElementById("words_div"); // the document is finished, find the comments-container

		if(elem !== null && !alreadyfound && elementInViewport(elem)) // when found for the first time, no scrolling necessary
		{
			alreadyfound = true;
			initializeView();
			doThreadTab();
		}	

		window.onscroll = function(){  // when scrolling, look for it
			if(elem !== null && !alreadyfound && elementInViewport(elem)) // when found for the first time...
			{
				alreadyfound = true;
				initializeView();
				doThreadTab();
			}	
		};
		return;
	}
});			