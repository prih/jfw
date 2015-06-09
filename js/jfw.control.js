/**
	JavaScript Framework Control

	@version 0.1.0
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core'], function(fw){
	fw.Control = function(proto, param) {
		if (typeof param == 'undefined') {
			param = proto;
			proto = {};
		}
		return fw.Construct.extend(proto, {
			'init': function(selector) {
				if (selector) this['element'] = jQuery(selector);
				else this['element'] = jQuery(document.createElement('div'));

				if (typeof param.init == 'function') param.init.apply(this, arguments);
				for (var i in param) {
					if (i != 'init') {
						var p = i.match('^(.*)\\s+(.*)$');
						if (p && p.length > 2) {
							param[i].control = this;
							var cb = param[i];
							
							jQuery(this.element).on(p[2], p[1], { self: this }, cb);
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