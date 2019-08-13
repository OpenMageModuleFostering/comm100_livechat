/*
 * Comm100 Plugin JavaScript Package 2.0 
 * Modify Date: 2014-06-18
 * http://www.comm100.com
*/
//register source
var register_source = 'plugin.magento';
var appId = 'MQ==';

//register button id
var register_submit = 'register_submit';
//login button id
var login_submit = 'login_submit';
//save account button id
var save_account = 'save_account';
//post form id 
var post_form_id = 'comm100_form_link';
//unlink button id
var btn_unlink = 'btn_unlink';
//expire tip message div id
var comm100livechat_expire = 'comm100livechat_expire';
//install successful message div id
var comm100livechat_guide = 'comm100livechat_guide';
//select code plan and site div id
var comm100livechat_site_and_plan = 'comm100livechat_site_and_plan';
//login div id 
var comm100livechat_login = 'comm100livechat_login';
//register div id
var comm100livechat_register = 'comm100livechat_register';

//service URL
var Comm100RouteServiceDomain = "route.comm100.com"; 
var Comm100RouteServiceDomain1 = "route1.comm100.com";
var requestIndex = 0;

String.prototype.trim = function()
{
    return this.replace(/(^[\s]*)|([\s]*$)/g, "");
}

if (typeof comm100_script_id == 'undefined')
	comm100_script_id = 0;

function html_encode(html) {
	var div=document.createElement("div");
	var txt=document.createTextNode(html);
	div.appendChild(txt);
	return div.innerHTML;
}
//STYPE 1: route domain 2: subdomain
/*
function comm100_script_request(STYPE,requestIndex,params,_success,_error)
{
	var _domain = Comm100RouteServiceDomain;
	if(STYPE==1)
	{
		_domain = _domain + "/routeserver/pluginhandler.ashx";
	}
	if(STYPE==2)
	{
		var scr = document.createElement('script');
		scr.src = 'https://'+jQuery("txt_cpanel_domain").val() + '/AdminPluginService/livechatplugin.ashx?action=session';
		scr.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(scr);
		alert(jQuery("txt_cpanel_domain").val());
		_domain = jQuery("txt_cpanel_domain").val() + '/AdminPluginService/(S(' + comm100livechat_session + '))/livechatplugin.ashx';
	}
	var serviceUrl = "https://"+_domain+params;
	jQuery.ajax({
		type : "get",
		async:false,
		url : serviceUrl,
		dataType : "jsonp",
		jsonp: "callback",
		jsonpCallback:"handleResponse",
		success : function(json){
			_success(json);
		},
		error : function(){
			if(STYPE==1 && requestIndex == 0 )
			{
				comm100_script_request(STYPE,1,params,_success,_error);
			}
		}
	});
}
*/

function comm100_script_request(STYPE,requestIndex,params, success, error) {
//STYPE 1 : sites
//STYPE 2 : other request
//STYPE 3 : register
	var timeoutsecond = 10;
	if(STYPE==3)timeoutsecond = 30;
	var cpanel_domain = jQuery("#txt_cpanel_domain").val();
	function request() {
		var _id = 'comm100_script_' + comm100_script_id++;
		var _success;
		var _timer_timeout;

		function _append_script(id, src) {
			var scr = document.createElement('script');
			scr.src = src;
			scr.id = '_' + _id;
			scr.type = 'text/javascript';
			document.getElementsByTagName('head')[0].appendChild(scr);
		}
		this.send = function _send (url, success, error) {
			_append_script(_id, url + '&callback=' + _id + '.onresponse');
			_timer_timeout = setTimeout(function() {
				if (error) error('Operation timeout.');
			}, timeoutsecond * 1000);

			_success = success || function() {};		
		}
		this.onresponse = function _onresponse(response) {
			window[_id] = null;
			var scr = document.getElementById('_' + _id);
			document.getElementsByTagName('head')[0].removeChild(scr);

			clearTimeout(_timer_timeout);

			_success(response);
		}
		window[_id] = this;
	}

	var req = new request();

	var _domain = Comm100RouteServiceDomain;
	if(STYPE==1)
	{
		if(requestIndex==1)
		{
			_domain = Comm100RouteServiceDomain1;
		}
		_domain = _domain + "/routeserver/pluginhandler.ashx";
	}
	if(STYPE==2)
	{
		_domain = cpanel_domain + '/AdminPluginService/livechatplugin.ashx';
	}
	if(STYPE ==3)
	{
		_domain = Comm100RouteServiceDomain + "/routeserver/pluginhandler.ashx";
	}
	var serviceUrl = "https://"+_domain+params;
	
	if(typeof comm100livechat_session == null) {
        setTimeout(function() {
			req.send(serviceUrl, success, error);
        }, 1000);
	} else {
		req.send(serviceUrl, success, error);
	}
}

