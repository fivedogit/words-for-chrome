
/***
 *     _   _ _____ _____ _    _   ___________ _____ _   _______ _____ _   _ _____  
 *    | | | |_   _|  ___| |  | | |_   _| ___ \  ___| \ | |  _  \_   _| \ | |  __ \ 
 *    | | | | | | | |__ | |  | |   | | | |_/ / |__ |  \| | | | | | | |  \| | |  \/ 
 *    | | | | | | |  __|| |/\| |   | | |    /|  __|| . ` | | | | | | | . ` | | __  
 *    \ \_/ /_| |_| |___\  /\  /   | | | |\ \| |___| |\  | |/ / _| |_| |\  | |_\ \ 
 *     \___/ \___/\____/ \/  \/    \_/ \_| \_\____/\_| \_/___/  \___/\_| \_/\____/ 
 */

function doTrendingTab()
{
	tabmode = "trending";
	$("#thread_tab_img").attr("src", chrome.extension.getURL("images/chat_gray.png"));
	$("#trending_tab_img").attr("src", chrome.extension.getURL("images/trending_blue.png"));
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", chrome.extension.getURL("images/clock_gray.png"));
	$("#profile_tab_img").attr("src", chrome.extension.getURL("images/user_gray.png"));
	//updateNotificationTabLinkImage();

	$("#utility_header_td").html("Activity across the Web <span id=\"trending_activity_hours_span\"></span>"); //OK
	
	$("#utility_message_td").hide();
	$("#utility_csf_td").hide();
	
	$("#footer_div").html("");
	
	drawTrendingTable(null, 20, "main_div_" + currentURLhash);
	getTrendingActivity(); // initial window, choices
}

function drawTrendingTable(hostname_or_null, number_of_results, target_dom_id)
{
	var compstr = "";  // main div string
	if(hostname_or_null === null)
	{
		$("#utility_header_td").html("Activity across the Web <span id=\"trending_activity_hours_span\"></span>"); //OK
		compstr = compstr + "<table style=\"background-color:#fff;display:none\" id=\"trending_table\">";
	}	
	else
	{
		compstr = compstr + "<table style=\"background-color:#ebebeb;display:none\" id=\"trending_table\">";
		compstr = compstr + "	<tr>";
		compstr = compstr + "		<td colspan=2 style=\"text-align:center;font-size:13px;padding-top:10px;padding-bottom:3px;border-top:1px solid #ddd\" id=\"trending_on_this_site_td\">";
		compstr = compstr + "			Activity for <img src=\"http://www.google.com/s2/favicons?domain=" + hostname_or_null + "\" style=\"vertical-align:middle\"> " + hostname_or_null + " <span id=\"trending_activity_hours_span\"></span>";
		compstr = compstr + "		</td>";
		compstr = compstr + "	</tr>";
	}	
	compstr = compstr + "	<tr>";
	compstr = compstr + "		<td style=\"width:50%;padding:5px;vertical-align:top;text-align:center;font-weight:bold\">";
	compstr = compstr + "Most active pages";
	compstr = compstr + "		</td>";
	compstr = compstr + "		<td style=\"width:50%;padding:5px;vertical-align:top;text-align:center;font-weight:bold\">";
	compstr = compstr + "Most liked pages";
	compstr = compstr + "		</td>";
	compstr = compstr + "	</tr>";
	compstr = compstr + "	<tr>";
	compstr = compstr + "		<td id=\"most_active_pages_td\" style=\"width:50%;padding:0px 8px 8px 8px;vertical-align:top\">";
	compstr = compstr + "<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">";
	compstr = compstr + "		</td>";
	compstr = compstr + "		<td id=\"most_liked_pages_td\" style=\"width:50%;padding:0px 8px 8px 8px;vertical-align:top\">";
	compstr = compstr + "<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">";
	compstr = compstr + "		</td>";
	compstr = compstr + "	</tr>";
	compstr = compstr + "</table>";
	$("#" + target_dom_id).html(compstr);
	
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "getMostActivePages",
			hostname: hostname_or_null
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if (data.response_status === "success") 
			{
				if(typeof data.trendingactivity_ja !== "undefined" && data.trendingactivity_ja !== null && data.trendingactivity_ja.length > 0)
					$("#trending_table").show();
				drawTrendingChart(data, number_of_results, "most_active_pages_td");
				$("#trending_activity_hours_span").text("(" + data.num_hours + " hrs)");
			}
			else if (data.response_status === "error") 
			{
				displayMessage(data.message, "red", "utility_message_td");
				return;
			}
			else
			{
				//alert("nonajax error");
				return;
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			displayMessage("AJAX error getting most active pages info.", "red", "utility_message_td");
			console.log(textStatus, errorThrown);
			return;
		} 
	});
	
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "getMostLikedPages",
			hostname: hostname_or_null
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if (data.response_status === "success") 
			{
				if(typeof data.trendingactivity_ja !== "undefined" && data.trendingactivity_ja !== null && data.trendingactivity_ja.length > 0)
					$("#trending_table").show();
				drawTrendingChart(data, number_of_results, "most_liked_pages_td");
				$("#trending_activity_hours_span").text("(" + data.num_hours + " hrs)");
			}
			else if (data.response_status === "error") 
			{
				displayMessage(data.message, "red", "utility_message_td");
				return;
			}
			else
			{
				//alert("nonajax error");
				return;
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			displayMessage("AJAX error getting most liked pages info.", "red", "utility_message_td");
			console.log(textStatus, errorThrown);
			return;
		} 
	});
	
}

