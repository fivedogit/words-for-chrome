var bg = chrome.extension.getBackgroundPage();

/*	User clicks sign in with one of the login services
 * 	Client side gets the authorizationCode
 * 	With authorization code, client side tells words backend to exchange code for token <----- you are here
 * 	Client passes access_token to server
 * 	1. Server checks access_token validity, gets email address
 * 	2. if(! email address registered)
 * 		RETURN TO DO FULL REGISTRATION
 * 	2b.else
 * 		log user in, returning this_access_token, this_access_token_expires, screenname and email
 */

//need to include this here because it resides in buttongen.js on the extension itself
var docCookies = {
		  getItem: function (sKey) {
		    if (!sKey || !this.hasItem(sKey)) { return null; }
		    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
		  },
		  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
		    var sExpires = "";
		    if (vEnd) {
		      switch (vEnd.constructor) {
		        case Number:
		          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
		          break;
		        case String:
		          sExpires = "; expires=" + vEnd;
		          break;
		        case Date:
		          sExpires = "; expires=" + vEnd.toGMTString();
		          break;
		      }
		    }
		    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		  },
		  removeItem: function (sKey, sPath) {
		    if (!sKey || !this.hasItem(sKey)) { return; }
		    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
		  },
		  hasItem: function (sKey) {
		    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
		  },
		};


function displayMessage(inc_message, inc_color, dom_id, s)
{
	if(typeof dom_id === "undefined" || dom_id === null)
		dom_id = "message_div";
	var ms;
	if(s === null || !$.isNumeric(s) ||  Math.floor(s) != s) // not a number or not an integer 
		ms = 3000;
	else
		ms = s * 1000;
	if (typeof inc_color === "undefined" || inc_color === null)
		inc_color = "red";
	$("#" + dom_id).css("color", inc_color);
	$("#" + dom_id).text(inc_message);
	$("#" + dom_id).show();
	//setTimeout(function() { $("#" + dom_id).hide();}, ms);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[")
        .replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results === null) return null;
    else return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// here's how this flow works
// if(there a "code" parameter)
//		get it and poll the WORDS backend to exchange it for a real token. Backend automatically takes the resulting code and gets a tat
//		(in other words, this encapsulates login in addition to code-for-token)
// else this a normal login attempt
// 		if google
//			check expiration
//			if expired
//				redirect to google for re-auth
//			else not expired
//				use it and log the user in
//		else if facebook
//			check expiration
//			if expired
//				redirect to google for re-auth
//			else not expired
//				use it and log the user in

