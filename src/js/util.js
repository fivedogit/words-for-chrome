var devel = false; 
var endpoint = "https://w.ords.co/endpoint";
if(devel === true)
	endpoint = "http://localhost:8080/words/endpoint";

// functions found here must be loaded for the background page and the overlay. 

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function fromOtherBaseToDecimal(base, number ) {
	var baseDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	//alert("i "  + base + " and number " + number)
    var iterator = number.length;
    var returnValue = 0;
    var multiplier = 1;
  //  alert("t " + iterator);
    while( iterator > 0 ) {
        returnValue = returnValue + ( baseDigits.indexOf( number.substring( iterator - 1, iterator ) ) * multiplier );
        multiplier = multiplier * base;
        --iterator;
    }
   // alert("z");
    return returnValue;
}

// this is modified to handle our timestamps only. Had to chop off a string of zeros at the front with a hack (length - 7)
function fromDecimalToOtherBase ( base, decimalNumber ) {
	var baseDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var tempVal = decimalNumber == 0 ? "0" : "";
    var mod = 0;

    while( decimalNumber != 0 ) {
        mod = decimalNumber % base;
        tempVal = baseDigits.substring( mod, mod + 1 ) + tempVal;
        decimalNumber = decimalNumber / base;
    }
    return tempVal.substring(tempVal.length - 7);
}

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


function hashFnv32a(str, asString, seed) {
    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}


function getHost(loc_url)
{
	var parser = document.createElement('a');
	parser.href = loc_url;
	return parser.host;
}

