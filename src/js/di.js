var elem = null;
	elem = document.getElementById("words_div"); // the document is finished, find the comments-container	
	if(elem === null)
		elem = document.getElementById("comments-container"); // the document is finished, find the comments-container
	if(elem === null)
		elem = document.getElementById("comments"); // the document is finished, find the comments-container
	if(elem === null)
		elem = document.getElementById("disqus_thread"); // the document is finished, find the comments-container
	
	if(typeof elem !== "undefined" && elem !== null && elem.id !== "words_div")
	{	
		//alert("0 " + elem.id);
		elem.innerHTML = ""; // blank it.
		elem.setAttribute("id", "words_div");
		//$("#words_div").css("height", "650px");
		//$("#words_div").css("overflow", "auto");
	}
	else
	{
		// do nothing
	}