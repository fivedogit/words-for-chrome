/* This software is copyrighted.
 * It is open source, but the code is not free to use or redistribute. Sorry. 
 */

var user_jo;
var thread_jo; 

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

chrome.extension.onMessage.addListener(function(request, sender, callback)
{
	if (request.action === "embedWORDS")
	{
		var alreadyfound = false;
		var elem = document.getElementById("comments-container"); // the document is finished, find the comments-container
		elem.innerHTML = ""; // blank it.
		
		if(!alreadyfound && elementInViewport(document.getElementById("comments-container"))) // when found for the first time...
		{
			alreadyfound = true;
			thread_jo = request.thread_jo;
			user_jo = request.user_jo;
			var newhtml = "<table style=\"width:100%;height:32px;border:1px solid black;padding:10px;margin:0px;border-collapse:separate\">";
			newhtml = newhtml + "<tr>";
			newhtml = newhtml + "	<td style=\"width:32px;border:0px\">WORDS HERE";
			newhtml = newhtml + "	</td>";
			newhtml = newhtml + "</tr>";
			newhtml = newhtml + "</table>";
			document.getElementById("comments-container").innerHTML = newhtml; // populate it with WORDS
		}	
		
		window.onscroll = function(){  // when scrolling, look for it
			if(!alreadyfound && elementInViewport(document.getElementById("comments-container"))) // when found for the first time...
			{
				alreadyfound = true;
				thread_jo = request.thread_jo;
				user_jo = request.user_jo;
				var newhtml = "<table style=\"width:100%;height:32px;border:1px solid black;padding:10px;margin:0px;border-collapse:separate\">";
				newhtml = newhtml + "<tr>";
				newhtml = newhtml + "	<td style=\"width:32px;border:0px\">WORDS HERE";
				newhtml = newhtml + "	</td>";
				newhtml = newhtml + "</tr>";
				newhtml = newhtml + "</table>";
				document.getElementById("comments-container").innerHTML = newhtml; // populate it with WORDS
			}	
		};
		return;
	}	
});