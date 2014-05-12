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
    if (results === null) return "";
    else return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// here's how this flow works
// if(there a "code" parameter)
//		get it and poll the Words backend to exchange it for a real token. Backend automatically takes the resulting code and gets a tat
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

var code = getParameterByName("code");
var login_type = getParameterByName("login_type");
var capitalized_login_type = "Unknown";
if(login_type !== null && login_type.length > 1)
	capitalized_login_type = login_type.charAt(0).toUpperCase() + login_type.slice(1);

if(code !== null && code !== "")
{
	// login_type gets passed through the oauth scheme. so it's always there. No need to try to get it again here.
	displayMessage("Verifying your identity with " + capitalized_login_type + "... ", "black");
	$("#progress_tr").show();
	$.ajax({
		type: 'get',
		url: bg.endpoint,
		data: {
			method: "getAccessTokenFromAuthorizationCode",
			code: getParameterByName("code"),
			login_type: login_type
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if(data.response_status === "error")
			{
				displayMessage("error getting access_token from " + login_type, "red");
				$("#progress_tr").hide();
				if(data.error_code === "0000" && data.login_type === "facebook")
				{
					docCookies.removeItem("last_tab_id");
					docCookies.removeItem("facebook_access_token");
					docCookies.removeItem("facebook_access_token_expires");
					docCookies.removeItem("email");
					docCookies.removeItem("this_access_token");
				}	
				if(data.error_code === "0000" && data.login_type === "google")
				{
					docCookies.removeItem("last_tab_id");
					docCookies.removeItem("google_access_token");
					docCookies.removeItem("google_access_token_expires");
					docCookies.removeItem("email");
					docCookies.removeItem("this_access_token");
				}	
			}
			else if(data.response_status === "success")
			{
				$("#progress_tr").hide();
				if(data.show_registration === "true" && data.login_type === "facebook")
				{
					//alert("getAccessTokenFromAuthorizationCode() show registration=true");
					docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
					docCookies.setItem("facebook_access_token_expires", data.facebook_access_token_expires, 31536e3);
					docCookies.setItem("email", data.email, 31536e3);
					showRegistration(data.picture, data.login_type, data.email);
				}
				else if(data.show_registration === "false" && data.login_type === "facebook")
				{
					//alert("getAccessTokenFromAuthorizationCode() show registration=false");
					docCookies.setItem("email", data.email, 31536e3);
					docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
					docCookies.setItem("facebook_access_token_expires", data.facebook_access_token_expires, 31536e3);
		    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
		    		doFinished();
				}	
				if(data.show_registration === "true" && data.login_type === "google")
				{
					//alert("gATFAC: show registration=true\nexpires=" + data.google_access_token_expires + "\nrefresh=" + data.google_refresh_token);
					docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
					docCookies.setItem("google_access_token_expires", data.google_access_token_expires, 31536e3);
					docCookies.setItem("email", data.email, 31536e3);
					showRegistration(data.picture, data.login_type, data.email);
				}
				else if(data.show_registration === "false" && data.login_type === "google")
				{
					//alert("getAccessTokenFromAuthorizationCode() show registration=false");
					docCookies.setItem("email", data.email, 31536e3);
					docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
					docCookies.setItem("google_access_token_expires", data.google_access_token_expires, 31536e3);
		    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
		    		doFinished();
				}	
			}	
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			displayMessage("Could not retrieve access token. Please try again through the Words extension. (AJAX)", "red");
		} 
	}); 
}	
else
{
	var capitalized_login_type = login_type.charAt(0).toUpperCase() + login_type.slice(1);
	displayMessage("Verifying your identity with " + capitalized_login_type + "... ", "black");
	if(login_type === "google")
	{
		var access_token_expired_or_doesnt_exist = true;
		if(docCookies.getItem("google_access_token_expires") != null && docCookies.getItem("google_access_token") != null) // ok, the token/expires cookies exist
		{
			var ex = docCookies.getItem("google_access_token_expires");
			if(ex > bg.msfe_according_to_backend) 
				access_token_expired_or_doesnt_exist = false; // and it appears valid
			else 
			{												// it existed, but wasn't valid. Delete everything
				docCookies.removeItem("last_tab_id");
				docCookies.removeItem("google_access_token");
				docCookies.removeItem("google_access_token_expires");
				docCookies.removeItem("email");
				docCookies.removeItem("this_access_token");
				access_token_expired_or_doesnt_exist = true;
			}	
		}	
		if(access_token_expired_or_doesnt_exist)
		{
			//displayMessage("Didn't find valid google_access_token and google_access_token_expires cookies. Redirecting to google.", "black");
			var google_url = 'https://accounts.google.com/o/oauth2/auth?' +
		      'scope=profile email&' +
		      'redirect_uri=urn:ietf:wg:oauth:2.0:oob&'+
		      'response_type=code&' +
		      'client_id=591907226969-rrjdbkf5ugett5nspi518gkh3qs0ghsj.apps.googleusercontent.com&' +
		      'access_type=offline';
			window.location = google_url;
		}
		else // use the apparently valid access token to log the user in.
		{
			displayMessage("Existing Google credentials appear valid. Logging you into Words... ", "black");
			login("google", docCookies.getItem("google_access_token"), docCookies.getItem("google_access_token_expires"));
		}
	}
	else if(login_type === "facebook")
	{
		var access_token_expired_or_doesnt_exist = true;
		if(docCookies.getItem("facebook_access_token_expires") != null && docCookies.getItem("facebook_access_token") != null) // ok, the token/expires cookies exist
		{
			var ex = docCookies.getItem("facebook_access_token_expires");
			if(ex > bg.msfe_according_to_backend) 
				access_token_expired_or_doesnt_exist = false; // and it appears valid
			else 
			{												// it existed, but wasn't valid. Delete everything
				docCookies.removeItem("last_tab_id");
				docCookies.removeItem("facebook_access_token");
				docCookies.removeItem("facebook_access_token_expires");
				docCookies.removeItem("email");
				docCookies.removeItem("this_access_token");
				access_token_expired_or_doesnt_exist = true;
			}	
		}	
		if(access_token_expired_or_doesnt_exist)
		{
			//displayMessage("Didn't find valid facebook_access_token and facebook_access_token_expires cookies. Redirecting to google.", "black");
			var facebook_url = "https://www.facebook.com/dialog/oauth?client_id=271212039709142&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=email";
			window.location = facebook_url;
		}
		else // use the apparently valid access token to log the user in.
		{
			displayMessage("Existing Facebook credentials appear valid. Logging you into Words... ", "black");
			login("facebook", docCookies.getItem("facebook_access_token"), docCookies.getItem("facebook_access_token_expires"));
		}
	}	
}	


