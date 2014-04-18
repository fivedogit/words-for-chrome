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
	$("#" + dom_id).html(inc_message);
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
var login_type = getParameterByName("login_type");
var capitalized_login_type = login_type.charAt(0).toUpperCase() + login_type.slice(1);
if(login_type === "native")
	displayMessage("Verifying your identity... <img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">", "black");
else
	displayMessage("Verifying your identity with " + capitalized_login_type + "... <img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">", "black");

if(getParameterByName("social_access_token") != null && getParameterByName("social_access_token") !== "" && 
		getParameterByName("social_access_token") !== "null" && getParameterByName("social_access_token") !== "undefined") // user is asserting an access token, try to login only (no registration)
{
	//alert("pure login");
	// a social_access_token qsp is being asserted, try pure login
	$.ajax({
		type: 'GET',
		url: bg.endpoint,
		data: {
			method: "login",
			social_access_token: getParameterByName("social_access_token"),
			login_type: login_type
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if(data.response_status === "error")
			{
				displayMessage(data.message, "red");
				if(data.error_code == "0000" && data.login_type === "facebook")
				{
					docCookies.removeItem("last_tab_id");
					docCookies.removeItem("facebook_access_token");
					docCookies.removeItem("email");
					docCookies.removeItem("this_access_token");
				}	
				if(data.error_code == "0000" && data.login_type === "google")
				{
					docCookies.removeItem("last_tab_id");
					docCookies.removeItem("google_access_token");
					docCookies.removeItem("email");
					docCookies.removeItem("this_access_token");
				}	
			}
			else if(data.response_status === "success")
			{
				if(data.show_registration === "true" && data.login_type === "google")
				{
					//alert("login() show registration=true");
					docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
					docCookies.setItem("email", data.email, 31536e3);
					showRegistration(data.picture, data.login_type, data.email);
				}
				else if(data.show_registration === "false" && data.login_type === "google")
				{
					//alert("login() show registration=false");
					docCookies.setItem("email", data.email, 31536e3);
					docCookies.setItem("google_access_token", data.facebook_access_token, 31536e3);
		    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
		    		doFinished();
				}	
				else if(data.show_registration === "true" && data.login_type === "facebook")
				{
					//alert("login() show registration=true");
					docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
					docCookies.setItem("email", data.email, 31536e3);
					showRegistration(data.picture, data.login_type, data.email);
				}
				else if(data.show_registration === "false" && data.login_type === "facebook")
				{
					//alert("login() show registration=false");
					docCookies.setItem("email", data.email, 31536e3);
					docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
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
else if(getParameterByName("social_access_token") === null || getParameterByName("social_access_token") === "") // user is claiming no access token, just register
{	
		//alert("polling backend for access token from auth code")
		// get access token from code, with built-in login
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
					if(data.error_code === "0000" && data.login_type === "facebook")
					{
						docCookies.removeItem("last_tab_id");
						docCookies.removeItem("facebook_access_token");
						docCookies.removeItem("email");
						docCookies.removeItem("this_access_token");
					}	
					if(data.error_code === "0000" && data.login_type === "google")
					{
						docCookies.removeItem("last_tab_id");
						docCookies.removeItem("google_access_token");
						docCookies.removeItem("email");
						docCookies.removeItem("this_access_token");
					}	
				}
				else if(data.response_status === "success")
				{
					if(data.show_registration === "true" && data.login_type === "facebook")
					{
						//alert("getAccessTokenFromAuthorizationCode() show registration=true");
						docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
						docCookies.setItem("email", data.email, 31536e3);
						showRegistration(data.picture, data.login_type, data.email);
					}
					else if(data.show_registration === "false" && data.login_type === "facebook")
					{
						//alert("getAccessTokenFromAuthorizationCode() show registration=false");
						docCookies.setItem("email", data.email, 31536e3);
						docCookies.setItem("facebook_access_token", data.facebook_access_token, 31536e3);
			    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
			    		doFinished();
					}	
					if(data.show_registration === "true" && data.login_type === "google")
					{
						//alert("getAccessTokenFromAuthorizationCode() show registration=true");
						docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
						docCookies.setItem("email", data.email, 31536e3);
						showRegistration(data.picture, data.login_type, data.email);
					}
					else if(data.show_registration === "false" && data.login_type === "google")
					{
						//alert("getAccessTokenFromAuthorizationCode() show registration=false");
						docCookies.setItem("email", data.email, 31536e3);
						docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
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
	//weird state for social_access_token. nuke everything
	displayMessage("Bad login state. Please start over. Sorry for the inconvenience.", "red");
	docCookies.removeItem("email");
	docCookies.removeItem("last_tab_id");
	docCookies.removeItem("google_access_token");
	docCookies.removeItem("this_access_token");
	docCookies.removeItem("facebook_access_token");
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
	var mess = "";
	mess = "<b>Welcome! Let's create a Words account for you.</b>";
	$("#message_td").html(mess);
	if(!picture)
	{
		$("#use_google_tr").hide();
		$("#use_facebook_tr").hide();
	}
	else
	{
		if(login_type === "google")
		{
			alert("lit google");
			$("#use_facebook_tr").hide();
		}
		else if(login_type === "facebook")
			$("#use_google_tr").hide();
		
		$("#avatar_img").attr("src", picture);
	}
	$("#registration_email_td").html(email);
	$("#registration_form_td").show();
	
	$("#use_google_radio").click(function () {
		$("#avatar_img").attr("src", picture);
	});
	$("#use_facebook_radio").click(function () {
		$("#avatar_img").attr("src", picture );
	});
	$("#use_geometric_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=identicon");
	});
	$("#use_monster_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=monsterid");
	});
	$("#use_cartoonface_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=wavatar");
	});
	$("#use_retro_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=retro");
	});
	$("#use_unicorn_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://unicornify.appspot.com/avatar/" + g + "?s=96");
	});
	$("#use_silhouette_radio").click(function () {
		var g = guid();
		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=mm");
	});
	//EVENT HANDLERS

	$("#not_you_link").click(function () {
		docCookies.removeItem("email");
		docCookies.removeItem("last_tab_id");
		docCookies.removeItem("google_access_token");
		docCookies.removeItem("this_access_token");
		docCookies.removeItem("facebook_access_token");
		$("#registration_form_td").html("<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>");
		$("#registration_form_td").show();
		var finmess = "<div style=\"font-weight:bold;margin-right:auto;margin-left:auto\">The existing user information has been removed. Please start the login process again.</div>";
		$("#message_td").html(finmess);
		
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
}



$("#registration_screenname_button").click(
		function () 
		{
				$("#screenname_availability_span").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">");
				if ($("#registration_screenname_input").val().length <= 0) 
				{
					$("#screenname_availability_span").css("color", "red");
					$("#screenname_availability_span").html("Blank");
					setTimeout(function() { $("#screenname_availability_span").html("");}, 3000);
				} 
				else if ($("#registration_screenname_input").val().length < 6) 
				{
					$("#screenname_availability_span").css("color", "red");
					$("#screenname_availability_span").html("Too short");
					setTimeout(function() { $("#screenname_availability_span").html("");}, 3000);
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
								$("#screenname_availability_span").html(data.message);
								setTimeout(function() { $("#screenname_availability_span").html("");}, 3000);
							} 
							else if (response_object.response_status === "success") 
							{
								if (response_object.screenname_available === "true") 
								{
									$("#screenname_availability_span").css("color", "green");
									$("#screenname_availability_span").html("Available");
								}
								else if (response_object.screenname_available === "false") 
								{
									$("#screenname_availability_span").css("color", "red");
									$("#screenname_availability_span").html("Unavailable");
								}
								else
								{
									$("#screenname_availability_span").css("color", "red");
									$("#screenname_availability_span").html("Error. Value !t/f.");
								}
								setTimeout(function() { $("#screenname_availability_span").html();}, 3000);
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
				
				if($("#registration_screenname_input").val().length > 15)
				{
					displayMessage("Screennames must be less than 15 characters.", "red");
					return false;
				}	
				
				if($("#registration_screenname_input").val().length < 6)
				{
					displayMessage("Screennames must be at least 6 characters.", "red");
					return false;
				}	
				
				var avatar_str = null;
				var picture = null;
				
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
				
				displayMessage("Creating Words account...", "black");
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
				    	password: $("#registration_password_input").val(),
				    	confirm: $("#registration_confirm_input").val()
				    },
				    dataType: 'json',
				    async: true,
				    success: function (data, status) {
				    	//alert("ajax success");
				    	if(data.response_status === "error")
				    	{
				    		displayMessage(data.message, "red");
				    		$("#registration_form_td").show();
				    	}
				    	else
				    	{
				    		docCookies.setItem("email", data.email, 31536e3);
	    		    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
	    		    		doFinished();
				    	}
				    },
				    error: function (XMLHttpRequest, textStatus, errorThrown) {
				        console.log(textStatus, errorThrown);
				        displayMessage("Unable to create Words account. Can't reach network.<br>Please check your internet connection and try again.<br>If you continue to have trouble, please email w at ords dot co.", "red");
				    } 
				});
			});



