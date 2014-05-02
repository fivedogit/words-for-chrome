
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
else
{
	alert("error. Unknown login type.");
}

var redirect = chrome.extension.getURL('receiver.html');
window.location = redirect + "?login_type=" + login_type + "&code=" + code;
