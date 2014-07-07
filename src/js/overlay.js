
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

//when the overlay's html page has loaded, do this
document.addEventListener('DOMContentLoaded', function () {
	 chrome.tabs.getSelected(null, function(tab) {
		 currentURL = tab.url;
		 currentURLhash = fromDecimalToOtherBase(62,hashFnv32a(tab.url));
		 currentHostname = currentURL.substring(currentURL.indexOf("://") + 3, currentURL.indexOf("/", currentURL.indexOf("://") + 3));
		 if (currentHostname.indexOf(".", currentHostname.indexOf(".")+1) === -1) // only has one "." assume www.
			 currentHostname = "www." + currentHostname;
		 
		 initializeView();
		 if (typeof bg.user_jo.overlay_size !== "undefined" && bg.user_jo.overlay_size !== null)
		 {	
			 $("body").css("width", bg.user_jo.overlay_size + "px");
		 }
		 
		 // need a valid email/this_access_token to do the rest
		 email = docCookies.getItem("email");
		 this_access_token = docCookies.getItem("this_access_token");
		 
		 doThreadTab();
	 });
});