function doFinished()
{
	// we've gotten the login return, now we need to get the user before we can safely say, 
	displayMessage("Identify verified. Loading Words user info... <img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">", "black");
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
        		if(data.error_code && data.error_code === "0000")
        		{
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        		}
        	} 
        	else if (data.response_status === "success") 
        	{	
        		if(data.user_jo) { 	bg.user_jo = data.user_jo; }
        		var finmess = "<div style=\"font-weight:bold;margin-right:auto;margin-left:auto\">You are now logged in.</div>";
        		$("#message_td").html(finmess);
        		$("#registration_form_td").html("<a href=\"#\" id=\"close_this_tab_link\">Close this tab</a>");
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

/***
 *          __      __  _______       _____  
 *         /\ \    / /\|__   __|/\   |  __ \ 
 *        /  \ \  / /  \  | |  /  \  | |__) |
 *       / /\ \ \/ / /\ \ | | / /\ \ |  _  / 
 *      / ____ \  / ____ \| |/ ____ \| | \ \ 
 *     /_/    \_\/_/    \_\_/_/    \_\_|  \_\
 *                                           
 *                                           
 */

//Dropdown plugin data
var avatarData=[{text:"Avatar 0",value:0,selected:false,description:"Avatar 0",imageSrc:"images/avatars/48avatar00.png"},
                {text:"Avatar 1",value:1,selected:false,description:"Avatar 1",imageSrc:"images/avatars/48avatar01.png"},
                {text:"Avatar 2",value:2,selected:false,description:"Avatar 2",imageSrc:"images/avatars/48avatar02.png"},
                {text:"Avatar 3",value:3,selected:false,description:"Avatar 3",imageSrc:"images/avatars/48avatar03.png"},
                {text:"Avatar 4",value:4,selected:false,description:"Avatar 4",imageSrc:"images/avatars/48avatar04.png"},
                {text:"Avatar 5",value:5,selected:false,description:"Avatar 5",imageSrc:"images/avatars/48avatar05.png"},
                {text:"Avatar 6",value:6,selected:false,description:"Avatar 6",imageSrc:"images/avatars/48avatar06.png"},
                {text:"Avatar 7",value:7,selected:false,description:"Avatar 7",imageSrc:"images/avatars/48avatar07.png"},
                {text:"Avatar 8",value:8,selected:false,description:"Avatar 8",imageSrc:"images/avatars/48avatar08.png"},
                {text:"Avatar 9",value:9,selected:false,description:"Avatar 9",imageSrc:"images/avatars/48avatar09.png"},
                {text:"Avatar 10",value:10,selected:false,description:"Avatar 10",imageSrc:"images/avatars/48avatar10.png"},
                {text:"Avatar 11",value:11,selected:false,description:"Avatar 11",imageSrc:"images/avatars/48avatar11.png"},
                {text:"Avatar 12",value:12,selected:false,description:"Avatar 12",imageSrc:"images/avatars/48avatar12.png"},
                {text:"Avatar 13",value:13,selected:false,description:"Avatar 13",imageSrc:"images/avatars/48avatar13.png"},
                {text:"Avatar 14",value:14,selected:false,description:"Avatar 14",imageSrc:"images/avatars/48avatar14.png"},
                {text:"Avatar 15",value:15,selected:false,description:"Avatar 15",imageSrc:"images/avatars/48avatar15.png"},
                {text:"Avatar 16",value:16,selected:false,description:"Avatar 16",imageSrc:"images/avatars/48avatar16.png"},
                {text:"Avatar 17",value:17,selected:false,description:"Avatar 17",imageSrc:"images/avatars/48avatar17.png"},
                {text:"Avatar 18",value:18,selected:false,description:"Avatar 18",imageSrc:"images/avatars/48avatar18.png"},
                {text:"Avatar 23",value:23,selected:false,description:"Avatar 23",imageSrc:"images/avatars/48avatar23.png"},
                {text:"Avatar 20",value:20,selected:false,description:"Avatar 20",imageSrc:"images/avatars/48avatar20.png"},
                {text:"Avatar 21",value:21,selected:false,description:"Avatar 21",imageSrc:"images/avatars/48avatar21.png"},
                {text:"Avatar 22",value:22,selected:false,description:"Avatar 22",imageSrc:"images/avatars/48avatar22.png"},
                {text:"Avatar 23",value:23,selected:false,description:"Avatar 23",imageSrc:"images/avatars/48avatar23.png"},
                {text:"Avatar 24",value:24,selected:false,description:"Avatar 24",imageSrc:"images/avatars/48avatar24.png"}];
