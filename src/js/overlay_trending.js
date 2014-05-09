
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
	$("#thread_tab_img").attr("src", "images/chat_gray.png");
	$("#trending_tab_img").attr("src", "images/trending_blue.png");
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", "images/clock_gray.png");
	$("#profile_tab_img").attr("src", "images/user_gray.png");
	//updateNotificationTabLinkImage();

	$("#utility_div").show();
	$("#header_div_top").html("Activity across the Web <span id=\"trending_activity_hours_span\"></span>"); //OK
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	var mds = "";  // main div string
	mds = mds + "<table style=\"padding:10px\">";
	mds = mds + "	<tr>";
	mds = mds + "		<td style=\"width:50%;padding:10px;vertical-align:top;text-align:center;font-weight:bold\">";
	mds = mds + "Most active pages";
	mds = mds + "		</td>";
	mds = mds + "		<td style=\"width:50%;padding:10px;vertical-align:top;text-align:center;font-weight:bold\">";
	mds = mds + "Most liked pages";
	mds = mds + "		</td>";
	mds = mds + "	</tr>";
	mds = mds + "	<tr>";
	mds = mds + "		<td id=\"most_active_pages_td\" style=\"width:50%;vertical-align:top\">";
	mds = mds + "<br><img src=\"images/ajaxSnake.gif\" style=\"width:16px;height16px;border:0px\">";
	mds = mds + "		</td>";
	mds = mds + "		<td id=\"most_liked_pages_td\" style=\"width:50%;vertical-align:top\">";
	mds = mds + "<br><img src=\"images/ajaxSnake.gif\" style=\"width:16px;height16px;border:0px\">";
	mds = mds + "		</td>";
	mds = mds + "	</tr>";
	mds = mds + "</table>";
	$("#main_div_" + currentURLhash).html(mds); //OK
	getTrendingActivity(); // initial window, choices
}

function getTrendingActivity()
{
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "getMostActivePages"
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if (data.response_status === "success") 
			{
				drawTrendingChart(data.num_hours, data, "most_active_pages_td");
				$("#trending_activity_hours_span").text("(" + data.num_hours + " hrs)");
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
			displayMessage("AJAX error getting most active pages info.", "red", "message_div_" + currentURLhash);
			console.log(textStatus, errorThrown);
			return;
		} 
	});
	
	$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
			method: "getMostLikedPages"
		},
		dataType: 'json',
		async: true,
		success: function (data, status) {
			if (data.response_status === "success") 
			{
				drawTrendingChart(data.num_hours, data, "most_liked_pages_td");
				$("#trending_activity_hours_span").text("(" + data.num_hours + " hrs)");
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
			displayMessage("AJAX error getting most liked pages info.", "red", "message_div_" + currentURLhash);
			console.log(textStatus, errorThrown);
			return;
		} 
	});
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
		mds = mds + " No data.";
		mds = mds + "		</td>";
		mds = mds + "	</tr>";
	}	
	// what about for the window we want to see?
	else if(typeof data.trendingactivity_ja === "undefined" || data.trendingactivity_ja === null || data.trendingactivity_ja.length === 0)
	{
		mds = mds + "<table>";
		mds = mds + "	<tr>";
		mds = mds + "		<td style=\"text-align:center;padding:8px;font-size:12px\">";
		mds = mds + " 			No data in the past " + cutoff_in_hours + " hours. ";
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
			mds = mds + "		<td style=\"text-align:left;padding-top:3px;vertical-align:top\">";
			mds = mds + "<img src=\"http://www.google.com/s2/favicons?domain=" + data.trendingactivity_ja[x].pseudo_url + "\" style=\"vertical-align:middle\"> ";
			mds = mds + "		</td>";
			mds = mds + "		<td style=\"text-align:left;padding-top:3px;padding-left:3px;font-size:10px\">";
			if(typeof data.trendingactivity_ja[x].page_title === "undefined" || data.trendingactivity_ja[x].page_title === null || data.trendingactivity_ja[x].page_title === "")
				mds = mds + "Unknown page title";
			else
			{	
				var splittable = data.trendingactivity_ja[x].page_title;
				var split_result = splittable.split(" ");
				var yerma = 0;
				var finalstring = "";
				//alert(split_result.length + " items");
				while(yerma < split_result.length)
				{
					if(split_result[yerma].length > 40)
					{
						//alert("gt40" + split_result[yerma]);
						finalstring = finalstring + splitString(split_result[yerma]);
					}
					else
					{
						finalstring = finalstring + split_result[yerma] + " ";
					}
					yerma++;
				}	
				mds = mds + finalstring;
			}
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td colspan=2 style=\"text-align:left;padding-bottom:2px;font-family:'Arial'\">";
			var url_to_use_loc = getSmartCutURL(data.trendingactivity_ja[x].pseudo_url, 36);
			mds = mds + "<a class=\"newtab\" href=\"" + data.trendingactivity_ja[x].pseudo_url + "\">" + url_to_use_loc + "</a>";
			mds = mds + "		</td>";
			mds = mds + "	</tr>";
			mds = mds + "	<tr>";
			mds = mds + "		<td colspan=2 style=\"padding-bottom:5px\">";
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
	$("#" + dom_id).html(mds);//FIXME
	$("a").click(function(event) {
		if(typeof event.processed === "undefined" || event.processed === null) // prevent this from firing multiple times by setting event.processed = true on first pass
		{
			event.processed = true;
			var c = $(this).attr('class');
			if(c == "newtab")
			{
				var h = $(this).attr('href');
				doNewtabClick(h);
			}
		}
	});
	return;
}