var logout = getParameterByName("logout");
if(logout !== null)
{
	//alert("reciever removing credentials because logout !== null");
	docCookies.removeItem("screenname");
	docCookies.removeItem("this_access_token");
	var logout_msg = "";
	logout_msg = logout_msg + "<div style=\"width:360px;padding:15px\">";
	logout_msg = logout_msg + "	<div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">";
	logout_msg = logout_msg + "		You are now logged out.";
	logout_msg = logout_msg + "	</div>";
	logout_msg = logout_msg + "	<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>";
	logout_msg = logout_msg + "</div>";
	$("#message_div").html(logout_msg);
	$("#close_this_tab_link").click( function (event) { event.preventDefault();
		chrome.tabs.getSelected(null, function(tab) { 
			var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
			chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
			docCookies.removeItem("last_tab_id");
			chrome.tabs.remove(tab.id);
		});
	});
}	
else
{	
	//alert("receiver mode !== logout");
	var code = getParameterByName("code");
	var login_type = getParameterByName("login_type");
	var capitalized_login_type = "Unknown";
	if(login_type !== null && login_type.length > 1)
		capitalized_login_type = login_type.charAt(0).toUpperCase() + login_type.slice(1);

	var client_id = "";
	if(login_type === "google" && chrome.runtime.id === "mpefojdpeaiaepbgjjmnanepdkhoeeii") //laptop
		client_id = "591907226969-fgjpelovki35oc3nclvu512msaka2hfh.apps.googleusercontent.com";
	else if(login_type === "google" && chrome.runtime.id === "lgdfecngaioibcmfbfpeeddgkjfdpgij")
		client_id = "591907226969-ct58tt67m00b8fjd9b92gfl5aiq0jva6.apps.googleusercontent.com";
	else //fb
	    client_id = "271212039709142";
	if(login_type === "google" && code === "undefined") // if google user clicks "cancel" 
	{
		var google_cancel_message = "";
		google_cancel_message = google_cancel_message + "<div style=\"width:360px;padding:15px\">";
		google_cancel_message = google_cancel_message + "	<div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">";
		google_cancel_message = google_cancel_message + "		You canceled the login.";
		google_cancel_message = google_cancel_message + "	</div>";
		google_cancel_message = google_cancel_message + "	<div style=\"font-size:11px;padding-bottom:15px;font-style:italic\">";
		google_cancel_message = google_cancel_message + "		To use a different Google account, <b>restart your browser</b> and then log back in.";
		google_cancel_message = google_cancel_message + "	</div>";
		google_cancel_message = google_cancel_message + "	<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>";
		google_cancel_message = google_cancel_message + "</div>";
		$("#message_div").html(google_cancel_message);
		$("#close_this_tab_link").click( function (event) { event.preventDefault();
			chrome.tabs.getSelected(null, function(tab) { 
				var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
				chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
				docCookies.removeItem("last_tab_id");
				chrome.tabs.remove(tab.id);
			});
		});
	}	
	else if(login_type === "facebook" && code === "undefined") // if facebook user clicks "cancel" 
	{
		var facebook_cancel_message = "";
		facebook_cancel_message = facebook_cancel_message + "<div style=\"width:360px;padding:15px\">";
		facebook_cancel_message = facebook_cancel_message + "	<div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">";
		facebook_cancel_message = facebook_cancel_message + "		You canceled the login.";
		facebook_cancel_message = facebook_cancel_message + "	</div>";
		facebook_cancel_message = facebook_cancel_message + "	<div style=\"font-size:11px;padding-bottom:15px;font-style:italic\">";
		facebook_cancel_message = facebook_cancel_message + "		To use a different Facebook account, <b>restart your browser</b> and then log back in.";
		facebook_cancel_message = facebook_cancel_message + "	</div>";
		facebook_cancel_message = facebook_cancel_message + "	<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>";
		facebook_cancel_message = facebook_cancel_message + "</div>";
		$("#message_div").html(facebook_cancel_message);
		$("#close_this_tab_link").click( function (event) { event.preventDefault();
			chrome.tabs.getSelected(null, function(tab) { 
				var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
				chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
				docCookies.removeItem("last_tab_id");
				chrome.tabs.remove(tab.id);
			});
		});
	}	
	else if(code === null)
	{
		if(login_type === "google")
		{
			displayMessage("Logging in with Google. A popup window like this may appear.", "black");
			var tstr = "";
			tstr=tstr+"<table style=\"margin-right:auto;margin-left:auto;\">";
			tstr=tstr+"	<tr>";
			tstr=tstr+"		<td style=\"width:220px;padding:20px\"><img style=\"border:1px solid black\" src=\"images/google_popup.jpg\"></td>";
			tstr=tstr+"		<td style=\"vertical-align:middle;text-align:center;padding:20px\">";
			tstr=tstr+"			<a href=\"#\" id=\"confirm_google_popup_link\">Ok. I got it. >></a>";
			tstr=tstr+"			<br><br>";
			tstr=tstr+"			Or, login with: <img style=\"vertical-align:middle\" id=\"facebook_login_img\" src=\"" + chrome.extension.getURL("images/facebook_button_24x24.png") + "\"> <img style=\"vertical-align:middle\" id=\"words_login_img\" src=\"" + chrome.extension.getURL("images/words_button_black_24x24.png") + "\"> ";
			tstr=tstr+"		</td>";
			tstr=tstr+"	</tr>";
			tstr=tstr+"</table>";
			$("#content_div").html(tstr);
			$("#confirm_google_popup_link").click(function(event){ event.preventDefault();
				var redirectUri0 = 'https://' + chrome.runtime.id + '.chromiumapp.org/provider_cb';
				var interactive = true;
				var redirectRe = new RegExp(redirectUri0 + '[#\?](.*)');
				
				var options = {
				          'interactive': interactive,
				          url:'https://accounts.google.com/o/oauth2/auth?' +
					      'scope=profile email' +
					      '&response_type=code' +
					      '&client_id=' + client_id +
					      '&redirect_uri=' + encodeURIComponent(redirectUri0)
				        }
				
				chrome.identity.launchWebAuthFlow(options, function(redirectUri1) {
					if (chrome.runtime.lastError) { // if google and the user clicks the X to close the perm window
						$("#content_div").hide();
						//alert(JSON.stringify(chrome.runtime.lastError));
						var google_close_message = "";
						google_close_message = google_close_message + "<div style=\"width:360px;padding:15px\">";
						google_close_message = google_close_message + "	<div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">";
						google_close_message = google_close_message + "		You closed the permission window.";
						google_close_message = google_close_message + "	</div>";
						google_close_message = google_close_message + "	<div style=\"font-size:11px;padding-bottom:15px;font-style:italic\">";
						google_close_message = google_close_message + "		To use a different Google account, <b>restart your browser</b> and then log back in.";
						google_close_message = google_close_message + "	</div>";
						google_close_message = google_close_message + "	<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>";
						google_close_message = google_close_message + "</div>";
						$("#message_div").html(google_close_message);
						$("#close_this_tab_link").click( function (event) { event.preventDefault();
							chrome.tabs.getSelected(null, function(tab) { 
								var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
								chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
								docCookies.removeItem("last_tab_id");
								chrome.tabs.remove(tab.id);
							});
						});
						return;
					}
					var matches = redirectUri1.match(redirectRe);
					if (matches && matches.length > 1)
					{
						//alert("successful redirect URI match");
						var values = parseRedirectFragment(matches[1]);
						window.location = "chrome-extension://" + chrome.runtime.id + "/receiver.html?login_type=google&code=" + values.code + "&redirect_uri=" + encodeURIComponent(redirectUri0);
					}
					else
					{
						alert("unsuccessful redirect URI match");
					}	 
				 });
			});
			
			
			$("#facebook_login_img").click(function(event){
				window.location = chrome.extension.getURL('receiver.html') + "?login_type=facebook";
			});
			$("#facebook_login_img").mouseover( function() {
				$("#facebook_login_img").attr("src", chrome.extension.getURL("images/facebook_button_24x24_mo.png"));
			});
			$("#facebook_login_img").mouseout( function() {
				$("#facebook_login_img").attr("src", chrome.extension.getURL("images/facebook_button_24x24.png"));
			});
			$("#words_login_img").click(function(event){
				window.location = chrome.extension.getURL('receiver.html') + "?login_type=words";
			});
			$("#words_login_img").mouseover( function() {
				$("#words_login_img").attr("src", chrome.extension.getURL("images/words_button_black_24x24_mo.png"));
			});
			$("#words_login_img").mouseout( function() {
				$("#words_login_img").attr("src", chrome.extension.getURL("images/words_button_black_24x24.png"));
			});
			
		}
		else if(login_type === "facebook")
		{
			displayMessage("Logging in with Facebook. A popup window like this may appear.", "black");
			$("#content_div").html("<table style=\"margin-right:auto;margin-left:auto;\"><tr><td><img style=\"border:1px solid black\" src=\"images/fb_popup.jpg\"></td><td style=\"vertical-align:middle;text-align:center;padding-left:10px\"><a href=\"#\" id=\"confirm_facebook_popup_link\">Ok. I got it. >></a></td></tr></table>");
			var tstr = "";
			tstr=tstr+"<table style=\"margin-right:auto;margin-left:auto;\">";
			tstr=tstr+"	<tr>";
			tstr=tstr+"		<td style=\"width:220px;padding:20px\"><img style=\"border:1px solid black\" src=\"images/fb_popup.jpg\"></td>";
			tstr=tstr+"		<td style=\"vertical-align:middle;text-align:center;padding:20px\">";
			tstr=tstr+"			<a href=\"#\" id=\"confirm_facebook_popup_link\">Ok. I got it. >></a>";
			tstr=tstr+"			<br><br>";
			tstr=tstr+"			Or, login with: <img style=\"vertical-align:middle\" id=\"google_login_img\" src=\"" + chrome.extension.getURL("images/google_button_24x24.png") + "\"> <img style=\"vertical-align:middle\" id=\"words_login_img\" src=\"" + chrome.extension.getURL("images/words_button_black_24x24.png") + "\"> ";
			tstr=tstr+"		</td>";
			tstr=tstr+"	</tr>";
			tstr=tstr+"</table>";
			$("#content_div").html(tstr);
			$("#confirm_facebook_popup_link").click(function(event){ event.preventDefault();
				var redirectUri0 = 'https://' + chrome.runtime.id + '.chromiumapp.org/provider_cb';
				var interactive = true;
				var redirectRe = new RegExp(redirectUri0 + '[#\?](.*)');
				var options = {
			          'interactive': interactive,
			          url:'https://www.facebook.com/dialog/oauth?client_id=' + client_id +
			              '&reponse_type=code' +
			              '&display=popup' + 
			              '&scope=email' +
			              '&redirect_uri=' + encodeURIComponent(redirectUri0)
			        }
			
				chrome.identity.launchWebAuthFlow(options, function(redirectUri1) {
					if (chrome.runtime.lastError) {
						$("#content_div").hide();
						//alert("error=" + JSON.stringify(chrome.runtime.lastError));
						var facebook_close_message = "";
						facebook_close_message = facebook_close_message + "<div style=\"width:360px;padding:15px\">";
						facebook_close_message = facebook_close_message + "	<div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">";
						facebook_close_message = facebook_close_message + "		You closed the permission window.";
						facebook_close_message = facebook_close_message + "	</div>";
						facebook_close_message = facebook_close_message + "	<div style=\"font-size:11px;padding-bottom:15px;font-style:italic\">";
						facebook_close_message = facebook_close_message + "		To use a different Facebook account, <b>restart your browser</b> and then log back in.";
						facebook_close_message = facebook_close_message + "	</div>";
						facebook_close_message = facebook_close_message + "	<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>";
						facebook_close_message = facebook_close_message + "</div>";
						$("#message_div").html(facebook_close_message);
						$("#close_this_tab_link").click( function (event) { event.preventDefault();
						chrome.tabs.getSelected(null, function(tab) { 
							var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
							chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
							docCookies.removeItem("last_tab_id");
							chrome.tabs.remove(tab.id);
						});
						});
					return;
					}
					var matches = redirectUri1.match(redirectRe);
					if (matches && matches.length > 1)
					{	
						//alert("successful redirect URI match");
						var values = parseRedirectFragment(matches[1]);
						window.location = "chrome-extension://" + chrome.runtime.id + "/receiver.html?login_type=facebook&redirect_uri=" + encodeURIComponent(redirectUri0) + "&code=" + values.code;
					}
					else
					{
						alert("unsuccessful redirect URI match");
					}	 
				});
			});
			$("#google_login_img").click(function(event){
				window.location = chrome.extension.getURL('receiver.html') + "?login_type=google";
			});
			$("#google_login_img").mouseover( function() {
				$("#google_login_img").attr("src", chrome.extension.getURL("images/google_button_24x24_mo.png"));
			});
			$("#google_login_img").mouseout( function() {
				$("#google_login_img").attr("src", chrome.extension.getURL("images/google_button_24x24.png"));
			});
			$("#words_login_img").click(function(event){
				window.location = chrome.extension.getURL('receiver.html') + "?login_type=words";
			});
			$("#words_login_img").mouseover( function() {
				$("#words_login_img").attr("src", chrome.extension.getURL("images/words_button_black_24x24_mo.png"));
			});
			$("#words_login_img").mouseout( function() {
				$("#words_login_img").attr("src", chrome.extension.getURL("images/words_button_black_24x24.png"));
			});
		}	
		else if(login_type === "words")
		{
			displayNewRegistration(true, null, "words", null, null); // show login, picture, login_type, email, facebook_access_token;
		}
		
	}	
	else if(code !== null && code !== "")
	{
		//alert("receiver: code exists");
		// login_type gets passed through the oauth scheme. so it's always there. No need to try to get it again here.
		//alert("parsing code, going to getAccessTokenFromAuthorizationCode with redirect_uri=" + getParameterByName("redirect_uri"));
		displayMessage("Verifying your identity with " + capitalized_login_type + "... ", "black");
		$("#content_div").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">");
		$.ajax({
			type: 'get',
			url: bg.endpoint,
			data: {
				method: "getAccessTokenFromAuthorizationCode",
				code: getParameterByName("code"),
				login_type: login_type,
				redirect_uri: getParameterByName("redirect_uri"),
				client_id: client_id
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				$("#content_div").html(""); 
				if(data.response_status === "error")
				{
					displayMessage(data.message, "red");
					if(data.login_type === "facebook")
					{
						var msg = "";
						msg = msg + "<div style=\"margin-right:auto;margin-left:auto;width:360px;padding:15px;font-style:italic\">If you're having trouble or want to switch Facebook accounts, <b>try restarting your browser</b> and logging back in.<br><br><a href=\"#\" id=\"close_this_tab_link\">Close this tab</a></div>";
						$("#content_div").html(msg);//OK
						$("#close_this_tab_link").click( function (event) { event.preventDefault();
							chrome.tabs.getSelected(null, function(tab) { 
								var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
								chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
								docCookies.removeItem("last_tab_id");
								chrome.tabs.remove(tab.id);
							});
						});
					}	
					else if(data.login_type === "google")
					{
						var msg = "";
						msg = msg + "<div style=\"margin-right:auto;margin-left:auto;width:360px;padding:15px;font-style:italic\">If you're having trouble or want to switch Google accounts, <b>try restarting your browser</b> and logging back in.<br><br><a href=\"#\" id=\"close_this_tab_link\">Close this tab</a></div>";
						$("#content_div").html(msg);//OK
						$("#close_this_tab_link").click( function (event) { event.preventDefault();
							chrome.tabs.getSelected(null, function(tab) { 
								var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
								chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
								docCookies.removeItem("last_tab_id");
								chrome.tabs.remove(tab.id);
							});
						});
					}
					
					if(data.error_code === "0000" && data.login_type === "facebook")
					{
						//alert("reciever removing credentials because getAccessToken (FB) error");
						docCookies.removeItem("last_tab_id");
						docCookies.removeItem("screenname");
						docCookies.removeItem("this_access_token");
					}	
					else if(data.error_code === "0000" && data.login_type === "google")
					{
						//alert("reciever removing credentials because getAccessToken (G) error");
						docCookies.removeItem("last_tab_id");
						docCookies.removeItem("screenname");
						docCookies.removeItem("this_access_token");
					}	
				}
				else if(data.response_status === "success")
				{
					if(data.show_registration === "true" && data.login_type === "facebook")
					{
						//docCookies.setItem("email", data.email, 31536e3); if we're passing the email in the next line, why do we need to store it as a cookie?
						displayNewRegistration(false, data.picture, data.login_type, data.email, data.facebook_access_token);
					}
					else if(data.show_registration === "false" && data.login_type === "facebook")
					{
						//alert("receiver: fb login success, showing no registration, going to doFinished()");
						docCookies.setItem("screenname", data.screenname, 31536e3);
						docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
						$("#content_div").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">");
						setTimeout(function(){
							doFinished(data.facebook_access_token, data.screenname, data.this_access_token);
						}, 1000);
			    		
					}	
					if(data.show_registration === "true" && data.login_type === "google")
					{
						//docCookies.setItem("email", data.email, 31536e3); if we're passing the email in the next line, why do we need to store it as a cookie?
						displayNewRegistration(false, data.picture, data.login_type, data.email, data.google_access_token);
					}
					else if(data.show_registration === "false" && data.login_type === "google")
					{
						//alert("receiver: g+ login success, showing no registration, going to doFinished()");
						docCookies.setItem("screenname", data.screenname, 31536e3);
						docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
						$("#content_div").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">");
						setTimeout(function(){
							doFinished(data.google_access_token, data.screenname, data.this_access_token);
						}, 1000);
					}	
				}	
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				$("#content_div").html("");
				console.log(textStatus, errorThrown);
				displayMessage("Unknown login error. Please try again.", "red");
			} 
		}); 
	}	
}

