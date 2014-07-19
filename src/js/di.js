var h = window.location.hostname;

var count = (h.split(".").length - 1);
if(count === 1)
	h = "www." + h;

if(h === "www.techcrunch.com")
{
	var elem = null;
	elem = document.getElementById("words_div"); // the document is finished, find the comments-container	
	if(elem === null)	
	{
		elem = document.getElementById("comments-container");
	}
	
	if(typeof elem !== "undefined" && elem !== null && elem.id !== "words_div")
	{	
		elem.innerHTML = ""; // blank it.
		elem.setAttribute("id", "words_div");
	}
}


