/**
	JavaScript Framework Model

	@version 0.1.1
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core'], function(fw){
	var fixtures = {};
	var fixtures_enable = false;
	
	var ajax = function(ajax_param) {
		if (!fixtures_enable) {
			jQuery.ajax(ajax_param);
			return;
		}

		var url = ajax_param.url;

		if (fixtures[url]) {
			if (typeof fixtures[url][ajax_param.type] == 'function') {
				fixtures[url][ajax_param.type].call(this, ajax_param, function(ret){
					if (typeof ajax_param.success == 'function' && ret !== false)
						ajax_param.success.call(this, ret);
					if (typeof ajax_param.error == 'function' && ret === false)
						ajax_param.error.call(this);
				});
				return;
			} else {
				jQuery.ajax(ajax_param);
				return;
			}
		} else {
			for (var i in fixtures) {
				var parse_str = null;
				if (fixtures[i].reg && (parse_str = fixtures[i].reg.exec(ajax_param.url)) != null ) {
					fixtures[i].reg.lastIndex = 0;
					var data = {};
					for (var j = 1; j < parse_str.length; j++) {
						data[fixtures[i].fields[j-1]] = parse_str[j];
					}
					var ret = fixtures[i][ajax_param.type].call(this, ajax_param, data);
					fixtures[i][ajax_param.type].call(this, ajax_param, function(ret){
						if (typeof ajax_param.success == 'function' && ret !== false)
							ajax_param.success.call(this, ret);
						if (typeof ajax_param.error == 'function' && ret === false)
							ajax_param.error.call(this);
					}, data);
					return;
				}
			}
		}

		jQuery.ajax(ajax_param);
	};

	var AjaxRequest = function(type, url, data_cb) {
		if (!/^https?\:/.test(url)){
			var burl = (fw.Model.baseUrl) ? fw.Model.baseUrl : null;
			if (burl){
				url = burl + url;
			}
		}

		var url_tpl = fw.utils.createStringTemplate(url);

		return function(data, suc) {
			data = data  || this.attr();

			var csrf_token = fw.utils.getCookie('csrf_token');
			if(csrf_token) data.csrf_token = csrf_token;
			
			var ajax_param = {
				type: type.toUpperCase(),
				url: fw.utils.makeStringTemplate(url_tpl, data),
				dataType: 'json',
				cache: false,
				data: data
			};
			if (typeof suc == 'function') {
				ajax_param.success = function(res_data){
					if (typeof data_cb == 'function') {
						var ret = data_cb.call(this, res_data);
						suc.call(this, null, ret);
					} else {
						suc.call(this, null, res_data);
					}
				};

				ajax_param.error = function(jqXHR){
					if (typeof data_cb == 'function') {
						suc.call(this, jqXHR, null);
					} else {
						suc.call(this, jqXHR, null);
					}
				};
			}
			
			ajax(ajax_param);
		}
	};

	var buildStatFind = function(stat, param, f_name, fun) {
		var p = param.match('^(GET|POST|PUT|DELETE)[\\s]+(.*)$');
		if (p.length > 2) {
			stat[f_name] = AjaxRequest(p[1], p[2], function(res_json){
				return fun.call(this, res_json);
			});
		}
	};

	fw.Model = function(param) {
		param = param || {};

		var model_proto = {
			save: function(cb, err) {
				if (typeof this.__theNew != 'undefined') {
					this.create(cb, err);
					delete this.__theNew;
				} else {
					this.update(cb, err);
				}
			}
		}

		var model_stat = {};

		if (typeof param.find != 'undefined') {
			buildStatFind(model_stat, param.find, 'find', function(res_json){
				return res_json;
			});
		}

		if (typeof param.findAll != 'undefined') {
			buildStatFind(model_stat, param.findAll, 'findAll', function(res_json){
				var ret = null;
				if (typeof res_json.data != 'undefined') {
					ret = res_json.data;
				}
				return ret;
			});
		}

		if (typeof param.findOne != 'undefined') {
			buildStatFind(model_stat, param.findOne, 'findOne', function(res_json){
				var ret = null;
				if (res_json) {
					ret = res_json;
				}
				return ret;
			});
		}

		for (var i in param) {
			var p = param[i].match('^(GET|POST|PUT|DELETE)[\\s]+(.*)$');
			if (p.length > 2) {
				switch (i.toLowerCase()) {
					case 'create':
						var createFun = AjaxRequest.call(param, p[1], p[2]);
						model_proto.create = function(cb, err) {
							createFun.call(this, null, cb, err);
						};
						break;
					case 'update':
						var updateFun = AjaxRequest.call(param, p[1], p[2]);
						model_proto.update = function(cb, err) {
							updateFun.call(this, null, cb, err);
						};
						break;
					case 'destroy':
						var destroyFun = AjaxRequest.call(param, p[1], p[2]);
						model_proto.destroy = function(cb, err) {
							destroyFun.call(this, null, cb, err);
						};
						break;
				}
			}
		}

		return fw.Map.extend(model_proto, model_stat, {
			'init': function(data_object, the_new) {
				if (typeof the_new == 'undefined') the_new = true;
				else the_new = Boolean(the_new);
				if (typeof param.init == 'function') {
					param.init.call(this);
					delete param.init;
				}

				this.__theNew = the_new;
			}
		});
	};

	fw.Model.fixture = function(req, handler) {
		var re = new RegExp('\{\:(.*?)\}', 'g');
		var addFixture = function(req, handler) {
			var p = req.match('^(GET|POST|PUT|DELETE)[\\s]+(.*)$');
			if (p.length == 3) {
				fixtures_enable = true;

				var burl = (fw.Model.baseUrl) ? fw.Model.baseUrl : '';
				var url = burl + p[2];
				var method = p[1];

				fixtures[url] = {};
				fixtures[url][method] = handler;
				
				if (url.match(re)) {
					var data = [];
					var res = null;
					while ((res = re.exec(url)) != null) {
						data.push(res[1]);
					}
					fixtures[url].fields = data;
					var reg_str = url.replace(/\{\:.*?\}/g, '(.+?)');
					fixtures[url].reg = new RegExp(reg_str, 'g');
				}
			}
		};

		if (typeof req == 'string') {
			addFixture(req, handler);
		}

		if (typeof req == 'object') {
			for(var i in req) {
				if (req.hasOwnProperty(i)) {
					addFixture(i, req[i]);
				}
			}
		}
	};

	fw.Model.getFormData = function(form) {
		var ret = {};
		jQuery(form).serializeArray().forEach(function(obj){
			ret[obj.name] = obj.value;
		});
		return ret;
	};

	return fw;
});