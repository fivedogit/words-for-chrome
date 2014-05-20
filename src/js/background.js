var style = document.createElement('style'); 
var style_str =  "@font-face {";
style_str = style_str + "font-family: \"Silkscreen\";";
style_str = style_str + "src: url(\"type/slkscr.ttf\");";
style_str = style_str + "}";
style.innerHTML = style_str;
document.documentElement.appendChild(style); 

var currentURL = "";
var currentTitle = "";
var currentId = "";
var t_jo;
var threadstatus = 0;
var top="???";
var bottom="???";
var msfe_according_to_backend = (new Date).getTime(); // set to local machine time to start... will be reset to backend time by first thread call.
var footer_random_pool = 12; // start at 12, let backend change

(function() {
	getUser(); // user_jo should always be null when this is called
	t_jo = null;
	chrome.tabs.getSelected(null, function(tab) {
		currentURL = tab.url;
		currentTitle = tab.title;
		currentId = tab.id;
		
		var canvas = document.getElementById("button_canvas");
		var context = canvas.getContext("2d");
		context.fillStyle = "#ffffff";
		context.font = "8px Silkscreen";
		context.fillText("PRIMER",0,0);
		setTimeout(function() {doButtonGen();},2000);
	});
})();

// GENERIC FUNCTIONS
function getColorHexStringFromRGB(r, g, b)
{
	var r_hex = ~~r;
	r_hex = r_hex.toString(16);//.substring(2);
	if (r_hex.length === 1)
		r_hex = "0" + r_hex;
	var g_hex = ~~g;
	g_hex = g_hex.toString(16);//.substring(2);
	if (g_hex.length === 1)
		g_hex = "0" + g_hex;
	var b_hex = ~~b;
	b_hex = b_hex.toString(16);
	if (b_hex.length === 1)
		b_hex = "0" + b_hex;
	return "#" + r_hex + g_hex + b_hex;
}

//REAL FUNCTIONS, IN EXECUTION ORDER TOP2BOTTOM (sort of) 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatingtab) {
	if (changeInfo.status === "loading") // also fires at "complete", which I'm ignoring here. Only need one (this one).
	{
		chrome.tabs.getSelected(null, function(tab) { // only follow through if the updating tab is the same as the selected tab, don't want background tabs reloading and wrecking stuff
			if(updatingtab.url === tab.url) // the one that's updating is the one we're looking at. good. proceed
			{
				if(currentURL !== tab.url) //  && tab.url.indexOf("chrome-extension://") !== 0) // only do this if the update is of a new url, no point in reloading the existing url again
				{	
					currentURL = updatingtab.url;
					currentTitle = updatingtab.title;
					currentId = tab.id;
					drawTTUButton("   ", "   "); // clear out what's there now
					doButtonGen();
				}
			}	
		});
	}
	else if (changeInfo.status === "complete") // also fires at "complete", which I'm ignoring here. Only need one (this one).
	{
		//alert("onupdated complete");
	}
}); 

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.getSelected(null, function(tab) {
		if(typeof tab.url !== "undefined" && tab.url !== null && tab.url !== "")
		{
			//alert("tab activation event tab.url=" + tab.url);
			getUser(); // get user on every valid tab change. This updates notifications and logstat (do not getUser on random page updates)
			currentURL = tab.url;
			currentTitle = tab.title;
			currentId = tab.id;
			drawTTUButton("   ", "   "); // clear out anything that's there now
			doButtonGen();
		}
	});
}); 


function doButtonGen()
{
	var url_at_function_call = currentURL;	   // need to save the currentURL bc if it has changed by the time threads come back, they are irrelevant at that point
	t_jo = null;
	
	// priority order: 
	// 1. display a url error, if applicable
	// 2. go get thread
	// 		if notification, draw big number in button
	//      if not, draw thread info in button
	if (!isValidURLFormation(currentURL))
	{
		drawTTUButton("?", "URL");
		return;
	}	
	else 
	{
		url_at_function_call = currentURL;
		getThread(url_at_function_call, true); // updatebutton = true
	}
}