function drawTrendingChart(data, number_of_results, dom_id)
{
	
	var mds = "";
	var rand = makeid();
	// did the system find ANY activity at all? In any window? If not, say so.
	if(typeof data.trendingactivity_ja === "undefined" || data.trendingactivity_ja === null  || data.trendingactivity_ja.length === 0)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " No data.";
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
		mds = mds + "</table>";
		$("#" + dom_id).html(mds);//OK
		return;
	}	
	// There is activity in the window we want to see
	else
	{
		var max = 0;
		for(var x = 0; x < data.trendingactivity_ja.length; x++)
		{
			if(data.trendingactivity_ja[x].count > max)
				max = data.trendingactivity_ja[x].count;
		}
		var trendingmap = data.trendingactivity_ja;
		trendingmap.sort(function(a,b){
			return b.count - a.count;
		});
		data.trendingactivity_ja = trendingmap;
		mds = mds + "<table style=\"width:100%;\">";
		for(var x = 0; x < data.trendingactivity_ja.length && x < number_of_results; x++)
		{
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"text-align:left;padding-top:3px;vertical-align:top;width:16px\">";
			mds = mds + "			<img id=\"google_favicon_img_" + rand + "_" + x + "\" src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"vertical-align:middle\"> ";
			mds = mds + "		</td>";
			mds = mds + "		<td id=\"page_title_td_" + rand + "_" + x + "\" style=\"text-align:left;padding-top:3px;padding-left:3px;font-size:10px\">";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td id=\"page_url_td_" + rand + "_" + x + "\" colspan=2 style=\"text-align:left;padding-bottom:2px;font-family:'Arial'\">";
			mds = mds + " 			<a id=\"page_url_link_" + rand + "_" + x + "\" class=\"newtab\" href=\"#\"></a>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td colspan=2 style=\"padding-bottom:5px;line-height:3px\">";
			mds = mds + "			<table>";
			mds = mds + "				<tr>";
			mds = mds + "					<td id=\"orange_left_" + rand + "_" + x + "\" style=\"height:3px;border:1px solid black;background-color:orange;width:50%\"></td>";
			mds = mds + "					<td id=\"count_" + rand + "_" + x + "\" style=\"height:3px;text-align:left;padding-left:3px\"></td>";
			mds = mds + "				</tr>";
			mds = mds + "			</table>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
		}	
		mds = mds + "</table>";
		$("#" + dom_id).html(mds);//OK
	}
	
	//alert(JSON.stringify(data.trendingactivity_ja));
	for(var x = 0; x < data.trendingactivity_ja.length; x++)
	{
		// google favicon
		$("#google_favicon_img_" + rand + "_" + x).attr("src", "http://www.google.com/s2/favicons?domain=" + data.trendingactivity_ja[x].pseudo_url);
		
		// title
		if(typeof data.trendingactivity_ja[x].page_title === "undefined" || data.trendingactivity_ja[x].page_title === null || data.trendingactivity_ja[x].page_title === "")
			$("#page_title_td_" + rand + "_" + x).text("Unknown page title");
		else
		{	
			var splittable = data.trendingactivity_ja[x].page_title;
			var split_result = splittable.split(" ");
			var yerma = 0;
			var finalstring = "";
			while(yerma < split_result.length)
			{
				if(split_result[yerma].length > 40)
					finalstring = finalstring + splitString(split_result[yerma]);
				else
					finalstring = finalstring + split_result[yerma] + " ";
				yerma++;
			}	
			$("#page_title_td_" + rand + "_" + x).text(finalstring);
		}
		
		// url/link
		var url_to_use_loc = getSmartCutURL(data.trendingactivity_ja[x].pseudo_url, 36);
		$("#page_url_link_" + rand + "_" + x).attr("href", data.trendingactivity_ja[x].pseudo_url);
		$("#page_url_link_" + rand + "_" + x).text(url_to_use_loc);
		
		// graphic and number
		var left_percentage = data.trendingactivity_ja[x].count / max * 92;
		left_percentage = left_percentage|0;
		var right_percentage = 92 - left_percentage;
		$("#orange_left_" + rand + "_" + x).css("width", left_percentage + "%");
		$("#count_" + rand + "_" + x).text(data.trendingactivity_ja[x].count);
	}
	
	
	$("a").click(function(event) { event.preventDefault();
		if(typeof event.processed === "undefined" || event.processed === null) // prevent this from firing multiple times by setting event.processed = true on first pass
		{
			event.processed = true;
			var c = $(this).attr('class');
			if(c == "newtab")
			{
				var h = $(this).attr('href');
				if(chrome.tabs)
					doNewtabClick(h);
				else
					window.location = h;
			}
		}
	});
	return;
}
