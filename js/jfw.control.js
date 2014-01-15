/**
	JavaScript Framework Control

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
(function(){
	if (!fw) {
		console.error('you must first load jfw.core');
		return;
	}

	fw.Control = function(param) {
		return fw.Construct.extend({}, {
			'init': function(selector) {
				this['element'] = jQuery(selector);
				if (typeof param.init == 'function') param.init.call(this.element);
				for (var i in param) {
					if (i != 'init') {
						var p = i.match('^(.*)\\s(.*)$');
						if (p.length > 2) {
							jQuery(p[1], this.element).on(p[2], param[i]);
						}
					}
				}
			}
		});
	};
})(window);