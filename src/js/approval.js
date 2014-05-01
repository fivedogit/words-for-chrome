
function getParameterByName(name) {
     name = name.replace(/[\[]/, "\\\[")
         .replace(/[\]]/, "\\\]");
     var regexS = "[\\?&]" + name + "=([^&#]*)";
     var regex = new RegExp(regexS);
     var results = regex.exec(window.location.search);
     if (typeof results === "undefined") return "";
     else return decodeURIComponent(results[1].replace(/\+/g, " "));
 }

var code = "";
var login_type = "";
if(document.URL.indexOf("facebook") != -1)
{
	code = getParameterByName("code");
	login_type = "facebook";
}
else if (document.URL.indexOf("google") != -1)
{
	code = $("#code").val();
	login_type = "google";
}
else if (document.URL.indexOf("w.ords.co") != -1)
{
	code = getParameterByName("code");
	login_type = "native";
}
else
{
	alert("error. Unknown login type.");
}

var redirect = chrome.extension.getURL('receiver.html');
window.location = redirect + "?login_type=" + login_type + "&code=" + code;

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-49477303-4', 'ords.co');
	ga('require', 'displayfeatures');
	ga('send', 'pageview');