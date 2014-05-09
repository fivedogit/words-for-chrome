
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
	//updateNotificationTabLinkImage();
	$("#thread_tab_img").attr("src", "images/chat_gray.png");
	$("#trending_tab_img").attr("src", "images/trending_gray.png");
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", "images/clock_gray.png");
	$("#profile_tab_img").attr("src", "images/user_blue.png");
	
	$("#utility_div").show();
	$("#header_div_top").text("Profile");
	$("#header_div_top").show();
	$("#comment_submission_form_div_" + currentURLhash).hide();
	if (bg.user_jo != null)
	{	
		getProfile(screenname);
	}
	else
	{
		$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to see user profiles.</div>");//OK
	}
}

function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	               .toString(16)
	               .substring(1);
	  }
	  return s4() + s4() + s4()+ s4() +
	         s4() +s4() + s4() + s4();
	}

function getProfile(screenname)
{
	var main_div_string = "";
	var target_user_jo;
	if (typeof bg.user_jo ==="undefined" || bg.user_jo === null) // not logged in nor was a target specified, 
	{									
		$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Log in to see user profiles.</div>");//OK
	}
	else if(typeof screenname === "undefined" || screenname === null)
	{
		$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">No target screenname provided. Check the link and try again.</div>");//OK
	}	
	else
	{
		$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Loading profile... please wait.</div>");//OK
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
            	$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Unable to retrieve profile.</div>");//OK
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
            	
            	main_div_string = main_div_string + "<div style=\"padding:5px;text-align:center\">";
            	main_div_string = main_div_string + "<table style=\"margin-right:auto;margin-left:auto;width:400px\">";
            	main_div_string = main_div_string + "<tr>";
            	main_div_string = main_div_string + "	<td>";
            	main_div_string = main_div_string + "		<table style=\"width:100%;\">";
            	main_div_string = main_div_string + "			<tr>";
            	main_div_string = main_div_string + "				<td style=\"width:128px;text-align:right\" id=\"large_avatar_td\">";
            	main_div_string = main_div_string + "					<img class=\"rounded\" id=\"large_avatar_img\" src=\"images/48avatar_ghosted.png\" style=\"height:128px;\">";
            	main_div_string = main_div_string + "				</td>";
            	main_div_string = main_div_string + "				<td>";
            	main_div_string = main_div_string + "					<table style=\"margin-right:auto;border-spacing:5px;\">";
            	if (target_user_jo.email)
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Screenname:</td><td style=\"text-align:left\"><span id=\"profile_page_screenname_span\"></span> <a href=\"#\" id=\"logout_link\">Log out</a></td></tr>";
            	else
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Screenname:</td><td style=\"text-align:left\"><span id=\"profile_page_screenname_span\"></span></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Email:</td><td style=\"text-align:left\" id=\"profile_page_email_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Since:</td><td style=\"text-align:left\" id=\"profile_page_since_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Seen:</td><td style=\"text-align:left\" id=\"profile_page_seen_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Comments:</td><td style=\"text-align:left\" id=\"profile_page_numcomments_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr>";
            	main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold\">";
            	main_div_string = main_div_string + "							Location:";
            	main_div_string = main_div_string + "							</td>";
            	main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"state_country_td\">";
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
					main_div_string = main_div_string + "						<tr>"
					main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold;vertical-align:top\">";
					main_div_string = main_div_string + "								Change avatar:<br>";
					main_div_string = main_div_string + "								<span id=\"social_wording_span\" style=\"font-size:10px;font-style:italic;font-weight:normal\"></span>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<div id=\"picture_type_div\">";
					main_div_string = main_div_string + "<table style=\"margin-right:auto;margin-left:auto\">";
					main_div_string = main_div_string + "<tr id=\"use_google_tr\">";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_google_radio\" type=\"radio\" name=\"picture_type\" value=\"google\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_google_wording_td\">";
					main_div_string = main_div_string + "		Google picture";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "<tr id=\"use_facebook_tr\">";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_facebook_radio\" type=\"radio\" name=\"picture_type\" value=\"facebook\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_facebook_wording_td\">";
					main_div_string = main_div_string + "		Facebook picture";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "<tr>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_geometric_radio\" type=\"radio\" name=\"picture_type\" value=\"geometric\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_geometric_wording_td\">";
					main_div_string = main_div_string + "		Geometric";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "<tr>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_monster_radio\" type=\"radio\" name=\"picture_type\" value=\"monster\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_monster_wording_td\">";
					main_div_string = main_div_string + "		Monster";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "<tr>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_cartoonface_radio\" type=\"radio\" name=\"picture_type\" value=\"cartoonface\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_cartoonface_wording_td\">";
					main_div_string = main_div_string + "		Cartoon face";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "<tr>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_retro_radio\" type=\"radio\" name=\"picture_type\" value=\"retro\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_retro_wording_td\">";
					main_div_string = main_div_string + "		Retro";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "<tr>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_unicorn_radio\" type=\"radio\" name=\"picture_type\" value=\"unicorn\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_unicorn_wording_td\">";
					main_div_string = main_div_string + "		Unicorn <span id=\"unicorn_wait_span\" style=\"font-style:italic\"></span>";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "<tr>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_silhouette_radio\" type=\"radio\" name=\"picture_type\" value=\"silhouette\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_silhouette_wording_td\">";
					main_div_string = main_div_string + "		Silhouette";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";
					main_div_string = main_div_string + "</table>";
					main_div_string = main_div_string + "								</div>";
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
					main_div_string = main_div_string + "							<td style=\"text-align:left;vertical-align:top\">";
					main_div_string = main_div_string + "								<img class=\"rounded\" id=\"avatar_img\" src=\"images/48avatar_ghosted.png\" style=\"width:48px;height:48px\">";
					main_div_string = main_div_string + "								<br><button id=\"avatar_save_button\">Save</button>";
					main_div_string = main_div_string + "								<br><span style=\"margin-left:7px\" id=\"avatar_save_span\"></span>";
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
					main_div_string = main_div_string + "								<span style=\"margin-left:2px;border:0px black solid;display:none\" id=\"screenname_availability_span\"><img src=\"images/ajaxSnake.gif\" style=\"width:16px;height16px;border:0px\"></span>";
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
            	$("#main_div_" + currentURLhash).html(main_div_string); //OK
            	$("#large_avatar_img").attr("src", target_user_jo.picture);
            	$("#profile_page_screenname_span").text(target_user_jo.screenname);
            	$("#profile_page_since_td").text(target_user_jo.since);
            	$("#profile_page_numcomments_td").text(target_user_jo.num_comments_authored);
            	if(target_user_jo.email)
            		$("#profile_page_email_td").text(target_user_jo.email + " (private)");
            	else
            	{
            		$("#profile_page_email_td").css("font-style", "italic");
            		$("#profile_page_email_td").text("hidden");
            	}	
            	if(target_user_jo.seen)
            		$("#profile_page_seen_td").text(target_user_jo.seen);
            	else
            	{
            		$("#profile_page_seen_td").css("font-style", "italic");
            		$("#profile_page_seen_td").text("hidden");
            	}	
            	if (target_user_jo.country === "USA")
            		$("#state_country_td").text(target_user_jo.state + ", " + target_user_jo.country);
            	else
            		$("#state_country_td").text(target_user_jo.country);
            	
            	$("#avatar_img").attr("src", bg.user_jo.picture);
            	
            	$("#screenname_available_button").click(
            			function () 
            			{
            		         	$("#screenname_availability_span").show();
            					if ($("#screenname_change_input").val().length <= 0) 
            					{
            						$("#screenname_availability_span").css("color","red");
            						$("#screenname_availability_span").text("Blank");
            						return;
            					} 
            					else if ($("#screenname_change_input").val().length < 6) 
            					{
            						$("#screenname_availability_span").css("color","red");
            						$("#screenname_availability_span").text("Too short");
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
            									$("#screenname_availability_span").css("color","red");
            									$("#screenname_availability_span").text("Error");
            									setTimeout( function () { 
        											$("#screenname_availability_span").text("");
        										}, 3000);
            								} 
            								else if (response_object.response_status === "success") 
            								{
            									if (response_object.screenname_available === "true") 
            									{
            										$("#screenname_availability_span").css("color","green");
            										$("#screenname_availability_span").text("Available");
            										setTimeout( function () { 
            											$("#screenname_availability_span").text("");
            										}, 3000);
            									}
            									else if (response_object.screenname_available === "false") 
            									{
            										$("#screenname_availability_span").css("color","red");
            										$("#screenname_availability_span").text("Unavailable");
            										setTimeout( function () { 
            											$("#screenname_availability_span").text("");
            										}, 3000);
            									}
            									else
            									{
            										$("#screenname_availability_span").css("color","red");
            										$("#screenname_availability_span").text("Error. Value !t/f.");
            										setTimeout( function () { 
            											$("#screenname_availability_span").text("");
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
            	
            	$("#screenname_submit_button").click(function () {
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
				        	{
				        		$("#screenname_result_td").text("error");
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
				        		$("#screenname_result_td").text("updated");
				        		setTimeout( function () { 
									$("#screenname_result_td").text("");
								}, 3000);
				        		bg.user_jo.screenname = $("#screenname_change_input").val();
				        		displayLogstatAsLoggedIn(); //updateLogstat();
				        		viewProfile($("#screenname_change_input").val());
				        		$("#screenname_change_input").val("");
				        	}
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#screenname_result_td").text("error");
				            console.log(textStatus, errorThrown);
				        }
					});
            	});

            	// see if the user has social tokens which look valid...
            	var google_access_token_expired_or_doesnt_exist = true;
        		if(docCookies.getItem("google_access_token_expires") != null && docCookies.getItem("google_access_token") != null) // ok, the token/expires cookies exist
        		{
        			var ex = docCookies.getItem("google_access_token_expires");
        			if(ex > bg.msfe_according_to_backend) 
        				google_access_token_expired_or_doesnt_exist = false; // and it appears valid
        			else 
        			{												// it existed, but wasn't valid. Delete everything
        				docCookies.removeItem("last_tab_id");
        				docCookies.removeItem("google_access_token");
        				docCookies.removeItem("google_access_token_expires");
        				docCookies.removeItem("email");
        				docCookies.removeItem("this_access_token");
        				google_access_token_expired_or_doesnt_exist = true;
        			}	
        		}	
        		var facebook_access_token_expired_or_doesnt_exist = true;
        		if(docCookies.getItem("facebook_access_token_expires") != null && docCookies.getItem("facebook_access_token") != null) // ok, the token/expires cookies exist
        		{
        			var ex = docCookies.getItem("facebook_access_token_expires");
        			if(ex > bg.msfe_according_to_backend) 
        				facebook_access_token_expired_or_doesnt_exist = false; // and it appears valid
        			else 
        			{												// it existed, but wasn't valid. Delete everything
        				docCookies.removeItem("last_tab_id");
        				docCookies.removeItem("facebook_access_token");
        				docCookies.removeItem("facebook_access_token_expires");
        				docCookies.removeItem("email");
        				docCookies.removeItem("this_access_token");
        				facebook_access_token_expired_or_doesnt_exist = true;
        			}	
        		}	
        		
        		if(bg.user_jo.picture.indexOf("googleusercontent.com") != -1)
        			$("#use_google_radio").prop('checked', true);
        		else if(bg.user_jo.picture.indexOf("graph.facebook.com") != -1)
        			$("#use_facebook_radio").prop('checked', true);
        		if(bg.user_jo.picture.indexOf("unicornify.appspot.com") != -1)
        			$("#use_unicorn_radio").prop('checked', true);
        		else if(bg.user_jo.picture.indexOf("d=identicon") != -1)
        			$("#use_geometric_radio").prop('checked', true);
        		else if(bg.user_jo.picture.indexOf("d=mm") != -1)
        			$("#use_silhouette_radio").prop('checked', true);
        		else if(bg.user_jo.picture.indexOf("d=retro") != -1)
        			$("#use_retro_radio").prop('checked', true);
        		else if(bg.user_jo.picture.indexOf("d=wavatar") != -1)
        			$("#use_cartoonface_radio").prop('checked', true);
        		else if(bg.user_jo.picture.indexOf("d=monsterid") != -1)
        			$("#use_monster_radio").prop('checked', true);
        		
        		// then show the appropriate trs and write the appropriate wording...
        		if(facebook_access_token_expired_or_doesnt_exist && google_access_token_expired_or_doesnt_exist)
        		{
        			$("#use_google_tr").hide();
        			$("#use_facebook_tr").hide();
        			$("#social_wording_span").text("To use a FB or Google picture, log out and back in, then return here. (Email must match.)");
        		}
        		else if(!facebook_access_token_expired_or_doesnt_exist && google_access_token_expired_or_doesnt_exist)
        		{
        			$("#use_google_tr").hide();
        			$("#social_wording_span").text("To use a Google picture, log out (fully) and back in with Google, then return here. (Email must match.)");
        		}
        		else if(facebook_access_token_expired_or_doesnt_exist && !google_access_token_expired_or_doesnt_exist)
        		{
        			$("#use_facebook_tr").hide();
        			$("#social_wording_span").text("To use a FB picture, log out (fully) and back in with FB, then return here. (Email must match.)");
        		}
        		else // both valid somehow, go off the picture hostname
        		{
        			if(bg.user_jo.picture.indexOf("graph.facebook.com") != -1)
        			{
        				$("#use_google_tr").hide();
        				$("#social_wording_span").text("To use a Google picture, log out and back in with Google, then return here. (Email must match.)");
        			}
        			else if(bg.user_jo.picture.indexOf("googleusercontent.com") != -1)
        			{
        				$("#use_facebook_tr").hide();
        				$("#social_wording_span").text("To use a FB picture, log out (fully) and back in with FB, then return here. (Email must match.)");
        			}
        			else // this is a bizarre situation where user has valid tokens for both social services but is using neither service's image
        			{    // let's just force only google to be valid. hehe
        				docCookies.removeItem("facebook_access_token");
        				docCookies.removeItem("facebook_access_token_expires");
        				$("#use_facebook_tr").hide();
        				$("#social_wording_span").text("To use a FB picture, log out (fully) and back in with FB, then return here. (Email must match.)");
        			}	
        		}	
            	
            	$("#use_google_radio").click(function () {
            		// go get Google picture
            		$.ajax({
            			type: 'GET',
            			url: bg.endpoint,
            			data: {
            				method: "getSocialPicture",
            				social_access_token: docCookies.getItem("google_access_token"),
            				social_access_token_expires: docCookies.getItem("google_access_token_expires"),
            				login_type: "google"
            			},
            			dataType: 'json',
            			async: true,
            			success: function (data, status) {
            				if(data.response_status === "error")
            				{
            					if(data.error_code == "0000")
            					{
            						docCookies.removeItem("google_access_token");
            						docCookies.removeItem("google_access_token_expires");
            					}	
            					displayMessage("Can't get Google picture as your token has expired. Please log out/in and try again.");
            					return "error";
            				}
            				else if(data.response_status === "success")
            				{
            					$("#avatar_img").attr("src", data.picture);
            				}	
            			},
            			error: function (XMLHttpRequest, textStatus, errorThrown) {
            				console.log(textStatus, errorThrown);
            				displayMessage("Couldn't retrieve picture. Network connection? (AJAX)", "red");
            				return error;
            			} 
            		});  
            	});
            	
            	$("#use_facebook_radio").click(function () {
            		// go get Google picture
            		$.ajax({
            			type: 'GET',
            			url: bg.endpoint,
            			data: {
            				method: "getSocialPicture",
            				social_access_token: docCookies.getItem("facebook_access_token"),
            				social_access_token_expires: docCookies.getItem("facebook_access_token_expires"),
            				login_type: "facebook"
            			},
            			dataType: 'json',
            			async: true,
            			success: function (data, status) {
            				if(data.response_status === "error")
            				{
            					if(data.error_code == "0000")
            					{
            						docCookies.removeItem("facebook_access_token");
            						docCookies.removeItem("facebook_access_token_expires");
            					}	
            					displayMessage("Can't get Facebook picture as your token has expired. Please log out/in and try again.");
            					return "error";
            				}
            				else if(data.response_status === "success")
            				{
            					$("#avatar_img").attr("src", data.picture);
            				}	
            			},
            			error: function (XMLHttpRequest, textStatus, errorThrown) {
            				console.log(textStatus, errorThrown);
            				displayMessage("Couldn't retrieve picture. Network connection? (AJAX)", "red");
            				return error;
            			} 
            		});  
            	});
            	
            	$("#use_geometric_radio").click(function () {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=identicon&s=128");
            	});
            	$("#use_monster_radio").click(function () {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=monsterid&s=128");
            	});
            	$("#use_cartoonface_radio").click(function () {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=wavatar&s=128");
            	});
            	$("#use_retro_radio").click(function () {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=retro&s=128");
            	});
            	$("#use_unicorn_radio").click(function () {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://unicornify.appspot.com/avatar/" + g + "?s=128");
            		$("#unicorn_wait_span").text("Wait...");
            		setTimeout(function() {$("#unicorn_wait_span").text("");}, 2000);
            	});
            	$("#use_silhouette_radio").click(function () {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=mm&s=128");
            	});
            	
            	$("#avatar_save_button").click(function () {
            		//alert("nyi image=" + $("#avatar_img").attr("src"));
            		$.ajax({
            			type: 'GET',
            			url: bg.endpoint,
            			data: {
            				method: "savePicture",
            				email: email,             
				            this_access_token: this_access_token,  
            				picture: $("#avatar_img").attr("src")
            			},
            			dataType: 'json',
            			async: true,
            			success: function (data, status) {
            				if(data.response_status === "error")
            				{
            					$("#avatar_save_span").text(" error");
            				}
            				else if(data.response_status === "success")
            				{
            					bg.user_jo.picture = $("#avatar_img").attr("src");
            					$("#large_avatar_img").attr("src", bg.user_jo.picture);
				        		$("#logged_in_profile_img").attr("src", bg.user_jo.picture);
            					$("#avatar_save_span").text(" saved");
            					setTimeout(function() {$("#avatar_save_span").text("");}, 2000);
            				}	
            			},
            			error: function (XMLHttpRequest, textStatus, errorThrown) {
            				console.log(textStatus, errorThrown);
            				displayMessage("Couldn't save picture. Network connection? (AJAX)", "red");
            				return error;
            			} 
            		});  
            	});
            	
            	$("#logout_link").click(
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
            				$("#main_div_" + currentURLhash).html(logoutmessage);//OK
            				
            				$("#logout_confirmation_button").click(
                        			function () {
                        				docCookies.removeItem("email");
                        				docCookies.removeItem("this_access_token");
                        				docCookies.removeItem("this_access_token_expires");
                        				if($("#facebook_disconnect_checkbox").prop("checked"))
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
                        				if($("#google_disconnect_checkbox").prop("checked"))
                        				{
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
            
            	if (bg.user_jo.overlay_size === 600)
            		$("#size_selector").val("wide");
            	else if (bg.user_jo.overlay_size === 450)
            		$("#size_selector").val("medium");
            	
            	if (bg.user_jo.onlike === "email")
            		$("#onlike_selector").val("email");
            	else if (bg.user_jo.onlike === "do nothing")
            		$("#onlike_selector").val("do nothing");
            	
            	if (bg.user_jo.ondislike === "email")
            		$("#ondislike_selector").val("email");
            	else if (bg.user_jo.ondislike === "do nothing")
            		$("#ondislike_selector").val("do nothing");
            	
            	if (bg.user_jo.onreply === "email")
            		$("#onreply_selector").val("email");
            	else if (bg.user_jo.onreply === "do nothing")
            		$("#onreply_selector").val("do nothing");
            	
            	if (bg.user_jo.onmention === "email")
            		$("#onmention_selector").val("email");
            	else if (bg.user_jo.onmention === "do nothing")
            		$("#onmention_selector").val("do nothing");
            	
            	/*if (bg.user_jo.emailpromos === "yes")
            		$("#emailpromos_selector").val("yes");
            	else if (bg.user_jo.emailpromos === "no")
            		$("#emailpromos_selector").val("no");*/
            	
            	$("#size_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "overlay_size",
				            value: $("#size_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#size_result_td").text("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.overlay_size === 600)
				            		$("#size_selector").val("wide");
				            	else if (bg.user_jo.overlay_size === 450)
				            		$("#size_selector").val("medium");
				            	else
				            		$("#size_selector").val("medium");
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
				        		$("#size_result_td").text("updated");
				        		if($("#size_selector").val() === "wide")
				        			bg.user_jo.overlay_size = 600;
				        		else if($("#size_selector").val() === "medium")
				        			bg.user_jo.overlay_size = 450;
				        		else
				        			bg.user_jo.overlay_size = 450;
				        		$("body").css("width", bg.user_jo.overlay_size + "px");
				        	}
				        	setTimeout(function(){$("#size_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#size_result_td").text("ajax error");
				        	setTimeout(function(){$("#size_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#onlike_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "onlike",
				            value: $("#onlike_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onlike_result_td").text("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.onlike === "email")
				            		$("#onlike_selector").val("email");
				            	else if (bg.user_jo.onlike === "do nothing")
				            		$("#onlike_selector").val("do nothing");
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
				        		$("#onlike_result_td").text("updated");
				        	setTimeout(function(){$("#onlike_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#onlike_result_td").text("ajax error");
				        	setTimeout(function(){$("#onlike_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#ondislike_selector").change(function () {
            		var previousval = 
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "ondislike",
				            value: $("#ondislike_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#ondislike_result_td").text("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.ondislike === "email")
				            		$("#ondislike_selector").val("email");
				            	else if (bg.user_jo.ondislike === "do nothing")
				            		$("#ondislike_selector").val("do nothing");
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
				        		$("#ondislike_result_td").text("updated");
				        	setTimeout(function(){$("#ondislike_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#ondislike_result_td").text("ajax error");
				        	setTimeout(function(){$("#ondislike_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#onreply_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "onreply",
				            value: $("#onreply_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onreply_result_td").text("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.onreply === "email")
				            		$("#onreply_selector").val("email");
				            	else if (bg.user_jo.onreply === "do nothing")
				            		$("#onreply_selector").val("do nothing");
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
				        		$("#onreply_result_td").text("updated");
				        	setTimeout(function(){$("#onreply_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#onreply_result_td").text("ajax error");
				        	setTimeout(function(){$("#onreply_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#onmention_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "onmention",
				            value: $("#onmention_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onmention_result_td").text("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.onmention === "email")
				            		$("#onmention_selector").val("email");
				            	else if (bg.user_jo.onmention === "do nothing")
				            		$("#onmention_selector").val("do nothing");
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
				        		$("#onmention_result_td").text("updated");
				        	setTimeout(function(){$("#onmention_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#onmention_result_td").text("ajax error");
				        	setTimeout(function(){$("#onmention_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            }
        
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	displayMessage("Ajax error setUserPreference: text=" + textStatus + " and error=" + errorThrown, "red", "message_div_" + currentURLhash);
            console.log(textStatus, errorThrown);
        } 
	});
	}
}

