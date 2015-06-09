/**
	JavaScript Framework
	for single page application

	Utils module

	@version 0.1.1
	@author andrey prih <prihmail@gmail.com>
*/

define(function(){
	var utils = {};

	/**
		Простое наследование свойств
		@param {Object} child Объект наследник
		@param {Object} parent Расширяемый объект
		@param {Boolean} own Наследовать только собственные свойства
	*/
	utils.simpleExtend = function(child, parent, own){
		own = own || false;
		for (var i in parent) {
			if (typeof child[i] == 'undefined') {
				if (own && parent.hasOwnProperty(parent[i]))
					child[i] = parent[i];
				if (!own) child[i] = parent[i];
			}
		}
	};

	/**
		Создание компилируемого шаблона строки
	*/
	utils.createStringTemplate = function(str) {
		var re = new RegExp('\{\:(.*?)\}', 'g');
		var res = null;
		var tpl = '\''+str+'\'';
		while ((res = re.exec(str)) != null) {
			tpl = tpl.replace(res[0], '\'+tpl_data[\''+res[1]+'\']+\'');
		}
		return tpl;
	};

	/**
		Компиляция шаблона строки
		@see utils.createStringTemplate
	*/
	utils.makeStringTemplate = function(tpl_str, tpl_data) {
		return eval(tpl_str);
	};

	utils.parse_uri = function(href) {
		var match = href.match(/^(https?\:)?(?:\/\/)?(([^:\/?#]*)(?:\:([0-9]+))?)((?:\/)?[^?#]*)(\?[^#]*|)(#.*|)$/);
		return match && {
			protocol: match[1],
			host: match[2],
			hostname: match[3],
			port: match[4],
			pathname: match[5],
			search: match[6],
			path: match[5] + match[6],
			hash: match[7]
		}
	};

	utils.getCookie = function(name) {
		var matches = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	}

	return utils;
});