function login(login_type, social_access_token, social_access_token_expires)
{
	$("#progress_tr").show();
	$.ajax({
		type: 'GET',
		url: bg.endpoint,
		data: {
			method: "login",
			social_access_token: social_access_token,
			social_access_token_expires: social_access_token_expires,
			login_type: login_type
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if(data.response_status === "error")
			{
				$("#progress_tr").hide();
				if(data.error_code == "0000" && data.login_type === "facebook")
				{
					docCookies.removeItem("last_tab_id");
					docCookies.removeItem("facebook_access_token");
					docCookies.removeItem("facebook_access_token_expires");
					docCookies.removeItem("email");
					docCookies.removeItem("this_access_token");
				}	
				if(data.error_code == "0000" && data.login_type === "google")
				{
					docCookies.removeItem("last_tab_id");
					docCookies.removeItem("google_access_token");
					docCookies.removeItem("google_access_token_expires");
					docCookies.removeItem("email");
					docCookies.removeItem("this_access_token");
				}	
				displayMessage(data.message, "red");
				$("#registration_form_td").html("<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>");//OK
				$("#registration_form_td").show();
				$("#close_this_tab_link").click( function () {
					chrome.tabs.getSelected(null, function(tab) { 
						chrome.tabs.remove(tab.id);
					});
				});
				
			}
			else if(data.response_status === "success")
			{
				$("#progress_tr").hide();
				if(data.show_registration === "true" && data.login_type === "google")
				{
					//alert("login: show registration=true\nexpires=" + data.google_access_token_expires + "\nrefresh=" + data.google_refresh_token);
					docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
					docCookies.setItem("google_access_token_expires", data.google_access_token_expires, 31536e3);
					docCookies.setItem("email", data.email, 31536e3);
					showRegistration(data.picture, data.login_type, data.email);
				}
				else if(data.show_registration === "false" && data.login_type === "google")
				{
					//alert("login() show registration=false");
					docCookies.setItem("email", data.email, 31536e3);
					docCookies.setItem("google_access_token", data.facebook_access_token, 31536e3);
					docCookies.setItem("google_access_token_expires", data.google_access_token_expires, 31536e3);
		    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
		    		doFinished();
				}	
				else if(data.show_registration === "true" && data.login_type === "facebook")
				{
					docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
					docCookies.setItem("facebook_access_token_expires", data.facebook_access_token_expires, 31536e3);
					docCookies.setItem("email", data.email, 31536e3);
					showRegistration(data.picture, data.login_type, data.email);
				}
				else if(data.show_registration === "false" && data.login_type === "facebook")
				{
					//alert("login() show registration=false");
					docCookies.setItem("email", data.email, 31536e3);
					docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
					docCookies.setItem("facebook_access_token_expires", data.facebook_access_token_expires, 31536e3);
		    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
		    		doFinished();
				}	
			}	
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			//alert("loginWithGoogle ajax failure");
			console.log(textStatus, errorThrown);
			displayMessage("Could not log you in. Network connection? (AJAX)", "red");
		} 
	});  
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

function showRegistration(picture, login_type, email)
{
	$("#message_td").css("font-weight", "bold");
	$("#message_td").text("Welcome! Let's create a Words account for you.");
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
	
	$("#use_google_radio").click(function () {
		$("#avatar_img").attr("src", picture);
	});
	$("#use_facebook_radio").click(function () {
		$("#avatar_img").attr("src", picture );
	});
	$("#use_geometric_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=identicon&s=128");
	});
	$("#use_monster_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=monsterid&s=128");
	});
	$("#use_cartoonface_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=wavatar&s=128");
	});
	$("#use_retro_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=retro&s=128");
	});
	$("#use_unicorn_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://unicornify.appspot.com/avatar/" + g + "?s=128");
		$("#unicorn_wait_span").text("Wait...");
		setTimeout(function() {$("#unicorn_wait_span").text("");}, 2000);
	});
	$("#use_silhouette_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=mm&s=128");
	});
	//EVENT HANDLERS

	$("#not_you_link").click(function () {
		docCookies.removeItem("email");
		docCookies.removeItem("last_tab_id");
		docCookies.removeItem("google_access_token");
		docCookies.removeItem("this_access_token");
		docCookies.removeItem("facebook_access_token");
		$("#registration_form_td").html("<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>");//OK
		$("#registration_form_td").show();
		$("#message_td").text("The existing user information has been removed. Please start the login process again.");
		
		$("#close_this_tab_link").click( function () {
			chrome.tabs.getSelected(null, function(tab) { 
				chrome.tabs.remove(tab.id);
			});
		});
	});

	$("#registration_country_select").change( function() {
		if($("#registration_country_select").val() === "USA")
			$("#registration_state_select_tr").show();
		else
		{
			$("#registration_state_select_tr").hide();
			$("#registration_state_select").val("");
		}
	});
	
	$("#registration_screenname_button").click(
			function () 
			{
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
		
		$("#registration_submit_button").click(
				function () {
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
					
					if($("#registration_country_select").val() === "")
					{
						displayMessage("Select a country.", "red");
						return false;
					}
					
					if($("#registration_country_select").val() === "USA" && $("#registration_state_select").val() === "")
					{
						displayMessage("When you select USA as your country, you must pick a state.", "red");
						return false;
					}
					
					displayMessage("Creating Words account... ", "black");
					$("#progress_tr").show();
					$("#registration_form_td").hide();

					var local_a_t;
					if(login_type === "google")
						local_a_t = docCookies.getItem("google_access_token");
					else if(login_type === "facebook")
						local_a_t = docCookies.getItem("facebook_access_token");
					$.ajax({
					    type: 'GET',
					    url: bg.endpoint,
					    data: {
					    	method: "createUser",
					    	login_type: login_type,
					    	social_access_token: local_a_t,
					    	screenname: $("#registration_screenname_input").val(),
					    	state: $("#registration_state_select").val(),
					    	country: $("#registration_country_select").val(),
					    	picture: picture,
					    	email: docCookies.getItem("email"),
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
		    		    		doFinished();
					    	}
					    },
					    error: function (XMLHttpRequest, textStatus, errorThrown) {
					        console.log(textStatus, errorThrown);
					        displayMessage("Unable to create Words account. Can't reach network.<br>Please check your internet connection and try again.<br>If you continue to have trouble, please contact us.", "red");
					    } 
					});
				});
}







