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


function displayMessage(inc_message, inc_color)
{
	if(inc_color === null)
		inc_color = "red";
	$("#message_td").html("<span style=\"color:" + inc_color + "\">" + inc_message + "</span>");
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
	if(login_type === "google")
	{
		chrome.identity.getAuthToken({ 'interactive': true },function (token) { // interactive false. We have to show permission screen on receiver.html due to overlay closing
			if(token == null)
			{
				// if no token available, user declined or encountered a strange error. Ask them to try again. 
				displayMessage("Encountered error trying to login with Google. Please try again.");
			}	
			else
			{		
				// token should be valid. use it to log in.
				$.ajax({
					type: 'GET',
					url: bg.endpoint,
					data: {
						method: "login",
						social_access_token: token,
						login_type: "google"
					},
					dataType: 'json',
					async: true,
					success: function (data, status) {
						if(data.response_status === "error")
						{
							displayMessage(data.message, "red");
							console.log("login() response error. Google auth token bad? Should never happen. Deleting cookies to allow user to start over from scratch, just in case.");
							chrome.identity.getAuthToken({ 'interactive': false },
      						      function(current_token) {
      						        if (!chrome.runtime.lastError) {
      						          chrome.identity.removeCachedAuthToken({ token: current_token }, function() {});
      						        }
							});
	                		docCookies.removeItem("email"); 
	                		docCookies.removeItem("this_access_token");
	                		docCookies.removeItem("google_access_token");
	                		bg.user_jo = null;
						}
						else if(data.response_status === "success")
						{
							if(data.show_registration === "true")
	        				{
	        					//alert("login() show registration=true");
	        					docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
	        					docCookies.setItem("email", data.email, 31536e3);
	        					window.location = chrome.extension.getURL('receiver.html') + "?login_type=google&social_access_token=" + docCookies.getItem("google_access_token");
	        				}
							else if(data.show_registration === "false")
							{	
								//alert("login() show registration=false. getUserSelf()");
								docCookies.setItem("email", data.email, 31536e3);
								docCookies.setItem("google_access_token", data.google_access_token, 31536e3);
					    		docCookies.setItem("this_access_token", data.this_access_token, 31536e3);
					    		email = data.email;
					    		this_access_token = data.this_access_token;
					    		$.ajax({ 
					    			type: 'GET', 
					    			url: bg.endpoint, 
					    			data: {
					    	            method: "getUserSelf",
					    	            email: email,							
					    	            this_access_token: this_access_token	
					    	        },
					    	        dataType: 'json', 
					    	        async: true, 
					    	        success: function (data, status) {
					    	        	if (data.response_status === "error") // login was JUST successful. The credentials should be fine and never produce an error here.
					                	{
					    	        		displayMessage(data.message, "red"); 
					    	        		console.log("getUserSelf() response error for getUserSelf. Should never happen. Deleting cookies to allow user to start over from scratch, just in case.");
					    	        		docCookies.removeItem("email"); 
					                		docCookies.removeItem("this_access_token");
					                		docCookies.removeItem("google_access_token");
					                		bg.user_jo = null;
					                	} 
					                	else if (data.response_status === "success") 
					                	{
					                		bg.user_jo = data.user_jo; 
					                		doFinished();
					                	}
					    	        },
					    	        error: function (XMLHttpRequest, textStatus, errorThrown) {
					    	            console.log(textStatus, errorThrown);
					    	            displayMessage("getUserSelf ajax error", "red");
					    	        } 
					    		});
							}
						}	
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						//alert("loginWithGoogle ajax failure");
						console.log(textStatus, errorThrown);
						displayMessage("Could not log you in. Network connection? (AJAX)", "red");
					} 
				});  // end bg.endpoint.login() call
			} // end else
		}); // end chrome.identity.getAuthToken() call
	}	
	else // not google
	{	
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
				}	
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				displayMessage("Could not retrieve access token. Please try again through the Words extension. (AJAX)", "red");
			} 
		}); 
	}
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

function showRegistration(picture, login_type, email)
{
	
	if(login_type === "native")
	{
		$("#password_tr").show();
		$("#confirm_tr").show();
	}
	var mess = "";
	mess = "<b>Welcome! Let's create a Words account for you.</b>";
	displayMessage(mess, "black");
	if(!picture)
	{
		// do nothing, the user will be shown the avatar selector and that's all
		//picture = "images/avatars/48avatar00.png";
		//$("#picture_div").html("<img src=\"" + picture + "\" style=\"width:48px;height:48px\">");
		//$("#picture_div").show();
		$("#words_image_div").show();
	}
	else
	{
		$("#picture_div").html("<img src=\"" + picture + "\" style=\"width:48px;height:48px\">");
		$("#picture_type_div").show();
		$("#use_picture_wording_td").html("Use " + login_type + " picture");
		$("#use_picture_radio").trigger("click");
	}
	$("#registration_email_td").html(email);
	$("#registration_form_td").show();
}

$("#use_picture_radio").click(function () {
	$("#picture_div").show();
	$("#words_image_div").hide();
});

$("#use_words_image_radio").click(function () {
	$("#picture_div").hide();
	$("#words_image_div").show();
});

$('#registration_avatar_selector').ddslick({
	    data: avatarData,
	    width: 200,
	    imagePosition: "left",
	    selectText: "Select your Avatar",
	    onSelected: function(data){  
	    	$('html, body').animate({ scrollTop: 0 }, 0);
	    	$('#hidden_avatar_input').val(data.selectedData.imageSrc.substring(data.selectedData.imageSrc.lastIndexOf("/48") + 3));
	    	$("#registration_submit_button").focus();
	    }    
});

$("#registration_screenname_button").click(
		function () 
		{
				//$("#screenname_availability_span").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">");
	         	$("#screenname_availability_span").show();
				if ($("#registration_screenname_input").val().length <= 0) 
				{
					$("#screenname_availability_span").html("<font color=red>Blank</font>");
					return;
				} 
				else if ($("#registration_screenname_input").val().length < 6) 
				{
					$("#screenname_availability_span").html("<font color=red>Too short</font>");
					return;
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
								$("#screenname_availability_span").html("<font color=red>Error</font>");
							} 
							else if (response_object.response_status === "success") 
							{
								if (response_object.screenname_available === "true") 
									$("#screenname_availability_span").html("<font color=green>Available</font>");
								else if (response_object.screenname_available === "false") 
									$("#screenname_availability_span").html("<font color=red>Unavailable</font>");
								else
									$("#screenname_availability_span").html("<font color=red>Error. Value !t/f.</font>");
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
				var which_picture = null;
				if($("#use_picture_radio").is(':checked')) 
				{
					which_picture = login_type + "_picture";
				}
				else
				{
					if($("#hidden_avatar_input").val() === 0)
					{
						displayMessage("Select an avatar.", "red");
						return false;
					}
					avatar_str = $("#hidden_avatar_input").val();
					which_picture = "avatar_icon";
				}
				
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
				    	avatar_icon: avatar_str,
				    	state: $("#registration_state_select").val(),
				    	country: $("#registration_country_select").val(),
				    	which_picture: which_picture,
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

$("#registration_country_select").change( function() {
	if($("#registration_country_select").val() === "USA")
		$("#registration_state_select_tr").show();
	else
	{
		$("#registration_state_select_tr").hide();
		$("#registration_state_select").val("");
	}
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


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-49477303-3', 'ords.co');
	ga('send', 'pageview');
