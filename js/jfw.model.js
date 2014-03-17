/**
	JavaScript Framework Model

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core', 'jquery'], function(fw, jQuery){
	fw.utils.buildString = function(str, data) {
		var ret = str;
		var re = new RegExp('\{\:(.*?)\}', 'g');
		var res = null;
		while ((res = re.exec(str)) != null) {
			if (typeof data[res[1]] != 'undefined') {
				ret = ret.replace(res[0], data[res[1]]);
				delete data[res[1]];
			} else {
				ret = ret.replace(res[0], '');
			}
		}
		return ret;
	};

	fw.utils.getFormData = function(form) {
		var ret = {};
		jQuery(form).serializeArray().forEach(function(obj){
			ret[obj.name] = obj.value;
		});
		return ret;
	};

	fw.utils.parse_uri = function(href) {
		var match = href.match(/^(https?\:)?(?:\/\/)?(([^:\/?#]*)(?:\:([0-9]+))?)((?:\/)?[^?#]*)(\?[^#]*|)(#.*|)$/);
		return match && {
			protocol: match[1],
			host: match[2],
			hostname: match[3],
			port: match[4],
			pathname: match[5],
			search: match[6],
			hash: match[7]
		}
	};

	var fixtures = {};
	
	fw.utils.ajax = function(ajax_param) {
		var uri = fw.utils.parse_uri(ajax_param.url);
		if (uri.pathname == '' && uri.hostname != '' && uri.protocol == '') {
			uri.pathname = uri.hostname;
		}
		uri.pathname += uri.search;

		if (fixtures[uri.pathname]) {
			if (typeof fixtures[uri.pathname][ajax_param.type] == 'function') {
				var ret = fixtures[uri.pathname][ajax_param.type].call(this, ajax_param);
				if (typeof ajax_param.success == 'function' && ret !== false)
					ajax_param.success.call(this, ret);
				if (typeof ajax_param.error == 'function' && ret === false)
					ajax_param.error.call(this);
			} else {
				jQuery.ajax(ajax_param);
			}
		} else {
			for (var i in fixtures) {
				var parse_str = null;
				if ( (parse_str = fixtures[i].reg.exec(ajax_param.url)) != null ) {
					fixtures[i].reg.lastIndex = 0;
					var data = {};
					for (var j = 1; j < parse_str.length; j++) {
						data[fixtures[i].fields[j-1]] = parse_str[j];
					}
					var ret = fixtures[i][ajax_param.type].call(this, ajax_param, data);
					if (typeof ajax_param.success == 'function' && ret !== false)
						ajax_param.success.call(this, ret);
					if (typeof ajax_param.error == 'function' && ret === false)
						ajax_param.error.call(this);

					return;
				}
			}
		}

		jQuery.ajax(ajax_param);
	};

	var AjaxRequest = function(type, url, data_cb) {
		return function(data, suc, err) {
			data = data  || this.attr();
			var str_data = {};
			for (var i in data) {
				str_data[i] = data[i];
			}
			var ajax_param = {
				type: type.toUpperCase(),
				url: fw.utils.buildString(url, str_data),
				dataType: 'json',
				cache: false,
				data: str_data
			};
			if (typeof suc == 'function') ajax_param.success = function(res_data){
				if (typeof data_cb == 'function') {
					var ret = data_cb.call(this, res_data);
					suc.call(this, ret);
				} else {
					suc.call(this, res_data);
				}
			};
			if (typeof err == 'function') ajax_param.error = err;
			fw.utils.ajax(ajax_param);
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
			save: function(cb) {
				if (typeof this.__theNew != 'undefined') {
					this.create(this.attr(), cb);
				} else {
					this.update(this.attr(), cb);
				}
			}
		}

		var model_stat = {};

		var RowsMap = fw.Map.extend(model_proto, {});

		if (typeof param.findAll != 'undefined') {
			buildStatFind(model_stat, param.findAll, 'findAll', function(res_json){
				var ret = [];
				if (typeof res_json.data != 'undefined') {
					// for (var i in res_json.data) {
					// 	var obj = new RowsMap(res_json.data[i]);
					// 	ret[i] = obj;
					// }
					return res_json.data;
				}
				return ret;
			});
		}

		if (typeof param.findOne != 'undefined') {
			buildStatFind(model_stat, param.findOne, 'findOne', function(res_json){
				var ret = null;
				if (res_json) {
					ret = new RowsMap(res_json);
				}
				return ret;
			});
		}

		for (var i in param) {
			var p = param[i].match('^(GET|POST|PUT|DELETE)[\\s]+(.*)$');
			if (p.length > 2) {
				switch (i.toLowerCase()) {
					case 'create':
						var createFun = AjaxRequest(p[1], p[2]);
						model_proto.create = function(cb, err) {
							createFun.call(this, null, cb, err);
						};
						break;
					case 'update':
						var updateFun = AjaxRequest(p[1], p[2]);
						model_proto.update = function(cb, err) {
							updateFun.call(this, null, cb, err);
						};
						break;
					case 'destroy':
						var destroyFun = AjaxRequest(p[1], p[2]);
						model_proto.destroy = function(cb, err) {
							if (!this.id) return;
							destroyFun.call(this, { id: this.id }, cb, err);
						};
						break;
				}
			}
		}

		return fw.Map.extend(model_proto, model_stat, {
			'init': function() {
				if (typeof param.init == 'function') {
					param.init.call(this);
					delete param.init;
				}

				this.__theNew = true;
			}
		});
	};

	fw.Model.fixture = function(req, handler) {
		var re = new RegExp('\{\:(.*?)\}', 'g');
		var addFixture = function(req, handler) {
			var p = req.match('^(GET|POST|PUT|DELETE)[\\s]+(.*)$');
			if (p.length == 3) {
				fixtures[p[2]] = {};
				fixtures[p[2]][p[1]] = handler;
				if (p[2].match(re)) {
					var data = [];
					var res = null;
					while ((res = re.exec(p[2])) != null) {
						data.push(res[1]);
					}
					fixtures[p[2]].fields = data;
					var reg_str = p[2].replace(/\{\:.*?\}/g, '(.+?)');
					fixtures[p[2]].reg = new RegExp(reg_str, 'g');
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

	return fw;
});