var comm100_plugin = (function() {
    function _onexception(msg) {
        alert(msg);
    }

    function checkemail(str){
    	var Expression=/\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/; 
    	var objExp=new RegExp(Expression);
    	if(objExp.test(str)==true){
    		return true;
    	}else{
    		return false;
    	}
    }
    
    function IsMail(mail)
    { 
    var patrn = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!patrn.test(mail))
      return false;
    else
      return true;
    }
    
    function _get_timezone() {
        return ((new Date()).getTimezoneOffset() / -60.0).toString();
    }
    function _register() {
    	hideErrorMessage();
    	showLoadingBar(register_submit);
        var edition = 74;
        var source = register_source;
        var name = document.getElementById('register_name').value;
        var email = document.getElementById('register_email').value;
        var password = document.getElementById('register_password').value;
        var password_retype = document.getElementById('register_password_retype').value;
        var phone = document.getElementById('register_phone').value;
        var website = document.getElementById('register_website').value;
        var ip = document.getElementById('register_ip').value;
        var timezone = _get_timezone();
        //var verification_code = document.getElementById('register_verification_code').value;
        var referrer = window.location.href;
        
        if(email=='')
        {
        	showErrorMessage('Email required');
        	document.getElementById('register_email').focus();
        	return false;
        }

        if(!IsMail(email))
        {
        	showErrorMessage('Incorrect email');
        	document.getElementById('register_email').focus();
        	return false;
        }
        
        if(password=='')
        {
        	showErrorMessage('Password required');
        	document.getElementById('register_password').focus();
        	return false;
        }
        
        if(password!=password_retype)
        {
        	showErrorMessage('The two passwords do not match');
        	document.getElementById('register_password_retype').focus();
        	return false;
        }
        
        document.getElementById(register_submit).disabled = true;
        
        name = encodeURIComponent(name);
        email = encodeURIComponent(email);
        password = encodeURIComponent(password);
        phone = encodeURIComponent(phone);
        website = encodeURIComponent(website);
        ip = encodeURIComponent(ip);
        timezone = encodeURIComponent(timezone);
        //verification_code = encodeURIComponent(verification_code);
		var verification_code = '';
        referrer = encodeURIComponent(referrer);
        
        comm100_script_request(3,0,'?action=register&float_button=true&edition=' + edition + '&name=' + name + '&email=' + email +
			'&password=' + password + '&phone=' + phone + '&website=' + website + '&ip=' + ip + '&timezone=' + timezone + '&verificationCode=' + verification_code + '&referrer=' + referrer
			+ '&source=' + source
			, function(response) {
        		document.getElementById(register_submit).disabled = false;
			    if(response.success) {
			    	jQuery("#login_email").val(jQuery("#register_email").val());
			    	jQuery("#login_password").val(jQuery("#register_password").val());
			    	_sitesNoStep(jQuery("#register_email").val(),jQuery("#register_password").val());
			    }
			    else {
			        showErrorMessage(response.error);
			     }

			}, function(error) {
				document.getElementById(register_submit).disabled = false;
				showErrorMessage('Operation timeout.');
			});
    }
    
    function _get_plan_type(plan) {
    	if (plan.button_type == 2) {
    		return 0;  //monitor
    	} else if (plan.button_type == 0 && plan.button_float) /*float*/ {
    		return 1; //float image
    	} else {
    		return 2; //others,  need widget
    	}
    }
    
    function _login(success, error) {
		var email = encodeURIComponent(document.getElementById('txt_email').value);
        var password = encodeURIComponent(document.getElementById('txt_password').value);
        var timezone = encodeURIComponent(_get_timezone());
        var site_id = encodeURIComponent(document.getElementById('txt_site_id').value);
        var site_id = encodeURIComponent(document.getElementById('txt_site_id').value.trim());
        comm100_script_request(2,0,'?action=login&siteId=' + site_id + '&email=' + email + '&password=' + password
			, function(response) {
				if(response.success)
				{
					jQuery("#"+save_account).show();
					_get_plans(site_id, function(response) {
					jQuery("#preViewImgBox").show();

					var plans = response;
					if (plans.length == 1 && jQuery("#comm100_sites_select option").length==1 ) {
						//set plan and go to next step
						jQuery("#txt_plan_id").val(plans[0].id);
						jQuery("#txt_plan_type").val(_get_plan_type(plans[0]));
						jQuery("#comm100_loading").hide();
						var src = jQuery("#comm100_loading img:first").attr("src");
						jQuery("#"+comm100livechat_site_and_plan).html("Linking up...<img src='" + src + "' />");
						onComm100Save();
					} else { 
						_show_plans(plans);
					}
					}); 
					
				}
				else
				{
					jQuery("#"+save_account).hide();
					jQuery("#preViewImgBox").hide();
					var selPlansObj = jQuery("#comm100_codeplans_select");
					selPlansObj.empty();
					
					showErrorMessage(response.error);
				}
			
			}, function(message) {
				error(message);
			});
    }

    function _get_plans(site_id, success, error) {
        comm100_script_request(2,0,'?action=plans&siteId=' + site_id, function(response) {
            if(response.error) {
                if (typeof error != 'undefined')
                    error('Comm100 Live Chat is not added to your site yet as you haven\'t linked up any Comm100 account.<br/><a href="admin.php?page=comm100livechat_settings">Link Up your account now</a> and start chatting with your visitors.');
            } else {
                success(response.response);
            }
        });
    }

    function _show_plans(plans) {
    	//set step
    	setStepShow(3);

    	var selPlansObj = jQuery("#comm100_codeplans_select");
    	selPlansObj.empty();
    	
		for (var i= 0, len=plans.length; i<len; i++) {
    		var p = plans[i];			
    		selPlansObj.append("<option value='"+p.id+"' data-plantype='"+_get_plan_type(p)+"' data-button-image-type='"+p.button_image_type+"' data-button-offline-id='"+p.button_offline_id+"' data-button-offline-url='"+p.button_offline_url+"' data-button-online-id='"+p.button_online_id+"' data-button-online-url='"+p.button_online_url+"' data-button-type='"+p.button_type+"' data-button-text-content='"+p.button_text_content+"' >"+p.name+"</option>");  
    	}
		
		//init variables
		var planid = "0";
		var plantype = "0";
		var img_type = "0";
		var img_offline_id = "0";
		var img_online_id = "0";
		var img_offline_url = "";
		var img_online_url = "";
		
		selPlansObj.change(function(){
			var plan = jQuery(this).children('option:selected');
    		var planid = plan.val();
    		var siteid = jQuery("#txt_site_id").val();
    		var plantype = plan.attr("data-plantype");
    		var img_type = plan.attr("data-button-image-type");
    		var img_offline_id = plan.attr("data-button-offline-id");
    		var img_online_id = plan.attr("data-button-online-id");
    		var img_offline_url = plan.attr("data-button-offline-url");
    		var img_online_url = plan.attr("data-button-online-url");
    		var button_type = plan.attr("data-button-type");
    		var button_text_content = plan.attr("data-button-text-content");
    		_on_codeplan_selected(planid,plantype,img_type,img_offline_id,img_online_id,img_offline_url,img_online_url,button_type,button_text_content);
    		
    	});
		
		//set default
		var plan = plans[0];	
		var planid = plan.id;
		var plantype = _get_plan_type(plan);
		var img_type = plan.button_image_type;
		var img_offline_id = plan.button_offline_id;
		var img_online_id = plan.button_online_id;
		var img_offline_url = plan.button_offline_url;
		var img_online_url = plan.button_online_url;
		var button_type = plan.button_type;
		var button_text_content = plan.button_text_content;
		_on_codeplan_selected(planid,plantype,img_type,img_offline_id,img_online_id,img_offline_url,img_online_url,button_type,button_text_content);
		
		hideLoadingBar();
    }
    
    function _on_codeplan_selected(planid,plantype,img_type,img_offline_id,img_online_id,img_offline_url,img_online_url,button_type,button_text_content)
    {
    	jQuery("#txt_plan_id").val(planid);
		jQuery("#txt_plan_type").val(plantype);
		
		if(button_type==0)
		{
			if(img_online_id == 0 && img_online_url=="")
	    	{
				jQuery("#preViewImgBox").hide();
	    		return;
	    	}
			
			var siteid = jQuery("#txt_site_id").val();
			var main_chatserver_domain = jQuery("#txt_main_chatserver_domain").val();
			var img_online = "https://"+main_chatserver_domain+"/DBResource/DBImage.ashx?imgId="+img_online_id+"&type="+img_type+"&siteId="+siteid;
			var img_offline = "https://"+main_chatserver_domain+"/DBResource/DBImage.ashx?imgId="+img_offline_id+"&type="+img_type+"&siteId="+siteid;
			if(img_type==0)
			{
				img_online = img_online_url;
				img_offline = img_offline_url;
			}
			
			//show preview images
			jQuery("#preViewImgOnline").show();
			jQuery("#preViewImgOffline").show();
			jQuery("#preViewTextButton").hide();
			
			jQuery("#imgOnline").attr("src",img_online);
			jQuery("#imgOnline").show();
			jQuery("#imgOffline").attr("src",img_offline);
			jQuery("#imgOffline").show();
			
			jQuery("#preViewTextButton").hide();
			
			jQuery("#preViewImgBox").show();
		}
		else if(button_type==1) //text button
		{
			jQuery("#preViewImgOnline").hide();
			jQuery("#preViewImgOffline").hide();
			
			jQuery("#preViewTextButton").show();
			jQuery("#lblOnlineText").html(button_text_content);
			jQuery("#preViewImgBox").show();
		}
		else
		{
			jQuery("#preViewImgBox").hide();
		}
    }
    
    function _get_code(site_id, plan_id, callback) {
        comm100_script_request(2,0,'?action=code&siteId=' + site_id + '&planId=' + plan_id, function(response) {
            callback(response.response);
        });
    }
    function _get_editions(callback) {
        comm100_script_request(2,0,'?action=editions', function(response) {
            callback(response.response);
        });
    }

    function _show_sites(sites) {
    	//set step
    	setStepShow(3);
    	if(sites.length<1)
    	{
    		showErrorMessage("you have not create a site.");
    		return;
    	}
    	
    	if(sites.length<=1)
    	{
    		jQuery("#trSiteSelect").hide();
    	}
    	else
    	{
    		jQuery("#trSiteSelect").show();
    	}
    	
    	var selSitesObj = jQuery("#comm100_sites_select");
    	selSitesObj.empty();
    	var defaultSelectSiteId = 0;
    	for (var i= 0, len=sites.length; i<len; i++) {
    		var s = sites[i];
    		if(s.inactive)
    		{
    			continue;
    		}
    		if(defaultSelectSiteId==0)
    		{
    			defaultSelectSiteId = s.id;
    		}
			var  optionVal = s.id;
    		selSitesObj.append("<option value='"+optionVal+"'>"+s.id+"</option>");  
    	}
    	
    	selSitesObj.change(function(){
    		showLoadingBar(save_account);
    		var optionVal = jQuery(this).children('option:selected').val();
			var siteid = optionVal;
    		jQuery("#txt_site_id").val(siteid);
			/*
    		_get_plans(siteid, function(response) {
	    		var plans = response;
	    		if (plans.length == 1 && jQuery("#comm100_sites_select option").length==1 ) {
			        //set plan and go to next step
	    			jQuery("#txt_plan_id").val(plans[0].id);
	    			jQuery("#txt_plan_type").val(_get_plan_type(plans[0]));
	    			jQuery("#comm100_loading").hide();
	    			var src = jQuery("#comm100_loading img:first").attr("src");
	    			jQuery("#"+comm100livechat_site_and_plan).html("Linking up...<img src='" + src + "' />");
	    			onComm100Save();
		    	} else { 
		    		_show_plans(plans);
		    	}
	    	}); */
			_login(function () {
				//hideLoadingBar();
			}, function (error) {
				//showErrorMessage(error);        	
			});
    	});
    	
    	showLoadingBar(save_account);
    	jQuery("#txt_site_id").val(defaultSelectSiteId);
		
		/*
    	_get_plans(defaultSelectSiteId, function(response) {
    		var plans = response;
    		if (plans.length == 1 && jQuery("#comm100_sites_select option").length==1 ) {
		        //set plan and go to next step
    			jQuery("#txt_plan_id").val(plans[0].id);
    			jQuery("#txt_plan_type").val(_get_plan_type(plans[0]));
    			jQuery("#comm100_loading").hide();
    			var src = jQuery("#comm100_loading img:first").attr("src");
    			jQuery("#"+comm100livechat_site_and_plan).html("Linking up...<img src='" + src + "' />");
    			onComm100Save();
	    	} else { 
	    		_show_plans(plans);
	    	}
    	});
        */
		_login(function () {
			//hideLoadingBar();
        }, function (error) {
		    //showErrorMessage(error);        	
        });
		
    	//document.getElementById('num_sites').innerHTML = sites.length;
    }
    
    function _sitesNoStep(email,password)
    {
		document.getElementById('txt_email').value = email;
    	document.getElementById('txt_password').value = password;
		
    	comm100_script_request(1,0,'?action=sites&email='+email+'&password='+password+'&timezoneoffset='+(new Date()).getTimezoneOffset(), 
    	function (response) {
    		document.getElementById(login_submit).disabled = false;
    		if (response.success) {
			
				document.getElementById('txt_cpanel_domain').value = response.cpanel_domain;
				jQuery("#txt_main_chatserver_domain").val(response.main_chatserver_domain);
				jQuery("#txt_standby_chatserver_domain").val(response.standby_chatserver_domain);
				
    			var sites = response.response;
    			if (sites.length == 0) {
    				showErrorMessage('There is no site associate this account');
    				return;
    			}

    			document.getElementById('txt_site_id').value = sites[0].id;
    			_show_sites(response.response);
    		} else {
    			showErrorMessage(response.error);
			}
    	});
    }

    function _sites () {
    	//set step
    	setStepShow(1);
    	showLoadingBar(login_submit);
        document.getElementById(login_submit).disabled = true;

    	var email = encodeURIComponent(document.getElementById('login_email').value);
        var password = encodeURIComponent(document.getElementById('login_password').value);
        var email1 = document.getElementById('login_email').value;
    	comm100_script_request(1,0,'?action=sites&email='+email+'&password='+password+'&timezoneoffset='+(new Date()).getTimezoneOffset(), 
    	function(response){
			document.getElementById('login_submit').disabled = false;
    		if (response.success) {
    			var sites = response.response;
    			if (sites.length == 0) {
    				showErrorMessage('There is no site associate this account');
    				return;
    			}
    			document.getElementById('txt_email').value = email1;
    			document.getElementById('txt_site_id').value = sites[0].id;
    			document.getElementById('txt_password').value = password;
    			document.getElementById('txt_cpanel_domain').value = response.cpanel_domain;
				jQuery("#txt_main_chatserver_domain").val(response.main_chatserver_domain);
				jQuery("#txt_standby_chatserver_domain").val(response.standby_chatserver_domain);
				
    			_show_sites(response.response);
    			
    		} else {
    			showErrorMessage(response.error);
			    
			    document.getElementById('login_submit').disabled = false;
			}
		},
		function(){
			comm100_script_request(1,1,'?action=sites&email='+email+'&password='+password+'&timezoneoffset='+(new Date()).getTimezoneOffset(), function(response){
			document.getElementById('login_submit').disabled = false;
    		if (response.success) {
    			var sites = response.response;
    			if (sites.length == 0) {
    				showErrorMessage('There is no site associate this account');
    				return;
    			}
    			document.getElementById('txt_email').value = email1;
    			document.getElementById('txt_site_id').value = sites[0].id;
    			document.getElementById('txt_password').value = password;
    			document.getElementById('txt_cpanel_domain').value = response.cpanel_domain;
				jQuery("#txt_main_chatserver_domain").val(response.main_chatserver_domain);
				jQuery("#txt_standby_chatserver_domain").val(response.standby_chatserver_domain);
    			_show_sites(response.response);
    			
    		} else {
    			showErrorMessage(response.error);
			    
			    document.getElementById('login_submit').disabled = false;
			}
			},function(error){showErrorMessage(error);});
		});
    }
    
    function _issiteexpire () {
        var siteid = jQuery("#txt_site_id").val();
		var cpanel_domain = jQuery("#txt_cpanel_domain").val();
        var _data = '?action=issiteexpire&siteid='+siteid+'&timezoneoffset='+(new Date()).getTimezoneOffset();
        var service = 'https://' + cpanel_domain + '/AdminPluginService/livechatplugin.ashx' + _data;
        
        comm100_script_request(2,0,_data, 
            	function (response) {
        	if (response.success) {
    			var result = response.response;
    			if (result == 0) {
    				jQuery("#"+comm100livechat_expire).hide();
    				return;
    			}
    			else
    			{
    				jQuery("#"+comm100livechat_expire).show();
    				return;
    			}
    			
    		} else {
    			//showErrorMessage(res.error);
			}
            	});
    }
    
    return {
        register: _register,
        login: _login,
        get_plans: _get_plans,
        get_code: _get_code,
        get_editions: _get_editions,
        sites: _sites,
        issiteexpire: _issiteexpire
    };
})();