function parseRedirectFragment(fragment) {
    var pairs = fragment.split(/&/);
    var values = {};

    pairs.forEach(function(pair) {
      var nameval = pair.split(/=/);
      values[nameval[0]] = nameval[1];
    });

    return values;
  }

function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	               .toString(16)
	               .substring(1);
	  }
	  return s4() + s4() + s4()+ s4() +
	         s4() +s4() + s4() + s4();
	}

function displayNewRegistration(show_login, picture, login_type, email, social_access_token)
{
	$("#message_div").hide();
	$("#content_div").css("padding","0px");
	var log_and_reg = "";
	
	if(show_login)
	{	
		log_and_reg = log_and_reg + "<form name=\"login_form\" id=\"existing_user_login_form\" method=\"get\" action=\"#\">";
		log_and_reg = log_and_reg + "<table style=\"width:100%;border:0px solid black;border-spacing:15px;border-collapse:separate\">";
		log_and_reg = log_and_reg + "	<tr>";
		log_and_reg = log_and_reg + "		<td style=\"text-align:left;font-size:15px;font-weight:bold;width:110px\">Log in:</td><td></td>";
		log_and_reg = log_and_reg + "	</tr>";
		log_and_reg = log_and_reg + "	<tr>";
		log_and_reg = log_and_reg + "		<td style=\"text-align:right;width:110px\">screenname:</td><td><input type=\"text\" size=20 id=\"screenname_input\"></td>";
		log_and_reg = log_and_reg + "	</tr>";
		log_and_reg = log_and_reg + "	<tr>";
		log_and_reg = log_and_reg + "		<td style=\"text-align:right;width:110px\">password:</td><td><input type=\"password\" size=20 id=\"password_input\"></td>";
		log_and_reg = log_and_reg + "	</tr>";
		log_and_reg = log_and_reg + "	<tr>";
		log_and_reg = log_and_reg + "		<td style=\"text-align:right;width:110px\"></td><td><input type=\"submit\" value=\"Login\"></td>";
		log_and_reg = log_and_reg + "	</tr>";
		log_and_reg = log_and_reg + "	<tr>";
		log_and_reg = log_and_reg + "		<td style=\"text-align:right;width:110px\"></td><td style=\"color:red;font-size:11px\" id=\"login_submit_message_div\"></td>";
		log_and_reg = log_and_reg + "	</tr>";
		log_and_reg = log_and_reg + "	<tr>";
		log_and_reg = log_and_reg + "		<td style=\"text-align:right;width:110px\"></td><td><a href=\"#\" id=\"forgot_password_link\">I forgot my password.</a></td>";
		log_and_reg = log_and_reg + "	</tr>";
		log_and_reg = log_and_reg + "</table>";
		log_and_reg = log_and_reg + "</form>";
	}
	
	log_and_reg = log_and_reg + "<form name=\"registration_form\" id=\"new_user_registration_form\" method=\"get\" action=\"#\">";
	log_and_reg = log_and_reg + "<table style=\"width:100%;border-top:1px solid #cccccc;border-spacing:15px;border-collapse:separate\">";
	log_and_reg = log_and_reg + "	<tr>";
	log_and_reg = log_and_reg + "		<td colspan=3 style=\"text-align:left;font-size:15px;font-weight:bold;width:110px\">Create account:</td>";
	log_and_reg = log_and_reg + "	</tr>";
	if(email !== null)
	{
		log_and_reg = log_and_reg + "	<tr>";
		log_and_reg = log_and_reg + "		<td style=\"text-align:right\">email:</td><td>" + email + "</td>";
		log_and_reg = log_and_reg + "			<td style=\"text-align:right;font-style:italic;font-size:11px\">";
		log_and_reg = log_and_reg + "				Not you? Restart browser <br>to try again.";
		log_and_reg = log_and_reg + "			</td>";
		log_and_reg = log_and_reg + "	</tr>";
	}	
	log_and_reg = log_and_reg + "	<tr>";
	log_and_reg = log_and_reg + "		<td style=\"text-align:right;vertical-align:top;width:110px\">screenname:</td>";
	log_and_reg = log_and_reg + "		<td style=\"vertical-align:top\"><input type=\"text\" size=20 id=\"registration_screenname_input\"></td>";
	log_and_reg = log_and_reg + "		<td style=\"text-align:center;vertical-align:top\"><a href=\"#\" id=\"screenname_availability_link\">available?</a><br><span id=\"screenname_availability_span\"></span></td>";
	log_and_reg = log_and_reg + "	</tr>";
	log_and_reg = log_and_reg + "	<tr>";
	log_and_reg = log_and_reg + "		<td style=\"text-align:right;width:110px\">password:</td>";
	log_and_reg = log_and_reg + "		<td><input type=\"password\" size=20 id=\"registration_password_input\"> <span style=\"font-size:11px\" id=\"password_validity_span\"></span></td>";
	log_and_reg = log_and_reg + "		<td></td>";
	log_and_reg = log_and_reg + "	</tr>";
	log_and_reg = log_and_reg + "	<tr>";
	log_and_reg = log_and_reg + "		<td style=\"text-align:right;width:110px\">confirm:</td>";
	log_and_reg = log_and_reg + "		<td><input type=\"password\" size=20 id=\"registration_confirm_input\"> <span style=\"font-size:11px\" id=\"confirm_validity_span\"></span></td>";
	log_and_reg = log_and_reg + "		<td></td>";
	log_and_reg = log_and_reg + "	</tr>";
	log_and_reg = log_and_reg + "	<tr>";
	log_and_reg = log_and_reg + "		<td style=\"text-align:right;vertical-align:top;width:110px\">avatar:<br><span style=\"font-style:italic;color:#666666;font-size:10px\">(To use your own picture, log in with Google or FB.)</span></td>";
	log_and_reg = log_and_reg + "		<td>";
	log_and_reg = log_and_reg + "			<table>";
	if(login_type === "google" || login_type === "facebook")
	{	
		log_and_reg = log_and_reg + "				<tr>";
		if(login_type === "google")
		{
			log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
			log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"use_google_radio\" value=\"google\">";
			log_and_reg = log_and_reg + "					</td>";
			log_and_reg = log_and_reg + "					<td>";
			log_and_reg = log_and_reg + "						Google";
			log_and_reg = log_and_reg + "					</td>";
		}
		else if(login_type === "facebook")
		{	
			log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
			log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"use_facebook_radio\" value=\"facebook\">";
			log_and_reg = log_and_reg + "					</td>";
			log_and_reg = log_and_reg + "					<td>";
			log_and_reg = log_and_reg + "						Facebook";
			log_and_reg = log_and_reg + "					</td>";
		}
		log_and_reg = log_and_reg + "				<td></td><td></td>";
		log_and_reg = log_and_reg + "				</tr>";
	}
	log_and_reg = log_and_reg + "				<tr>";
	log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
	log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"geometric\" value=\"geometric\">";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td>";
	log_and_reg = log_and_reg + "						Geometric";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
	log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"monster\" value=\"monster\">";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td>";
	log_and_reg = log_and_reg + "						Monster";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "				</tr>";
	log_and_reg = log_and_reg + "				<tr>";
	log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
	log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"cartoon\" value=\"cartoon\">";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td>";
	log_and_reg = log_and_reg + "						Cartoon";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
	log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"retro\" value=\"retro\">";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td>";
	log_and_reg = log_and_reg + "						Retro";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "				</tr>";
	log_and_reg = log_and_reg + "				<tr>";
	log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
	log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"unicorn\" value=\"unicorn\">";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td>";
	log_and_reg = log_and_reg + "						Unicorn <img style=\"vertical-align:middle;width:16px;height:16px;display:none\" id=\"unicorn_progress_img\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td style=\"width:15px\">";
	log_and_reg = log_and_reg + "						<input type=\"radio\" name=\"registration_avatar\" id=\"silhouette\" value=\"silhouette\">";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "					<td>";
	log_and_reg = log_and_reg + "						Silhouette";
	log_and_reg = log_and_reg + "					</td>";
	log_and_reg = log_and_reg + "				</tr>";
	log_and_reg = log_and_reg + "			</table>";
	log_and_reg = log_and_reg + "		</td>";
	log_and_reg = log_and_reg + "		<td><img style=\"width:80px;height:80px;display:none\" id=\"registration_avatar_img\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\"></td>";
	log_and_reg = log_and_reg + "	</tr>";
	log_and_reg = log_and_reg + "	<tr>";
	log_and_reg = log_and_reg + "		<td style=\"width:110px\"></td><td><input type=\"submit\" value=\"Create account\"></td><td></td>";
	log_and_reg = log_and_reg + "	</tr>";
	log_and_reg = log_and_reg + "	<tr>";
	log_and_reg = log_and_reg + "		<td style=\"width:110px\"></td><td colspan=2 style=\"color:red;font-size:11px\" id=\"submit_message_div\"></td>";
	log_and_reg = log_and_reg + "	</tr>";
	log_and_reg = log_and_reg + "	<tr>";
	if(login_type === "words")
		log_and_reg = log_and_reg + "		<td style=\"width:110px\"></td><td>Or, login with: <img style=\"vertical-align:middle\" id=\"google_login_img\" src=\"" + chrome.extension.getURL("images/google_button_24x24.png") + "\"> <img style=\"vertical-align:middle\" id=\"facebook_login_img\" src=\"" + chrome.extension.getURL("images/facebook_button_24x24.png") + "\"></td><td></td>";
	else if(login_type === "facebook")
		log_and_reg = log_and_reg + "		<td style=\"width:110px\"></td><td>Or, login with: <img style=\"vertical-align:middle\" id=\"google_login_img\" src=\"" + chrome.extension.getURL("images/google_button_24x24.png") + "\"> <img style=\"vertical-align:middle\" id=\"words_login_img\" src=\"" + chrome.extension.getURL("images/words_button_24x24.png") + "\"></td><td></td>";
	else if(login_type === "google")
		log_and_reg = log_and_reg + "		<td style=\"width:110px\"></td><td>Or, login with: <img style=\"vertical-align:middle\" id=\"facebook_login_img\" src=\"" + chrome.extension.getURL("images/facebook_button_24x24.png") + "\"> <img style=\"vertical-align:middle\" id=\"words_login_img\" src=\"" + chrome.extension.getURL("images/words_button_24x24.png") + "\"></td><td></td>";
	log_and_reg = log_and_reg + "	</tr>";
	log_and_reg = log_and_reg + "</table>";
	log_and_reg = log_and_reg + "</form>";
	$("#content_div").html(log_and_reg);
	
	$("#existing_user_login_form").submit(function(event){
		$("#login_submit_message_div").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">");
		$.ajax({
			type: 'GET',
			url: bg.endpoint,
			data: {
				method: "nativeLogin",
				screenname: $("#screenname_input").val(),
				password: $("#password_input").val()
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				//alert("ajax success");
				if(data.response_status === "error")
				{
					$("#login_submit_message_div").text(data.message);
					setTimeout(function() { $("#login_submit_message_div").text("");}, 3000);
				}
				else
				{
					$("#message_div").show();
					$("#login_submit_message_div").text();
					docCookies.setItem("screenname", data.screenname, 31536e3);
					docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
					doReallyFinished();
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				$("#login_submit_message_div").text("Unable to login. Check username and password. (AJAX)");
				setTimeout(function() { $("#login_submit_message_div").text("");}, 3000);
			} 
		});
		return false;
	});
	
	$("#forgot_password_link").click(function(event){ event.preventDefault();
		var fp_form = "";
		fp_form = fp_form + "<form name=\"forgotpasword_form\" id=\"fp_form\" method=\"get\" action=\"#\">";
		fp_form = fp_form + "<table style=\"width:100%;border:0px solid black;border-spacing:15px;border-collapse:separate\">";
		fp_form = fp_form + "	<tr>";
		fp_form = fp_form + "		<td colspan=2 style=\"text-align:left;font-size:15px;font-weight:bold;width:110px\">Password reset:</td>";
		fp_form = fp_form + "	</tr>";
		fp_form = fp_form + "	<tr>";
		fp_form = fp_form + "		<td style=\"text-align:right;width:110px\">email address:</td><td><input type=\"text\" size=20 id=\"email_input\"></td>";
		fp_form = fp_form + "	</tr>";
		fp_form = fp_form + "	<tr>";
		fp_form = fp_form + "		<td style=\"text-align:right;width:110px\"></td><td><input type=\"submit\" value=\"Submit\"></td>";
		fp_form = fp_form + "	</tr>";
		fp_form = fp_form + "	<tr>";
		fp_form = fp_form + "		<td style=\"text-align:right;width:110px\"></td><td style=\"color:red;font-size:11px\" id=\"fp_submit_message_div\"></td>";
		fp_form = fp_form + "	</tr>";
		fp_form = fp_form + "	<tr>";
		fp_form = fp_form + "		<td style=\"text-align:right;width:110px\"></td><td style=\"font-style:italic;color:#444444\">If you never confirmed an email address,<br>your password is unrecoverable. Sorry.<br>Create a new account.</td>";
		fp_form = fp_form + "	</tr>";
		fp_form = fp_form + "</table>";
		fp_form = fp_form + "</form>";
		$("#content_div").html(fp_form);
		$("#fp_form").submit(function(event){
			var email_address = $("#email_input").val();
			$("#fp_submit_message_div").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">");
			$.ajax({
				type: 'GET',
				url: bg.endpoint,
				data: {
					method: "sendPasswordResetEmail",
					email: email_address
				},
				dataType: 'json',
				async: true,
				success: function (data, status) {
					if(data.response_status === "error")
					{
						$("#fp_submit_message_div").text(data.message);
						setTimeout(function() { $("#fp_submit_message_div").text("");}, 3000);
					}
					else if(data.response_status === "success")
					{
						var confcode_form = "";
						confcode_form = confcode_form + "<form name=\"forgotpasword_form\" id=\"confcode_form\" method=\"get\" action=\"#\">";
						confcode_form = confcode_form + "<table style=\"width:100%;border:0px solid black;border-spacing:15px;border-collapse:separate\">";
						confcode_form = confcode_form + "	<tr>";
						confcode_form = confcode_form + "		<td colspan=2 style=\"text-align:left;font-size:15px;font-weight:bold;width:110px\">Password reset:</td>";
						confcode_form = confcode_form + "	</tr>";
						confcode_form = confcode_form + "	<tr>";
						confcode_form = confcode_form + "		<td style=\"text-align:right;width:110px\">confirmation code:</td><td><input type=\"text\" size=20 id=\"confcode_input\"></td>";
						confcode_form = confcode_form + "	</tr>";
						confcode_form = confcode_form + "	<tr>";
						confcode_form = confcode_form + "		<td style=\"text-align:right;width:110px\"></td><td><input type=\"submit\" value=\"Submit\"></td>";
						confcode_form = confcode_form + "	</tr>";
						confcode_form = confcode_form + "	<tr>";
						confcode_form = confcode_form + "		<td style=\"text-align:right;width:110px\"></td><td style=\"color:red;font-size:11px\" id=\"confcode_submit_message_div\">";
						confcode_form = confcode_form + "			<span style=\"color:#444;font-style:italic\">If that email address was found, a reset code has been sent to it.<br>Check your email and enter the code above.</span>";
						confcode_form = confcode_form + " 		</td>";
						confcode_form = confcode_form + "	</tr>";
						confcode_form = confcode_form + "	<tr>";
						confcode_form = confcode_form + "		<td style=\"text-align:right;width:110px\"></td><td style=\"font-style:italic;color:red\">Keep this window open!</td>";
						confcode_form = confcode_form + "	</tr>";
						confcode_form = confcode_form + "</table>";
						confcode_form = confcode_form + "</form>";
						$("#content_div").html(confcode_form);
						$("#confcode_form").submit(function(event){
							$("#confcode_submit_message_div").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">");
							$.ajax({
								type: 'GET',
								url: bg.endpoint,
								data: {
									method: "confirmPasswordReset",
									email: email_address,
									confcode: $("#confcode_input").val()
								},
								dataType: 'json',
								async: true,
								success: function (data, status) {
									if(data.response_status === "error")
									{
										$("#confcode_submit_message_div").text(data.message);
										setTimeout(function() { $("#confcode_submit_message_div").text("");}, 3000);
									}
									else if(data.response_status === "success")
									{
										var confcode_form = "";
										confcode_form = confcode_form + "<table style=\"width:100%;border:0px solid black;border-spacing:15px;border-collapse:separate\">";
										confcode_form = confcode_form + "	<tr>";
										confcode_form = confcode_form + "		<td style=\"text-align:left;font-size:15px;font-weight:bold;width:110px\">Password reset</td>";
										confcode_form = confcode_form + "	</tr>";
										confcode_form = confcode_form + "	<tr>";
										confcode_form = confcode_form + "		<td style=\"text-align:left;width:110px\">Your new password has been emailed to you.</td>";
										confcode_form = confcode_form + "	</tr>";
										confcode_form = confcode_form + "</table>";
										$("#content_div").html(confcode_form);
									}
								},
								error: function (XMLHttpRequest, textStatus, errorThrown) {
									console.log(textStatus, errorThrown);
									$("#login_submit_message_div").text("Unable to login. Check username and password. (AJAX)");
									setTimeout(function() { $("#login_submit_message_div").text("");}, 3000);
								} 
							});
							return false;
						});
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log(textStatus, errorThrown);
					$("#login_submit_message_div").text("Unable to login. Check username and password. (AJAX)");
					setTimeout(function() { $("#login_submit_message_div").text("");}, 3000);
				} 
			});
			return false;
		});
	});
	
	$("#screenname_availability_link").click( function (event) { event.preventDefault();
	$("#screenname_availability_span").text("Checking...");
	var response_object;
	$.ajax({
		type: 'GET',
		url: bg.endpoint,
		data: {
			method: "isScreennameAvailable",
			screenname: $("#registration_screenname_input").val()
		},
		dataType: 'json',
		async: true,
		success: function (data, status) 
		{
			response_object = data;
			if (response_object.response_status === "error") 
			{
				$("#screenname_availability_span").css("color", "red");
				$("#screenname_availability_span").text(data.message);
				setTimeout(function() { $("#screenname_availability_span").text("");}, 3000);
			} 
			else if (response_object.response_status === "success") 
			{
				if (response_object.screenname_available === "true") 
				{
					$("#screenname_availability_span").css("color", "green");
					$("#screenname_availability_span").text("Available");
				}
				else if (response_object.screenname_available === "false") 
				{
					$("#screenname_availability_span").css("color", "red");
					$("#screenname_availability_span").text("Unavailable");
				}
				else
				{
					$("#screenname_availability_span").css("color", "red");
					$("#screenname_availability_span").text("Error. Value !t/f.");
				}
				setTimeout(function() { $("#screenname_availability_span").text("");}, 3000);
			}
			else
			{
				//alert("weird. response_status not error or success.");
			}
			return;
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) 
		{
			console.log(textStatus, errorThrown);
		}
	});	
});					
	
	$("#registration_password_input")
	.focusout(function () {
	$("#registration_password_input")
	    .trigger("keypress");
	});
	$("#registration_password_input")
	.keyup(function () {
	$("#registration_password_input")
	    .trigger("keypress");
	});
	$("#registration_password_input")
	.keydown(function () {
	$("#registration_password_input")
	    .trigger("keypress");
	});

	$("#registration_password_input").keypress(
			function () {
				$("#submit_message_div").html("");
				if (!$("#registration_password_input").val().match(/^(\w|[!@\-#$%\*]){8,20}$/))
				{
					$("#password_validity_span").text("X");
					$("#password_validity_span").css("color", "red");

				}
				else if ($("#registration_password_input").val().length >= 6) 
				{
					$("#password_validity_span").text("OK");
					$("#password_validity_span").css("color", "green");
				}
			});
	
	$("#registration_confirm_input")
	.focusout(function () {
	$("#registration_confirm_input")
	    .trigger("keypress");
	});
	$("#registration_confirm_input")
	.keyup(function () {
	$("#registration_confirm_input")
	    .trigger("keypress");
	});
	$("#registration_confirm_input")
	.keydown(function () {
	$("#registration_confirm_input")
	    .trigger("keypress");
	});
	
	$("#registration_confirm_input").keypress(
			function () {
				$("#submit_message_div").html("");
				if ($("#registration_confirm_input").val().length <= 0) 
				{
					$("#confirm_validity_span").text("X");
					$("#confirm_validity_span").css("color", "red");
				} 
				else if ($("#registration_confirm_input").val().length < 6) 
				{
					$("#confirm_validity_span").text("X");
					$("#confirm_validity_span").css("color", "red");
				} 
				else if ($("#registration_confirm_input").val().length >= 6) 
				{
					if ($("#registration_confirm_input").val() === $("#registration_password_input").val()) 
					{
						$("#confirm_validity_span").text("OK");
						$("#confirm_validity_span").css("color", "green");
					} 
					else 
					{
						$("#confirm_validity_span").text("X");
						$("#confirm_validity_span").css("color", "red");
					}
				}
			});
	
	if(login_type === "google")
	{	
		$("#use_google_radio").click(function (event) { 
			$("#registration_avatar_img").show();
			$("#registration_avatar_img").attr("src", picture);
		});
		$("#use_google_radio").trigger("click");
		
	}
	if(login_type === "facebook")
	{
		$("#use_facebook_radio").click(function (event) {
			$("#registration_avatar_img").show();
			$("#registration_avatar_img").attr("src", picture );
		});
		$("#use_facebook_radio").trigger("click");
	}	
	
	$("#geometric").click(function (event) { 
		var g = guid();
		$("#registration_avatar_img").show();
		$("#registration_avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=identicon&s=128");
	});
	$("#monster").click(function (event) { 
		var g = guid();
		$("#registration_avatar_img").show();
		$("#registration_avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=monsterid&s=128");
	});
	$("#cartoon").click(function (event) { 
		var g = guid();
		$("#registration_avatar_img").show();
		$("#registration_avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=wavatar&s=128");
	});
	$("#retro").click(function (event) { 
		var g = guid();
		$("#registration_avatar_img").show();
		$("#registration_avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=retro&s=128");
	});
	$("#unicorn").click(function (event) { 
		var g = guid();
		$("#registration_avatar_img").show();
		$("#registration_avatar_img").attr("src", "http://unicornify.appspot.com/avatar/" + g + "?s=128");
		$("#unicorn_progress_img").show();
		setTimeout(function() {$("#unicorn_progress_img").hide();}, 2000);
	});
	$("#silhouette").click(function (event) { 
		var g = guid();
		$("#registration_avatar_img").show();
		$("#registration_avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=mm&s=128");
	});
	
	$("#new_user_registration_form").submit(function(event){
		if (!$("#registration_screenname_input").val().match(/^[a-zA-Z]([a-zA-Z0-9]){2,14}$/))
		{
			$("#submit_message_div").text("Screenname must be 3-15 chars, no spaces");
			setTimeout(function() { $("#submit_message_div").text("");}, 3000);
		}
		else if (!$("#registration_password_input").val().match(/^(\w|[!@\-#$%\*]){8,20}$/))
		{
			$("#submit_message_div").text("Password must be 8-20 letters, numbers or !@-#$%*_");
			setTimeout(function() { $("#submit_message_div").text("");}, 3000);
		}
		else if ($("#registration_confirm_input").val() !== $("#registration_password_input").val()) 
		{
			$("#submit_message_div").text("Password and confirm don't match");
			setTimeout(function() { $("#submit_message_div").text("");}, 3000);
		}
		else if ($("#registration_avatar_img").attr("src").indexOf("ajaxSnake.gif") != -1) 
		{
			$("#submit_message_div").text("You must choose an avatar");
			setTimeout(function() { $("#submit_message_div").text("");}, 3000);
		}
		else
		{
			$("#submit_message_div").html("<img src=\"\" + chrome.extension.getURL(\"images/ajaxSnake.gif\") + \"\" style=\"width:16px;height16px;border:0px\">");
			if(login_type === "words")
				email = $("#registration_screenname_input").val() + "@words4chrome.com";
			$.ajax({
				type: 'GET',
				url: bg.endpoint,
				data: {
					method: "createUser",
					login_type: login_type,
					social_access_token: social_access_token,
					screenname: $("#registration_screenname_input").val(),
					picture: $("#registration_avatar_img").attr("src"),
					email: email,
					password: $("#registration_password_input").val(),
					useragent: navigator.userAgent
				},
				dataType: 'json',
				async: true,
				success: function (data, status) {
					//alert("ajax success");
					if(data.response_status === "error")
					{
						$("#submit_message_div").text(data.message);
						setTimeout(function() {$("#submit_message_div").text("");}, 2000);
					}
					else if(data.response_status === "success")
					{
						$("#message_div").show();
						docCookies.setItem("screenname", data.screenname, 31536e3);
						docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
						doReallyFinished();
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					console.log(textStatus, errorThrown);
					displayMessage("Unable to create WORDS account. Can't reach network.<br>Please check your internet connection and try again.<br>If you continue to have trouble, please contact us.", "red");
				} 
			});
		}	
		return false;
	});
	
	$("#google_login_img").click(function(event){
		window.location = chrome.extension.getURL('receiver.html') + "?login_type=google";
	});
	$("#google_login_img").mouseover( function() {
		$("#google_login_img").attr("src", chrome.extension.getURL("images/google_button_24x24_mo.png"));
	});
	$("#google_login_img").mouseout( function() {
		$("#google_login_img").attr("src", chrome.extension.getURL("images/google_button_24x24.png"));
	});
	$("#facebook_login_img").click(function(event){
		window.location = chrome.extension.getURL('receiver.html') + "?login_type=facebook";
	});
	$("#facebook_login_img").mouseover( function() {
		$("#facebook_login_img").attr("src", chrome.extension.getURL("images/facebook_button_24x24_mo.png"));
	});
	$("#facebook_login_img").mouseout( function() {
		$("#facebook_login_img").attr("src", chrome.extension.getURL("images/facebook_button_24x24.png"));
	});
		
}

function doFinished(social_access_token, screenname, this_access_token)
{
	// we've gotten the login return, now we need to get the user before we can safely say, 
	displayMessage("Identify verified. Loading WORDS user info... ", "black");
	$("#content_div").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\">");
	//alert("receiver getUserSelf()");
	$.ajax({ 
		type: 'GET', 
		url: bg.endpoint, 
		data: {
            method: "getUserSelf",
            screenname: screenname,						
            this_access_token: this_access_token
        },
        dataType: 'json', 
        async: true, 
        timeout: 20000,
        success: function (data, status) {
        	$("#content_div").html("");
        	if (data.response_status === "error") 
        	{
        		displayMessage("doFinished(): " + data.message, "red");
        		if(data.error_code && data.error_code === "0000")
        		{
        			docCookies.removeItem("screenname"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        		}
        	} 
        	else if (data.response_status === "success") 
        	{	
        		//alert("receiver: getUserSelf success");
        		var existing_pic = "";
        		if(data.user_jo) 
        		{ 	
        			bg.user_jo = data.user_jo; 
        			if(typeof data.user_jo.picture !== "undefined" && data.user_jo.picture !== null)
        				existing_pic = data.user_jo.picture;
        		}
        		
        		//alert("receiver: asking about ");
    			var message = "";
        		message = message + "<div style=\"width:360px;padding:15px\">";
        		message = message + "	<div style=\"font-weight:bold;font-size:14px;padding-bottom:30px\">";
        		message = message + "		You are now logged in.";
        		message = message + "	</div>";
        		message = message + "	<div id=\"image_choice_progress_div\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\"></div>";
        		message = message + "	<div id=\"image_choice_div\" style=\"display:none\">";
        		message = message + " 		Use your " + capitalized_login_type  + " image as your WORDS profile pic?";
        		message = message + "		<table style=\"padding-top:0px;margin-right:auto;margin-left:auto\">";
        		message = message + "			<tr>";
        		message = message + "				<td style=\"text-align:center;padding-right:10px\">";
        		message = message + "					<table style=\"padding-top:10px;margin-right:auto;margin-left:auto\">";
        		message = message + "						<tr>";
        		message = message + "							<td style=\"text-align:center\">";
        		message = message + "								" + capitalized_login_type + " picture";
        		message = message + "							</td>";
        		message = message + "						</tr>";
        		message = message + "						<tr>";
        		message = message + "							<td style=\"text-align:center\">";
        		message = message + "								<img id=\"social_img\" src=\"images/48avatar_ghosted.png\" style=\"width:48px;height:48px\">";
        		message = message + "							</td>";
        		message = message + "						</tr>";
        		message = message + "						<tr>";
        		message = message + "							<td style=\"text-align:center\">";
        		message = message + "								<a href=\"#\" id=\"yes_link\">Yes</a>";
        		message = message + "							</td>";
        		message = message + "						</tr>";
        		message = message + "					</table>";
        		message = message + "				</td>";
        		message = message + "				<td style=\"text-align:center\">";
        		message = message + "					<table style=\"padding-top:10px;padding-left:10px;margin-right:auto;margin-left:auto\">";
        		message = message + "						<tr>";
        		message = message + "							<td style=\"text-align:center\">";
        		message = message + "								Your current picture";
        		message = message + "							</td>";
        		message = message + "						</tr>";
        		message = message + "						<tr>";
        		message = message + "							<td style=\"text-align:center\">";
        		message = message + "								<img id=\"existing_img\" src=\"images/48avatar_ghosted.png\" style=\"width:48px;height:48px\">";
        		message = message + "							</td>";
        		message = message + "						</tr>";
        		message = message + "						<tr>";
        		message = message + "							<td style=\"text-align:center\">";
        		message = message + "								<a href=\"#\" id=\"no_link\">No, use current</a>";
        		message = message + "							</td>";
        		message = message + "						</tr>";
        		message = message + "					</table>";
        		message = message + "				</td>";
        		message = message + "			</tr>";
        		message = message + "			<tr>";
        		message = message + "				<td colspan=2 style=\"text-align:center;padding-top:20px;font-style:italic;font-size:11px\">";
        		message = message + " 					If these are the same, simply <a href=\"#\" id=\"close_this_tab_link\">close this tab</a>. If you've recently changed your profile pic, it may take time to update here.";
        		message = message + "				</td>";
        		message = message + "			</tr>";
        		message = message + "		</table>";
        		message = message + "	</div>";
        		message = message + "</div>";
        		$("#message_div").html(message);
        			
        		$("#close_this_tab_link").click( function (event) { event.preventDefault();
        		chrome.tabs.getSelected(null, function(tab) { 
        			var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
        			chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
        			docCookies.removeItem("last_tab_id");
        			chrome.tabs.remove(tab.id);
        			});
        		});
        		
        		var social_pic = null;
        		$.ajax({
        			type: 'GET',
        			url: bg.endpoint,
        			data: {
        				method: "getSocialPicture",
        				social_access_token: social_access_token,
        				login_type: login_type
        			},
        			dataType: 'json',
        			async: true,
        			success: function (data, status) {
        				
        				if(data.response_status === "error")
        				{
        					// should never ever ever happen as we've JUST gotten the token info to get to this point.
        					return "error";
        				}
        				else if(data.response_status === "success")
        				{
        					social_pic = data.picture;
        					if(social_pic === existing_pic)
        						doReallyFinished();
        					else
        					{
        						$("#image_choice_div").show();
        						$("#image_choice_progress_div").hide();
        						$("#social_img").attr("src", social_pic);
        						$("#existing_img").attr("src", existing_pic);
        					}
        					
        				}	
        			},
        			error: function (XMLHttpRequest, textStatus, errorThrown) {
        				console.log(textStatus, errorThrown);
        				displayMessage("Couldn't retrieve picture. Network connection? Please try again later.", "red");
        				return error;
        			} 
        		});  
        		
        		$("#yes_link").click( function (event) { event.preventDefault();
        			$.ajax({
            			type: 'GET',
            			url: bg.endpoint,
            			data: {
            				method: "savePicture",
            				screenname: docCookies.getItem("screenname"),							
            				this_access_token: docCookies.getItem("this_access_token"),	
            				picture: social_pic
            			},
            			dataType: 'json',
            			async: true,
            			success: function (data, status) {
            				bg.user_jo.picture = social_pic;
            			},
            			error: function (XMLHttpRequest, textStatus, errorThrown) {
            				console.log(textStatus, errorThrown);
            			} 
            		});  
        			doReallyFinished();
        		});
        		$("#no_link").click( 	function (event) { event.preventDefault();
        			doReallyFinished();
        		});	
            	
        	}
        	else
        	{
        		console.log("getUserSelf response not success or error. Should never happen. Deleting cookies to allow user to start over from scratch, just in case.");
        		docCookies.removeItem("screenname"); 
        		docCookies.removeItem("this_access_token");
        		bg.user_jo = null;
        	}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	$("#content_div").html("");
        	if(errorThrown != null && errorThrown === "timeout")
        	{
        		displayMessage("Timeout retrieving WORDS user info.", "red");
        	}	
            console.log(textStatus, errorThrown);
        } 
	});
	
}

function doReallyFinished()
{
	$("#message_div").html("<div style=\"width:360px;padding:15px\"><div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">You are now logged in.</div><a href=\"#\" id=\"close_this_tab_link\">Close this tab</a></div>");
	
	// tips html formation
	var str = "";
	str = str + "<div style=\"width:360px;padding:15px;border-top:1px solid black\">";
	str = str + "<p style=\"font-weight:bold;text-align:left\">Remember to downvote the following:</p>";
	str = str + "<p style=\"text-align:left\">Racism, trolling, general meanness, comments that should be upvotes instead (e.g. \"I love this site\", \"Me too!\"), out-of-place political/religious discussion, lolspeak and shoddy spelling/punctuation.</p>";
	str = str + "<p style=\"font-weight:bold;text-align:center\">Have fun and be nice!</p></div>";
	
	// end tips html formation
	
	$("#content_div").html(str);//OK
	
	$("#close_this_tab_link").click( function (event) { event.preventDefault();
		chrome.tabs.getSelected(null, function(tab) { 
			var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
			chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
			docCookies.removeItem("last_tab_id");
			chrome.tabs.remove(tab.id);
		});
	});
}