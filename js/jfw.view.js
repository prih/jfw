/**
	JavaScript Framework View

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
define(['jfw.core', 'jfw.ejs'], function(fw){
	fw.view = function(template, data) {
		var ejs = null;
		if (/\.ejs$/.test(template)) {
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
				var dom = document.createElement('div');
				dom.innerHTML = str;
				var ret = document.createDocumentFragment();
				for (var i = 0; i < dom.children.length; i++) {
					ret.appendChild(dom.children[i]);
				}
				return ret;
			};
			if (typeof data == 'undefined') return render;
			else return render(data);
		}
	};

	return fw;
});