function hide_element(id) {
	document.getElementById(id).style.display = 'none';
}
function show_element(id, display) {
	document.getElementById(id).style.display = display || '';
}
function is_empty(str) {
	return (!str || /^\s*jQuery/.test(str));
}
function is_email(str) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))jQuery/;
	return re.test(str);
}
function is_input_empty(input_id) {
	return is_empty(document.getElementById(input_id).value);
}
function is_input_email(input_id) {
	return is_email(document.getElementById(input_id).value);
}
function setStepShow(step)
{
	//set step
	jQuery("#txtCurrentStep").val(step);
	//clear error message
	hideErrorMessage();
	
	/*
	 * 1 : login
	 * 2 : register
	 * 3 : choose site and code plan
	 * 4 : success guide
	 *  */
	jQuery("#"+comm100livechat_guide).hide();
	jQuery("#"+comm100livechat_login).hide();
	jQuery("#"+comm100livechat_site_and_plan).hide();
	jQuery("#"+comm100livechat_register).hide();
	
	if(step == 1)
	{
		jQuery("#"+comm100livechat_login).show();
	}
	else if(step == 2)
	{
		jQuery("#"+comm100livechat_register).show();
	}
	else if(step == 3)
	{
		jQuery("#"+comm100livechat_site_and_plan).show();
	}
	else if(step == 4)
	{
		
		
		setStaticButtonJSCode();
		jQuery("#"+comm100livechat_guide).show();
	}
}
function hideErrorMessage()
{
	jQuery("#comm100_error").hide();
	jQuery("#comm100_error_text").html("");
}