function doFinished()
{
	// we've gotten the login return, now we need to get the user before we can safely say, 
	displayMessage("Identify verified. Loading Words user info... ", "black");
	$("#progress_tr").show();
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
        		if(data.user_jo) { 	bg.user_jo = data.user_jo; }
        		$("#message_td").html("<div style=\"width:360px;padding:15px\"><div style=\"font-weight:bold;font-size:14px;padding-bottom:15px\">You are now logged in.</div><a href=\"#\" id=\"close_this_tab_link\">Close this tab</a></div>");
        		
        		// tips html formation
        		var str = "";
        		str = str + "<div style=\"width:360px;padding:15px;border-top:1px solid black\">";
        		str = str + "<p style=\"font-weight:bold;text-align:left\">Remember to downvote the following:</p>";
        		str = str + "<p style=\"text-align:left\">Name-calling, racism, ALL CAPS, trolling, comments that should be upvotes instead (e.g. \"I love this site\", \"Me too!\"), out-of-place political/religious discussion, profanity aimed at another user, lolspeak and aggressively shoddy spelling/punctuation.</p>";
        		str = str + "<p style=\"font-weight:bold;text-align:center\">HAVE FUN!</p></div>";
        		
        		// end tips html formation
        		
        		$("#registration_form_td").html(str);//OK
        		$("#registration_form_td").show();
        		
        		$("#close_this_tab_link").click( function () {
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
        		console.log("getUserSelf response not success or error. Should never happen. Deleting cookies to allow user to start over from scratch, just in case.");
        		docCookies.removeItem("email"); 
        		docCookies.removeItem("this_access_token");
        		bg.user_jo = null;
        	}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	if(errorThrown != null && errorThrown === "timeout")
        	{
        		displayMessage("Timeout retrieving Words user info.", "red");
        	}	
            console.log(textStatus, errorThrown);
        } 
	});
	
}
