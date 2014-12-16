/**
	JavaScript Framework Storage

	@version 0.0.9
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core'], function(fw){
	var storage = new fw.Map();

	storage.bind('change', function(e){
		if (typeof e.new_val != 'undefined') {
			e.new_val = JSON.stringify(e.new_val);
			localStorage.setItem(e.key, e.new_val);
		} else {
			localStorage.removeItem(e.key);
		}
	});

	if (typeof Storage != 'undefined') {
		storage.attr = function(key, val) {
			if (typeof this[key] == 'undefined') {
				var data = localStorage.getItem(key);
				if (data) this[key] = JSON.parse(data);
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