// do we want to check for double #?
function isValidURLFormation(inc_url)
{
	var validurl = true;
	if (typeof inc_url === "undefined" || inc_url === null || inc_url === "")
	{
		console.log("isValidURLFormation(): inc_url was undefined, null or blank");
		validurl = false;
	}
	else if((inc_url.substring(0,7) !== "http://") && (inc_url.substring(0,8) !== "https://"))
	{
		console.log("isValidURLFormation(): inc_url did not start with http(s)://");
		validurl = false;
	}
	else
	{	
		var host = getHost(inc_url);
		if(host.indexOf(":") != -1)
		{
			console.log("isValidURLFormation(): inc_url contained \":\"");
			validurl = false;
		}	
		else if (host.indexOf(".") == -1)
		{
			console.log("isValidURLFormation(): did not contain \".\"");
			validurl = false;
		}
		else
		{
			validurl = true;
		}
	}
	return validurl;
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function splitString(inc_str)
{
	if(inc_str.length > 40)
	{
		var left = inc_str.substring(0,inc_str.length/2);
		var right = inc_str.substring(inc_str.length/2);
		if(left > 40)
			left = splitString(left);
		if(right > 40)
			right = splitString(right);
		//alert("returning " + left + " " + right);
		return left + " " + right;
	}
	else
		return inc_str;
}

function getSmartCutURL(url_to_use_inc, limit) // cut as www.hostname.com/.../filename.html whenever possible for max readability
{
	 var url_to_use_loc = url_to_use_inc;
	 //alert("smart cutting with " + url_to_use_loc);
	 if(url_to_use_loc.indexOf("https://") == 0 || url_to_use_loc.indexOf("http://") == 0)
		 url_to_use_loc = url_to_use_loc.substring(url_to_use_loc.indexOf("://")+ 3);
		
	 var hostname = url_to_use_loc.substring(0,url_to_use_loc.indexOf("/")); // pages will always have a slash after the hostname, even if it's just www.hostname.com/
	 
	 if(url_to_use_loc.endsWith("?"))
			url_to_use_loc = url_to_use_loc.substring(0,url_to_use_loc.length-1);
		
		// url cases:
		// 1. is less than limit. use as-is
		// 2. hostname is shorter than limit, url is longer than limit, url has >3 slashes one is trailing -> use host + "/.../" + file method (on 2ndtolast /) -> use default if still too long
		// 3. hostname is shorter than limit, url is longer than limit, url has >3 slashes, none trailing -> use host + "/.../" + file method -> use default if still too long
		// 4. hostname is shorter than limit, url is longer than limit, url has exactly 2 slashes, one is trailing -> use default cutting method
		// 5. hostname is shorter than limit, url is longer than limit, url has exactly 2 slashes, none trailing -> use host + "/.../" + file method -> use default if still too long
		// 6. hostname is shorter than limit, url is longer than limit, url has exactly 1 slash, (www.acceptable.com/waytoolong_...) -> use default method
		// 7. hostname is longer than limit -> use default method
		
		if(url_to_use_loc.length > limit && hostname.length < limit) 
		{
			var use_default_method = false;
			
			if((url_to_use_loc.split("/").length - 1) > 2) //case 2/3: has at least 3 forward slashes
			{
				var has_trailing_slash = false;
				if(url_to_use_loc.substr(url_to_use_loc.length - 1) == "/") //case 2: has trailing slash
				{
					//alert("case 2, hostname ok, >3 slashes with trailing");
					has_trailing_slash = true;
					url_to_use_loc = url_to_use_loc.substring(0,url_to_use_loc.length - 1); // temporarily remove trailing slash
				}
				else
				{
					//alert("case 3, hostname ok, >3 slashes, none trailing");
				}	
				var trythis = hostname + "/.../" + url_to_use_loc.substring(url_to_use_loc.lastIndexOf("/") + 1);
				if(trythis.length <= limit) //case 2/3: is the "smart" cut acceptable? if so, use it
				{
					//alert("case 2/3, smart cut worked!");
					url_to_use_loc = trythis;
					if(has_trailing_slash)
						url_to_use_loc = url_to_use_loc + "/";
				}
				else						//case 2/3: is the "smart" cut still too long? use default
				{
					//alert("case 2/3, smart cut no good. Using default method.");
					use_default_method = true;
				}
				
			}
			else if((url_to_use_loc.split("/").length - 1) == 2) // has exactly 2 forward slashes
			{
				if(url_to_use_loc.substr(url_to_use_loc.length - 1) == "/") //case 4: has trailing slash, this means the url has only one effective slash and is too big, even for hostname + "/..." + file form.
				{
					//alert("case 4: exactly 2 slashes, one trailing, use default method");
					use_default_method = true;
				}
				else //case 5: 2 slashes, no trailing slash
				{	
					//alert("case 5: exactly 2 slashes, none trailing, try smart cut");
					var trythis = hostname + "/.../" + url_to_use_loc.substring(url_to_use_loc.lastIndexOf("/") + 1);
					if(trythis.length <= limit) // case 5: is the "smart" cut acceptable? if so, use it
					{
						//alert("case 5: exactly 2 slashes, none trailing, smart cut worked!");
						url_to_use_loc = trythis;
					}
					else					    // case 5: is the "smart" cut still too long? if so, use default
					{
						//alert("case 5: exactly 2 slashes, none trailing, smart cut no good. Using default method");
						use_default_method = true;
					}
				}
			}	
			else //case 6: has one slash. acceptable hostname, VERY long filename
			{
				//alert("case 6: one slash, ok hostname, very long filename. Use default method.");
				use_default_method = true;
			}

			if(use_default_method === true)
			{
				url_to_use_loc = hostname + "/..." + url_to_use_inc.substring(url_to_use_inc.length - ((limit-3) - hostname.length)); 
			}
		}
		else if(url_to_use_loc.length > limit && hostname.length >= limit) //case 7: special case super long hostname... simply split in half
		{
			//alert("case 7: hostname > limit. Use special chop-in-half method.");
			url_to_use_loc = url_to_use_loc.substring(0,Math.floor(limit/2)) + "..." + url_to_use_loc.substring(url_to_use_loc.length-(Math.floor(limit/2)-3));
		}
		else
		{// case 1
			//alert("case 1, url less than limit");
			// do-nothing case, use url as-is
		}
		return url_to_use_loc;
}

//
//_   _ _____ _____ _     _____ _______   __ ___  ___ _____ _____ _   _ ___________  _____ 
//| | | |_   _|_   _| |   |_   _|_   _\ \ / / |  \/  ||  ___|_   _| | | |  _  |  _  \/  ___|
//| | | | | |   | | | |     | |   | |  \ V /  | .  . || |__   | | | |_| | | | | | | |\ `--. 
//| | | | | |   | | | |     | |   | |   \ /   | |\/| ||  __|  | | |  _  | | | | | | | `--. \
//| |_| | | |  _| |_| |_____| |_  | |   | |   | |  | || |___  | | | | | \ \_/ / |/ / /\__/ /
//\___/  \_/  \___/\_____/\___/  \_/   \_/   \_|  |_/\____/  \_/ \_| |_/\___/|___/  \____/ 

function has_scrollbar(elem_id) 
{ 
elem = document.getElementById(elem_id); 
if (elem.clientHeight < elem.scrollHeight) 
return true;
else 
return false;
} 

function updateNotificationTabLinkImage()
{
	if (tabmode === "notifications")
		$("#notifications_tab_img").attr("src",chrome.extension.getURL("images/flag_blue.png")); 
	else if (typeof user_jo === "undefined" || user_jo === null || user_jo.notification_count === 0)
		$("#notifications_tab_img").attr("src",chrome.extension.getURL("images/flag_gray.png")); 
	else if (user_jo.notification_count <= 10)
		$("#notifications_tab_img").attr("src",chrome.extension.getURL("images/flag" + user_jo.notification_count + ".png"));
	else if (user_jo.notification_count > 10)
		$("#notifications_tab_img").attr("src",chrome.extension.getURL("images/flag11plus.png")); 
	else
		$("#notifications_tab_img").attr("src",chrome.extension.getURL("images/flag_gray.png")); 
}


function displayMessage(inc_message, inc_color, dom_id, s)
{
	if(typeof dom_id === "undefined" || dom_id === null)
	{
		dom_id = "message_div_" + currentURLhash;
	}
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
	setTimeout(function() { $("#" + dom_id).hide();}, ms);
}


$(window).scroll(function() {
	if ($(window).scrollTop() + $(window).height() === $(document).height()) {
		if (scrollable === 1)
		{
			scrollable = 0;
			beginindex = beginindex + 8; 
			endindex = endindex + 8;
			if(tabmode === "thread")
				prepareGetAndPopulateThreadPortion();
			else if(tabmode === "past")
				getPastComments();
		}
	}
});

function doNewtabClick(h)
{
// 	try to find h
// 	if(successful)
//			open it
//		else if(unsuccessful)
//			try with newh
//			if(unsuccessful)
//			{
//				open new tab with original url
//			}
//		}
var newh = "";
if(h.indexOf("://www.") != -1)
	 newh = h.replace("://www.", "://");
else
	 newh = h.replace("://", "://www.");

//alert("h=" + h + " and newh=" + newh);
var open_tab_id = null;
chrome.tabs.query({url: h}, function(tabs) { 
	 for (var i = 0; i < tabs.length; i++) { // try to find h
		 open_tab_id = tabs[i].id;
	 }
	 if(open_tab_id !== null) // found it
	 {
		 if(bg.currentId === open_tab_id)
			 displayMessage("That's the current page.", "black");
		 else
			 chrome.tabs.update(open_tab_id,{"active":true}, function(tab) {}); // open the existing tab
	 }
	 else // if(open_tab_id === null)  // didn't find h
	 {
		 chrome.tabs.query({url: newh}, function(tabs) {  // try to find newh
			 for (var i = 0; i < tabs.length; i++) {
				 open_tab_id = tabs[i].id;
			 }
			 if(open_tab_id !== null) // found it
			 {
				 if(bg.currentId === open_tab_id)
					 displayMessage("That's the current page.", "black");
				 else
					 chrome.tabs.update(open_tab_id,{"active":true}, function(tab) {}); // open the existing tab
			 }
			 else // if(open_tab_id === null)
				 chrome.tabs.create({url:h}); // all else fails, open new tab
		 });
	 }
});
}

function isValidThreadItemId(inc_id)
{
	// before innerHTML, make sure this is a harmless 11-char string of letters and numbers ending with the letter C (for "comment").
	if(inc_id.length === 11 && /^[A-Za-z0-9]+C$/.test(inc_id))
		return true;
	return false;
}

/***
 *     _____ ________  ______  ___ _____ _   _ _____   _____ ________  _________   _____ _   _ _____ _   _ _____ _____ 
 *    /  __ \  _  |  \/  ||  \/  ||  ___| \ | |_   _| /  __ \  _  |  \/  || ___ \ |  ___| | | |  ___| \ | |_   _/  ___|
 *    | /  \/ | | | .  . || .  . || |__ |  \| | | |   | /  \/ | | | .  . || |_/ / | |__ | | | | |__ |  \| | | | \ `--. 
 *    | |   | | | | |\/| || |\/| ||  __|| . ` | | |   | |   | | | | |\/| ||  __/  |  __|| | | |  __|| . ` | | |  `--. \
 *    | \__/\ \_/ / |  | || |  | || |___| |\  | | |   | \__/\ \_/ / |  | || |     | |___\ \_/ / |___| |\  | | | /\__/ /
 *     \____/\___/\_|  |_/\_|  |_/\____/\_| \_/ \_/    \____/\___/\_|  |_/\_|.    \____/ \___/\____/\_| \_/ \_/ \____/ 
 *                                                                                                                     
 *                                                                                                                     
 */

function createSubmissionFormSubmitButtonClickEvent(id)
{
	 $("#comment_submission_form_submit_button_" + id).click({id: id},
			 function (event) {
				 
				 $("#comment_submission_form_submit_button_" + event.data.id).attr("disabled", "disabled");
				 $("#comment_submission_progress_span_" + event.data.id).show();
				 if (user_jo) 
				 {
					 // no need to check for comment rating here. Backend will let the user know on submit.
					 if ($("#comment_textarea_" + event.data.id) && $("#comment_textarea_" + event.data.id).val() != "") 
					 {
						 // event.data.id may be "top", which will be handled in submitComment();
						 submitComment(event.data.id); // the "event.data.id" of this current comment (or hpqsp) will become the "parent" after the jump as it is the parent to which the new comment will be attached
						 // what happens to the visibility of the submission area depends on error/success
					 } 
					 else 
					 {
						 displayMessage("Unable to post empty comment.", "red", "message_div_" + event.data.id);
						 $("#progress_span_" + event.data.id).hide();
						 $("#comment_submission_form_submit_button_" + event.data.id).removeAttr('disabled');
					 }
				 } 
				 else // user isn't logged in. Not sure they're seeing this form in the first place. They shouldn't be.
				 {
					 displayMessage("Unable to post comment. You are not logged in.", "red", "message_div_" + event.data.id); // USER SHOULD NOT SEE THIS MESSAGE. SHOULD BE WARNED OF LOGGEDOUT STATUS MUCH EARLIER
					 $("#progress_span_" + event.data.id).hide();
					 $("#comment_submission_form_submit_button_" + event.data.id).removeAttr('disabled');
				 }
				 return false;
			 });
}

function createKeyupEventForTextarea(id, charlimit){
	 $("#comment_textarea_" + id).keyup({id: id},
			 function (event) {
				 if(has_scrollbar("comment_textarea_" + event.data.id))
				 {
					 var currentheight = $("#comment_textarea_" + event.data.id).css("height");
					 currentheight = (currentheight.substring(0, currentheight.length - 2)*1) + 17;
					 $("#comment_textarea_" + event.data.id).css("height", currentheight + "px");
					 // still has scrollbar? grow it again. (this happens in a big cut/paste sometimes)
					 if(has_scrollbar("comment_textarea_" + event.data.id))
					 {
						 $("#comment_textarea_" + event.data.id).trigger("keyup");
					 }
				 }
				 if($("#comment_textarea_" + event.data.id).val().length > 500)
					 $("#comment_textarea_" + event.data.id).val($("#comment_textarea_" + event.data.id).val().substring(0,charlimit));
				 $("#charsleft_" + event.data.id).text(charlimit - $("#comment_textarea_" + event.data.id).val().length);
				 docCookies.setItem("saved_text", $("#comment_textarea_" + event.data.id).val(), 31536e3);
				 docCookies.setItem("saved_text_dom_id", "comment_textarea_" + event.data.id, 31536e3);
			 }
	 );
}

function createBlurEventForTextarea(id)
{
	 $("#comment_textarea_" + id).blur({id: id},
			function (event) {
				if($("#comment_textarea_" + event.data.id).val() === "") // if the user has written anything, leave the composition + submission area the way it is
				{
					$("#comment_textarea_" + event.data.id).css("height", "22px");			// set it back to normal height
					$("#comment_textarea_" + event.data.id).val("Say something..."); // set the default wording
					$("#char_count_and_submit_button_div_" + event.data.id).hide();			// hide the charcount and submit area
					$("#comment_textarea_" + event.data.id).css("color", "#aaa");			// reset the text to gray
				}
			});
}

function createFocusEventForTextarea(id)
{
	 $("#comment_textarea_" + id).focus({id: id},
			 function (event) {
		 
		 if(user_jo === null)
		 {
			 displayMessage("Unable to compose comment. You are not logged in.", "red", "message_div_" + event.data.id);
			 $("#comment_textarea_" + event.data.id).trigger("blur");
		 }
		 else // user logged in and rating ok
		 {	 
			 if(user_jo.rating <= -5)
			 {
				 displayMessage("Unable to compose comment. Your comment rating is too low.", "red", "message_div_" + event.data.id);
				 $("#comment_textarea_" + event.data.id).trigger("blur");
			 }
			 else
			 {
				 $("#comment_textarea_" + event.data.id).css("height", "80px");
				 if($("#comment_textarea_" + event.data.id).val() === "Say something...") // only do this if the textarea is currently "blank"
				 {
					 $("#comment_textarea_" + event.data.id).val("");							 // blank it out
				 }
				 else 
				 {
					 if(has_scrollbar("comment_textarea_" + event.data.id)) // it was increased to 80 above, but if it still has a scrollbar, grow it
						 $("#comment_textarea_" + event.data.id).trigger("keyup");
				 } 
				 $("#comment_textarea_" + event.data.id).css("color", "#000"); 				// set the text to black
				 $("#char_count_and_submit_button_div_" + event.data.id).show();					// show the charcount and submit buttons
			 }	 
		 }
	 });
}

/*
function noteImpressionAndCreateHandler(target, source_category, dom_id, inc_url)
{	
	//alert("noting impression");
	var id = null;
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "noteImpression",
			target: target,
			source_category: source_category
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if(data.response_status === "error")
			{
				id = null;
			}
			else if(data.response_status === "success")
			{
				id = data.id;
				createHandler(id, dom_id, inc_url);
			}	
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		} 
	}); 
}	
	
 function noteConversion(id) //booleans or strings
 {
 	$.ajax({
 		type: 'GET',
 		url: endpoint,
 		data: {
 			method: "noteConversion",
 			id: id
 		},
 		dataType: 'json',
 		async: true,
 		success: function (data, status) {
 			if(data.response_status === "error")
 			{
 				// fail silently
 			}
 			else if(data.response_status === "success")
 			{
 				// succeed silently 
 			}	
 		},
 		error: function (XMLHttpRequest, textStatus, errorThrown) {
 			console.log(textStatus, errorThrown);
 			// fail silently
 		} 
 	}); 
 }
 
 function createHandler(id, dom_id, inc_url)
 {
	// alert("creating handler with id=" + id + " and dom_id=" + dom_id + " and inc_url=" + inc_url);
	 $("#" + dom_id).click(
			 function () {
				 chrome.tabs.create({url:inc_url});
				 noteConversion(id);
				 return false;
			 });
 }
 

 function doFirstrunFooterMsg(firstrun_msg_index)
 {
	 var footerstr = "";
	 if(firstrun_msg_index === 0)
	 {
		 docCookies.setItem("firstrun_msg_index", 1, 31536e3);
		 footerstr = footerstr + "Welcome to WORDS. I’m <a href=\"#\" id=\"fivedogit_link\" style=\"color:#baff00\">@fivedogit</a>, the developer. This footer space is where I say things.<span style=\"font-size:9px;margin-left:10px\">(1/6)</span> <a href=\"#\" style=\"font-size:9px\" id=\"next_link\">next>></a>";
		 $("#footer_div").html(footerstr);
		 noteImpressionAndCreateHandler("twitter_persacct", "footer", "fivedogit_link", "http://www.twitter.com/fivedogit");
		 $("#next_link").click(function(event){ doFirstrunFooterMsg(1); });
	 }	 
	 else if(firstrun_msg_index === 1)
	 {
		 docCookies.setItem("firstrun_msg_index", 2, 31536e3);
		 footerstr = footerstr + "First, thank you for trying WORDS. Together, we can make <span style=\"color:#47dfff\">civilized comments</span> a reality.<span style=\"font-size:9px;margin-left:10px\">(2/6)</span> <a href=\"#\" style=\"font-size:9px\" id=\"next_link\">next>></a>";
		 $("#footer_div").html(footerstr);
		 $("#next_link").click(function(event){ doFirstrunFooterMsg(2); });
	 }	
	 else if(firstrun_msg_index === 2)
	 {
		 docCookies.setItem("firstrun_msg_index", 3, 31536e3);
		 footerstr = footerstr + "But for WORDS to reach its potential, we’re going to need more <span style=\"color:#ffde00\">intelligent people</span> to join us.<span style=\"font-size:9px;margin-left:10px\">(3/6)</span> <a href=\"#\" style=\"font-size:9px\" id=\"next_link\">next>></a>";
		 $("#footer_div").html(footerstr);
		 $("#next_link").click(function(event){ doFirstrunFooterMsg(3); });
	 }	
	 else if(firstrun_msg_index === 3)
	 {
		 docCookies.setItem("firstrun_msg_index", 4, 31536e3);
		 footerstr = footerstr + "So please tell your friends about WORDS: ";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_facebook_link\" >Facebook</a>";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_twitter_link\" >Twitter</a>";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_googleplus_link\" >G+</a>";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_tumblr_link\" >Tumblr</a>";
		 if(typeof user_jo !== undefined && user_jo !== null && user_jo.email !== "undefined" && user_jo.email !== null && user_jo.email.endsWith("@gmail.com"))
			 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_gmail_link\" >Gmail</a>";
		 footerstr = footerstr + "<span style=\"font-size:9px;margin-left:10px\">(4/6)</span> <a href=\"#\" style=\"font-size:9px\" id=\"next_link\">next>></a>";
		 $("#footer_div").html(footerstr);
	 	
		 noteImpressionAndCreateHandler("facebookshare", "footer", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
		 noteImpressionAndCreateHandler("twittershare", "footer", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
		 noteImpressionAndCreateHandler("googleplusshare", "footer", "share_to_googleplus_link", "https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com");
		 noteImpressionAndCreateHandler("tumblrshare", "footer", "share_to_tumblr_link", "http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people");
		 if(typeof user_jo !== undefined && user_jo !== null && user_jo.email !== "undefined" && user_jo.email !== null && user_jo.email.endsWith("@gmail.com"))
			 noteImpressionAndCreateHandler("gmailshare", "footer", "share_to_gmail_link", "https://mail.google.com/mail/?view=cm&fs=1&su=Words%20for%20Chrome&body=Hey%2C%20I%20thought%20you%20might%20like%20this.%20It%27s%20a%20new%20kind%20of%20web%20commenting%20system%20that%20protects%20privacy%20and%20keeps%20out%20the%20crazies.%20%0A%0Ahttp%3A%2F%2Fwww.words4chrome.com%0A%0AYou%20can%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%0A%0AEnjoy!");
		 $("#next_link").click(function(event){ doFirstrunFooterMsg(4); });
	 }
	 else if(firstrun_msg_index === 4)
	 {
		 docCookies.setItem("firstrun_msg_index", 5, 31536e3);
		 footerstr = footerstr + "Additionally, a <a href=\"#\" id=\"rate_5_stars_link\" style=\"color:#baff00\">five star rating</a> would be enormously helpful.";
		 footerstr = footerstr + "<span style=\"font-size:9px;margin-left:10px\">(5/6)</span> <a href=\"#\" style=\"font-size:9px\" id=\"next_link\">next>></a>";
		 $("#footer_div").html(footerstr);
		 if(navigator.userAgent.indexOf("OPR/") !== -1)
			 noteImpressionAndCreateHandler("operastore", "footer", "rate_5_stars_link", "https://addons.opera.com/en/extensions/details/words/");
		 else
			 noteImpressionAndCreateHandler("cws", "footer", "rate_5_stars_link", "https://chrome.google.com/webstore/detail/words/lgdfecngaioibcmfbfpeeddgkjfdpgij/reviews");
		 $("#next_link").click(function(event){ doFirstrunFooterMsg(5); });
	 }
	 else if(firstrun_msg_index === 5)
	 {
		 docCookies.setItem("firstrun_msg_index", 6, 31536e3);
		 footerstr = footerstr + "That's all for now. Thanks again and I look forward to great discussions!<span style=\"font-size:9px;margin-left:10px\">(6/6)</span> <a href=\"#\" style=\"font-size:9px\" id=\"next_link\">next>></a>";
		 $("#footer_div").html(footerstr);
		 $("#next_link").click(function(event){ doFirstrunFooterMsg(6); });
	 }
	 else if(firstrun_msg_index === 6)
	 {
		 docCookies.setItem("firstrun_msg_index", 7, 31536e3);
		 footerstr = footerstr + "<span style=\"margin-left:15px\">RATE:</span> <a href=\"#\" id=\"rate_5_stars_link\" style=\"color:#baff00\">5 stars</a>";
		 footerstr = footerstr + "<span style=\"margin-left:15px\">SHARE:</span>";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_facebook_link\" >Facebook</a>";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_twitter_link\" >Twitter</a>";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_googleplus_link\" >G+</a>";
		 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_tumblr_link\" >Tumblr</a>";
		 if(typeof user_jo !== undefined && user_jo !== null && user_jo.email !== "undefined" && user_jo.email !== null && user_jo.email.endsWith("@gmail.com"))
			 footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_gmail_link\" >Gmail</a>";
		 footerstr = footerstr + "<span style=\"margin-left:15px\">FOLLOW: ";
		 footerstr = footerstr + "<a href=\"#\" id=\"twitter_mainacct_link\" style=\"color:#baff00\">@words4chrome</a>";
		 $("#footer_div").html(footerstr);
		 if(navigator.userAgent.indexOf("OPR/") !== -1)
			 noteImpressionAndCreateHandler("operastore", "footer", "rate_5_stars_link", "https://addons.opera.com/en/extensions/details/words/");
		 else
			 noteImpressionAndCreateHandler("cws", "footer", "rate_5_stars_link", "https://chrome.google.com/webstore/detail/words/lgdfecngaioibcmfbfpeeddgkjfdpgij/reviews");
		 noteImpressionAndCreateHandler("facebookshare", "footer", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
		 noteImpressionAndCreateHandler("twittershare", "footer", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
		 noteImpressionAndCreateHandler("googleplusshare", "footer", "share_to_googleplus_link", "https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com");
		 noteImpressionAndCreateHandler("tumblrshare", "footer", "share_to_tumblr_link", "http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people");
		 if(typeof user_jo !== undefined && user_jo !== null && user_jo.email !== "undefined" && user_jo.email !== null && user_jo.email.endsWith("@gmail.com"))
			 noteImpressionAndCreateHandler("gmailshare", "footer", "share_to_gmail_link", "https://mail.google.com/mail/?view=cm&fs=1&su=Words%20for%20Chrome&body=Hey%2C%20I%20thought%20you%20might%20like%20this.%20It%27s%20a%20new%20kind%20of%20web%20commenting%20system%20that%20protects%20privacy%20and%20keeps%20out%20the%20crazies.%20%0A%0Ahttp%3A%2F%2Fwww.words4chrome.com%0A%0AYou%20can%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%0A%0AEnjoy!");
		 noteImpressionAndCreateHandler("twitter_mainacct", "footer", "twitter_mainacct_link", "http://www.twitter.com/words4chrome");
		 $("#next_link").click(function(event){ doFirstrunFooterMsg(5); });
	 }
	 else
	 {
		 //
	 } 
 }*/
 
 /*	var footerstr = "";
	var shown_softlaunchmsg = docCookies.getItem("shown_softlaunchmsg");
	var firstrun_msg_index = docCookies.getItem("firstrun_msg_index")*1; 
	if(false) //bg.msfe_according_to_backend >= 1402266600000 && bg.msfe_according_to_backend < 1402300800000 && (shown_softlaunchmsg === null || firstrun_msg_index > 5)) // June 8th 6:30pm EST - June 9th 4am PST est
	{
		docCookies.setItem("shown_softlaunchmsg", "yes", 31536e3);
		footerstr = footerstr + "Preview Day! Please upvote WORDS on <a href=\"#\" style=\"color:#baff00\" id=\"hn_link\">Hacker News</a>";
		//footerstr = footerstr + ", <a href=\"#\" style=\"color:#baff00\" id=\"product_hunt_link\">Product Hunt</a>";
		footerstr = footerstr + " *AND* <a href=\"#\" style=\"color:#baff00\" id=\"reddit_link\">Reddit</a>!";
		$("#footer_div").html(footerstr);
		var hn_url = "http://news.ycombinator.com";
		$.ajax({
			type: 'GET',
			url: endpoint,
			data: {
				method: "getHNURL",
			},
			dataType: 'json',
			async: false,
			timeout: 2000,
			success: function (data, status) {
				if(data.response_status === "error")
				{
					// fail silently and use default url
				}
				else if(data.response_status === "success")
				{
					hn_url = data.url;
				}	
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				displayMessage("AJAX error getting HN url", "red");
			} 
		}); 			
		noteImpressionAndCreateHandler("hn", "footer", "hn_link", hn_url);
		var reddit_url = "http://reddit.com";
		$.ajax({
			type: 'GET',
			url: endpoint,
			data: {
				method: "getRURL",
			},
			dataType: 'json',
			async: false,
			timeout: 2000,
			success: function (data, status) {
				if(data.response_status === "error")
				{
					// fail silently and use default url
				}
				else if(data.response_status === "success")
				{
					reddit_url = data.url;
				}	
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(textStatus, errorThrown);
				displayMessage("AJAX error getting R url", "red");
			} 
		}); 			
		noteImpressionAndCreateHandler("reddit", "footer", "reddit_link", reddit_url);
		//noteImpressionAndCreateHandler("producthunt", "footer", "product_hunt_link", "http://www.producthunt.com/");
	}
	else // not soft launch day
	{
		if(typeof firstrun_msg_index === "undefined" || firstrun_msg_index === null)
			doFirstrunFooterMsg(0);
		else if(firstrun_msg_index < 7)
			doFirstrunFooterMsg(firstrun_msg_index*1);
		else
		{
			var randomint = -1;
			if(typeof bg.footer_random_pool !== "undefined" && bg.footer_random_pool !== null && bg.footer_random_pool > 0)
				randomint = Math.floor(Math.random() * bg.footer_random_pool);
			else
				randomint = Math.floor(Math.random() * 50);
			if(randomint === 0)
			{
				var footerstr = "";
				footerstr = footerstr + "If you get a moment, a <a href=\"#\" id=\"rate_5_stars_link\" style=\"color:#baff00\">five star rating</a> would be greatly appreciated.";
				$("#footer_div").html(footerstr);
				if(navigator.userAgent.indexOf("OPR/") !== -1)
					noteImpressionAndCreateHandler("operastore", "footer", "rate_5_stars_link", "https://addons.opera.com/en/extensions/details/words/");
				else
					noteImpressionAndCreateHandler("cws", "footer", "rate_5_stars_link", "https://chrome.google.com/webstore/detail/words/lgdfecngaioibcmfbfpeeddgkjfdpgij/reviews");
			}	
			else if(randomint === 1)
			{
				var footerstr = "";
				footerstr = footerstr + "Follow WORDS on <a href=\"#\" id=\"follow_on_facebook_link\" style=\"color:#baff00\">Facebook</a> and <a href=\"#\" id=\"follow_on_twitter_link\" style=\"color:#baff00\">Twitter</a>!";
				$("#footer_div").html(footerstr);
				noteImpressionAndCreateHandler("facebook_apppage", "footer", "follow_on_facebook_link", "https://www.facebook.com/pages/WORDS/232380660289924");
				noteImpressionAndCreateHandler("twitter_mainacct", "footer", "follow_on_twitter_link", "http://www.twitter.com/words4chrome");
			}
			else if(randomint === 2)
			{
				var footerstr = "";
				footerstr = footerstr + "Spread the WORDS! ";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_facebook_link\" >Facebook</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_twitter_link\" >Twitter</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_googleplus_link\" >G+</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_tumblr_link\" >Tumblr</a>";
				if(typeof user_jo !== undefined && user_jo !== null && user_jo.email !== "undefined" && user_jo.email !== null && user_jo.email.endsWith("@gmail.com"))
					footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"share_to_gmail_link\" >Gmail</a>";
				$("#footer_div").html(footerstr);
				
				noteImpressionAndCreateHandler("facebookshare", "footer", "share_to_facebook_link", "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.words4chrome.com");
				noteImpressionAndCreateHandler("twittershare", "footer", "share_to_twitter_link", "https://twitter.com/intent/tweet?text=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people&url=http%3A%2F%2Fwww.words4chrome.com");
				noteImpressionAndCreateHandler("googleplusshare", "footer", "share_to_googleplus_link", "https://plus.google.com/share?url=http%3A%2F%2Fwww.words4chrome.com");
				noteImpressionAndCreateHandler("tumblrshare", "footer", "share_to_tumblr_link", "http://www.tumblr.com/share?v=3&u=http%3A%2F%2Fwww.words4chrome.com&t=WORDS%20for%20Chrome%3A%20Web%20comments%20for%20smart%20people");
				if(typeof user_jo !== undefined && user_jo !== null && user_jo.email !== "undefined" && user_jo.email !== null && user_jo.email.endsWith("@gmail.com"))
					noteImpressionAndCreateHandler("gmailshare", "footer", "share_to_gmail_link", "https://mail.google.com/mail/?view=cm&fs=1&su=Words%20for%20Chrome&body=Hey%2C%20I%20thought%20you%20might%20like%20this.%20It%27s%20a%20new%20kind%20of%20web%20commenting%20system%20that%20protects%20privacy%20and%20keeps%20out%20the%20crazies.%20%0A%0Ahttp%3A%2F%2Fwww.words4chrome.com%0A%0AYou%20can%20download%20Chrome%20if%20you%20don%27t%20already%20have%20it.%0A%0AEnjoy!");
			}
			else if(randomint === 3)
			{
				var footerstr = "";
				footerstr = footerstr + "Remember: Appropriate downvoting isn't \"mean\" -- <span style=\"color:#ffde00\">it's necessary</span>.";
				$("#footer_div").html(footerstr);
			}
			else if(randomint === 4)
			{
				var footerstr = "";
				footerstr = footerstr + "Support WORDS with Bitcoin: ";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_2_link\" >$2</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_5_link\" >$5</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_10_link\" >$10</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_20_link\" >$20</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_50_link\" >$50</a>";
				footerstr = footerstr + "<a style=\"margin-left:6px;color:#baff00\" href=\"#\" id=\"coinbase_100_link\" >$100</a>";
				$("#footer_div").html(footerstr);
				noteImpressionAndCreateHandler("coinbase2", "footer", "coinbase_2_link", "https://coinbase.com/checkouts/0dd1fe6c62615d397145ab61ed563851");
				noteImpressionAndCreateHandler("coinbase5", "footer", "coinbase_5_link", "https://coinbase.com/checkouts/61112abb012d09699e65c6ec1a632e41");
				noteImpressionAndCreateHandler("coinbase10", "footer", "coinbase_10_link", "https://coinbase.com/checkouts/9413426d693428113687ecbddf94faca");
				noteImpressionAndCreateHandler("coinbase20", "footer", "coinbase_20_link", "https://coinbase.com/checkouts/1e317adfab144ec7378c6a8abda14895");
				noteImpressionAndCreateHandler("coinbase50", "footer", "coinbase_50_link", "https://coinbase.com/checkouts/8c894218504788240c6b75acaf200529");
			}
			else if(randomint === 5)
			{
				var footerstr = "";
				footerstr = footerstr + "Find a site that should be separated? Give me a heads up on Twitter <a href=\"#\" id=\"follow_on_twitter_link\" style=\"color:#baff00\">@fivedogit</a>.";
				$("#footer_div").html(footerstr);
				noteImpressionAndCreateHandler("twitter_persacct", "footer", "follow_on_twitter_link", "http://www.twitter.com/fivedogit");
			}
		}
	}*/


