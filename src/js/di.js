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

/*
chrome.runtime.sendMessage({method: "getAllowedHostnames"}, function(response) {
	//alert(JSON.stringify(response.allowed_hostnames));
	var keys = Object.keys(response.allowed_hostnames);
	if(keys.indexOf(h) !== -1)
	{	
		var elem = null;
		elem = document.getElementById("words_div"); // the document is finished, find the comments-container	
		if(elem === null)	
		{
			//alert(JSON.stringify(response.allowed_hostnames));
			//alert(JSON.stringify(response.allowed_hostnames[h]));
			var element_id = response.allowed_hostnames[h].element_id; //[response.allowed_hostnames.indexOf(h)];
			//alert(JSON.stringify(response.allowed_hostnames) + " " + JSON.stringify(response.corresponding_element_ids));
			//alert("index = " + response.allowed_hostnames.indexOf(h));
			alert("element id we're looking for=" + element_id + " action=" + response.allowed_hostnames[h].action);
			if(element_id === "none")
				elem = null;
			else
			{
				
				elem = document.getElementById(element_id);
			}
		}

		if(typeof elem !== "undefined" && elem !== null && elem.id !== "words_div")
		{	
			alert("elem not undefined or null, id not equal to words_div");
			if(response.allowed_hostnames[h].action === "replace")
			{
				alert("replacing");
				elem.innerHTML = ""; // blank it.
				elem.setAttribute("id", "words_div");
			}
			else if(response.allowed_hostnames[h].action === "before")
			{
				alert("inserting before");
				var parent = elem.parentNode;
				var temp = document.createElement("div");
				parent.insertBefore(temp,elem);
				elem = temp;
				elem.setAttribute("id", "words_div");
			}
			else if(response.allowed_hostnames[h].action === "after")
			{
				alert("inserting after");
				var parent = elem.parentNode;
				var temp = document.createElement("div");
				parent.insertAfter(temp,elem);
				elem = temp;
				elem.setAttribute("id", "words_div");
			}
		}
	}
});*/


