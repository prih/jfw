/**
	JavaScript Framework Hash Routing

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core', 'history'], function(fw){
	var route_rules = {};

	var route = new fw.Map({
		'add': function(rule, handler) {
			route_rules[rule] = {
				reg: new RegExp(rule),
				handler: handler
			};
		},
		'remove': function(rule) {
			delete route_rules[rule];
		}
	});

	window.onpopstate = function() {
		route.attr('hash', window.location.hash);
	};

	route.bind('hash', function(e){
		for (var i in route_rules) {
			if(route_rules[i].reg.test(this.hash.replace(/^#/, ''))) {
				var param = this.hash.match(i);
				param = Array.prototype.slice.call(param, 1, param.length);
				route_rules[i].handler.call(this, param, e);
				break;
			}
		}
	});

	route.attr('hash', window.location.hash);

	fw.route = route;

	return fw;
});