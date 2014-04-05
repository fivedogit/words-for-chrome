
var user_jo;
var devel = true;
var endpoint = "https://w.ords.co/endpoint";
if (devel)
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

// need to include this here because it resides in buttongen.js on the extension itself
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
    /*jshint bitwise:false */
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

function getUser()
{
	var email = docCookies.getItem("email");
	var this_access_token = docCookies.getItem("this_access_token");
	if(email !== null && email.length >=6 && this_access_token !== null && this_access_token.length == 36)// the shortest possible email length is x@b.co = 6.
	{
		$.ajax({ 
			type: 'GET', 
			url: endpoint, 
			data: {
	            method: "getUserSelf",
	            email: email,							
	            this_access_token: this_access_token	
	        },
	        dataType: 'json', 
	        async: true, 
	        success: function (data, status) {
	        	if (data.response_status === "error") 
            	{
            		if(data.error_code && data.error_code === "0000")
            		{
            			docCookies.removeItem("email"); 
            			docCookies.removeItem("this_access_token");
            			user_jo = null;
            		}
            	} 
            	else if (data.response_status === "success") 
            	{	if(data.user_jo) { 	user_jo = data.user_jo; }    }
            	else
            	{
            		console.log("getUser() response not success or error. Should never happen. Deleting cookies to allow user to start over from scratch, just in case.");
            		docCookies.removeItem("email"); 
            		docCookies.removeItem("this_access_token");
            		user_jo = null;
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

/***
 *          __      __  _______       _____  
 *         /\ \    / /\|__   __|/\   |  __ \ 
 *        /  \ \  / /  \  | |  /  \  | |__) |
 *       / /\ \ \/ / /\ \ | | / /\ \ |  _  / 
 *      / ____ \  / ____ \| |/ ____ \| | \ \ 
 *     /_/    \_\/_/    \_\_/_/    \_\_|  \_\
 *                                           
 *                                           
 */

//Dropdown plugin data
var avatarData=[{text:"Avatar 0",value:0,selected:false,description:"Avatar 0",imageSrc:"images/avatars/48avatar00.png"},
                {text:"Avatar 1",value:1,selected:false,description:"Avatar 1",imageSrc:"images/avatars/48avatar01.png"},
                {text:"Avatar 2",value:2,selected:false,description:"Avatar 2",imageSrc:"images/avatars/48avatar02.png"},
                {text:"Avatar 3",value:3,selected:false,description:"Avatar 3",imageSrc:"images/avatars/48avatar03.png"},
                {text:"Avatar 4",value:4,selected:false,description:"Avatar 4",imageSrc:"images/avatars/48avatar04.png"},
                {text:"Avatar 5",value:5,selected:false,description:"Avatar 5",imageSrc:"images/avatars/48avatar05.png"},
                {text:"Avatar 6",value:6,selected:false,description:"Avatar 6",imageSrc:"images/avatars/48avatar06.png"},
                {text:"Avatar 7",value:7,selected:false,description:"Avatar 7",imageSrc:"images/avatars/48avatar07.png"},
                {text:"Avatar 8",value:8,selected:false,description:"Avatar 8",imageSrc:"images/avatars/48avatar08.png"},
                {text:"Avatar 9",value:9,selected:false,description:"Avatar 9",imageSrc:"images/avatars/48avatar09.png"},
                {text:"Avatar 10",value:10,selected:false,description:"Avatar 10",imageSrc:"images/avatars/48avatar10.png"},
                {text:"Avatar 11",value:11,selected:false,description:"Avatar 11",imageSrc:"images/avatars/48avatar11.png"},
                {text:"Avatar 12",value:12,selected:false,description:"Avatar 12",imageSrc:"images/avatars/48avatar12.png"},
                {text:"Avatar 13",value:13,selected:false,description:"Avatar 13",imageSrc:"images/avatars/48avatar13.png"},
                {text:"Avatar 14",value:14,selected:false,description:"Avatar 14",imageSrc:"images/avatars/48avatar14.png"},
                {text:"Avatar 15",value:15,selected:false,description:"Avatar 15",imageSrc:"images/avatars/48avatar15.png"},
                {text:"Avatar 16",value:16,selected:false,description:"Avatar 16",imageSrc:"images/avatars/48avatar16.png"},
                {text:"Avatar 17",value:17,selected:false,description:"Avatar 17",imageSrc:"images/avatars/48avatar17.png"},
                {text:"Avatar 18",value:18,selected:false,description:"Avatar 18",imageSrc:"images/avatars/48avatar18.png"},
                {text:"Avatar 23",value:23,selected:false,description:"Avatar 23",imageSrc:"images/avatars/48avatar23.png"},
                {text:"Avatar 20",value:20,selected:false,description:"Avatar 20",imageSrc:"images/avatars/48avatar20.png"},
                {text:"Avatar 21",value:21,selected:false,description:"Avatar 21",imageSrc:"images/avatars/48avatar21.png"},
                {text:"Avatar 22",value:22,selected:false,description:"Avatar 22",imageSrc:"images/avatars/48avatar22.png"},
                {text:"Avatar 23",value:23,selected:false,description:"Avatar 23",imageSrc:"images/avatars/48avatar23.png"},
                {text:"Avatar 24",value:24,selected:false,description:"Avatar 24",imageSrc:"images/avatars/48avatar24.png"}];
