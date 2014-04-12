
/***
 *     _   _ _____ _____ _    _  ____________ ___________ _____ _      _____ 
 *    | | | |_   _|  ___| |  | | | ___ \ ___ \  _  |  ___|_   _| |    |  ___|
 *    | | | | | | | |__ | |  | | | |_/ / |_/ / | | | |_    | | | |    | |__  
 *    | | | | | | |  __|| |/\| | |  __/|    /| | | |  _|   | | | |    |  __| 
 *    \ \_/ /_| |_| |___\  /\  / | |   | |\ \\ \_/ / |    _| |_| |____| |___ 
 *     \___/ \___/\____/ \/  \/  \_|   \_| \_|\___/\_|    \___/\_____/\____/ 
 *                                                                           
 *                                                                           
 */

function viewProfile(screenname)
{
	tabmode = "profile";
	$("div#words_div #thread_tab_link").html("<img src=\"" + chrome.extension.getURL("images/chat_gray.png") + "\"></img>");
	$("div#words_div #trending_tab_link").html("<img src=\"" + chrome.extension.getURL("images/trending_gray.png") + "\"></img>");
	updateNotificationTabLinkImage();
	$("div#words_div #profile_tab_link").html("<img src=\"" + chrome.extension.getURL("images/user_blue.png") + "\"></img>");

	
	$("div#words_div #utility_div").show();
	$("div#words_div #header_div_top").html("Profile");
	$("div#words_div #header_div_top").show();
	$("div#words_div #comment_submission_form_div_" + currentURLhash).hide();
	if (bg.user_jo != null)
	{	
		$("div#words_div #main_div_" + currentURLhash).html("<div style=\"padding:20px\">Loading profile... please wait.<br><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\"></div>");
		getProfile(screenname);
	}
	else
	{
		$("div#words_div #main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to see user profiles.</div>");
	}
}