function getThread(url_at_function_call, updatebutton) 
{
	// This function always calls getThread and getUserSelf (if credentials available) at the same time. 
	// Once it is finished getting the thread, it updates the button and goes to a ready state for thread viewing.
	// The reason these are not called together is because the getThread call can be cached. The user call cannot.
	// Adding the user call to the thread call would render getThread uncacheable. 
	
	t_jo = null;
	var loc_thread_jo = null;
	threadstatus = 1;
	//alert("getting thread. " + url_at_function_call);
	$.ajax({ 
		type: 'GET', 
		url: endpoint, 
		data: {
            method: "getThread",
            url: url_at_function_call
        },
        dataType: 'json', 
        async: true, 
        success: function (data, status) {
        	if(currentURL === url_at_function_call)
        	{
        		if (typeof data.response_status === "undefined" || data.response_status === null || data.response_status === "error") 
            	{
        			// no need to provide code "0000" coverage here as credentials are not required for getThread
        			
        			displayMessage(data.message, "red");
        			threadstatus=0;
            	} 
            	else  // ajax success, url still correct, no error from server...
            	{
            		msfe_according_to_backend = data.msfe;
            		if(typeof data.footer_random_pool !== "undefined" && data.footer_random_pool !== null && $.isNumeric(data.footer_random_pool) && (data.footer_random_pool%1 === 0))
            		{
            			footer_random_pool = data.footer_random_pool;
            		}
            		loc_thread_jo = data.thread_jo;
            		threadstatus=0;
            	}
        	}
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	//alert("ajax error getting thread");
        	if(currentURL === url_at_function_call)
        	{
        		threadstatus=0;
        	}
            console.log(textStatus, errorThrown);
            drawTTUButton("---", "---");
        } 
	});
	
	// the following ugly piece of code waits for up to 7 seconds for the thread to finish. Checking every .333 seconds, exiting upon completion
	// as ugly as this is, there really isn't a better, more robust way to do animations in a chrome extension. Loops with setTimeout get really hairy. Don't judge.
	// if there is a better way, please submit a bug report on Github or notify me on twitter
	setTimeout(function () {
	    if (updatebutton && (url_at_function_call === currentURL)) {
	        drawTTUButton("-  ", "-  ")
	    }
	    if (threadstatus === 0 && loc_thread_jo != null) {
	        finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	        return;
	    }
	    if (currentURL !== url_at_function_call) {
	        return;
	    }
	    setTimeout(function () {
	        if (updatebutton && (url_at_function_call === currentURL)) {
	            drawTTUButton("-- ", "-- ")
	        }
	        if (threadstatus === 0 && loc_thread_jo != null) {
	            finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	            return;
	        }
	        if (currentURL !== url_at_function_call) {
	            return;
	        }
	        setTimeout(function () {
	            if (updatebutton && (url_at_function_call === currentURL)) {
	                drawTTUButton(" --", " --")
	            }
	            if (threadstatus === 0 && loc_thread_jo != null) {
	                finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                return;
	            }
	            if (currentURL !== url_at_function_call) {
	                return;
	            }
	            setTimeout(function () {
	                if (updatebutton && (url_at_function_call === currentURL)) {
	                    drawTTUButton("  -", "  -")
	                }
	                if (threadstatus === 0 && loc_thread_jo != null) {
	                    finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                    return;
	                }
	                if (currentURL !== url_at_function_call) {
	                    return;
	                }
	                setTimeout(function () {
	                    if (updatebutton && (url_at_function_call === currentURL)) {
	                        drawTTUButton("   ", "   ")
	                    }
	                    if (threadstatus === 0 && loc_thread_jo != null) {
	                        finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                        return;
	                    }
	                    if (currentURL !== url_at_function_call) {
	                        return;
	                    }
	                    setTimeout(function () {
	                        if (updatebutton && (url_at_function_call === currentURL)) {
	                            drawTTUButton("-  ", "-  ")
	                        }
	                        if (threadstatus === 0 && loc_thread_jo != null) {
	                            finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                            return;
	                        }
	                        if (currentURL !== url_at_function_call) {
	                            return;
	                        }
	                        setTimeout(function () {
	                            if (updatebutton && (url_at_function_call === currentURL)) {
	                                drawTTUButton("-- ", "-- ")
	                            }
	                            if (threadstatus === 0 && loc_thread_jo != null) {
	                                finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                return;
	                            }
	                            if (currentURL !== url_at_function_call) {
	                                return;
	                            }
	                            setTimeout(function () {
	                                if (updatebutton && (url_at_function_call === currentURL)) {
	                                    drawTTUButton(" --", " --")
	                                }
	                                if (threadstatus === 0 && loc_thread_jo != null) {
	                                    finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                    return;
	                                }
	                                if (currentURL !== url_at_function_call) {
	                                    return;
	                                }
	                                setTimeout(function () {
	                                    if (updatebutton && (url_at_function_call === currentURL)) {
	                                        drawTTUButton("  -", "  -")
	                                    }
	                                    if (threadstatus === 0 && loc_thread_jo != null) {
	                                        finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                        return;
	                                    }
	                                    if (currentURL !== url_at_function_call) {
	                                        return;
	                                    }
	                                    setTimeout(function () {
	                                        if (updatebutton && (url_at_function_call === currentURL)) {
	                                            drawTTUButton("   ", "   ")
	                                        }
	                                        if (threadstatus === 0 && loc_thread_jo != null) {
	                                            finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                            return;
	                                        }
	                                        if (currentURL !== url_at_function_call) {
	                                            return;
	                                        }
	                                        setTimeout(function () {
	                                            if (updatebutton && (url_at_function_call === currentURL)) {
	                                                drawTTUButton("-  ", "-  ")
	                                            }
	                                            if (threadstatus === 0 && loc_thread_jo != null) {
	                                                finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                return;
	                                            }
	                                            if (currentURL !== url_at_function_call) {
	                                                return;
	                                            }
	                                            setTimeout(function () {
	                                                if (updatebutton && (url_at_function_call === currentURL)) {
	                                                    drawTTUButton("-- ", "-- ")
	                                                }
	                                                if (threadstatus === 0 && loc_thread_jo != null) {
	                                                    finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                    return;
	                                                }
	                                                if (currentURL !== url_at_function_call) {
	                                                    return;
	                                                }
	                                                setTimeout(function () {
	                                                    if (updatebutton && (url_at_function_call === currentURL)) {
	                                                        drawTTUButton(" --", " --")
	                                                    }
	                                                    if (threadstatus === 0 && loc_thread_jo != null) {
	                                                        finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                        return;
	                                                    }
	                                                    if (currentURL !== url_at_function_call) {
	                                                        return;
	                                                    }
	                                                    setTimeout(function () {
	                                                        if (updatebutton && (url_at_function_call === currentURL)) {
	                                                            drawTTUButton("  -", "  -")
	                                                        }
	                                                        if (threadstatus === 0 && loc_thread_jo != null) {
	                                                            finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                            return;
	                                                        }
	                                                        if (currentURL !== url_at_function_call) {
	                                                            return;
	                                                        }
	                                                        setTimeout(function () {
	                                                            if (updatebutton && (url_at_function_call === currentURL)) {
	                                                                drawTTUButton("   ", "   ")
	                                                            }
	                                                            if (threadstatus === 0 && loc_thread_jo != null) {
	                                                                finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                                return;
	                                                            }
	                                                            if (currentURL !== url_at_function_call) {
	                                                                return;
	                                                            }
	                                                            setTimeout(function () {
	                                                                if (updatebutton && (url_at_function_call === currentURL)) {
	                                                                    drawTTUButton("-  ", "-  ")
	                                                                }
	                                                                if (threadstatus === 0 && loc_thread_jo != null) {
	                                                                    finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                                    return;
	                                                                }
	                                                                if (currentURL !== url_at_function_call) {
	                                                                    return;
	                                                                }
	                                                                setTimeout(function () {
	                                                                    if (updatebutton && (url_at_function_call === currentURL)) {
	                                                                        drawTTUButton("-- ", "-- ")
	                                                                    }
	                                                                    if (threadstatus === 0 && loc_thread_jo != null) {
	                                                                        finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                                        return;
	                                                                    }
	                                                                    if (currentURL !== url_at_function_call) {
	                                                                        return;
	                                                                    }
	                                                                    setTimeout(function () {
	                                                                        if (updatebutton && (url_at_function_call === currentURL)) {
	                                                                            drawTTUButton(" --", " --")
	                                                                        }
	                                                                        if (threadstatus === 0 && loc_thread_jo != null) {
	                                                                            finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                                            return;
	                                                                        }
	                                                                        if (currentURL !== url_at_function_call) {
	                                                                            return;
	                                                                        }
	                                                                        setTimeout(function () {
	                                                                            if (updatebutton && (url_at_function_call === currentURL)) {
	                                                                                drawTTUButton("  -", "  -")
	                                                                            }
	                                                                            if (threadstatus === 0 && loc_thread_jo != null) {
	                                                                                finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                                                return;
	                                                                            }
	                                                                            if (currentURL !== url_at_function_call) {
	                                                                                return;
	                                                                            }
	                                                                            setTimeout(function () {
	                                                                                if (updatebutton && (url_at_function_call === currentURL)) {
	                                                                                    drawTTUButton("   ", "   ")
	                                                                                }
	                                                                                if (threadstatus === 0 && loc_thread_jo != null) {
	                                                                                    finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                                                    return;
	                                                                                }
	                                                                                if (currentURL !== url_at_function_call) {
	                                                                                    return;
	                                                                                }
	                                                                                setTimeout(function () {
	                                                                                    if (updatebutton && (url_at_function_call === currentURL)) {
	                                                                                        drawTTUButton("---", "---");
	                                                                                        threadstatus = 0;
	                                                                                    }
	                                                                                    if (currentURL !== url_at_function_call) {
	                                                                                        return;
	                                                                                    }
	                                                                                    finishThread(loc_thread_jo, updatebutton, url_at_function_call);
	                                                                                    return;
	                                                                                }, 333)
	                                                                            }, 333)
	                                                                        }, 333)
	                                                                    }, 333)
	                                                                }, 333)
	                                                            }, 333)
	                                                        }, 333)
	                                                    }, 333)
	                                                }, 333)
	                                            }, 333)
	                                        }, 333)
	                                    }, 333)
	                                }, 333)
	                            }, 333)
	                        }, 333)
	                    }, 333)
	                }, 333)
	            }, 333)
	        }, 333)
	    }, 333)
	}, 333);
}

