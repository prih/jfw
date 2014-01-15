/**
	JavaScript Framework Model

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
(function(){
	if (!fw) {
		console.error('you must first load jfw.core');
		return;
	}

	fw.Model = function(param) {
		param = param || {};

		return fw.Map.extend({}, {
			findAll: function() {

			},
			findOne: function() {

			},
			create: function() {

			},
			update: function() {

			},
			destroy: function() {

			}
		}, {
			'init': function(data) {
				// if (typeof param.init == 'function') param.init.call(this);
				console.log(data);
			}
		});
	};
})(window);