function getProfile(screenname)
{
	var main_div_string = "";
	var target_user_jo;
	if (typeof bg.user_jo ==="undefined" || bg.user_jo === null) // not logged in nor was a target specified, 
	{																			
		$("div#words_div #main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to see user profiles.</div>");
	}
	else if(typeof screenname === "undefined" || screenname === null)
	{
		$("div#words_div #main_div_" + currentURLhash).html("<div style=\"padding:20px\">No target screenname provided. Check the link and try again.</div>");
	}	
	else
	{
		var email = docCookies.getItem("email");
		var this_access_token = docCookies.getItem("this_access_token");
		$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
            method: "getUserByScreenname",
            email: email,             // this can be called with no email
            this_access_token: this_access_token,   // this can be called with no this_access_token,bg.user_jo will just come back erroneous
            screenname: screenname // the screenname of the user to get. Backend will determine if self, provide correct response
        },
        dataType: 'json',
        async: true,
        success: function (data, status) {
            if (data.response_status === "error")
            {
            	displayMessage(data.message, "red", "message_div_" + currentURLhash);
            	if(data.error_code && data.error_code === "0000")
        		{
        			displayMessage("Your login has expired. Please relog.", "red");
        			docCookies.removeItem("email"); 
        			docCookies.removeItem("this_access_token");
        			bg.user_jo = null;
        			updateLogstat();
        		}
            }
            else 
            {
            	target_user_jo = data.target_user_jo; // backend will provide something that looks like this:
            	
            	//{
    			//	"elapsed": 197,
    			//	"target_user_jo": {
            	//			...
        		//		}
				//  }
            	
            	main_div_string = main_div_string + "<div style=\"padding:5px;text-align:center\">";
            	main_div_string = main_div_string + "<table style=\"margin-right:auto;margin-left:auto;width:400px\">";
            	main_div_string = main_div_string + "<tr>";
            	main_div_string = main_div_string + "	<td>";
            	main_div_string = main_div_string + "		<table style=\"width:100%;\">";
            	//main_div_string = main_div_string + "			<tr>";
            	//main_div_string = main_div_string + "				<td colspan=2 style=\"font-size:20px;font-weight:bold\">";
            	//main_div_string = main_div_string + "					BIO";
            	//main_div_string = main_div_string + "				</td>";
            	//main_div_string = main_div_string + "			</tr>";
            	main_div_string = main_div_string + "			<tr>";
            	main_div_string = main_div_string + "				<td style=\"width:128px;text-align:right\" id=\"large_avatar_td\">";
            	
            	if (target_user_jo.picture.lastIndexOf("avatar", 0) === 0)
            		main_div_string = main_div_string + "					<img class=\"rounded\" src=\"images/avatars/128" + target_user_jo.picture + "\" style=\"width:128px;height:128px\">";
            	else if (target_user_jo.which_picture === "google_picture")
            		main_div_string = main_div_string + "					<img class=\"rounded\" src=\"" + target_user_jo.picture + "\" style=\"width:128px;height:128px\">";
            	else if (target_user_jo.which_picture === "facebook_picture")
            		main_div_string = main_div_string + "					<img class=\"rounded\" src=\"" + target_user_jo.picture + "?type=large\" style=\"height:128px;\">";
            	
            	main_div_string = main_div_string + "				</td>";
            	main_div_string = main_div_string + "				<td>";
            	main_div_string = main_div_string + "					<table style=\"margin-right:auto;border-spacing:5px;\">";
            	if (target_user_jo.email)
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Screenname:</td><td style=\"text-align:left\">" + target_user_jo.screenname + " <a href=\"#\" id=\"logout_link\">Log out</a></td></tr>";
            	else
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Screenname:</td><td style=\"text-align:left\">" + target_user_jo.screenname + "</td></tr>";
            	// email
            	if (target_user_jo.email)
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Email:</td><td style=\"text-align:left\">" + target_user_jo.email + " (private)</td></tr>";
            	else
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Email:</td><td style=\"text-align:left;font-style:italic\">hidden</td></tr>";
            	// since
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Since:</td><td style=\"text-align:left\">" + target_user_jo.since + "</td></tr>";
            	// seen
            	if (target_user_jo.seen)
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Seen:</td><td style=\"text-align:left\">" + target_user_jo.seen + "</td></tr>";
            	else
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Seen:</td><td style=\"text-align:left;font-style:italic\">hidden</td></tr>";
            	
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Comments:</td><td style=\"text-align:left\">" + target_user_jo.num_comments_authored + "</td></tr>";
            	
      	   	main_div_string = main_div_string + "						<tr>";
        	main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold\">";
        	main_div_string = main_div_string + "							Location:";
        	main_div_string = main_div_string + "							</td>";
        	main_div_string = main_div_string + "							<td style=\"text-align:left\">";
        	 if (target_user_jo.country === "USA")
        		 main_div_string = main_div_string + target_user_jo.state + ", ";
        	 main_div_string = main_div_string + target_user_jo.country;
        	 main_div_string = main_div_string + "							</td>";
        	 main_div_string = main_div_string + "						</tr>";
        	 main_div_string = main_div_string + "					</table>";
        	 main_div_string = main_div_string + "				</td>";
        	 main_div_string = main_div_string + "			</tr>";
        	 main_div_string = main_div_string + "		</table>";
        	 main_div_string = main_div_string + "	</td>";
        	 main_div_string = main_div_string + "</tr>";
            	if (target_user_jo.email) // this is a self user
            	{
            		main_div_string = main_div_string + "<tr>";
            		main_div_string = main_div_string + "	<td>";
            		main_div_string = main_div_string + "		<table style=\"width:100%; border-top: 1px black solid;\">";
                	main_div_string = main_div_string + "			<tr>";
                	main_div_string = main_div_string + "				<td style=\"font-size:20px;font-weight:bold;padding-top:10px\">";
                	main_div_string = main_div_string + "					SETTINGS";
                	main_div_string = main_div_string + "				</td>";
                	main_div_string = main_div_string + "			</tr>";
                	main_div_string = main_div_string + "			<tr>";
                	main_div_string = main_div_string + "				<td>";
                	main_div_string = main_div_string + "					<table style=\"margin-right:auto;margin-left:auto;border-spacing:5px\">";
                	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Overlay size:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"size_selector\">";
					main_div_string = main_div_string + "							  <option value=\"medium\">medium (450px across)</option>";
					main_div_string = main_div_string + "							  <option value=\"wide\">wide (600px across)</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"size_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On like:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onlike_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"email\">Email me</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onlike_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On dislike:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"ondislike_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"email\">Email me</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"ondislike_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On reply:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onreply_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"email\">Email me</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onreply_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On mention:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onmention_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"email\">Email me</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onmention_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					/*main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Words promo emails:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"emailpromos_selector\">";
					main_div_string = main_div_string + "							  <option value=\"Yes\">Yes</option>";
					main_div_string = main_div_string + "							  <option value=\"No\">No</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"emailpromos_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";*/
					main_div_string = main_div_string + "						<tr>"
					main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold;vertical-align:top\">Change avatar:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<div id=\"picture_type_div\">";
					main_div_string = main_div_string + "									<table id=\"google_radio_table\"><tr><td><input style=\"width:20px\" id=\"use_google_picture_radio\" type=\"radio\" name=\"picture_type\" value=\"google\"></td><td>Use my Google+ picture</td></tr></table>";
					main_div_string = main_div_string + "									<table id=\"facebook_radio_table\"><tr><td><input style=\"width:20px\" id=\"use_facebook_picture_radio\" type=\"radio\" name=\"picture_type\" value=\"facebook\"></td><td>Use my Facebook picture</td></tr></table>";
					main_div_string = main_div_string + "									<table id=\"words_radio_table\"><tr><td><input style=\"width:20px\" id=\"use_words_image_radio\" type=\"radio\" name=\"picture_type\" value=\"words\"></td><td>Use a Words image instead</td></tr></table>";
					main_div_string = main_div_string + "								</div>";
					main_div_string = main_div_string + "								<div id=\"picture_div\" style=\"text-align:center\"></div>";
					//main_div_string = main_div_string + "								<div id=\"facebook_picture_div\" style=\"text-align:center;display:none\"></div>";
					//main_div_string = main_div_string + "								<div id=\"words_image_div\" style=\"display:none\">";
					main_div_string = main_div_string + "									<table id=\"words_avatar_selector_table\" style=\"display:none;margin-right:auto;margin-left:auto\">";
					main_div_string = main_div_string + "										<tr>";
					main_div_string = main_div_string + "											<td>";
					main_div_string = main_div_string + "												<div id=\"avatar_change_selector\"></div>";
					main_div_string = main_div_string + "						    					<input type=hidden id=\"hidden_avatar_change_input\" value=\"0\"></input>";
					main_div_string = main_div_string + "											</td>";
					main_div_string = main_div_string + "										</tr>";
					main_div_string = main_div_string + "									</table>";
					main_div_string = main_div_string + "								</div>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"avatar_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr>";
					main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold\">";
					main_div_string = main_div_string + "							 Change screenname:";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<input type=text id=\"screenname_change_input\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td>";
					main_div_string = main_div_string + "								<span style=\"margin-left:2px;border:0px black solid;display:none\" id=\"screenname_availability_span\"><img src=\"\" + chrome.extension.getURL(\"images/ajaxSnake.gif\") + \"\" style=\"width:16px;height16px;border:0px\"></span>";
					main_div_string = main_div_string +	"							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr>";
					main_div_string = main_div_string + "							<td>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<input type=button id=\"screenname_available_button\" value=\"available?\" style=\"width:85px\">";
					main_div_string = main_div_string + "								<input type=button id=\"screenname_submit_button\" value=\"submit\" style=\"width:85px\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"screenname_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
                	main_div_string = main_div_string + "					</table>";
                	main_div_string = main_div_string + "				</td>";
                	main_div_string = main_div_string + "			</tr>";
                	main_div_string = main_div_string + "		</table>";	
                	main_div_string = main_div_string + "	</td>";
                	main_div_string = main_div_string + "</tr>";
            	}
            	main_div_string = main_div_string + "</table>";
            	main_div_string = main_div_string + "</div>";
            	$("div#words_div #main_div_" + currentURLhash).html(main_div_string);
            	
            	
            	$("div#words_div #screenname_available_button").click(
            			function () 
            			{
            					//$("#screenname_availability_span").html("<img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\">");
            		         	$("#screenname_availability_span").show();
            					if ($("#screenname_change_input").val().length <= 0) 
            					{
            						$("#screenname_availability_span").html("<font color=red>Blank</font>");
            						return;
            					} 
            					else if ($("#screenname_change_input").val().length < 6) 
            					{
            						$("#screenname_availability_span").html("<font color=red>Too short</font>");
            						return;
            					} 
            					else 
            					{
            						var response_object;
            						$.ajax({
            							type: 'GET',
            							url: endpoint,
            							data: {
            								method: "isScreennameAvailable",
            								screenname: $("#screenname_change_input").val()
            							},
            							dataType: 'json',
            							async: true,
            							success: function (data, status) 
            							{
            								response_object = data;
            								if (response_object.response_status === "error") 
            								{
            									$("#screenname_availability_span").html("<font color=red>Error</font>");
            									setTimeout( function () { 
        											$("#screenname_availability_span").html("");
        										}, 3000);
            								} 
            								else if (response_object.response_status === "success") 
            								{
            									if (response_object.screenname_available === "true") 
            									{
            										$("#screenname_availability_span").html("<font color=green>Available</font>");
            										setTimeout( function () { 
            											$("#screenname_availability_span").html("");
            										}, 3000);
            									}
            									else if (response_object.screenname_available === "false") 
            									{
            										$("#screenname_availability_span").html("<font color=red>Unavailable</font>");
            										setTimeout( function () { 
            											$("#screenname_availability_span").html("");
            										}, 3000);
            									}
            									else
            									{
            										$("#screenname_availability_span").html("<font color=red>Error. Value !t/f.</font>");
            										setTimeout( function () { 
            											$("#screenname_availability_span").html("");
            										}, 3000);
            									}
            								}
            								else
            								{
            									//alert("weird. response_status not error or success.");
            								}
            								return;
            							},
            							error: function (XMLHttpRequest, textStatus, errorThrown) 
            							{
            								console.log(textStatus, errorThrown);
            							}
            						});
            						return;
            					}
            				});				
            	
            	$("div#words_div #screenname_submit_button").click(function () {
            		$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "screenname",
				            value:  $("#screenname_change_input").val()
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        		$("div#words_div #screenname_result_td").html("error");
				        	else
				        	{
				        		$("div#words_div #screenname_result_td").html("updated");
				        		setTimeout( function () { 
									$("div#words_div #screenname_result_td").html("");
								}, 3000);
				        		bg.user_jo.screenname = $("div#words_div #screenname_change_input").val();
				        		displayLogstatAsLoggedIn(); //updateLogstat();
				        		viewProfile($("div#words_div #screenname_change_input").val());
				        		$("div#words_div #screenname_change_input").val("");
				        	}
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #screenname_result_td").html("error");
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	if(typeof bg.user_jo.google_picture !== "undefined" && bg.user_jo.google_picture !== null)
            		$("div#words_div #google_radio_table").show();
            	else
            		$("div#words_div #google_radio_table").hide();
            	if(typeof bg.user_jo.facebook_picture !== "undefined" && bg.user_jo.facebook_picture !== null)
            		$("div#words_div #facebook_radio_table").show();
            	else
            		$("div#words_div #facebook_radio_table").hide();
            	
            	if(bg.user_jo.which_picture === "avatar_icon")
            	{
            		$("div#words_div #words_avatar_selector_table").show();
        			$("div#words_div #use_words_image_radio").prop('checked', true);
        			$("div#words_div #picture_div").html("<img class=\"rounded\" src=\"images/avatars/48" + bg.user_jo.avatar_icon + "\" style=\"width:48px;height:48px\">");
            	}	
            	else if (bg.user_jo.which_picture === "google_picture")
        		{
        			$("div#words_div #use_google_picture_radio").prop('checked', true);
        			$("div#words_div #picture_div").html("<img class=\"rounded\" src=\"" + bg.user_jo.google_picture + "\" style=\"width:48px;height:48px\">");
        		}
            	else if (bg.user_jo.which_picture === "facebook_picture")
        		{
        			$("div#words_div #use_facebook_picture_radio").prop('checked', true);
        			$("div#words_div #picture_div").html("<img class=\"rounded\" src=\"" + bg.user_jo.facebook_picture + "\" style=\"width:48px;height:48px\">");
        		}	
            	
            	// TODO User should have the option of deleting social service access tokens, in addition to this_access_token
            	$("div#words_div #logout_link").click(
            			function () {
            				var google_access_token = docCookies.getItem("google_access_token");
            				var facebook_access_token = docCookies.getItem("facebook_access_token");
            				var logoutmessage = "<div>";
            				logoutmessage = logoutmessage + "<table style=\"margin-right:auto;margin-left:auto;border-spacing:20px\">";
            				logoutmessage = logoutmessage + "	<tr>";
            				logoutmessage = logoutmessage + "		<td style=\"text-align:center;font-size:14px\">";
            				logoutmessage = logoutmessage + "You have chosen to log out of Words.<br>Also disconnect your 3rd party login?";
            				logoutmessage = logoutmessage + "		</td>";
            				logoutmessage = logoutmessage + "	</tr>";
            				if(facebook_access_token != null)
            				{
            					logoutmessage = logoutmessage + "	<tr>";
                				logoutmessage = logoutmessage + "		<td style=\"text-align:center\">";
                				logoutmessage = logoutmessage + "			<table style=\"width:210px;margin-right:auto;margin-left:auto;\">";
                				logoutmessage = logoutmessage + "				<tr>";
                				logoutmessage = logoutmessage + "					<td style=\"width:25px\">";
                				logoutmessage = logoutmessage + "<input type=\"checkbox\" id=\"facebook_disconnect_checkbox\" style=\"margin-left:auto;width:25px\">";
                				logoutmessage = logoutmessage + "					</td>";
                				logoutmessage = logoutmessage + "					<td>";
                				logoutmessage = logoutmessage + "remove Facebook authorization";
                				logoutmessage = logoutmessage + "					</td>";
                				logoutmessage = logoutmessage + "				</tr>";
                				logoutmessage = logoutmessage + "			</table>";
                				logoutmessage = logoutmessage + "		</td>";
                				logoutmessage = logoutmessage + "	</tr>";
            				}
            				logoutmessage = logoutmessage + "	<tr>";
            				logoutmessage = logoutmessage + "		<td style=\"text-align:center\">";
            				logoutmessage = logoutmessage + "			<table style=\"width:210px;margin-right:auto;margin-left:auto;\">";
            				logoutmessage = logoutmessage + "				<tr>";
            				logoutmessage = logoutmessage + "					<td style=\"width:25px\">";
            				logoutmessage = logoutmessage + "<input type=\"checkbox\" id=\"google_disconnect_checkbox\" style=\"margin-left:auto;width:25px\">";
            				logoutmessage = logoutmessage + "					</td>";
            				logoutmessage = logoutmessage + "					<td>";
            				logoutmessage = logoutmessage + "remove Google authorization (if any)"; // FIXME, should check users's current google login state. Not sure how, actually.
            				logoutmessage = logoutmessage + "					</td>";
            				logoutmessage = logoutmessage + "				</tr>";
            				logoutmessage = logoutmessage + "			</table>";
            				logoutmessage = logoutmessage + "		</td>";
            				logoutmessage = logoutmessage + "	</tr>";
            				logoutmessage = logoutmessage + "	<tr>";
            				logoutmessage = logoutmessage + "		<td style=\"text-align:center;font-size:15px\">";
            				logoutmessage = logoutmessage + "			<button id=\"logout_confirmation_button\">LOGOUT</button>";
            				logoutmessage = logoutmessage + "		</td>";
            				logoutmessage = logoutmessage + "	</tr>";
            				logoutmessage = logoutmessage + "</table>";
            				logoutmessage = logoutmessage + "</div>";
            				$("div#words_div #main_div_" + currentURLhash).html(logoutmessage);
            				
            				$("div#words_div #logout_confirmation_button").click(
                        			function () {
                        				docCookies.removeItem("email");
                        				docCookies.removeItem("this_access_token");
                        				docCookies.removeItem("this_access_token_expires");
                        				if($("div#words_div #facebook_disconnect_checkbox").prop("checked"))
                        				{
                        					//alert("telling facebook to delete permissions");
                        					$.ajax({
                        						type: 'DELETE',
                        						url: "https://graph.facebook.com/me/permissions?access_token=" + docCookies.getItem("facebook_access_token"),
                        						async: true,
                        						contentType: "application/json",
                        						dataType: 'json',
                        						success: function(nullResponse) { // on successful disconnection, also delete google_access_token. It isn't valid anymore anyway.
                        							//alert("success");
                        							docCookies.removeItem("facebook_access_token");
                        						},
                        						error: function(e) {
                        							console.log(e);
                        							//alert("ajax error");
                        							displayMessage("Sorry. Disconnection didn't work. You may already be disconnected. If not, you can disconnect manually in your Facebook settings", "red", null, 7);
                        						}
                        					});	 
                        					docCookies.removeItem("facebook_access_token");
                        				}
                        				if($("div#words_div #google_disconnect_checkbox").prop("checked"))
                        				{
                        					chrome.identity.getAuthToken({ 'interactive': false },
                        						      function(current_token) {
                        						        if (!chrome.runtime.lastError) {
                        						          chrome.identity.removeCachedAuthToken({ token: current_token }, function() {});
                        						        }
                        					});
                        					var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + docCookies.getItem("google_access_token");

                        					// Tell google to disconnect this user.
                        					//alert("telling google to disconnect user");
                        					$.ajax({
                        						type: 'GET',
                        						url: revokeUrl,
                        						async: true,
                        						contentType: "application/json",
                        						dataType: 'jsonp',
                        						success: function(nullResponse) { // on successful disconnection, also delete google_access_token. It isn't valid anymore anyway.
                        							//alert("success");
                        							docCookies.removeItem("google_access_token");
                        						},
                        						error: function(e) {
                        							console.log(e);
                        							//alert("ajax error");
                        							displayMessage("Sorry. Disconnection didn't work. You can disconnect manually <a href=\"https://plus.google.com/apps\">here</a>.", "red", null, 7);
                        						}
                        					});	 
                        				}
                        				email = null;
                        				this_access_token = null;
                        				bg.user_jo = null;
                        				displayLogstatAsLoggedOut();
                        				doThreadTab();
                        			});
            				return;
            			});
            	
            	
            	$("div#words_div #use_google_picture_radio").click(function () {
            		$("div#words_div #words_avatar_selector_table").hide();
            		$("div#words_div #picture_div").html("<img class=\"rounded\" src=\"" + bg.user_jo.google_picture + "\" style=\"width:48px;height:48px\">");
            		$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "which_picture",
				            value: "google_picture" // will always have this as the radio button wouldn't even be visible without it, server will check too
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        		$("div#words_div #avatar_result_td").html("error");
				        	else
				        	{
				        		$("div#words_div #avatar_result_td").html("updated");
				        		$("div#words_div #large_avatar_td").html("<img class=\"rounded\" src=\"" + bg.user_jo.google_picture + "\" style=\"width:128px;height:128px\"></img>");
				        		$("div#words_div #logged_in_profile_image_span").html("<img class=\"rounded\" src=\"" + bg.user_jo.google_picture + "\" style=\"width:32px;height:32px;border: 1px solid black;\"></img>");
				        		bg.user_jo.which_picture = "google_picture";
				        	}
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #avatar_result_td").html("error");
				            console.log(textStatus, errorThrown);
				        }
					});
            	});

            	$("div#words_div #use_facebook_picture_radio").click(function () {
            		$("div#words_div #words_avatar_selector_table").hide();
            		$("div#words_div #picture_div").html("<img class=\"rounded\" src=\"" + bg.user_jo.facebook_picture + "\" style=\"width:48px;height:48px\">");
            		$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "which_picture",
				            value: "facebook_picture" // will always have this as the radio button wouldn't even be visible without it, server will check too
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        		$("div#words_div #avatar_result_td").html("error");
				        	else
				        	{
				        		$("div#words_div #avatar_result_td").html("updated");
				        		$("div#words_div #large_avatar_td").html("<img class=\"rounded\" src=\"" + bg.user_jo.facebook_picture + "?type=large\" style=\"height:128px;\"></img>");
				        		$("div#words_div #logged_in_profile_image_span").html("<img class=\"rounded\" src=\"" + bg.user_jo.facebook_picture + "\" style=\"width:32px;height:32px;border: 1px solid black;\"></img>");
				        		bg.user_jo.which_picture = "facebook_picture";
				        	}
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #avatar_result_td").html("error");
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("div#words_div #use_words_image_radio").click(function () {
            		$("div#words_div #avatar_result_td").html("updated");
            		$("div#words_div #words_avatar_selector_table").show();
            		$("div#words_div #large_avatar_td").html("<img class=\"rounded\" src=\"images/avatars/128" + bg.user_jo.avatar_icon + "\"></img>");
	        		$("div#words_div #logged_in_profile_image_span").html("<img class=\"rounded\" src=\"images/avatars/48" + bg.user_jo.avatar_icon + "\" style=\"width:32px;height:32px;border: 1px solid black;\"></img>");
            		$("div#words_div #picture_div").html("<img class=\"rounded\" src=\"images/avatars/48" + bg.user_jo.avatar_icon + "\" style=\"width:48px;height:48px\">");
            		bg.user_jo.which_picture = "avatar_icon";
            	});
            	
            	$('#avatar_change_selector').ddslick({
            	    data: avatarData,
            	    width: 150,
            	    imagePosition: "left",
            	    selectText: "Select your Avatar",
            	    onSelected: function(data){  
            	            $('#hidden_avatar_change_input').val(data.selectedData.imageSrc.substring(data.selectedData.imageSrc.lastIndexOf("/48") + 3));
            	            $('html, body').animate({ scrollTop: 0 }, 0);
            	            $.ajax({
        						type: 'GET',
        						url: endpoint,
        						data: {
        				            method: "setUserPreference",
        				            email: email,             
        				            this_access_token: this_access_token,  
        				            which: "avatar_icon",
        				            value: $('#hidden_avatar_change_input').val()
        				        },
        				        dataType: 'json',
        				        async: true,
        				        success: function (data, status) {
        				        	if (data.response_status === "error")
        				        		$("div#words_div #avatar_result_td").html("error");
        				        	else
        				        	{
        				        		$("div#words_div #avatar_result_td").html("updated");
        				        		$("div#words_div #large_avatar_td").html("<img class=\"rounded\" src=\"images/avatars/128" + $('#hidden_avatar_change_input').val() + "\"></img>");
        				        		$("div#words_div #logged_in_profile_image_span").html("<img class=\"rounded\" src=\"images/avatars/48" + $('#hidden_avatar_change_input').val() + "\" style=\"width:32px;height:32px;border: 1px solid black;\"></img>");
        				        		$("div#words_div #picture_div").html("<img class=\"rounded\" src=\"images/avatars/48" + $('#hidden_avatar_change_input').val() + "\" style=\"width:48px;height:48px\">");
        				        		bg.user_jo.avatar_icon = $('#hidden_avatar_change_input').val();
        				        		bg.user_jo.which_picture = "avatar_icon";
        				        	}
        				        }
        				        ,
        				        error: function (XMLHttpRequest, textStatus, errorThrown) {
        				        	$("div#words_div #avatar_result_td").html("error");
        				            console.log(textStatus, errorThrown);
        				        }
        					});
            	    }    
            	});
            	
            	if (bg.user_jo.overlay_size === 600)
            		$("div#words_div #size_selector").val("wide");
            	else if (bg.user_jo.overlay_size === 450)
            		$("div#words_div #size_selector").val("medium");
            	
            	if (bg.user_jo.onlike === "email")
            		$("div#words_div #onlike_selector").val("email");
            	else if (bg.user_jo.onlike === "do nothing")
            		$("div#words_div #onlike_selector").val("do nothing");
            	
            	if (bg.user_jo.ondislike === "email")
            		$("div#words_div #ondislike_selector").val("email");
            	else if (bg.user_jo.ondislike === "do nothing")
            		$("div#words_div #ondislike_selector").val("do nothing");
            	
            	if (bg.user_jo.onreply === "email")
            		$("div#words_div #onreply_selector").val("email");
            	else if (bg.user_jo.onreply === "do nothing")
            		$("div#words_div #onreply_selector").val("do nothing");
            	
            	if (bg.user_jo.onmention === "email")
            		$("div#words_div #onmention_selector").val("email");
            	else if (bg.user_jo.onmention === "do nothing")
            		$("div#words_div #onmention_selector").val("do nothing");
            	
            	/*if (bg.user_jo.emailpromos === "yes")
            		$("div#words_div #emailpromos_selector").val("yes");
            	else if (bg.user_jo.emailpromos === "no")
            		$("div#words_div #emailpromos_selector").val("no");*/
            	
            	$("div#words_div #size_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "overlay_size",
				            value: $("div#words_div #size_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("div#words_div #size_result_td").html("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.overlay_size === 600)
				            		$("div#words_div #size_selector").val("wide");
				            	else if (bg.user_jo.overlay_size === 450)
				            		$("div#words_div #size_selector").val("medium");
				            	else
				            		$("div#words_div #size_selector").val("medium");
				        	}
				        	else
				        	{
				        		$("div#words_div #size_result_td").html("updated");
				        		if($("div#words_div #size_selector").val() === "wide")
				        			bg.user_jo.overlay_size = 600;
				        		else if($("div#words_div #size_selector").val() === "medium")
				        			bg.user_jo.overlay_size = 450;
				        		else
				        			bg.user_jo.overlay_size = 450;
				        		$("body").css("width", bg.user_jo.overlay_size + "px");
				        	}
				        	setTimeout(function(){$("div#words_div #size_result_td").html("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #size_result_td").html("ajax error");
				        	setTimeout(function(){$("div#words_div #size_result_td").html("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("div#words_div #onlike_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "onlike",
				            value: $("div#words_div #onlike_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("div#words_div #onlike_result_td").html("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.onlike === "email")
				            		$("div#words_div #onlike_selector").val("email");
				            	else if (bg.user_jo.onlike === "do nothing")
				            		$("div#words_div #onlike_selector").val("do nothing");
				        	}
				        	else
				        		$("div#words_div #onlike_result_td").html("updated");
				        	setTimeout(function(){$("div#words_div #onlike_result_td").html("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #onlike_result_td").html("ajax error");
				        	setTimeout(function(){$("div#words_div #onlike_result_td").html("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("div#words_div #ondislike_selector").change(function () {
            		var previousval = 
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "ondislike",
				            value: $("div#words_div #ondislike_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("div#words_div #ondislike_result_td").html("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.ondislike === "email")
				            		$("div#words_div #ondislike_selector").val("email");
				            	else if (bg.user_jo.ondislike === "do nothing")
				            		$("div#words_div #ondislike_selector").val("do nothing");
				        	}
				        	else
				        		$("div#words_div #ondislike_result_td").html("updated");
				        	setTimeout(function(){$("div#words_div #ondislike_result_td").html("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #ondislike_result_td").html("ajax error");
				        	setTimeout(function(){$("div#words_div #ondislike_result_td").html("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("div#words_div #onreply_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "onreply",
				            value: $("div#words_div #onreply_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("div#words_div #onreply_result_td").html("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.onreply === "email")
				            		$("div#words_div #onreply_selector").val("email");
				            	else if (bg.user_jo.onreply === "do nothing")
				            		$("div#words_div #onreply_selector").val("do nothing");
				        	}
				        	else
				        		$("div#words_div #onreply_result_td").html("updated");
				        	setTimeout(function(){$("div#words_div #onreply_result_td").html("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #onreply_result_td").html("ajax error");
				        	setTimeout(function(){$("div#words_div #onreply_result_td").html("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("div#words_div #onmention_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "onmention",
				            value: $("div#words_div #onmention_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("div#words_div #onmention_result_td").html("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.onmention === "email")
				            		$("div#words_div #onmention_selector").val("email");
				            	else if (bg.user_jo.onmention === "do nothing")
				            		$("div#words_div #onmention_selector").val("do nothing");
				        	}
				        	else
				        		$("div#words_div #onmention_result_td").html("updated");
				        	setTimeout(function(){$("div#words_div #onmention_result_td").html("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #onmention_result_td").html("ajax error");
				        	setTimeout(function(){$("div#words_div #onmention_result_td").html("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	/*$("div#words_div #emailpromos_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "emailpromos",
				            value: $("div#words_div #emailpromos_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        		$("div#words_div #emailpromos_result_td").html("Error: " + data.message);
				        	else
				        		$("div#words_div #emailpromos_result_td").html("updated");
				        	setTimeout(function(){$("div#words_div #emailpromos_result_td").html("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("div#words_div #emailpromos_result_td").html("ajax error");
				        	setTimeout(function(){$("div#words_div #emailpromos_result_td").html("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
					$("div#words_div #emailpromos_result_td").html("updated");
            	});*/
            }
        
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	displayMessage("Ajax error setUserPreference: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + currentURLhash);
            console.log(textStatus, errorThrown);
        } 
	});
	}
}