function showErrorMessage(error_msg)
{
	//clear load div
	jQuery("#comm100_loading").hide();
	jQuery("#comm100_error").show();
	jQuery("#comm100_error_text").html(error_msg);
}

function hideLoadingBar()
{
	jQuery("#comm100_loading").hide();
}

function showLoadingBar(elmentId)
{
	jQuery("#"+elmentId).attr("disable",true);
	var offset = jQuery("#"+elmentId).offset();
	var x = jQuery('#'+elmentId).offset().top;
	var y = jQuery('#'+elmentId).offset().left;
	jQuery("#comm100_loading").show();
	jQuery("#comm100_loading").attr("style","z-index:100;margin-top:"+x+";margin-left:"+y+";");
}

function onComm100Save()
{
	//get code
	var site_id = jQuery("#txt_site_id").val();
	var plan_id = jQuery("#txt_plan_id").val();
	if(site_id=="" || site_id <1)
	{
		showErrorMessage("please select a site!");
		return;
	}
	if(plan_id=="" || plan_id <1)
	{
		showErrorMessage("please select a code plan!");
		return;
	}
	
	//upload link action
	uploadActionLog(1);
}

function submitComm100Form_Link()
{
	jQuery("#"+post_form_id).submit();
}

function submitComm100Form_UnLink()
{
	showLoadingBar(btn_unlink);
	//upload unlink action
	uploadActionLog(4);	
}

