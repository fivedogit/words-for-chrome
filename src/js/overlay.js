
var bg = chrome.extension.getBackgroundPage();
var thread_jo = bg.t_jo;
var user_jo = bg.user_jo;
var curentURLhash;
var currentURL;
var currentHostname;
var scrollable = 0;
var beginindex;
var endindex;
var email;
var this_access_token;
var tabmode = "thread";
var msfe_according_to_backend = bg.msfe_according_to_backend;

$(window).scroll(function() {
	if ($(window).scrollTop() + $(window).height() === $(document).height()) {
		if (scrollable === 1)
		{
			scrollable = 0;
			beginindex = beginindex + 15; 
			endindex = endindex + 15;
			if(tabmode === "thread")
				prepareGetAndPopulateThreadPortion();
			else if(tabmode === "past")
				getPastComments();
		}
	}
});

//when the overlay's html page has loaded, do this
document.addEventListener('DOMContentLoaded', function () {
	 chrome.tabs.getSelected(null, function(tab) {
		 currentURL = tab.url;
		 currentURLhash = fromDecimalToOtherBase(62,hashFnv32a(tab.url));
		 currentHostname = currentURL.substring(currentURL.indexOf("://") + 3, currentURL.indexOf("/", currentURL.indexOf("://") + 3));
		 if (currentHostname.indexOf(".", currentHostname.indexOf(".")+1) === -1) // only has one "." assume www.
			 currentHostname = "www." + currentHostname;
		 
		 initializeView();
		 // need a valid email/this_access_token to do the rest
		 email = bg.docCookies.getItem("email");
		 this_access_token = bg.docCookies.getItem("this_access_token");
		 
		 doThreadTab();
	 });
});


