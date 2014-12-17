/**
	JavaScript Framework View

	@version 0.1.0
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core', 'jfw.ejs'], function(fw){
	fw.view = function(template, data) {
		var ejs = null;
		if (/\.ejs$/.test(template)) {
			if (this.view.version) {
				template = template+'?bust=v'+this.view.version;
			}
			ejs = new fw.EJS({ url: template });
		} else {
			var tpl = null;
			if (tpl = document.getElementById(template)) {
				ejs = new fw.EJS({ text: tpl.innerHTML });
			}
		}
		if (ejs) {
			var render = function(data) {
				var str = ejs.render(data);
				return str;
			};
			if (typeof data == 'undefined') return render;
			else return render(data);
		}
	};

	return fw;
});