function submitUnlinkForm()
{
	jQuery("#comm100_form_unlink").submit();
}

function postDataToMagento(_email,_password,_site_id,_plan_id,_code)
{
	var postURL = jQuery("#postURL").val();
	var _form_key = jQuery("#form_key").val();
	postURL = postURL + "key/" + _form_key;
	_email = encodeURIComponent(_email);
	_password = encodeURIComponent(_password);
	_site_id = encodeURIComponent(_site_id);
	_plan_id = encodeURIComponent(_plan_id);
	_code = encodeURIComponent(_code);
	jQuery.post(postURL,
	{
		email:email,
		email:_email,
		password:_password,
		site_id:_site_id,
		plan_id:_plan_id,
		code:_code
	},
	function(data,status){
		//go to step 4
		setStepShow(4);
	});
}

function resetLinkData()
{
	jQuery("#txt_email").val('');
	jQuery("#txt_password").val('');
	jQuery("#txt_plan_id").val('0');
	jQuery("#txt_plan_type").val('0');
	jQuery("#txt_site_id").val('0');
}

function setStaticButtonJSCode()
{
	var plantype = jQuery("#txt_plan_type").val();
	if(plantype==2)
	{
		var siteid = jQuery("#txt_site_id").val();
		var planid = jQuery("#txt_plan_id").val();
		var code = jQuery("#chat_button_code").val();
		var main_chatserver_domain = jQuery("#txt_main_chatserver_domain").val();
		var standby_chatserver_domain = jQuery("#txt_standby_chatserver_domain").val();
		re_siteid = new RegExp("{siteid}", "g");
		re_planid = new RegExp("{codeplanid}", "g");
		re_main_chatserver_domain = new RegExp("{main_chatserver_domain}", "g");
		re_standby_chatserver_domain = new RegExp("{standby_chatserver_domain}", "g");
		code = code.replace(re_siteid,siteid);
		code = code.replace(re_planid,planid);
		code = code.replace(re_main_chatserver_domain,main_chatserver_domain);
		code = code.replace(re_standby_chatserver_domain,standby_chatserver_domain);
		jQuery("#chat_button_code").val(code);
		jQuery("#pInstalledOkTipMsg").hide();
	}	
}

