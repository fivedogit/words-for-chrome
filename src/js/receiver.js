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
		dom_id = "message_td";
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
	docCookies.removeItem("email");
	docCookies.removeItem("this_access_token");
	var logout_msg = "";
	logout_msg = logout_msg + "<div style=\"width:360px;padding:15px\">";
	logout_msg = logout_msg + "	<div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">";
	logout_msg = logout_msg + "		You are now logged out.";
	logout_msg = logout_msg + "	</div>";
	logout_msg = logout_msg + "	<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>";
	logout_msg = logout_msg + "</div>";
	$("#message_td").html(logout_msg);
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
	if(login_type === "google" && chrome.runtime.id === "mpefojdpeaiaepbgjjmnanepdkhoeeii")
		client_id = "591907226969-jp2s464475jft1qgs3phb531f62jug48.apps.googleusercontent.com";
	else if(login_type === "google" && chrome.runtime.id === "lgdfecngaioibcmfbfpeeddgkjfdpgij")
		client_id = "591907226969-ct58tt67m00b8fjd9b92gfl5aiq0jva6.apps.googleusercontent.com";
	else //fb
	    client_id = "271212039709142";
	if(login_type === "google" && code === "undefined") // if google user clicks "cancel" 
	{
		$("#progress_tr").hide();
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
		$("#message_td").html(google_cancel_message);
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
		$("#progress_tr").hide();
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
		$("#message_td").html(facebook_cancel_message);
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
		//alert("receiver: no code");
		displayMessage("Requesting login permission from " + capitalized_login_type + ". A popup window should appear momentarily.", "black");
		$("#progress_tr").show();
		
		if(login_type === "google")
		{
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
					$("#progress_tr").hide();
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
					$("#message_td").html(google_close_message);
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
		}
		else if(login_type === "facebook")
		{
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
					$("#progress_tr").hide();
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
					$("#message_td").html(facebook_close_message);
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
		}	
		else
		{
			alert("Unknown login type");
		}	
		
	}	
	else if(code !== null && code !== "")
	{
		//alert("receiver: code exists");
		// login_type gets passed through the oauth scheme. so it's always there. No need to try to get it again here.
		//alert("parsing code, going to getAccessTokenFromAuthorizationCode with redirect_uri=" + getParameterByName("redirect_uri"));
		displayMessage("Verifying your identity with " + capitalized_login_type + "... ", "black");
		$("#progress_tr").show();
		
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
				if(data.response_status === "error")
				{
					displayMessage(data.message, "red");
					$("#progress_tr").hide();
					if(data.login_type === "facebook")
					{
						var msg = "";
						msg = msg + "<div style=\"margin-right:auto;margin-left:auto;width:360px;padding:15px;font-style:italic\">If you're having trouble or want to switch Facebook accounts, <b>try restarting your browser</b> and logging back in.<br><br><a href=\"#\" id=\"close_this_tab_link\">Close this tab</a></div>";
						$("#registration_form_td").html(msg);//OK
						$("#registration_form_td").show();
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
						$("#registration_form_td").html(msg);//OK
						$("#registration_form_td").show();
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
						docCookies.removeItem("last_tab_id");
						docCookies.removeItem("email");
						docCookies.removeItem("this_access_token");
					}	
					else if(data.error_code === "0000" && data.login_type === "google")
					{
						//alert("delete token here.");
						docCookies.removeItem("last_tab_id");
						docCookies.removeItem("email");
						docCookies.removeItem("this_access_token");
					}	
				}
				else if(data.response_status === "success")
				{
					$("#progress_tr").hide();
					if(data.show_registration === "true" && data.login_type === "facebook")
					{
						docCookies.setItem("email", data.email, 31536e3);
						showRegistration(data.picture, data.login_type, data.email, data.facebook_access_token);
					}
					else if(data.show_registration === "false" && data.login_type === "facebook")
					{
						//alert("receiver: fb login success, showing no registration, going to doFinished()");
						docCookies.setItem("email", data.email, 31536e3);
			    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
			    		doFinished(false, data.facebook_access_token);
					}	
					if(data.show_registration === "true" && data.login_type === "google")
					{
						docCookies.setItem("email", data.email, 31536e3);
						showRegistration(data.picture, data.login_type, data.email, data.google_access_token);
					}
					else if(data.show_registration === "false" && data.login_type === "google")
					{
						//alert("receiver: g+ login success, showing no registration, going to doFinished()");
						docCookies.setItem("email", data.email, 31536e3);
			    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
			    		doFinished(false, data.google_access_token);
					}	
				}	
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
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

function showRegistration(picture, login_type, email, social_access_token)
{
	$("#message_td").css("font-weight", "bold");
	$("#message_td").text("Welcome! Let's create a WORDS account for you.");
	if(!picture)
	{
		$("#use_google_tr").hide();
		$("#use_facebook_tr").hide();
	}
	else
	{
		if(login_type === "google")
		{
			$("#use_facebook_tr").hide();
			$("#use_google_radio").prop('checked', true);
		}
		else if(login_type === "facebook")
		{
			$("#use_google_tr").hide();
			$("#use_facebook_radio").prop('checked', true);
		}
		
		$("#avatar_img").attr("src", picture);
	}
	$("#registration_email_td").text(email);
	$("#registration_form_td").show();
	
	$("#use_google_radio").click(function (event) { 
		$("#avatar_img").attr("src", picture);
	});
	$("#use_facebook_radio").click(function (event) { 
		$("#avatar_img").attr("src", picture );
	});
	$("#use_geometric_radio").click(function (event) { 
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=identicon&s=128");
	});
	$("#use_monster_radio").click(function (event) { 
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=monsterid&s=128");
	});
	$("#use_cartoonface_radio").click(function (event) { 
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=wavatar&s=128");
	});
	$("#use_retro_radio").click(function (event) { 
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=retro&s=128");
	});
	$("#use_unicorn_radio").click(function (event) { 
		var g = guid();
		$("#avatar_img").attr("src", "http://unicornify.appspot.com/avatar/" + g + "?s=128");
		$("#unicorn_wait_span").text("Wait...");
		setTimeout(function() {$("#unicorn_wait_span").text("");}, 2000);
	});
	$("#use_silhouette_radio").click(function (event) { 
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=mm&s=128");
	});
	//EVENT HANDLERS

	$("#not_you_link").click(function (event) { event.preventDefault();
		docCookies.removeItem("email");
		docCookies.removeItem("last_tab_id");
		docCookies.removeItem("this_access_token");
		$("#registration_form_td").html("<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>");//OK
		$("#registration_form_td").show();
		$("#message_td").text("The existing user information has been removed. Please start the login process again.");
		
		$("#close_this_tab_link").click( function (event) { event.preventDefault();
			chrome.tabs.getSelected(null, function(tab) { 
				chrome.tabs.remove(tab.id);
			});
		});
	});
	
	$("#registration_screenname_button").click( function (event) { event.preventDefault();
		$("#screenname_availability_span").text("Checking...");
		if ($("#registration_screenname_input").val().length <= 0) 
		{
			$("#screenname_availability_span").css("color", "red");
			$("#screenname_availability_span").text("Blank");
			setTimeout(function() { $("#screenname_availability_span").text("");}, 3000);
		} 
		else if ($("#registration_screenname_input").val().length < 6) 
		{
			$("#screenname_availability_span").css("color", "red");
			$("#screenname_availability_span").text("Too short");
			setTimeout(function() { $("#screenname_availability_span").text("");}, 3000);
		} 
		else 
		{
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
			return;
		}
	});					
		
	$("#registration_submit_button").click( function (event) {	event.preventDefault();
		if($("#registration_screenname_input").val() === "")
		{
			displayMessage("Choose a screenname.", "red");
			return false;
		}	
		
		if($("#registration_screenname_input").val().length > 20)
		{
			displayMessage("Screennames must be less than 21 characters.", "red");
			return false;
		}	
		
		if($("#registration_screenname_input").val().length < 6)
		{
			displayMessage("Screennames must be at least 6 characters.", "red");
			return false;
		}	
		
		var avatar_str = null;
		var picture = $("#avatar_img").attr("src");		
		
		displayMessage("Creating WORDS account... ", "black");
		$("#progress_tr").show();
		$("#registration_form_td").hide();	
		
		$.ajax({
			type: 'GET',
			url: bg.endpoint,
			data: {
				method: "createUser",
				login_type: login_type,
				social_access_token: social_access_token,
				screenname: $("#registration_screenname_input").val(),
				picture: picture,
				email: email,
				useragent: navigator.userAgent
			},
			dataType: 'json',
			async: true,
			success: function (data, status) {
				//alert("ajax success");
				if(data.response_status === "error")
				{
					$("#progress_tr").hide();
					displayMessage(data.message, "red");
					$("#registration_form_td").show();
				}
				else
				{
					$("#progress_tr").hide();
					docCookies.setItem("email", data.email, 31536e3);
					docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
					doFinished(true, social_access_token);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				displayMessage("Unable to create WORDS account. Can't reach network.<br>Please check your internet connection and try again.<br>If you continue to have trouble, please contact us.", "red");
			} 
		});
	});
}

function doFinished(from_registration, social_access_token)
{
	//alert("receiver: doFinished from_reg=" + from_registration);
	// we've gotten the login return, now we need to get the user before we can safely say, 
	displayMessage("Identify verified. Loading WORDS user info... ", "black");
	
	$("#progress_tr").show();
	//alert("receiver getUserSelf()");
	$.ajax({ 
		type: 'GET', 
		url: bg.endpoint, 
		data: {
            method: "getUserSelf",
            email: docCookies.getItem("email"),							
            this_access_token: docCookies.getItem("this_access_token")	
        },
        dataType: 'json', 
        async: true, 
        timeout: 20000,
        success: function (data, status) {
        	var existing_pic = data.user_jo.picture;
        	if (data.response_status === "error") 
        	{
        		$("#progress_tr").hide();
        		displayMessage(data.message, "red");
        		if(data.error_code && data.error_code === "0000")
        		{
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        		}
        	} 
        	else if (data.response_status === "success") 
        	{	
        		$("#progress_tr").hide();
        		//alert("receiver: getUserSelf success");
        		if(data.user_jo) { 	bg.user_jo = data.user_jo; }
        		
        		if(from_registration === false) // don't ask them if they've just come from registration
        		{	
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
            		$("#message_td").html(message);
            		
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
                				email: docCookies.getItem("email"),							
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
        		else // this person is coming from registration where they just chose their image. Don't ask them twice in a row.
        		{
        			doReallyFinished();
        		}
        	}
        	else
        	{
        		console.log("getUserSelf response not success or error. Should never happen. Deleting cookies to allow user to start over from scratch, just in case.");
        		docCookies.removeItem("email"); 
        		docCookies.removeItem("this_access_token");
        		bg.user_jo = null;
        	}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
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
	$("#message_td").html("<div style=\"width:360px;padding:15px\"><div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">You are now logged in.</div><a href=\"#\" id=\"close_this_tab_link\">Close this tab</a></div>");
	
	// tips html formation
	var str = "";
	str = str + "<div style=\"width:360px;padding:15px;border-top:1px solid black\">";
	str = str + "<p style=\"font-weight:bold;text-align:left\">Remember to downvote the following:</p>";
	str = str + "<p style=\"text-align:left\">Racism, trolling, general meanness, comments that should be upvotes instead (e.g. \"I love this site\", \"Me too!\"), out-of-place political/religious discussion, lolspeak and shoddy spelling/punctuation.</p>";
	str = str + "<p style=\"font-weight:bold;text-align:center\">Have fun and be nice!</p></div>";
	
	// end tips html formation
	
	$("#registration_form_td").html(str);//OK
	$("#registration_form_td").show();
	
	$("#close_this_tab_link").click( function (event) { event.preventDefault();
		chrome.tabs.getSelected(null, function(tab) { 
			var last_tab_id_int = docCookies.getItem("last_tab_id") * 1;
			chrome.tabs.update(last_tab_id_int,{"active":true}, function(tab) {});
			docCookies.removeItem("last_tab_id");
			chrome.tabs.remove(tab.id);
		});
	});
}