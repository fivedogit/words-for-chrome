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
