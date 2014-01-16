/**
	JavaScript Framework Model

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
(function(){
	var fw = window.fw;
	if (!fw) {
		console.error('you must first load jfw.core');
		return;
	}

	var AjaxRequest = function(type, url, data_cb) {
		return function(data, suc, err) {
			data = data || {};
			var ajax_param = {
				type: type.toUpperCase(),
				url: fw.utils.buildString(url, data),
				dataType: 'json',
				cache: false,
				data: data
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
			jQuery.ajax(ajax_param);
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
					for (var i in res_json.data) {
						var obj = new RowsMap(res_json.data[i]);
						ret.push(obj);
					}
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

		return fw.Map.extend(model_proto, model_stat, {
			'init': function() {
				if (typeof param.init == 'function') {
					param.init.call(this);
					delete param.init;
				}

				this.__theNew = true;

				for (var i in param) {
					var p = param[i].match('^(GET|POST|PUT|DELETE)[\\s]+(.*)$');
					if (p.length > 2) {
						switch (i.toLowerCase()) {
							case 'create':
								model_proto.create = AjaxRequest(p[1], p[2]);
								break;
							case 'update':
								model_proto.update = AjaxRequest(p[1], p[2]);
								break;
							case 'destroy':
								model_proto.destroy = AjaxRequest(p[1], p[2]);
								break;
						}
					}
				}
			}
		});
	};
})();