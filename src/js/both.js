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

