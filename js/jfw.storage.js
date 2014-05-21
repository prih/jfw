/**
	JavaScript Framework Storage

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core'], function(fw){
	var storage = new fw.Map();

	storage.bind('change', function(e){
		localStorage.setItem(e.key, e.new_val);
	});

	if (typeof Storage != 'undefined') {
		storage.attr = function(key, val) {
			if (typeof this[key] == 'undefined') {
				this[key] = localStorage.getItem(key);
			}
			return this.superclass.attr.call(this, key, val);
		};

		storage.removeAttr = function(key) {
			localStorage.removeItem(key);
			return this.superclass.removeAttr.call(this, key);
		};
	}

	fw.storage = storage;

	return fw;
});