function finishThread(inc_thread_jo, updatebutton, url_at_function_call) 
{
	if (url_at_function_call === currentURL)
	{
		t_jo = inc_thread_jo;
		if(updatebutton) // don't update if the currentURL has changed, the info is irrelevant in that case
		{
			if(user_jo && user_jo.notification_count > 0)
			{
				if(user_jo.notification_count > 9)
					drawTTUButton("9", "NOTIFICATION");
				else
					drawTTUButton(user_jo.notification_count, "NOTIFICATION");
			}	
			else
			{	
				var top_and_bottom = [];
				if(inc_thread_jo.children)
				{ top_and_bottom = getTopAndBottom(inc_thread_jo.children); 
				drawTTUButton(top_and_bottom[0], top_and_bottom[1]); }
				else
				{ drawTTUButton("0", "1Y"); }
			}
		}	
	}
	else
	{
		// do nothing. Let whichever thread is in control now handle the button
	}	
}

function getTopAndBottom(inc_stripped)
{
	var top = inc_stripped.length+"";
	var bottom = "1Y";
	if (top === "0")
	{
		var tb = [];
		tb.push(top);
		tb.push(bottom);
		return tb;
	}
	else
	{
		var d = new Date();
		var now = d.getTime();
		var yearago = now - 31556901000;
		var monthago = now - 2592000000;
		var weekago = now - 604800000;
		var dayago = now - 86400000;
		var millisecondsintheyearportion = monthago - yearago;
		var millisecondsinthemonthportion = weekago - monthago;
		var millisecondsintheweekportion = dayago - weekago;
		var millisecondsinthedayportion = now - dayago;
		var yearportionweight = millisecondsintheyearportion / 31556901000;
		var monthportionweight = millisecondsinthemonthportion / 31556901000;
		var weekportionweight = millisecondsintheweekportion / 31556901000;
		var dayportionweight = millisecondsinthedayportion / 31556901000;
		var hitsintheyearportion = 0;
		var hitsinthemonthportion = 0;
		var hitsintheweekportion = 0;
		var hitsinthedayportion = 0;
		var currenttimestamp = 0;
		for(var x = 0; x < inc_stripped.length; x++)
	    {
			currenttimestamp = fromOtherBaseToDecimal(62, inc_stripped[x].substring(0,7));
			if (currenttimestamp > dayago && currenttimestamp < now) // this comment happened between now and 24 hours ago
				hitsinthedayportion++;
			else if (currenttimestamp > weekago && currenttimestamp < dayago)
				hitsintheweekportion++;
			else if (currenttimestamp > monthago && currenttimestamp < weekago)
				hitsinthemonthportion++;
			else if (currenttimestamp > yearago && currenttimestamp < monthago)
				hitsintheyearportion++;
		}
		var dayscore = hitsinthedayportion / dayportionweight;
		var weekscore = hitsintheweekportion / weekportionweight;
		var monthscore = hitsinthemonthportion / monthportionweight;
		var yearscore = hitsintheyearportion / yearportionweight;
		var scores = [];
		scores.push(dayscore);
		scores.push(weekscore);
		scores.push(monthscore);
		scores.push(yearscore);
		var max = 0;
		var index = 0;
		for(var x = 0; x < scores.length; x++)
		{
			if (scores[x] > max)
			{
				max = scores[x];
				index = x;
			}	
		}
		if (index === 0)
		{
			top = hitsinthedayportion;
			bottom = "24h";
		}
		else if (index === 1)
		{
			top = hitsintheweekportion;
			bottom = "7d";
		}
		else if (index === 2)
		{
			top = hitsinthemonthportion;
			bottom = "30d";
		}
		else if (index === 3)
		{
			top = hitsintheyearportion;
			bottom = "1Y";
		}
		top = top + "";
		var tb = [];
		tb.push(top);
		tb.push(bottom);
		return tb;
	}
}


