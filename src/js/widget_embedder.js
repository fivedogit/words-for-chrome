/* This software is copyrighted.
 * It is open source, but the code is not free to use or redistribute. Sorry. 
 */

var user_jo;
var thread_jo;
var currentURLhash;

function findClass(matchClass) {
    var elems = document.getElementsByTagName('*'), i;
    for (i in elems) {
        if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
                > -1) {
            alert("found class " + matchClass);
            return elems[i];
        }
    }
}

function elementInViewport(el) {
	  var top = el.offsetTop;
	  var left = el.offsetLeft;
	  var width = el.offsetWidth;
	  var height = el.offsetHeight;

	  while(el.offsetParent) {
	    el = el.offsetParent;
	    top += el.offsetTop;
	    left += el.offsetLeft;
	  }

	  return (
	    top >= window.pageYOffset &&
	    left >= window.pageXOffset &&
	    (top + height) <= (window.pageYOffset + window.innerHeight) &&
	    (left + width) <= (window.pageXOffset + window.innerWidth)
	  );
	}

//this is modified to handle our timestamps only. Had to chop off a string of zeros at the front with a hack (length - 7)
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

function doEet(request)
{
	alert("doing eet, for rills");
	thread_jo = request.thread_jo;
	user_jo = request.user_jo;
	var main_div_string = "";
	main_div_string = main_div_string + "<div class=\"no-comments-div\">";
	main_div_string = main_div_string + "	No comments for this page. Write one!";
	main_div_string = main_div_string + "</div>";
	main_div_string = main_div_string + "<div style=\"text-align:center;font-size:13px;padding-top:10px;padding-bottom:3px;display:none;border-top:1px solid black\" id=\"trending_on_this_site_div\">";
	main_div_string = main_div_string + "	<img src=\"http://www.google.com/s2/favicons?domain=" + request.currentURL + "\" style=\"vertical-align:middle\"> " + "currentHostname" + " (<span id=\"num_hours_span\"></span> hrs)";
	main_div_string = main_div_string + "</div>";
	main_div_string = main_div_string + "<table id=\"trending_for_this_site_table\" style=\"display:none\">";
	main_div_string = main_div_string + "	<tr>";
	main_div_string = main_div_string + "		<td style=\"width:50%;padding:10px;vertical-align:top;text-align:center;font-weight:bold\">";
	main_div_string = main_div_string + "Most active pages";
	main_div_string = main_div_string + "		</td>";
	main_div_string = main_div_string + "		<td style=\"width:50%;padding:10px;vertical-align:top;text-align:center;font-weight:bold\">";
	main_div_string = main_div_string + "Most liked pages";
	main_div_string = main_div_string + "		</td>";
	main_div_string = main_div_string + "	</tr>";
	main_div_string = main_div_string + "	<tr>";
	main_div_string = main_div_string + "		<td id=\"most_active_pages_on_this_site_td\" style=\"width:50%;padding:6px;vertical-align:top\">";
	main_div_string = main_div_string + "<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">";
	main_div_string = main_div_string + "		</td>";
	main_div_string = main_div_string + "		<td id=\"most_liked_pages_on_this_site_td\" style=\"width:50%;padding:6px;vertical-align:top\">";
	main_div_string = main_div_string + "<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">";
	main_div_string = main_div_string + "		</td>";
	main_div_string = main_div_string + "	</tr>";
	main_div_string = main_div_string + "</table>";
	$("#main_div_" + currentURLhash).html(main_div_string);//OK
	alert("after dothreadtab");
}

chrome.extension.onMessage.addListener(function(request, sender, callback)
{
	alert("msg " + request.currentURL);
	currentURLhash = fromDecimalToOtherBase(62,hashFnv32a(request.currentURL));
	
	if (request.action === "embedWORDS")
	{
		alert(currentURLhash);
		var alreadyfound = false;
		var elem = document.getElementById("comments-container"); // the document is finished, find the comments-container
		if(typeof elem !== "undefined" && elem !== null)
		{	
			elem.innerHTML = ""; // blank it.
			document.getElementById("comments-container").setAttribute("id", "main_div_" + currentURLhash);
		}
		else
		{
			elem = document.getElementById("main_div_" + currentURLhash);
		}
		
		
		if(!alreadyfound && elementInViewport(elem)) // when found for the first time...
		{
			alreadyfound = true;
			alert("doing eet 0");
			doEet(request);
		}	
		
		window.onscroll = function(){  // when scrolling, look for it
		//$(window).scroll({
			if(!alreadyfound && elementInViewport(elem)) // when found for the first time...
			{
				alreadyfound = true;
				alert("doing eet 1");
				doEet(request);
			}	
		};
		return;
	}
});