function uploadActionLog(actionType)
{
	/*
	1 : Link
	2 : Install
	3 : Uninstall
	4 : Unlink
	*/
	
	var siteId = jQuery("#txt_site_id").val();
	var planId = jQuery("#txt_plan_id").val();
	var domain =  encodeURIComponent(window.location.host);
	var linkedEmail = encodeURIComponent(jQuery("#txt_email").val());
	var pluginVersionNo = encodeURIComponent(jQuery("#txt_plugin_version").val());
	var checkPluginURL = encodeURIComponent(jQuery("#txt_plugin_check_url").val());
	var _data = "?action=uploadactionlog&siteId="+siteId+"&actionType="+actionType+"&planId="+planId+"&appId="+appId+"&domain="+domain+"&linkedEmail="+linkedEmail+"&pluginVersionNo="+pluginVersionNo+"&checkPluginURL="+checkPluginURL+"&timezoneoffset="+(new Date()).getMilliseconds();;
	comm100_script_request(2,0,_data, function(response) {
			    goAfterLog(actionType);
			}, function(message) {
				goAfterLog(actionType);
	});
	
}

function goAfterLog(actionType)
{
	if(actionType==1)
	{
		submitComm100Form_Link();
	}
	else if(actionType==4)
	{
		resetLinkData();
		submitUnlinkForm();
	}
}

jQuery(document).ready(function(){
	 //get domain
	 jQuery("#register_website").val(document.domain); 
})

jQuery(document).keyup(function(event){
	if(jQuery("#txt_site_id").val()>0)
	{
	    jQuery("#txtCurrentStep").val("4");
	}
	if(event.keyCode ==13){
	var step = jQuery("#txtCurrentStep").val();
	if(step=="1")//login
	{
	     jQuery("#login_submit").trigger("click");
	}
	else if(step=="2") //reg
	{
	     jQuery("#register_submit").trigger("click");
	}
	else if(step=="3") //site and code plan
	{
	     jQuery("#save_account").trigger("click");
	}
	return false;
	}
})