//draws the button. if bottom=="NOTIFICATION", then top is displayed larger (and bottom is not displayed)
function drawTTUButton(top, bottom) {
	
 // Get the canvas element.
 var canvas = document.getElementById("button_canvas");

 // Specify a 2d drawing context.
 var context = canvas.getContext("2d");
 
 var top_color = "4c7dd0";//<-- chrome blue   "29abe2"; <-- original teal-ish color
 
 var top_bg_r = "0x" + top_color.substring(0,2);
 var top_bg_g = "0x" + top_color.substring(2,4);
 var top_bg_b = "0x" + top_color.substring(4,6);
 if (devel === true) 
 {
 	top_bg_r = 0x55;
     top_bg_g = 0x55;
     top_bg_b = 0x55;
 }
           
 var bottom_bg_r = "0x00"; 
 var bottom_bg_g = "0x00";
 var bottom_bg_b = "0x00"; 

 context.fillStyle = getColorHexStringFromRGB(top_bg_r, top_bg_g, top_bg_b);
 context.fillRect (0, 0, 19, 8); 
 context.fillStyle = getColorHexStringFromRGB(bottom_bg_r, bottom_bg_g, bottom_bg_b);
 context.fillRect (0, 8, 19, 19); 
 var imageData = context.getImageData(0, 0, 19, 19);
 var pix = imageData.data;
 var r = 0; var g = 0; var b = 0; var a = 255;
 for (var i = 0, n = pix.length; i < n; i += 4) 
 {
 	r = 0; g = 0; b = 0; a = 255;
 	if (i === 0 || i === 72 || i === 1140 || i === 1212 // four corner roundings
 			|| (i >= 1216 && i <= 1224) || (i >= 1240 && i <= 1288) // first row below bubble
 			|| (i >= 1292 && i <= 1304) || (i >= 1316 && i <= 1364) // second row below bubble
 			|| (i >= 1368 && i <= 1384) || (i >= 1392))
 	{ 
 		r	= 255; g = 255; b = 255; a = 0; 
 		pix[i  ] = r; // red
 		pix[i+1] = g; // green
 		pix[i+2] = b; // blue
 		pix[i+3] = a; // i+3 is alpha (the fourth element)
 	}
 }

 context.putImageData(imageData, 0, 0);

 if (bottom === "NOTIFICATION")
 {
 	context.fillStyle = "#ffffff";
     context.font = "16px Silkscreen";
     if (top === "1" || top === 1)
     	context.fillText(top,5,13);
     else
     	context.fillText(top,4,13);
 }
 else
 {
 	context.fillStyle = "#ffffff";
     context.font = "8px Silkscreen";
     if (top.length === 1)
     	context.fillText(top,7,6);
     else if (top.length === 2)
     	context.fillText(top,4,6);
     else if (top.length === 3)
     	context.fillText(top,1,6);
     
     context.fillStyle = "#ffffff";
     context.font = "8px Silkscreen";
     if (bottom.length === 1)
     	context.fillText(bottom,7,14);
     else if (bottom.length === 2)
     	context.fillText(bottom,4,14);
     else if (bottom.length === 3)
     {
     	context.fillText(bottom,1,14);
     }
 }
 
 imageData = context.getImageData(0, 0, 19, 19);
 chrome.browserAction.setIcon({
   imageData: imageData
 });
}


