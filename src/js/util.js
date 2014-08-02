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

function getLinkifiedDiv(text) // also replaces line breaks with br
{
	var linkified_div = document.createElement('div');
	linkified_div.style.textAlign = "left";
	//linkified_div.style.padding = "6px";
	linkified_div.textContent = "";
	var m;
	var re = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	var last_index = 0;
	var matches_found = 0;
	var current_text = "";
	var current_textnode;
	var current_a;
	while (m = re.exec(text)) {
		matches_found = matches_found + 1;
		current_text = text.substring(last_index, m.index);
		if(current_text.indexOf("\n") === -1)
		{
			current_textnode = document.createTextNode(current_text);
			linkified_div.appendChild(current_textnode);
		}
		else
		{
			var arr = current_text.split("\n");
			var chunkcounter = 0;
			while(chunkcounter < arr.length)
			{
				current_textnode = document.createTextNode(arr[chunkcounter]);
				linkified_div.appendChild(current_textnode);
				if(chunkcounter < (arr.length - 1)) // if not the last one
					linkified_div.appendChild(document.createElement('br'));
				chunkcounter++;
			}	
		}	
		current_a = document.createElement('a');
		current_a.href = m[0];
		current_a.textContent = getSmartCutURL(m[0],60); 
		current_a.className = "newtab";
		linkified_div.appendChild(current_a);
		last_index = m.index + m[0].length;
	} 
	if(matches_found === 0)
		current_text = text;
	else
		current_text = text.substring(last_index);
	if(current_text.indexOf("\n") == -1)
	{
		current_textnode = document.createTextNode(current_text);
		linkified_div.appendChild(current_textnode);
	}
	else
	{
		var arr = current_text.split("\n");
		var chunkcounter = 0;
		while(chunkcounter < arr.length)
		{
			current_textnode = document.createTextNode(arr[chunkcounter]);
			linkified_div.appendChild(current_textnode);
			if(chunkcounter < (arr.length - 1)) // if not the last one
				linkified_div.appendChild(document.createElement('br'));
			chunkcounter++;
		}	
	}	
	return linkified_div;
}

function getHost(loc_url)
{
	var parser = document.createElement('a');
	parser.href = loc_url;
	return parser.host;
}

function getStandardizedHostname(inc_url)
{
	var h = getHost(inc_url);
	var count = (h.split(".").length - 1);
	if(count === 1)
		h = "www." + h;
	return h;
}

// do we want to check for double #?
function isValidURLFormation(inc_url)
{
	var validurl = true;
	if (typeof inc_url === "undefined" || inc_url === null || inc_url === "")
	{
		validurl = false;
	}
	else if((inc_url.substring(0,7) !== "http://") && (inc_url.substring(0,8) !== "https://"))
	{
		validurl = false;
	}
	else
	{	
		var host = getHost(inc_url);
		if(host.indexOf(":") != -1)
		{
			validurl = false;
		}	
		else if (host.indexOf(".") == -1)
		{
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
		dom_id = "utility_message_td";
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

function createSubmissionFormSubmitButtonClickEvent(id, message_element)
{
	 $("#comment_submission_form_submit_button_" + id).click({id: id, message_element: message_element}, function (event) { event.preventDefault();
				 $("#comment_submission_form_submit_button_" + event.data.id).attr("disabled", "disabled");
				 $("#comment_submission_progress_span_" + event.data.id).show();
				 if (user_jo) 
				 {
					 // no need to check for comment rating here. Backend will let the user know on submit.
					 if ($("#comment_textarea_" + event.data.id) && $("#comment_textarea_" + event.data.id).val() != "") 
					 {
						 // event.data.id may be "top", which will be handled in submitComment();
						 submitComment(event.data.id, message_element); // the "event.data.id" of this current comment (or hpqsp) will become the "parent" after the jump as it is the parent to which the new comment will be attached
						 // what happens to the visibility of the submission area depends on error/success
					 } 
					 else 
					 {
						 displayMessage("Unable to post empty comment.", "red", event.data.message_element);
						 $("#progress_span_" + event.data.id).hide();
						 $("#comment_submission_form_submit_button_" + event.data.id).removeAttr('disabled');
					 }
				 } 
				 else // user isn't logged in. Not sure they're seeing this form in the first place. They shouldn't be.
				 {
					 displayMessage("Unable to post comment. You are not logged in.", "red", event.data.message_element); // USER SHOULD NOT SEE THIS MESSAGE. SHOULD BE WARNED OF LOGGEDOUT STATUS MUCH EARLIER
					 $("#progress_span_" + event.data.id).hide();
					 $("#comment_submission_form_submit_button_" + event.data.id).removeAttr('disabled');
				 }
			 });
}

function createKeyupEventForTextarea(id, charlimit){
	 $("#comment_textarea_" + id).keyup({id: id}, function (event) {
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
				 
				 chrome.runtime.sendMessage({method: "setSavedText", saved_text: $("#comment_textarea_" + event.data.id).val(), saved_text_dom_id: "comment_textarea_" + event.data.id}, function(response) {
					  //alert(response.message);
				 });
			 }
	 );
}

function createBlurEventForTextarea(id)
{
	 $("#comment_textarea_" + id).blur({id: id}, function (event) {
				if($("#comment_textarea_" + event.data.id).val() === "") // if the user has written anything, leave the composition + submission area the way it is
				{
					$("#comment_textarea_" + event.data.id).css("height", "30px");			// set it back to normal height
					$("#comment_textarea_" + event.data.id).val("Say something..."); // set the default wording
					$("#char_count_and_submit_button_div_" + event.data.id).hide();			// hide the charcount and submit area
					$("#comment_textarea_" + event.data.id).css("color", "#aaa");			// reset the text to gray
				}
			});
}

function createFocusEventForTextarea(id, message_element)
{
	 $("#comment_textarea_" + id).focus({id: id, message_element: message_element}, function (event) {
		 if(typeof user_jo === "undefined" || user_jo === null)
		 {
			 displayMessage("Unable to compose comment. You are not logged in.", "red", event.data.message_element);
			 $("#comment_textarea_" + event.data.id).trigger("blur");
		 }
		 else // user logged in and rating ok
		 {	 
			 if(user_jo.rating <= -5)
			 {
				 displayMessage("Unable to compose comment. Your comment rating is too low.", "red", event.data.message_element);
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
	 $("#" + dom_id).click( function (event) { event.preventDefault();
	 			 if(chrome.tabs)
	 				 chrome.tabs.create({url:inc_url});
	 			 else
	 				 window.location = inc_url;
				 noteConversion(id);
			 });
 }
 