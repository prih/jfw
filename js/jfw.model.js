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

	fw.Model = function(param) {
		param = param || {};

		return fw.Map.extend({
			save: function() {
				
			}
		}, {}, {
			'init': function() {
				if (typeof param.init == 'function') param.init.call(this);
				delete param.init;

				for (var i in param) {
					var p = param[i].match('^(GET|POST|PUT|DELETE)[\\s]+(.*)$');
					if (p.length > 2) {
						switch (i.toLowerCase()) {
							case 'findall':
								this.constructor.findAll = function(data, suc, err) {
									data = data || {};
									var ajax_param = {
										type: p[1].toUpperCase(),
										url: p[2],
										dataType: 'json',
										cache: false,
										data: data
									};
									if (typeof suc == 'function') ajax_param.success = suc;
									if (typeof err == 'function') ajax_param.error = err;
									jQuery.ajax(ajax_param);
								}
						}
					}
				}
			}
		});
	};
})();