function getUser(retrieve_asynchronously)
{
	var async = true;
	if(retrieve_asynchronously != null && retrieve_asynchronously == false)
		async = false;
	var email = docCookies.getItem("email");
	var this_access_token = docCookies.getItem("this_access_token");
	if(email !== null && email.length >=6 && this_access_token !== null && this_access_token.length == 32)// the shortest possible email length is x@b.co = 6.
	{
		//alert("bg.getUserSelf()");
		$.ajax({ 
			type: 'GET', 
			url: endpoint, 
			data: {
	            method: "getUserSelf",
	            email: email,							
	            this_access_token: this_access_token	
	        },
	        dataType: 'json', 
	        async: async, 
	        timeout: 20000,
	        success: function (data, status) {
	        	if (data.response_status === "error") 
            	{
            		if(data.error_code && data.error_code === "0000")
            		{
            			//alert("getUser error 0000");
            			docCookies.removeItem("email"); 
            			docCookies.removeItem("this_access_token");
            			user_jo = null;
            		}
            	} 
            	else if (data.response_status === "success") 
            	{	if(data.user_jo) { 	user_jo = data.user_jo; }    }
            	else
            	{
            		//alert("getUser problem. response_status neither success nor error");
            	}
	        },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	            console.log(textStatus, errorThrown);
	        } 
		});
	}
	else if(email !== null || this_access_token !== null) // if either of these is not null and we've gotten here, 
	{													  // something is rotten in denmark re: cookie credentials, delete them 	
		docCookies.removeItem("email"); 
		docCookies.removeItem("this_access_token");
		user_jo = null;
	}
	else
	{
		user_jo = null; // proceed with user_jo = null
	}
}

// FIRSTRUN 

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
    	chrome.tabs.create({url:"http://www.words4chrome.com/firstrun.html"});
    }else if(details.reason == "update"){
      //  var thisVersion = chrome.runtime.getManifest().version;
      //  alert("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});
