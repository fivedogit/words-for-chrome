
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
	$("div#words_div #thread_tab_link").html("<img src=\"" + chrome.extension.getURL("images/chat_gray.png") + "\"></img>");
	$("div#words_div #trending_tab_link").html("<img src=\"" + chrome.extension.getURL("images/trending_blue.png") + "\"></img>");
	updateNotificationTabLinkImage();
	$("div#words_div #profile_tab_link").html("<img src=\"" + chrome.extension.getURL("images/user_gray.png") + "\"></img>");

	
	$("div#words_div #utility_div").show();
	$("div#words_div #header_div_top").html("Activity across the Web (48 hrs)");
	$("div#words_div #header_div_top").show();
	$("div#words_div #comment_submission_form_div_" + currentURLhash).hide();
	var mds = "";  // main div string
	mds = mds + "<div id=\"MAIN_trending_div\" style=\"padding:10px;\">Loading trending pages... please wait.<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\"></div>";
	$("div#words_div #main_div_" + currentURLhash).html(mds);
	getTrendingActivity(48, [48]); // initial window, choices
}

function getTrendingActivity(cutoff_in_hours, choices)
{
	
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "getTrendingActivity"
				// for right now, backend is doing 6, 12, 24, 48, but frontend should specify what it wants, right?
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if (data.response_status === "success") 
			{
				drawTrendingChart(cutoff_in_hours, choices, data, "MAIN_trending_div");
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

function drawTrendingChart(cutoff_in_hours, choices, data, dom_id)
{
	var mds = "";
	// did the system find ANY activity at all? In any window? If not, say so.
	if(typeof data.trendingactivity_jas === "undefined" || data.trendingactivity_jas === null)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " No activity.";
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
	}	
	// what about for the window we want to see?
	else if(typeof data.trendingactivity_jas[cutoff_in_hours] === "undefined" || data.trendingactivity_jas[cutoff_in_hours] === null || data.trendingactivity_jas[cutoff_in_hours].length === 0)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " 			No activity in the past " + cutoff_in_hours + " hours. ";
		if(choices.length > 1)
		{
			mds = mds + "<span style=\"padding-left:10px\">";
			var x = 0;
			while(x < choices.length)
			{
				if(x == (choices.length-1))
				{
					if(choices[x] === cutoff_in_hours)
						mds = mds + choices[x];
					else
						mds = mds + "<a href=\"#\" id=\"trending_choice_" + x + "\">" + choices[x] + "</a>";
				}
				else
				{
					if(choices[x] === cutoff_in_hours)
						mds = mds + choices[x] + " | ";
					else
						mds = mds + "<a href=\"#\" id=\"trending_choice_" + x + "\">" + choices[x] + "</a> | ";
				}
				x++;
			}	
			mds = mds + "</span>";
		}
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
	}	
	// There is activity in the window we want to see
	else
	{
		var max = 0;
		for(var x = 0; x < data.trendingactivity_jas[cutoff_in_hours].length; x++)
		{
			if(data.trendingactivity_jas[cutoff_in_hours][x].count > max)
				max = data.trendingactivity_jas[cutoff_in_hours][x].count;
		}
		var trendingmap = data.trendingactivity_jas[cutoff_in_hours];
		trendingmap.sort(function(a,b){
			return b.count - a.count;
		});
		data.trendingactivity_jas[cutoff_in_hours] = trendingmap;
		mds = mds + "<table style=\"width:100%;\">";
		for(var x = 0; x < data.trendingactivity_jas[cutoff_in_hours].length; x++)
		{
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"text-align:left;padding-top:3px\">";http://www.google.com/s2/favicons?domain=
			mds = mds + "<img src=\"http://www.google.com/s2/favicons?domain=" + data.trendingactivity_jas[cutoff_in_hours][x].hpqsp + "\" style=\"vertical-align:middle\"> ";	
			mds = mds + data.trendingactivity_jas[cutoff_in_hours][x].page_title;
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"text-align:left;padding-bottom:2px\">";
			var url_to_use = data.trendingactivity_jas[cutoff_in_hours][x].url_when_created;
			if(url_to_use.length > 50)
				url_to_use = url_to_use.substring(0,25) + "..." + url_to_use.substring(url_to_use.length-22);
			mds = mds + "<a class=\"newtab\" href=\"http://" + data.trendingactivity_jas[cutoff_in_hours][x].hpqsp + "\">" + url_to_use + "</a>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td style=\"padding-bottom:5px\">";
			mds = mds + "			<table>";
			mds = mds + "				<tr>";
			var left_percentage = data.trendingactivity_jas[cutoff_in_hours][x].count / max * 92;
			left_percentage = left_percentage|0;
			var right_percentage = 92 - left_percentage;
			mds = mds + "					<td style=\"height:10px;border:1px solid black;background-color:orange;width:" + left_percentage + "%\"></td>";
			mds = mds + "					<td style=\"height:10px;text-align:left;padding-left:3px\"> " + data.trendingactivity_jas[cutoff_in_hours][x].count + "</td>";
			mds = mds + "				</tr>";
			mds = mds + "			</table>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
		}	
	}
	mds = mds + "</table>";
	$("div#words_div #" + dom_id).html(mds);
	
	if(choices.length > 1) // only need these click events if there are links to click (i.e. multiple time window options)
	{
		var x = 0;
		while(x < choices.length)
		{
			$("#trending_choice_" + x).click({value: x}, function(event) {
				drawTrendingChart(choices[event.data.value], choices, data, "MAIN_trending_div");
			});	
			x++;
		}
	}
	$("a").click(function() {
		 var c = $(this).attr('class');
		 if(c == "newtab")
		 {
			 var h = $(this).attr('href');
			 chrome.tabs.create({url:h});
		 }
	});
	return;
}
