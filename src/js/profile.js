
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
	$("#thread_tab_img").attr("src", chrome.extension.getURL("images/chat_gray.png"));
	$("#trending_tab_img").attr("src", chrome.extension.getURL("images/trending_gray.png"));
	updateNotificationTabLinkImage();
	$("#past_tab_img").attr("src", chrome.extension.getURL("images/clock_gray.png"));
	$("#profile_tab_img").attr("src", chrome.extension.getURL("images/user_blue.png"));
	
	$("#utility_header_td").text("Profile");
	
	$("#utility_message_td").hide();
	$("#utility_csf_td").hide();
	
	$("#footer_div").html("");
	
	if (user_jo !== null)
	{	
		if(screenname !== null)
			getProfile(screenname); // get the specified profile (mine or someone else's)
		else
			getProfile(user_jo.screenname); // get my own profile by default
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

function getProfile(target_screenname)
{
	var main_div_string = "";
	var target_user_jo;
	if (typeof user_jo ==="undefined" || user_jo === null) // not logged in nor was a target specified, 
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
		$.ajax({
		type: 'GET',
		url: endpoint,
		data: {
            method: "getUserByScreenname",
            screenname: screenname,            
            this_access_token: this_access_token,   
            target_screenname: target_screenname // the screenname of the user to get. Backend will determine if self, provide correct response
        },
        dataType: 'json',
        async: true,
        success: function (data, status) {
            if (data.response_status === "error")
            {
            	displayMessage(data.message, "red", "utility_message_td");
            	$("#main_div_" + currentURLhash).html("<div style=\"padding:20px\">Unable to retrieve profile.</div>");//OK
            	if(data.error_code && data.error_code === "0000")
        		{
            		//alert("getUserByScreenname returned code 0000");
        			displayMessage("Your login has expired. Please relog.", "red");
        			user_jo = null;
        			updateLogstat();
        		}
            }
            else 
            {
            	target_user_jo = data.target_user_jo; // backend will provide something that looks like this:
            	
            	main_div_string = main_div_string + "<div style=\"padding:5px;text-align:center\">";
            	main_div_string = main_div_string + "<table style=\"margin-right:auto;margin-left:auto;width:580px\">";
            	main_div_string = main_div_string + "<tr>";
            	main_div_string = main_div_string + "	<td>";
            	main_div_string = main_div_string + "		<table style=\"width:100%;\">";
            	main_div_string = main_div_string + "			<tr>";
            	main_div_string = main_div_string + "				<td style=\"width:128px;text-align:right\" id=\"large_avatar_td\">";
            	main_div_string = main_div_string + "					<img style=\"border-radius: 4px;height:128px;\" id=\"large_avatar_img\" src=\"images/48avatar_ghosted.png\">";
            	main_div_string = main_div_string + "				</td>";
            	main_div_string = main_div_string + "				<td>";
            	main_div_string = main_div_string + "					<table style=\"margin-right:auto;border-spacing:5px;border-collapse:separate;\">";
            	if (target_user_jo.email) // ok, this is a self user
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Screenname:</td><td style=\"text-align:left\"><span id=\"profile_page_screenname_span\"></span> <a href=\"#\" id=\"logout_link\">Log out</a></td></tr>";
            	else
            		main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Screenname:</td><td style=\"text-align:left\"><span id=\"profile_page_screenname_span\"></span></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold;vertical-align:top\">Email <span style=\"font-style:italic;font-weight:normal;font-color:#666666\">(private)</span>:</td><td style=\"text-align:left\" id=\"profile_page_email_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Since:</td><td style=\"text-align:left\" id=\"profile_page_since_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Seen:</td><td style=\"text-align:left\" id=\"profile_page_seen_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Comments authored:</td><td style=\"text-align:left\" id=\"profile_page_numcommentsauthored_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Likes authored:</td><td style=\"text-align:left\" id=\"profile_page_numlikesauthored_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Dislikes authored:</td><td style=\"text-align:left\" id=\"profile_page_numdislikesauthored_td\"></td></tr>";
            	main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Rating <span id=\"rating_window_span\"></span>:</td>";
            	main_div_string = main_div_string + "						<td style=\"text-align:left\" id=\"profile_page_rating_td\">";
            	main_div_string = main_div_string + "						<span id=\"up_span\" style=\"color:green\"></span> up, ";
            	main_div_string = main_div_string + "						<span id=\"down_span\" style=\"color:red\"></span> down, ";
            	main_div_string = main_div_string + "						<span id=\"percent_up_span\" style=\"color:blue\"></span> % up, ";
            	main_div_string = main_div_string + "						<span id=\"rating_span\" style=\"color:blue\"></span> rating";
            	main_div_string = main_div_string + "						</td>";
            	main_div_string = main_div_string + "						</tr>";
            	main_div_string = main_div_string + "					</table>";
            	main_div_string = main_div_string + "				</td>";
            	main_div_string = main_div_string + "			</tr>";
            	main_div_string = main_div_string + "		</table>";
            	main_div_string = main_div_string + "	</td>";
            	main_div_string = main_div_string + "</tr>";
            	if (target_user_jo.email) // ok, this is a self user
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
                	main_div_string = main_div_string + "					<table style=\"margin-right:auto;margin-left:auto;border-collapse:separate;border-spacing:5px\">";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On like:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onlike_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"button\">Update button</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onlike_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On dislike:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"ondislike_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"button\">Update button</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"ondislike_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On reply:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onreply_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"button\">Update button</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onreply_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">On mention:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onmention_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"button\">Update button</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onmention_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">A page you're following<br>is commented on:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onfollowcomment_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"button\">Update button</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onfollowcomment_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">News/info:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"promos_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"button\">Update button</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"promos_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr>";
					main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold;vertical-align:top\">";
					main_div_string = main_div_string + "								Change avatar:<br>";
					main_div_string = main_div_string + "								<span id=\"social_wording_span\" style=\"font-size:10px;font-style:italic;font-weight:normal\">To use a G/FB profile pic, log in with G/FB.</span>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<div id=\"picture_type_div\">";
					main_div_string = main_div_string + "<table style=\"margin-right:auto;margin-left:auto\">";
				/*	main_div_string = main_div_string + "<tr>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\">";
					main_div_string = main_div_string + "		<input id=\"use_social_radio\" type=\"radio\" name=\"picture_type\" value=\"social\">";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "	<td style=\"text-align:left\" id=\"use_social_wording_td\">";
					main_div_string = main_div_string + "		Social";
					main_div_string = main_div_string + "	</td>";
					main_div_string = main_div_string + "</tr>";*/
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
					main_div_string = main_div_string + "								<img style=\"border-radius: 4px;width;70px;height:70px;\" id=\"avatar_img\" src=\"images/48avatar_ghosted.png\">";
					main_div_string = main_div_string + "								<br><button id=\"avatar_save_button\" class=\"standardized-button\" >Save</button>";
					main_div_string = main_div_string + "								<br><span style=\"margin-left:7px\" id=\"avatar_save_span\"></span>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr>";
					main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold;vertical-align:top\">";
					main_div_string = main_div_string + "							 Change screenname:<br><span style=\"font-weight:normal\">Letters and numbers only,<br>starting with a letter</span>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<table style=\"width:auto;margin-right:auto\">";
					main_div_string = main_div_string + "									<tr>";
					main_div_string = main_div_string + "										<td colspan=2 style=\"text-align:left;padding-left:5px;\">";
					main_div_string = main_div_string + "											<span style=\"font-style:italic\">Warning: Changing this will sign you out.</span><br>";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "									</tr>";
					main_div_string = main_div_string + "									<tr>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:5px;\">";
					main_div_string = main_div_string + "											<input type=text id=\"screenname_change_input\" type=password style=\"width:150px;color:#666666;font-size:11px\" value=\"new screenname\">";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:5px;\">";
					main_div_string = main_div_string + "											<span style=\"margin-left:2px;border:0px black solid;display:none\" id=\"screenname_availability_span\"><img src=\"" + chrome.extension.getURL("images/ajaxSnake.gif") + "\" style=\"width:16px;height16px;border:0px\"></span>";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "									</tr>";
					main_div_string = main_div_string + "									<tr>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:5px;\">";
					main_div_string = main_div_string + "											<a href=\"#\" id=\"screenname_available_link\">available?</a> - ";
					main_div_string = main_div_string + "											<a href=\"#\" id=\"screenname_submit_link\">submit</a>";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:5px;\" id=\"screenname_result_td\">";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "									</tr>";
					main_div_string = main_div_string + "								</table>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr>";
					main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold;vertical-align:top\">";
					main_div_string = main_div_string + "							 Change password:<br><span style=\"font-weight:normal\">8-20 letters, numbers, !@-#$%*_</span>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<table style=\"width:auto;margin-right:auto\">";
					main_div_string = main_div_string + "									<tr>";
					main_div_string = main_div_string + "										<td style=\"text-align:right;font-size:10px;\">current:</td>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:3px\">";
					main_div_string = main_div_string + "											<input type=password style=\"width:150px;color:#666666;font-size:11px\" id=\"password_current_input\">";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "									</tr>";
					main_div_string = main_div_string + "									<tr>";
					main_div_string = main_div_string + "										<td style=\"text-align:right;font-size:10px;\">new:</td>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:3px\">";
					main_div_string = main_div_string + "											<input type=password style=\"width:150px;color:#666666;font-size:11px\" id=\"password_new_input\">";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "									</tr>";
					main_div_string = main_div_string + "									<tr>";
					main_div_string = main_div_string + "										<td style=\"text-align:right;font-size:10px;\">confirm:</td>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:3px\">";
					main_div_string = main_div_string + "											<input type=password style=\"width:150px;color:#666666;font-size:11px\" id=\"password_confirm_input\">";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "									</tr>";
					main_div_string = main_div_string + "									<tr>";
					main_div_string = main_div_string + "										<td style=\"text-align:right;font-size:10px;\"></td>";
					main_div_string = main_div_string + "										<td style=\"text-align:left;padding-left:3px\">";
					main_div_string = main_div_string + "											<a href=\"#\" id=\"password_submit_link\">submit</a> <span id=\"password_change_result_span\"></span>";
					main_div_string = main_div_string + "										</td>";
					main_div_string = main_div_string + "									</tr>";
					main_div_string = main_div_string + "								</table>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td id=\"password_change_result_td\" style=\"text-align:left\">";
					main_div_string = main_div_string +	"							</td>";
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
            	$("#profile_page_numcommentsauthored_td").text(target_user_jo.num_comments_authored);
            	$("#profile_page_numlikesauthored_td").text(target_user_jo.num_likes_authored);
            	$("#profile_page_numdislikesauthored_td").text(target_user_jo.num_dislikes_authored);
            	$("#up_span").text(target_user_jo.up);
            	$("#down_span").text(target_user_jo.down);
            	if(target_user_jo.up === 0 && target_user_jo.down === 0)
            		$("#percent_up_span").text("0");
            	else if(target_user_jo.up > 0 && target_user_jo.down === 0)
            		$("#percent_up_span").text("100");
            	else
            		$("#percent_up_span").text(Math.floor(target_user_jo.up / (target_user_jo.up + target_user_jo.down) * 100));
            	$("#rating_span").text(target_user_jo.rating);
            	$("#rating_window_span").text("(" + (target_user_jo.rating_window_mins/1440) + "d)");
            	
            	if(target_user_jo.email)
            	{	
            		var tstr = "";
            		if(typeof target_user_jo.provisional_email !== "undefined" && target_user_jo.provisional_email !== null)
        			{
        				tstr = tstr + "<table>";
            			tstr = tstr + "<tr><td style=\"text-align:left\">" +  target_user_jo.provisional_email + " (pending confirmation)</td></tr>";
            			tstr = tstr + "<tr><td id=\"email_flex_td\" style=\"text-align:left;font-size:10px\">code: <input type=\"text\" style=\"width:120px;font-size:10px\" id=\"email_confirmation_code_input\" value=\"Enter confirmation code\"><button id=\"confirmation_code_go_button\">go</button>";
            			tstr = tstr + "<br><span id=\"conf_code_result_span\"></span></td></tr>";
            			tstr = tstr + "</table>";
            			$("#profile_page_email_td").html(tstr);
            			$("#email_confirmation_code_input").focus(function(event) {
            				$("#email_confirmation_code_input").val("");
            			});
            			$("#confirmation_code_go_button").click(function(event) {
            				$.ajax({
                				type: 'GET',
                				url: endpoint,
                				data: {
                					method: "confirmEmailAddressWithCode",
                					email_to_confirm: target_user_jo.provisional_email,
                					confirmation_code: $("#email_confirmation_code_input").val(),
                					screenname: screenname,
                					this_access_token: this_access_token
                				},
                				dataType: 'json',
                				async: true,
                				success: function (data, status) 
                				{
                					if(data.response_status === "error")
                					{
                						$("#conf_code_result_span").text(data.message);
                						$("#conf_code_result_span").css("color", "red");
                						setTimeout(function() { 
                							viewProfile(screenname);
                						}, 2000);
                					}	
                					else if(data.response_status === "success")
                					{
                						$("#email_flex_td").css("color", "green");
                						$("#email_flex_td").text(data.message);
                						setTimeout(function() { 
                							viewProfile(screenname);
                						}, 2000);
                					}	
                					else
                					{
                						alert("response_status neither error nor success");
                					}	
                				},
                				error: function (XMLHttpRequest, textStatus, errorThrown) 
                				{
                					console.log(textStatus, errorThrown);
                					alert("ajax error");
                				}	
                			});
            			});
        			}	
        			else // no provisional_email, just the default
        			{
        				if(target_user_jo.email_is_confirmed)
        				{
        					var flexstr = "";
        					flexstr = flexstr + "<table style=\"width:auto;margin-right:auto;\">";
            				flexstr = flexstr + "	<tr>";
            				flexstr = flexstr + "		<td style=\"text-align:left\">" + target_user_jo.email + " (confirmed)</td>";
            				flexstr = flexstr + "		<td style=\"text-align:left;padding-left:3px\" id=\"remove_or_go_td\"><a href=\"#\" id=\"remove_email_link\">remove</a></td>";
            				flexstr = flexstr + "	</tr>";
            				flexstr = flexstr + "	<tr id=\"currpassrow_tr\" style=\"display:none\">";
            				flexstr = flexstr + "		<td style=\"text-align:left\"><input type=text style=\"width:175px;font-size:11px;color:#666666\" id=\"remove_email_password_input\" value=\"current password\"></td>";
            				flexstr = flexstr + "		<td style=\"text-align:left;font-size:10px;padding-left:3px\" id=\"remove_email_result_td\" ></td>";
            				flexstr = flexstr + "	</tr>";
            				flexstr = flexstr + "</table>";
                			$("#profile_page_email_td").html(flexstr);
                			$("#remove_email_link").click(function(event) { event.preventDefault();
                				$("#currpassrow_tr").show();
                				$("#remove_or_go_td").html("<button id=\"remove_email_go_button\">go</button>");
                				$("#remove_email_password_input").focus(function() {
                					if($("#remove_email_password_input").val() === "current password")
                					{
                						$("#remove_email_password_input").val("");
                						$("#remove_email_password_input").css("color", "black");
                					}
                				});
                				$("#remove_email_go_button").click(function(event) { 
                					$.ajax({
                						type: 'GET',
                    					url: endpoint,
                    					data: {
                    						method: "removeEmail",
                    						email_to_remove: target_user_jo.email,
                    						current_password: $("#remove_email_password_input").val(),
                    						screenname: screenname,
                    						this_access_token: this_access_token
                    					},
                    					dataType: 'json',
                        				async: true,
                        				success: function (data, status) 
                        				{
                        					if(data.response_status === "error")
                        					{
                        						$("#remove_email_result_td").text(data.message);
                        						$("#remove_email_result_td").css("color", "red");
                        						setTimeout(function() { 
                        							$("#remove_email_result_td").text("");
                            						$("#remove_email_result_td").css("color", "black");
                        						}, 2000);
                        					}	
                        					else if(data.response_status === "success")
                        					{
                        						$("#profile_page_email_td").text(data.message);
                        						$("#profile_page_email_td").css("color", "green");
                        						setTimeout(function() { 
                        							viewProfile(screenname);
                        						}, 2000);
                        					}	
                        					else
                        					{
                        						alert("response_status neither error nor success");
                        					}	
                        				},
                        				error: function (XMLHttpRequest, textStatus, errorThrown) 
                        				{
                        					console.log(textStatus, errorThrown);
                        					alert("ajax error");
                        				}
                        			});
                				});
                			});
        				}	
        				else // no provisional email waiting, nothing confirmed... this is the default @words4chrome.com address
        				{
        					tstr = tstr + "<table>";
                			tstr = tstr + "<tr><td style=\"text-align:left\">" +  target_user_jo.email + " (placeholder)</td></tr>";
                			tstr = tstr + "<tr><td id=\"email_flex_td\" style=\"text-align:left;font-size:10px\"><a href=\"#\" id=\"enter_real_address_link\">Enter a valid email in case you forget your password.</a></td></tr>";
                			tstr = tstr + "</table>";
                			$("#profile_page_email_td").html(tstr);
                			
                			$("#enter_real_address_link").click(function(event) { event.preventDefault();
                				var flexstr = "";
                				flexstr = flexstr + "<table style=\"width:auto;margin-right:auto;\">";
                				flexstr = flexstr + "	<tr>";
                				flexstr = flexstr + "		<td style=\"text-align:left\"><input type=text style=\"width:175px;font-size:11px;color:#666666\" id=\"real_email_input\" value=\"enter email\"></td>";
                				flexstr = flexstr + "		<td style=\"text-align:left\"><button id=\"real_email_go_button\">go</button></td>";
                				flexstr = flexstr + "	</tr>";
                				flexstr = flexstr + "	<tr>";
                				flexstr = flexstr + "		<td style=\"text-align:left\">current pass: <input type=password style=\"width:100px;font-size:11px;color:#666666\" id=\"real_email_password_input\"></td>";
                				flexstr = flexstr + "		<td style=\"text-align:left;font-size:10px\" id=\"real_email_result_td\" ></td>";
                				flexstr = flexstr + "	</tr>";
                				flexstr = flexstr + "</table>";
                				$("#email_flex_td").html(flexstr);
                				$("#real_email_input").focus(function() {
                					if($("#real_email_input").val() === "enter email")
                					{
                						$("#real_email_input").val("");
                						$("#real_email_input").css("color", "black");
                					}
                				});
                				$("#real_email_go_button").click(function(event) {
                					$.ajax({
                        				type: 'GET',
                        				url: endpoint,
                        				data: {
                        					method: "setProvisionalEmail",
                        					current_password: $("#real_email_password_input").val(),
                        					provisional_email: $("#real_email_input").val(),
                        					screenname: screenname,
                        					this_access_token: this_access_token
                        				},
                        				dataType: 'json',
                        				async: true,
                        				success: function (data, status) 
                        				{
                        					if(data.response_status === "error")
                        					{
                        						$("#real_email_result_td").text(data.message);
                        						$("#real_email_result_td").css("color", "red");
                        						setTimeout(function() { 
                        							$("#real_email_result_td").text("");
                            						$("#real_email_result_td").css("color", "black");
                        						}, 2000);
                        					}	
                        					else if(data.response_status === "success")
                        					{
                        						$("#email_flex_td").text(data.message);
                        						$("#email_flex_td").css("color", "green");
                        					}	
                        					else
                        					{
                        						alert("response_status neither error nor success");
                        					}	
                        				},
                        				error: function (XMLHttpRequest, textStatus, errorThrown) 
                        				{
                        					console.log(textStatus, errorThrown);
                        					alert("ajax error");
                        				}
                        			});
                    			});
                			});
        				}
        			}		
            	}
            	else
            	{
            		$("#profile_page_email_td").css("font-style", "italic");
            		$("#profile_page_email_td").text("private");
            	}	
            	if(target_user_jo.seen)
            		$("#profile_page_seen_td").text(target_user_jo.seen);
            	else
            	{
            		$("#profile_page_seen_td").css("font-style", "italic");
            		$("#profile_page_seen_td").text("hidden");
            	}	
            	
            	$("#avatar_img").attr("src", user_jo.picture);
            	
            	$("#screenname_available_link").click( function (event) { event.preventDefault();
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
            	
            	

            	if(user_jo.picture.indexOf("unicornify.appspot.com") != -1)
        			$("#use_unicorn_radio").prop('checked', true);
        		else if(user_jo.picture.indexOf("d=identicon") != -1)
        			$("#use_geometric_radio").prop('checked', true);
        		else if(user_jo.picture.indexOf("d=mm") != -1)
        			$("#use_silhouette_radio").prop('checked', true);
        		else if(user_jo.picture.indexOf("d=retro") != -1)
        			$("#use_retro_radio").prop('checked', true);
        		else if(user_jo.picture.indexOf("d=wavatar") != -1)
        			$("#use_cartoonface_radio").prop('checked', true);
        		else if(user_jo.picture.indexOf("d=monsterid") != -1)
        			$("#use_monster_radio").prop('checked', true);
        		
            	$("#use_geometric_radio").click(function (event) {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=identicon&s=128");
            	});
            	$("#use_monster_radio").click(function (event) { 
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=monsterid&s=128");
            	});
            	$("#use_cartoonface_radio").click(function (event) {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=wavatar&s=128");
            	});
            	$("#use_retro_radio").click(function (event) { 
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=retro&s=128");
            	});
            	$("#use_unicorn_radio").click(function (event) {
            		var g = guid();
            		$("#avatar_img").attr("src", "http://unicornify.appspot.com/avatar/" + g + "?s=128");
            		$("#unicorn_wait_span").text("Wait...");
            		setTimeout(function() {$("#unicorn_wait_span").text("");}, 2000);
            	});
            	$("#use_silhouette_radio").click(function (event) { 
            		var g = guid();
            		$("#avatar_img").attr("src", "http://www.gravatar.com/avatar/" + g + "?d=mm&s=128");
            	});
            	
            	$("#avatar_save_button").click(function (event) { event.preventDefault();
            		$.ajax({
            			type: 'GET',
            			url: endpoint,
            			data: {
            				method: "savePicture",
            				screenname: screenname,             
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
            					user_jo.picture = $("#avatar_img").attr("src");
            					$("#large_avatar_img").attr("src", user_jo.picture);
				        		$("#logged_in_profile_img").attr("src", user_jo.picture);
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
            	
            	$("#logout_link").click( function (event) { event.preventDefault();
            				var logoutmessage = "<div>";
            				logoutmessage = logoutmessage + "<table style=\"margin-right:auto;margin-left:auto;border-spacing:20px;border-collapse:separate\">";
            				logoutmessage = logoutmessage + "	<tr>";
            				logoutmessage = logoutmessage + "		<td style=\"text-align:center;font-size:14px\">";
            				logoutmessage = logoutmessage + "You have chosen to log out of WORDS.";
            				logoutmessage = logoutmessage + "<br>Please confirm.";
            				logoutmessage = logoutmessage + "		</td>";
            				logoutmessage = logoutmessage + "	</tr>";
            				logoutmessage = logoutmessage + "	<tr>";
            				logoutmessage = logoutmessage + "		<td style=\"text-align:center;font-size:11px;font-style:italic\">";
            				if(user_jo.last_login_type === "google")
            				{
            					logoutmessage = logoutmessage + "To use a different Google account, click LOGOUT below, <b>restart your browser</b>, then log back in.";
            				}	
            				else if(user_jo.last_login_type === "facebook")
            				{
            					logoutmessage = logoutmessage + "To use a different Facebook account, click LOGOUT below, <b>restart your browser</b>, then log back in.";
            				}	
            				logoutmessage = logoutmessage + "		</td>";
            				logoutmessage = logoutmessage + "	</tr>";
            				logoutmessage = logoutmessage + "	<tr>";
            				logoutmessage = logoutmessage + "		<td style=\"text-align:center;font-size:15px\">";
            				logoutmessage = logoutmessage + "			<button id=\"logout_confirmation_button\" class=\"standardized-button\">Logout</button>";
            				logoutmessage = logoutmessage + "		</td>";
            				logoutmessage = logoutmessage + "	</tr>";
            				logoutmessage = logoutmessage + "</table>";
            				logoutmessage = logoutmessage + "</div>";
            				$("#main_div_" + currentURLhash).html(logoutmessage);//OK
            				
            				$("#logout_confirmation_button").click( function (event) { event.preventDefault();
                        				 chrome.runtime.sendMessage({method: "logout"}, function(response) {
                        					  //alert(response.message);
                        					  user_jo = null;
                        					  initializeView();
                        					  doThreadTab();
                        				 });
                        			});
            				return;
            			});
            
            	if (user_jo.onlike === "button")
            		$("#onlike_selector").val("button");
            	else if (user_jo.onlike === "do nothing")
            		$("#onlike_selector").val("do nothing");
            	
            	if (user_jo.ondislike === "button")
            		$("#ondislike_selector").val("button");
            	else if (user_jo.ondislike === "do nothing")
            		$("#ondislike_selector").val("do nothing");
            	
            	if (user_jo.onreply === "button")
            		$("#onreply_selector").val("button");
            	else if (user_jo.onreply === "do nothing")
            		$("#onreply_selector").val("do nothing");
            	
            	if (user_jo.onmention === "button")
            		$("#onmention_selector").val("button");
            	else if (user_jo.onmention === "do nothing")
            		$("#onmention_selector").val("do nothing");

            	if (user_jo.onfollowcomment === "button")
            		$("#onfollowcomment_selector").val("button");
            	else if (user_jo.onfollowcomment === "do nothing")
            		$("#onfollowcomment_selector").val("do nothing");
            	
            	if (user_jo.promos === "button")
            		$("#promos_selector").val("button");
            	else if (user_jo.promos === "do nothing")
            		$("#promos_selector").val("do nothing");
            	
            	$("#onlike_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            screenname: screenname,             
				            this_access_token: this_access_token,  
				            which: "onlike",
				            value: $("#onlike_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onlike_result_td").text(data.message);
				        		// on error, reset the selector to the user_jo value
				        		if (user_jo.onlike === "button")
				            		$("#onlike_selector").val("button");
				            	else if (user_jo.onlike === "do nothing")
				            		$("#onlike_selector").val("do nothing");
				        		displayMessage(data.message, "red", "utility_message_td");
				            	if(data.error_code && data.error_code === "0000")
				        		{
				        			displayMessage("Your login has expired. Please relog.", "red");
				        			user_jo = null;
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
				            screenname: screenname,               
				            this_access_token: this_access_token,  
				            which: "ondislike",
				            value: $("#ondislike_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#ondislike_result_td").text(data.message);
				        		// on error, reset the selector to the user_jo value
				        		if (user_jo.ondislike === "button")
				            		$("#ondislike_selector").val("button");
				            	else if (user_jo.ondislike === "do nothing")
				            		$("#ondislike_selector").val("do nothing");
				        		displayMessage(data.message, "red", "utility_message_td");
				            	if(data.error_code && data.error_code === "0000")
				        		{
				        			displayMessage("Your login has expired. Please relog.", "red");
				        			user_jo = null;
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
				            screenname: screenname,          
				            this_access_token: this_access_token,  
				            which: "onreply",
				            value: $("#onreply_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onreply_result_td").text(data.message);
				        		// on error, reset the selector to the user_jo value
				        		if (user_jo.onreply === "button")
				            		$("#onreply_selector").val("button");
				            	else if (user_jo.onreply === "do nothing")
				            		$("#onreply_selector").val("do nothing");
				        		displayMessage(data.message, "red", "utility_message_td");
				            	if(data.error_code && data.error_code === "0000")
				        		{
				        			displayMessage("Your login has expired. Please relog.", "red");
				        			user_jo = null;
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
				            screenname: screenname,              
				            this_access_token: this_access_token,  
				            which: "onmention",
				            value: $("#onmention_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onmention_result_td").text(data.message);
				        		// on error, reset the selector to the user_jo value
				        		if (user_jo.onmention === "button")
				            		$("#onmention_selector").val("button");
				            	else if (user_jo.onmention === "do nothing")
				            		$("#onmention_selector").val("do nothing");
				        		displayMessage(data.message, "red", "utility_message_td");
				            	if(data.error_code && data.error_code === "0000")
				        		{
				        			displayMessage("Your login has expired. Please relog.", "red");
				        			user_jo = null;
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
            	
            	
            	$("#onfollowcomment_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            screenname: screenname,               
				            this_access_token: this_access_token,  
				            which: "onfollowcomment",
				            value: $("#onfollowcomment_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onfollowcomment_result_td").text(data.message);
				        		// on error, reset the selector to the user_jo value
				        		if (user_jo.onfollowcomment === "button")
				            		$("#onfollowcomment_selector").val("button");
				            	else if (user_jo.onfollowcomment === "do nothing")
				            		$("#onfollowcomment_selector").val("do nothing");
				        		displayMessage(data.message, "red", "utility_message_td");
				            	if(data.error_code && data.error_code === "0000")
				        		{
				        			displayMessage("Your login has expired. Please relog.", "red");
				        			user_jo = null;
				        			updateLogstat();
				        		}
				        	}
				        	else
				        		$("#onfollowcomment_result_td").text("updated");
				        	setTimeout(function(){$("#onfollowcomment_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#onfollowcomment_result_td").text("ajax error");
				        	setTimeout(function(){$("#onfollowcomment_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#promos_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            screenname: screenname,                
				            this_access_token: this_access_token,  
				            which: "promos",
				            value: $("#promos_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#promos_result_td").text(data.message);
				        		// on error, reset the selector to the user_jo value
				        		if (user_jo.promos === "button")
				            		$("#promos_selector").val("button");
				            	else if (user_jo.promos === "do nothing")
				            		$("#promos_selector").val("do nothing");
				        		displayMessage(data.message, "red", "utility_message_td");
				            	if(data.error_code && data.error_code === "0000")
				        		{
				        			displayMessage("Your login has expired. Please relog.", "red");
				        			user_jo = null;
				        			updateLogstat();
				        		}
				        	}
				        	else
				        		$("#promos_result_td").text("updated");
				        	setTimeout(function(){$("#promos_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#promos_result_td").text("ajax error");
				        	setTimeout(function(){$("#promos_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#screenname_change_input").focus(function () { 
            		if($("#screenname_change_input").val() === "new screenname")
            		{
            			$("#screenname_change_input").val("");
            			$("#screenname_change_input").css("color", "black");
            		}
            	});
            	
            	// this will log the user out as their existing screenname/tat combo won't work anymore
            	$("#screenname_submit_link").click(function (event) { event.preventDefault();
            		$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            screenname: screenname,             
				            this_access_token: this_access_token,  
				            which: "screenname",
				            value:  $("#screenname_change_input").val()
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#screenname_result_td").css("color","red");
								$("#screenname_result_td").text("error");
								setTimeout( function () { 
									$("#screenname_result_td").text("");
								}, 3000);
				            	if(data.error_code && data.error_code === "0000")
				        		{
				        			displayMessage("Your login has expired. Please relog.", "red");
				        			user_jo = null;
				        			updateLogstat();
				        		}
				        	}
				        	else
				        	{
				        		$("#screenname_result_td").text("updated");
				        		setTimeout( function () { 
									$("#screenname_result_td").text("");
								}, 3000);
				        		user_jo = null; // changing screenname logs the user out completely
				        		updateLogstat(); 
				        		viewProfile($("#screenname_change_input").val());
				        		$("#screenname_change_input").val("");
				        	}
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#screenname_result_td").text("ajax error");
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#password_submit_link").click(function (event) { event.preventDefault();
            	
            		if ($("#password_new_input").val() !== $("#password_confirm_input").val())
            		{
            			$("#password_result_td").css("color","red");	
            			$("#screenname_result_td").text("Password and confirm don't match.");
            		}
            		else if (!$("#password_new_input").val().match(/^(\w|[!@\-#$%\*]){8,20}$/))
            		{
            			$("#password_result_td").css("color","red");	
            			$("#screenname_result_td").text("New password is invalid.");
            		}
            		else
            		{
            			
            		}	
            		$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "changePassword",
				            screenname: screenname,             
				            this_access_token: this_access_token,  
				            current_password: $("#password_current_input").val(),
				            new_password:  $("#password_new_input").val()
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#password_change_result_span").css("color","red");
								$("#password_change_result_span").text("error");
								setTimeout( function () { 
									$("#password_change_result_span").text("");
								}, 2000);
				            	if(data.error_code && data.error_code === "0000")
				        		{
				            		$("#password_change_result_span").text("Your login has expired. Please relog.");
				        			user_jo = null;
				        			updateLogstat();
				        		}
				        	}
				        	else
				        	{
				        		$("#password_change_result_span").css("color","green");
								$("#password_change_result_span").text("updated");
								$("#password_current_input").val("");
								$("#password_new_input").val("");
								$("#password_confirm_input").val("");
				        		setTimeout( function () { 
									$("#password_change_result_span").text("");
								}, 2000);
				        	}
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#password_change_result_span").css("color","red");
							$("#password_change_result_span").text("ajax error");
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            }
        
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        	displayMessage("Ajax error setUserPreference: text=" + textStatus + " and error=" + errorThrown, "red", "utility_message_td");
            console.log(textStatus, errorThrown);
        } 
	});
	}
}

