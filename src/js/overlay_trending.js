
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
	$("#thread_tab_link").html("<img src=\"images/chat_gray.png\"></img>");
	$("#trending_tab_link").html("<img src=\"images/trending_blue.png\"></img>");
	updateNotificationTabLinkImage();
	$("#past_tab_link").html("<img src=\"images/clock_gray.png\"></img>");
	$("#profile_tab_link").html("<img src=\"images/user_gray.png\"></img>");

	$("#utility_div").show();
	$("#header_div_top").html("Activity across the Web <span id=\"trending_activity_hours_span\">?</span>");
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	var mds = "";  // main div string
	mds = mds + "<div id=\"MAIN_trending_div\" style=\"padding:10px;\">Loading trending pages... please wait.<br><img src=\"images/ajaxSnake.gif\" style=\"width:16px;height16px;border:0px\"></div>";
	$("#main_div_" + currentURLhash).html(mds);
	getTrendingActivity(); // initial window, choices
}

function getTrendingActivity()
{
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "getTrendingActivity"
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if (data.response_status === "success") 
			{
				drawTrendingChart(data.num_hours, data, "MAIN_trending_div");
				$("#trending_activity_hours_span").html("(" + data.num_hours + " hrs)");
			}
			else if (data.response_status === "error") 
			{
				displayMessage(data.message, "red", "message_div_" + currentURLhash);
				return;
			}
			else
			{
				//alert("nonajax error");
				return;
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			displayMessage("AJAX error getting trending info.", "red", "message_div_" + currentURLhash);
			console.log(textStatus, errorThrown);
			return;
		} 
	});
}

function drawTrendingChart(hours_to_get, data, dom_id)
{
	
	var cutoff_in_hours = hours_to_get;
	var mds = "";
	// did the system find ANY activity at all? In any window? If not, say so.
	if(typeof data.trendingactivity_ja === "undefined" || data.trendingactivity_ja === null)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " No activity.";
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
	}	
	// what about for the window we want to see?
	else if(typeof data.trendingactivity_ja === "undefined" || data.trendingactivity_ja === null || data.trendingactivity_ja.length === 0)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " 			No activity in the past " + cutoff_in_hours + " hours. ";
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
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
		for(var x = 0; x < data.trendingactivity_ja.length; x++)
		{
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"text-align:left;padding-top:3px\">";
			mds = mds + "<img src=\"http://www.google.com/s2/favicons?domain=" + data.trendingactivity_ja[x].pseudo_url + "\" style=\"vertical-align:middle\"> ";	
			mds = mds + data.trendingactivity_ja[x].page_title;
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"text-align:left;padding-bottom:2px\">";
			var url_to_use = data.trendingactivity_ja[x].pseudo_url;
			if(url_to_use.length > 50)
				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
			mds = mds + "<a class=\"newtab\" href=\"" + data.trendingactivity_ja[x].pseudo_url + "\">" + url_to_use + "</a>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"padding-bottom:5px\">";
			mds = mds + "			<table>";
			mds = mds + "				<tr>";
			var left_percentage = data.trendingactivity_ja[x].count / max * 92;
			left_percentage = left_percentage|0;
			var right_percentage = 92 - left_percentage;
			mds = mds + "					<td style=\"height:10px;border:1px solid black;background-color:orange;width:" + left_percentage + "%\"></td>";
			mds = mds + "					<td style=\"height:10px;text-align:left;padding-left:3px\"> " + data.trendingactivity_ja[x].count + "</td>";
			mds = mds + "				</tr>";
			mds = mds + "			</table>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
		}	
	}
	mds = mds + "</table>";
	$("#" + dom_id).html(mds);
	$("a").click(function() {
		 var c = $(this).attr('class');
		 if(c == "newtab")
		 {
			 var h = $(this).attr('href');
			 var open_tab_id = null;
			 chrome.tabs.query({url: h}, function(tabs) { 
				 for (var i = 0; i < tabs.length; i++) {
					 open_tab_id = tabs[i].id;
				 }
				 if(open_tab_id === null)
					 chrome.tabs.create({url:h});
				 else
					 chrome.tabs.update(open_tab_id,{"active":true}, function(tab) {});
			 });
			
		 }
		
		
	});
	return;
}
