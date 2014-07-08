/* This software is copyrighted.
 * It is open source, but the code is not free to use or redistribute. Sorry. 
 */

var user_jo;
var thread_jo;
var currentURL;
var currentURLhash;
var email;
var this_access_token;
var scrollable = 0;
var tabmode = "thread";

function elementInViewport(el) {
	  var top = el.offsetTop;
	  var left = el.offsetLeft;
	  var width = el.offsetWidth;
	  var height = el.offsetHeight;

	  while(el.offsetParent) {
	    el = el.offsetParent;
	    top += el.offsetTop;
	    left += el.offsetLeft;
	  }

	  return (
	    top >= window.pageYOffset &&
	    left >= window.pageXOffset &&
	    (top + height) <= (window.pageYOffset + window.innerHeight) &&
	    (left + width) <= (window.pageXOffset + window.innerWidth)
	  );
	}

chrome.extension.onMessage.addListener(function(request, sender, callback)
{
	currentURLhash = fromDecimalToOtherBase(62,hashFnv32a(request.currentURL));
	currentURL = request.currentURL;
	if(request.user_jo !== null)
	{
		email = request.email;
		this_access_token = request.this_access_token;
	}	
	user_jo = request.user_jo;
	thread_jo = request.thread_jo;
	if (request.action === "embedWORDS")
	{
		var alreadyfound = false;
		var elem = document.getElementById("comments-container"); // the document is finished, find the comments-container
		if(typeof elem !== "undefined" && elem !== null)
		{	
			elem.innerHTML = ""; // blank it.
			document.getElementById("comments-container").setAttribute("id", "words_div");
		}
		else
		{
			elem = document.getElementById("words_div");
		}
		
		if(!alreadyfound && elementInViewport(elem)) // when found for the first time, no scrolling necessary
		{
			alreadyfound = true;
			initializeView();
			doThreadTab();
		}	
		
		window.onscroll = function(){  // when scrolling, look for it
			if(!alreadyfound && elementInViewport(elem)) // when found for the first time...
			{
				alreadyfound = true;
				initializeView();
				doThreadTab();
			}	
		};
		return;
	}
});			

