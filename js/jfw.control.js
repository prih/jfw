/**
	JavaScript Framework Control

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core', 'jquery'], function(fw, jQuery){
	fw.Control = function(proto, param) {
		if (typeof param == 'undefined') {
			param = proto;
			proto = {};
		}
		return fw.Construct.extend(proto, {
			'init': function(selector) {
				this['element'] = jQuery(selector);
				if (typeof param.init == 'function') param.init.call(this);
				for (var i in param) {
					if (i != 'init') {
						var p = i.match('^(.*)\\s(.*)$');
						if (p && p.length > 2) {
							param[i].control = this;
							jQuery(this.element).on(p[2], p[1], param[i]);
							// jQuery(p[1], this.element).on(p[2], param[i]);
						} else {
							this[i] = param[i];
						}
					}
				}
			}
		});
	};

	return fw;
});