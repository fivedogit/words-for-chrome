
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
            		//alert("getUserByScreenname returned code 0000");
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
            	main_div_string = main_div_string + "<table style=\"margin-right:auto;margin-left:auto;width:430px\">";
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
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">A page you're following<br>is commented on:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"onfollowcomment_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"email\">Email me</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"onfollowcomment_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">News/info emails:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "							<select id=\"emailpromos_selector\">";
					main_div_string = main_div_string + "							  <option SELECTED value=\"email\">Email me</option>";
					main_div_string = main_div_string + "							  <option value=\"do nothing\">Do nothing</option>";
					main_div_string = main_div_string + "							</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"emailpromos_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr><td style=\"text-align:right;font-weight:bold\">Country:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "			<select id=\"country_selector\">";
					main_div_string = main_div_string + "			<option value=\"\" SELECTED>Select country</option>";
					main_div_string = main_div_string + "			<option value=\"USA\">United States</option>";
					main_div_string = main_div_string + "			<option value=\"AFG\">Afghanistan</option>";
					main_div_string = main_div_string + "			<option value=\"ALB\">Albania</option>";
					main_div_string = main_div_string + "			<option value=\"DZA\">Algeria</option>";
					main_div_string = main_div_string + "			<option value=\"ASM\">American Samoa</option>";
					main_div_string = main_div_string + "			<option value=\"AND\">Andorra</option>";
					main_div_string = main_div_string + "			<option value=\"AGO\">Angola</option>";
					main_div_string = main_div_string + "			<option value=\"AIA\">Anguilla</option>";
					main_div_string = main_div_string + "			<option value=\"ATA\">Antarctica</option>";
					main_div_string = main_div_string + "			<option value=\"ATG\">Antigua and Barbuda</option>";
					main_div_string = main_div_string + "			<option value=\"ARG\">Argentina</option>";
					main_div_string = main_div_string + "			<option value=\"ARM\">Armenia</option>";
					main_div_string = main_div_string + "			<option value=\"ABW\">Aruba</option>";
					main_div_string = main_div_string + "			<option value=\"AUS\">Australia</option>";
					main_div_string = main_div_string + "			<option value=\"AUT\">Austria</option>";
					main_div_string = main_div_string + "			<option value=\"AZE\">Azerbaijan</option>";
					main_div_string = main_div_string + "			<option value=\"BHS\">Bahamas</option>";
					main_div_string = main_div_string + "			<option value=\"BHR\">Bahrain</option>";
					main_div_string = main_div_string + "			<option value=\"BGD\">Bangladesh</option>";
					main_div_string = main_div_string + "			<option value=\"BRB\">Barbados</option>";
					main_div_string = main_div_string + "			<option value=\"BLR\">Belarus</option>";
					main_div_string = main_div_string + "			<option value=\"BEL\">Belgium</option>";
					main_div_string = main_div_string + "			<option value=\"BLZ\">Belize</option>";
					main_div_string = main_div_string + "			<option value=\"BEN\">Benin</option>";
					main_div_string = main_div_string + "			<option value=\"BMU\">Bermuda</option>";
					main_div_string = main_div_string + "			<option value=\"BTN\">Bhutan</option>";
					main_div_string = main_div_string + "			<option value=\"BOL\">Bolivia</option>";
					main_div_string = main_div_string + "			<option value=\"BES\">Bonaire, Sint Eustatius and Saba</option>";
					main_div_string = main_div_string + "			<option value=\"BIH\">Bosnia and Herzegovina</option>";
					main_div_string = main_div_string + "			<option value=\"BWA\">Botswana</option>";
					main_div_string = main_div_string + "			<option value=\"BVT\">Bouvet Island</option>";
					main_div_string = main_div_string + "			<option value=\"BRA\">Brazil</option>";
					main_div_string = main_div_string + "			<option value=\"IOT\">British Indian Ocean Territory</option>";
					main_div_string = main_div_string + "			<option value=\"BRN\">Brunei Darussalam</option>";
					main_div_string = main_div_string + "			<option value=\"BGR\">Bulgaria</option>";
					main_div_string = main_div_string + "			<option value=\"BFA\">Burkina Faso</option>";
					main_div_string = main_div_string + "			<option value=\"BDI\">Burundi</option>";
					main_div_string = main_div_string + "			<option value=\"KHM\">Cambodia</option>";
					main_div_string = main_div_string + "			<option value=\"CMR\">Cameroon</option>";
					main_div_string = main_div_string + "			<option value=\"CAN\">Canada</option>";
					main_div_string = main_div_string + "			<option value=\"CPV\">Cape Verde</option>";
					main_div_string = main_div_string + "			<option value=\"CYM\">Cayman Islands</option>";
					main_div_string = main_div_string + "			<option value=\"CAF\">Central African Republic</option>";
					main_div_string = main_div_string + "			<option value=\"TCD\">Chad</option>";
					main_div_string = main_div_string + "			<option value=\"CHL\">Chile</option>";
					main_div_string = main_div_string + "			<option value=\"CHN\">China</option>";
					main_div_string = main_div_string + "			<option value=\"CXR\">Christmas Island</option>";
					main_div_string = main_div_string + "			<option value=\"CCK\">Cocos (Keeling) Islands</option>";
					main_div_string = main_div_string + "			<option value=\"COL\">Colombia</option>";
					main_div_string = main_div_string + "			<option value=\"COM\">Comoros</option>";
					main_div_string = main_div_string + "			<option value=\"COG\">Congo</option>";
					main_div_string = main_div_string + "			<option value=\"COD\">Congo, DR</option>";
					main_div_string = main_div_string + "			<option value=\"COK\">Cook Islands</option>";
					main_div_string = main_div_string + "			<option value=\"CRI\">Costa Rica</option>";
					main_div_string = main_div_string + "			<option value=\"CIV\">Côte d'Ivoire</option>";
					main_div_string = main_div_string + "			<option value=\"HRV\">Croatia</option>";
					main_div_string = main_div_string + "			<option value=\"CUB\">Cuba</option>";
					main_div_string = main_div_string + "			<option value=\"CUW\">Curaçao</option>";
					main_div_string = main_div_string + "			<option value=\"CYP\">Cyprus</option>";
					main_div_string = main_div_string + "			<option value=\"CZE\">Czech Republic</option>";
					main_div_string = main_div_string + "			<option value=\"DNK\">Denmark</option>";
					main_div_string = main_div_string + "			<option value=\"DJI\">Djibouti</option>";
					main_div_string = main_div_string + "			<option value=\"DMA\">Dominica</option>";
					main_div_string = main_div_string + "			<option value=\"DOM\">Dominican Republic</option>";
					main_div_string = main_div_string + "			<option value=\"ECU\">Ecuador</option>";
					main_div_string = main_div_string + "			<option value=\"EGY\">Egypt</option>";
					main_div_string = main_div_string + "			<option value=\"SLV\">El Salvador</option>";
					main_div_string = main_div_string + "			<option value=\"GNQ\">Equatorial Guinea</option>";
					main_div_string = main_div_string + "			<option value=\"ERI\">Eritrea</option>";
					main_div_string = main_div_string + "			<option value=\"EST\">Estonia</option>";
					main_div_string = main_div_string + "			<option value=\"ETH\">Ethiopia</option>";
					main_div_string = main_div_string + "			<option value=\"FLK\">Falkland Islands (Malvinas)</option>";
					main_div_string = main_div_string + "			<option value=\"FRO\">Faroe Islands</option>";
					main_div_string = main_div_string + "			<option value=\"FJI\">Fiji</option>";
					main_div_string = main_div_string + "			<option value=\"FIN\">Finland</option>";
					main_div_string = main_div_string + "			<option value=\"FRA\">France</option>";
					main_div_string = main_div_string + "			<option value=\"GUF\">French Guiana</option>";
					main_div_string = main_div_string + "			<option value=\"PYF\">French Polynesia</option>";
					main_div_string = main_div_string + "			<option value=\"ATF\">French Southern Territories</option>";
					main_div_string = main_div_string + "			<option value=\"GAB\">Gabon</option>";
					main_div_string = main_div_string + "			<option value=\"GMB\">Gambia</option>";
					main_div_string = main_div_string + "			<option value=\"GEO\">Georgia</option>";
					main_div_string = main_div_string + "			<option value=\"DEU\">Germany</option>";
					main_div_string = main_div_string + "			<option value=\"GHA\">Ghana</option>";
					main_div_string = main_div_string + "			<option value=\"GIB\">Gibraltar</option>";
					main_div_string = main_div_string + "			<option value=\"GRC\">Greece</option>";
					main_div_string = main_div_string + "			<option value=\"GRL\">Greenland</option>";
					main_div_string = main_div_string + "			<option value=\"GRD\">Grenada</option>";
					main_div_string = main_div_string + "			<option value=\"GLP\">Guadeloupe</option>";
					main_div_string = main_div_string + "			<option value=\"GUM\">Guam</option>";
					main_div_string = main_div_string + "			<option value=\"GTM\">Guatemala</option>";
					main_div_string = main_div_string + "			<option value=\"GGY\">Guernsey</option>";
					main_div_string = main_div_string + "			<option value=\"GIN\">Guinea</option>";
					main_div_string = main_div_string + "			<option value=\"GNB\">Guinea-Bissau</option>";
					main_div_string = main_div_string + "			<option value=\"GUY\">Guyana</option>";
					main_div_string = main_div_string + "			<option value=\"HTI\">Haiti</option>";
					main_div_string = main_div_string + "			<option value=\"HMD\">Heard Island and McDonald Islands</option>";
					main_div_string = main_div_string + "			<option value=\"VAT\">Holy See (Vatican City State)</option>";
					main_div_string = main_div_string + "			<option value=\"HND\">Honduras</option>";
					main_div_string = main_div_string + "			<option value=\"HKG\">Hong Kong</option>";
					main_div_string = main_div_string + "			<option value=\"HUN\">Hungary</option>";
					main_div_string = main_div_string + "			<option value=\"ISL\">Iceland</option>";
					main_div_string = main_div_string + "			<option value=\"IND\">India</option>";
					main_div_string = main_div_string + "			<option value=\"IDN\">Indonesia</option>";
					main_div_string = main_div_string + "			<option value=\"IRN\">Iran</option>";
					main_div_string = main_div_string + "			<option value=\"IRQ\">Iraq</option>";
					main_div_string = main_div_string + "			<option value=\"IRL\">Ireland</option>";
					main_div_string = main_div_string + "			<option value=\"IMN\">Isle of Man</option>";
					main_div_string = main_div_string + "			<option value=\"ISR\">Israel</option>";
					main_div_string = main_div_string + "			<option value=\"ITA\">Italy</option>";
					main_div_string = main_div_string + "			<option value=\"JAM\">Jamaica</option>";
					main_div_string = main_div_string + "			<option value=\"JPN\">Japan</option>";
					main_div_string = main_div_string + "			<option value=\"JEY\">Jersey</option>";
					main_div_string = main_div_string + "			<option value=\"JOR\">Jordan</option>";
					main_div_string = main_div_string + "			<option value=\"KAZ\">Kazakhstan</option>";
					main_div_string = main_div_string + "			<option value=\"KEN\">Kenya</option>";
					main_div_string = main_div_string + "			<option value=\"KIR\">Kiribati</option>";
					main_div_string = main_div_string + "			<option value=\"PRK\">Korea, DPR</option>";
					main_div_string = main_div_string + "			<option value=\"KOR\">Korea, Republic of</option>";
					main_div_string = main_div_string + "			<option value=\"KWT\">Kuwait</option>";
					main_div_string = main_div_string + "			<option value=\"KGZ\">Kyrgyzstan</option>";
					main_div_string = main_div_string + "			<option value=\"LAO\">Lao People's Democratic Republic</option>";
					main_div_string = main_div_string + "			<option value=\"LVA\">Latvia</option>";
					main_div_string = main_div_string + "			<option value=\"LBN\">Lebanon</option>";
					main_div_string = main_div_string + "			<option value=\"LSO\">Lesotho</option>";
					main_div_string = main_div_string + "			<option value=\"LBR\">Liberia</option>";
					main_div_string = main_div_string + "			<option value=\"LBY\">Libya</option>";
					main_div_string = main_div_string + "			<option value=\"LIE\">Liechtenstein</option>";
					main_div_string = main_div_string + "			<option value=\"LTU\">Lithuania</option>";
					main_div_string = main_div_string + "			<option value=\"LUX\">Luxembourg</option>";
					main_div_string = main_div_string + "			<option value=\"MAC\">Macao</option>";
					main_div_string = main_div_string + "			<option value=\"MKD\">Macedonia</option>";
					main_div_string = main_div_string + "			<option value=\"MDG\">Madagascar</option>";
					main_div_string = main_div_string + "			<option value=\"MWI\">Malawi</option>";
					main_div_string = main_div_string + "			<option value=\"MYS\">Malaysia</option>";
					main_div_string = main_div_string + "			<option value=\"MDV\">Maldives</option>";
					main_div_string = main_div_string + "			<option value=\"MLI\">Mali</option>";
					main_div_string = main_div_string + "			<option value=\"MLT\">Malta</option>";
					main_div_string = main_div_string + "			<option value=\"MHL\">Marshall Islands</option>";
					main_div_string = main_div_string + "			<option value=\"MTQ\">Martinique</option>";
					main_div_string = main_div_string + "			<option value=\"MRT\">Mauritania</option>";
					main_div_string = main_div_string + "			<option value=\"MUS\">Mauritius</option>";
					main_div_string = main_div_string + "			<option value=\"MYT\">Mayotte</option>";
					main_div_string = main_div_string + "			<option value=\"MEX\">Mexico</option>";
					main_div_string = main_div_string + "			<option value=\"FSM\">Micronesia</option>";
					main_div_string = main_div_string + "			<option value=\"MDA\">Moldova</option>";
					main_div_string = main_div_string + "			<option value=\"MCO\">Monaco</option>";
					main_div_string = main_div_string + "			<option value=\"MNG\">Mongolia</option>";
					main_div_string = main_div_string + "			<option value=\"MNE\">Montenegro</option>";
					main_div_string = main_div_string + "			<option value=\"MSR\">Montserrat</option>";
					main_div_string = main_div_string + "			<option value=\"MAR\">Morocco</option>";
					main_div_string = main_div_string + "			<option value=\"MOZ\">Mozambique</option>";
					main_div_string = main_div_string + "			<option value=\"MMR\">Myanmar</option>";
					main_div_string = main_div_string + "			<option value=\"NAM\">Namibia</option>";
					main_div_string = main_div_string + "			<option value=\"NRU\">Nauru</option>";
					main_div_string = main_div_string + "			<option value=\"NPL\">Nepal</option>";
					main_div_string = main_div_string + "			<option value=\"NLD\">Netherlands</option>";
					main_div_string = main_div_string + "			<option value=\"NCL\">New Caledonia</option>";
					main_div_string = main_div_string + "			<option value=\"NZL\">New Zealand</option>";
					main_div_string = main_div_string + "			<option value=\"NIC\">Nicaragua</option>";
					main_div_string = main_div_string + "			<option value=\"NER\">Niger</option>";
					main_div_string = main_div_string + "			<option value=\"NGA\">Nigeria</option>";
					main_div_string = main_div_string + "			<option value=\"NIU\">Niue</option>";
					main_div_string = main_div_string + "			<option value=\"NFK\">Norfolk Island</option>";
					main_div_string = main_div_string + "			<option value=\"MNP\">Northern Mariana Islands</option>";
					main_div_string = main_div_string + "			<option value=\"NOR\">Norway</option>";
					main_div_string = main_div_string + "			<option value=\"OMN\">Oman</option>";
					main_div_string = main_div_string + "			<option value=\"PAK\">Pakistan</option>";
					main_div_string = main_div_string + "			<option value=\"PLW\">Palau</option>";
					main_div_string = main_div_string + "			<option value=\"PSE\">Palestine</option>";
					main_div_string = main_div_string + "			<option value=\"PAN\">Panama</option>";
					main_div_string = main_div_string + "			<option value=\"PNG\">Papua New Guinea</option>";
					main_div_string = main_div_string + "			<option value=\"PRY\">Paraguay</option>";
					main_div_string = main_div_string + "			<option value=\"PER\">Peru</option>";
					main_div_string = main_div_string + "			<option value=\"PHL\">Philippines</option>";
					main_div_string = main_div_string + "			<option value=\"PCN\">Pitcairn</option>";
					main_div_string = main_div_string + "			<option value=\"POL\">Poland</option>";
					main_div_string = main_div_string + "			<option value=\"PRT\">Portugal</option>";
					main_div_string = main_div_string + "			<option value=\"PRI\">Puerto Rico</option>";
					main_div_string = main_div_string + "			<option value=\"QAT\">Qatar</option>";
					main_div_string = main_div_string + "			<option value=\"REU\">Réunion</option>";
					main_div_string = main_div_string + "			<option value=\"ROU\">Romania</option>";
					main_div_string = main_div_string + "			<option value=\"RUS\">Russian Federation</option>";
					main_div_string = main_div_string + "			<option value=\"RWA\">Rwanda</option>";
					main_div_string = main_div_string + "			<option value=\"BLM\">Saint Barthélemy</option>";
					main_div_string = main_div_string + "			<option value=\"KNA\">Saint Kitts and Nevis</option>";
					main_div_string = main_div_string + "			<option value=\"LCA\">Saint Lucia</option>";
					main_div_string = main_div_string + "			<option value=\"MAF\">Saint Martin (French part)</option>";
					main_div_string = main_div_string + "			<option value=\"SPM\">Saint Pierre and Miquelon</option>";
					main_div_string = main_div_string + "			<option value=\"VCT\">Saint Vincent and the Grenadines</option>";
					main_div_string = main_div_string + "			<option value=\"WSM\">Samoa</option>";
					main_div_string = main_div_string + "			<option value=\"SMR\">San Marino</option>";
					main_div_string = main_div_string + "			<option value=\"STP\">Sao Tome and Principe</option>";
					main_div_string = main_div_string + "			<option value=\"SAU\">Saudi Arabia</option>";
					main_div_string = main_div_string + "			<option value=\"SEN\">Senegal</option>";
					main_div_string = main_div_string + "			<option value=\"SRB\">Serbia</option>";
					main_div_string = main_div_string + "			<option value=\"SYC\">Seychelles</option>";
					main_div_string = main_div_string + "			<option value=\"SLE\">Sierra Leone</option>";
					main_div_string = main_div_string + "			<option value=\"SGP\">Singapore</option>";
					main_div_string = main_div_string + "			<option value=\"SXM\">Sint Maarten (Dutch part)</option>";
					main_div_string = main_div_string + "			<option value=\"SVK\">Slovakia</option>";
					main_div_string = main_div_string + "			<option value=\"SVN\">Slovenia</option>";
					main_div_string = main_div_string + "			<option value=\"SLB\">Solomon Islands</option>";
					main_div_string = main_div_string + "			<option value=\"SOM\">Somalia</option>";
					main_div_string = main_div_string + "			<option value=\"ZAF\">South Africa</option>";
					main_div_string = main_div_string + "			<option value=\"SSD\">South Sudan</option>";
					main_div_string = main_div_string + "			<option value=\"ESP\">Spain</option>";
					main_div_string = main_div_string + "			<option value=\"LKA\">Sri Lanka</option>";
					main_div_string = main_div_string + "			<option value=\"SDN\">Sudan</option>";
					main_div_string = main_div_string + "			<option value=\"SUR\">Suriname</option>";
					main_div_string = main_div_string + "			<option value=\"SJM\">Svalbard and Jan Mayen</option>";
					main_div_string = main_div_string + "			<option value=\"SWZ\">Swaziland</option>";
					main_div_string = main_div_string + "			<option value=\"SWE\">Sweden</option>";
					main_div_string = main_div_string + "			<option value=\"CHE\">Switzerland</option>";
					main_div_string = main_div_string + "			<option value=\"SYR\">Syrian Arab Republic</option>";
					main_div_string = main_div_string + "			<option value=\"TWN\">Taiwan</option>";
					main_div_string = main_div_string + "			<option value=\"TJK\">Tajikistan</option>";
					main_div_string = main_div_string + "			<option value=\"TZA\">Tanzania</option>";
					main_div_string = main_div_string + "			<option value=\"THA\">Thailand</option>";
					main_div_string = main_div_string + "			<option value=\"TLS\">Timor-Leste</option>";
					main_div_string = main_div_string + "			<option value=\"TGO\">Togo</option>";
					main_div_string = main_div_string + "			<option value=\"TKL\">Tokelau</option>";
					main_div_string = main_div_string + "			<option value=\"TON\">Tonga</option>";
					main_div_string = main_div_string + "			<option value=\"TTO\">Trinidad and Tobago</option>";
					main_div_string = main_div_string + "			<option value=\"TUN\">Tunisia</option>";
					main_div_string = main_div_string + "			<option value=\"TUR\">Turkey</option>";
					main_div_string = main_div_string + "			<option value=\"TKM\">Turkmenistan</option>";
					main_div_string = main_div_string + "			<option value=\"TCA\">Turks and Caicos Islands</option>";
					main_div_string = main_div_string + "			<option value=\"TUV\">Tuvalu</option>";
					main_div_string = main_div_string + "			<option value=\"UGA\">Uganda</option>";
					main_div_string = main_div_string + "			<option value=\"UKR\">Ukraine</option>";
					main_div_string = main_div_string + "			<option value=\"ARE\">United Arab Emirates</option>";
					main_div_string = main_div_string + "			<option value=\"GBR\">United Kingdom</option>";
					main_div_string = main_div_string + "			<option value=\"USA\">United States</option>";
					main_div_string = main_div_string + "			<option value=\"URY\">Uruguay</option>";
					main_div_string = main_div_string + "			<option value=\"UZB\">Uzbekistan</option>";
					main_div_string = main_div_string + "			<option value=\"VUT\">Vanuatu</option>";
					main_div_string = main_div_string + "			<option value=\"VEN\">Venezuela</option>";
					main_div_string = main_div_string + "			<option value=\"VNM\">Viet Nam</option>";
					main_div_string = main_div_string + "			<option value=\"VGB\">Virgin Islands, British</option>";
					main_div_string = main_div_string + "			<option value=\"VIR\">Virgin Islands, U.S.</option>";
					main_div_string = main_div_string + "			<option value=\"WLF\">Wallis and Futuna</option>";
					main_div_string = main_div_string + "			<option value=\"ESH\">Western Sahara</option>";
					main_div_string = main_div_string + "			<option value=\"YEM\">Yemen</option>";
					main_div_string = main_div_string + "			<option value=\"ZMB\">Zambia</option>";
					main_div_string = main_div_string + "			<option value=\"ZWE\">Zimbabwe</option>";
					main_div_string = main_div_string + "		</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"country_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr id=\"state_tr\" style=\"display:none\"><td style=\"text-align:right;font-weight:bold\">State:</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "			<select id=\"state_selector\">";
					main_div_string = main_div_string + "		<option value=\"\" selected=\"selected\">Select state</option>";
					main_div_string = main_div_string + "	<option value=\"AL\">Alabama</option>";
					main_div_string = main_div_string + "	<option value=\"AK\">Alaska</option>";
					main_div_string = main_div_string + "	<option value=\"AZ\">Arizona</option>";
					main_div_string = main_div_string + "	<option value=\"AR\">Arkansas</option>";
					main_div_string = main_div_string + "	<option value=\"CA\">California</option>";
					main_div_string = main_div_string + "	<option value=\"CO\">Colorado</option>";
					main_div_string = main_div_string + "	<option value=\"CT\">Connecticut</option>";
					main_div_string = main_div_string + "	<option value=\"DE\">Delaware</option>";
					main_div_string = main_div_string + "	<option value=\"DC\">District Of Columbia</option>";
					main_div_string = main_div_string + "	<option value=\"FL\">Florida</option>";
					main_div_string = main_div_string + "	<option value=\"GA\">Georgia</option>";
					main_div_string = main_div_string + "	<option value=\"HI\">Hawaii</option>";
					main_div_string = main_div_string + "	<option value=\"ID\">Idaho</option>";
					main_div_string = main_div_string + "	<option value=\"IL\">Illinois</option>";
					main_div_string = main_div_string + "	<option value=\"IN\">Indiana</option>";
					main_div_string = main_div_string + "	<option value=\"IA\">Iowa</option>";
					main_div_string = main_div_string + "	<option value=\"KS\">Kansas</option>";
					main_div_string = main_div_string + "	<option value=\"KY\">Kentucky</option>";
					main_div_string = main_div_string + "	<option value=\"LA\">Louisiana</option>";
					main_div_string = main_div_string + "	<option value=\"ME\">Maine</option>";
					main_div_string = main_div_string + "	<option value=\"MD\">Maryland</option>";
					main_div_string = main_div_string + "	<option value=\"MA\">Massachusetts</option>";
					main_div_string = main_div_string + "	<option value=\"MI\">Michigan</option>";
					main_div_string = main_div_string + "	<option value=\"MN\">Minnesota</option>";
					main_div_string = main_div_string + "	<option value=\"MS\">Mississippi</option>";
					main_div_string = main_div_string + "	<option value=\"MO\">Missouri</option>";
					main_div_string = main_div_string + "	<option value=\"MT\">Montana</option>";
					main_div_string = main_div_string + "	<option value=\"NE\">Nebraska</option>";
					main_div_string = main_div_string + "	<option value=\"NV\">Nevada</option>";
					main_div_string = main_div_string + "	<option value=\"NH\">New Hampshire</option>";
					main_div_string = main_div_string + "	<option value=\"NJ\">New Jersey</option>";
					main_div_string = main_div_string + "	<option value=\"NM\">New Mexico</option>";
					main_div_string = main_div_string + "	<option value=\"NY\">New York</option>";
					main_div_string = main_div_string + "	<option value=\"NC\">North Carolina</option>";
					main_div_string = main_div_string + "	<option value=\"ND\">North Dakota</option>";
					main_div_string = main_div_string + "	<option value=\"OH\">Ohio</option>";
					main_div_string = main_div_string + "	<option value=\"OK\">Oklahoma</option>";
					main_div_string = main_div_string + "	<option value=\"OR\">Oregon</option>";
					main_div_string = main_div_string + "	<option value=\"PA\">Pennsylvania</option>";
					main_div_string = main_div_string + "	<option value=\"RI\">Rhode Island</option>";
					main_div_string = main_div_string + "	<option value=\"SC\">South Carolina</option>";
					main_div_string = main_div_string + "	<option value=\"SD\">South Dakota</option>";
					main_div_string = main_div_string + "	<option value=\"TN\">Tennessee</option>";
					main_div_string = main_div_string + "	<option value=\"TX\">Texas</option>";
					main_div_string = main_div_string + "	<option value=\"UT\">Utah</option>";
					main_div_string = main_div_string + "	<option value=\"VT\">Vermont</option>";
					main_div_string = main_div_string + "	<option value=\"VA\">Virginia</option>";
					main_div_string = main_div_string + "	<option value=\"WA\">Washington</option>";
					main_div_string = main_div_string + "	<option value=\"WV\">West Virginia</option>";
					main_div_string = main_div_string + "	<option value=\"WI\">Wisconsin</option>";
					main_div_string = main_div_string + "	<option value=\"WY\">Wyoming</option>";
					main_div_string = main_div_string + "	</select>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\" id=\"state_result_td\">";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "						</tr>";
					main_div_string = main_div_string + "						<tr>";
					main_div_string = main_div_string + "							<td style=\"text-align:right;font-weight:bold;vertical-align:top\">";
					main_div_string = main_div_string + "								Change avatar:<br>";
					main_div_string = main_div_string + "								<span id=\"social_wording_span\" style=\"font-size:10px;font-style:italic;font-weight:normal\">To use a Google/FB profile pic, log out and back in.</span>";
					main_div_string = main_div_string + "							</td>";
					main_div_string = main_div_string + "							<td style=\"text-align:left\">";
					main_div_string = main_div_string + "								<div id=\"picture_type_div\">";
					main_div_string = main_div_string + "<table style=\"margin-right:auto;margin-left:auto\">";
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
					main_div_string = main_div_string + "							 Change screenname:<br><span style=\"font-weight:normal\">Letters and numbers only,<br>starting with a letter</span>";
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
					main_div_string = main_div_string + "								<input type=button id=\"screenname_available_button\" value=\"available?\" style=\"width:78px\">";
					main_div_string = main_div_string + "								<input type=button id=\"screenname_submit_button\" value=\"submit\" style=\"width:78px\">";
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
            	
            	$("#country_selector").val(target_user_jo.country);
            	if(typeof target_user_jo.state !== "undefined" || target_user_jo.state !== null)
            		$("#state_selector").val(target_user_jo.state);

            	if(target_user_jo.country === "USA")
            		$("#state_tr").show();
            	
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
				        		$("#screenname_result_td").css("color","red");
								$("#screenname_result_td").text("error");
								setTimeout( function () { 
									$("#screenname_result_td").text("");
								}, 3000);
				        		displayMessage(data.message, "red", "message_div_" + currentURLhash);
				            	if(data.error_code && data.error_code === "0000")
				        		{
				            		//alert("setUserPreference:screenname returned code 0000");
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
            				var logoutmessage = "<div>";
            				logoutmessage = logoutmessage + "<table style=\"margin-right:auto;margin-left:auto;border-spacing:20px\">";
            				logoutmessage = logoutmessage + "	<tr>";
            				logoutmessage = logoutmessage + "		<td style=\"text-align:center;font-size:14px\">";
            				logoutmessage = logoutmessage + "You have chosen to log out of WORDS.";
            				logoutmessage = logoutmessage + "<br>Please confirm.";
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

            	if (bg.user_jo.onfollowcomment === "email")
            		$("#onfollowcomment_selector").val("email");
            	else if (bg.user_jo.onfollowcomment === "do nothing")
            		$("#onfollowcomment_selector").val("do nothing");
            	
            	if (bg.user_jo.emailpromos === "email")
            		$("#emailpromos_selector").val("email");
            	else if (bg.user_jo.emailpromos === "do nothing")
            		$("#emailpromos_selector").val("do nothing");
            	
            	
            	
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
            	
            	
            	$("#onfollowcomment_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "onfollowcomment",
				            value: $("#onfollowcomment_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#onfollowcomment_result_td").text("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.onfollowcomment === "email")
				            		$("#onfollowcomment_selector").val("email");
				            	else if (bg.user_jo.onfollowcomment === "do nothing")
				            		$("#onfollowcomment_selector").val("do nothing");
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
            	
            	$("#emailpromos_selector").change(function () {
					$.ajax({
						type: 'GET',
						url: endpoint,
						data: {
				            method: "setUserPreference",
				            email: email,             
				            this_access_token: this_access_token,  
				            which: "emailpromos",
				            value: $("#emailpromos_selector").val() 
				        },
				        dataType: 'json',
				        async: true,
				        success: function (data, status) {
				        	if (data.response_status === "error")
				        	{
				        		$("#emailpromos_result_td").text("Error: " + data.message);
				        		// on error, reset the selector to the bg.user_jo value
				        		if (bg.user_jo.emailpromos === "email")
				            		$("#emailpromos_selector").val("email");
				            	else if (bg.user_jo.emailpromos === "do nothing")
				            		$("#emailpromos_selector").val("do nothing");
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
				        		$("#emailpromos_result_td").text("updated");
				        	setTimeout(function(){$("#emailpromos_result_td").text("");},3000);
				        }
				        ,
				        error: function (XMLHttpRequest, textStatus, errorThrown) {
				        	$("#emailpromos_result_td").text("ajax error");
				        	setTimeout(function(){$("#emailpromos_result_td").text("");},3000);
				            console.log(textStatus, errorThrown);
				        }
					});
            	});
            	
            	$("#country_selector").change(function () {
            		alert("change " + $("#country_selector").val());
            		if($("#country_selector").val() === "USA")
            			$("#state_tr").show();
            		else
            			$("#state_tr").hide();
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

