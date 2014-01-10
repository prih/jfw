/**
	JavaScript Framework
	for single page application

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/

(function(){
	var fw = window.fw || {};
	var utils = fw.utils || {};

	/**
		Простое наследование свойств
		@param {Object} child Объект наследник
		@param {Object} parent Расширяемый объект
	*/
	utils.simpleExtend = function(child, parent){
		for (var i in parent) {
			if (typeof child[i] == 'undefined') child[i] = parent[i];
		}
	};

	/**
		Создание нового класса
		@param {Object} stat Статические свойства класса
		@param {Object} param Свойства и методы объектов
		@return {Function} Функция конструктор класса
	*/
	fw.Construct = function(stat, param){
		return fw.Construct.extend({}, stat, param);
	};

	/**
		Создание нового класса с возможностью
		@param {Object} ext Объект который будет расширять класс
		@param {Object} stat Статические свойства класса
		@param {Object} param Свойства и методы объектов
		@return {Function} Функция конструктор класса
	*/
	fw.Construct.extend = function(ext, stat, param){
		if (typeof param == 'undefined') {
			param = stat;
			stat = {};
		}
		if (typeof param == 'undefined') {
			param = ext;
			ext = {};
		}

		ext = ext || {};
		param = param || {};

		var Construct = function(){
			if (typeof param.init == 'function') {
				param.init.apply(this, arguments);
			}
			for (var i in param) {
				if (i != 'init') this[i] = param[i];
			}
		};

		Construct.prototype = ext;
		Construct.prototype.superclass = ext;
		Construct.prototype.constructor = Construct;

		for (var i in stat) {
			Construct[i] = stat[i];
		}

		return Construct;
	};

	/**
		Массив обработчиков событий Map
		@private
		@see fw.Map.extend
	*/
	var map_events = {
		length: 0
	};

	/**
		Тригер обработки событий связанных с конкретным элементом Map
		@private
		@see fw.Map.extend
		@param {String} key Название свойства
		@param old_val Старое значение или undefined
		@param new_val Новое значение свойства 
	*/
	var map_event_trigger = function(key, old_val, new_val) {
		if(typeof map_events[this.__id][key] != 'undefined') {
			for (var i = 0; i < map_events[this.__id][key].length; i++) {
				map_events[this.__id][key][i].call(this, old_val, new_val);
			}
		}
	};

	/**
		Тригер обработки событий Map
		@private
		@see fw.Map.extend
		@param {String} type Название обработчика
		@param {String} key Название свойства
		@param {String} how Тип события
		@param old_val Старое значение или undefined
		@param new_val Новое значение свойства 
	*/
	var map_event_trigger_ext = function(type, key, how, old_val, new_val) {
		if(typeof map_events[this.__id][type] != 'undefined') {
			for (var i = 0; i < map_events[this.__id][type].length; i++) {
				map_events[this.__id][type][i].call(this, key, how, old_val, new_val);
			}
		}
	};

	/**
		Создание нового класса Map
		@see fw.Construct.extend
		@private
		@param {Object} ext Объект который будет расширять класс
		@param {Object} stat Статические свойства класса
		@param {Object} default_param Свойства и методы Map объекта
		@returns {Function} Функция конструктор класса Map
	*/
	var map = function(ext, stat, default_param){
		if (typeof default_param == 'undefined') {
			default_param = stat;
			stat = {};
		}

		if (typeof default_param == 'undefined') {
			default_param = ext;
			ext = {};
		}

		ext = ext || {};
		default_param = default_param || {};

		var map_proto = {
			/**
				Добавляет или изменяет значение свойства
				@param {String|Number|Object} key Название свойства
				@param val Значение свойства
				@returns Значение свойства или объект со всеми свойствами
			*/
			attr: function(key, val){
				if (typeof key == 'number') key = String(key);
				/**
					Если аргументы не установленны - то возвращаем объект
				*/
				if (typeof key == 'undefined') {
					var obj = {};
					for (var i in this.keys) {
						obj[this.keys[i]] = this[this.keys[i]];
					}
					return obj;
				}
				/**
					Если указанно название конкретного свойства
				*/
				if (typeof key == 'string') {
					if (typeof val == 'undefined') {
						return this[key];
					} else {
						var how = 'set';
						if (this.keys.indexOf(key) < 0) {
							this.keys.push(key);
							how = 'add';
						}
						var old_val = this[key];
						this[key] = val;

						map_event_trigger.call(this, key, old_val, val);
						map_event_trigger_ext.call(this, 'change', key, how, old_val, val);
					}
				}
				/**
					Если указан объект с несколькими свойствами
				*/
				if (typeof key == 'object') {
					for (var i in key) {
						var how = 'set';
						if (this.keys.indexOf(i) < 0) {
							this.keys.push(i);
							how = 'add';
						}
						var old_val = this[i];
						this[i] = key[i];

						map_event_trigger.call(this, i, old_val, val);
						map_event_trigger_ext.call(this, 'change', i, how, old_val, key[i]);
					}
				}
			},
			/**
				Итератор для Map объекта,
				перечесляет все свойства заданные при создании объекта или с помощью attr
				@param {Function} cb Функция итератора
			*/
			each: function(cb) {
				for (var i in this.keys) {
					cb.call(this, i, this[i]);
				}
			},
			/**
				Удаляет указанное свойство у объекта
				@param {String} key Название свойства
			*/
			removeAttr: function(key) {
				if (typeof key == 'number') key = String(key);
				var index = this.keys.indexOf(key);
				if (index < 0) return;
				this.keys.splice(index, 1);
				var old_val = this[key];
				delete this[key];

				map_event_trigger.call(this, key, old_val, undefined);
				map_event_trigger_ext.call(this, 'change', key, 'remove', old_val, undefined);
			},
			/**
				Устанавливает функцию обработчик указанного события у объекта Map
				@param {String} type Тип события или название свойства объекта Map
				@param {Function} cb Функция обработчик события
			*/
			bind: function(type, cb) {
				if ( !(map_events[this.__id][type] instanceof Array) ) {
					map_events[this.__id][type] = [];
				}
				for (var i in map_events[this.__id][type]) {
					if (map_events[this.__id][type][i] == cb) {
						return;
					}
				}
				map_events[this.__id][type].push(cb);
			},
			/**
				Удаляет все обработчики указанного события у объекта Map
				@param {String} type Тип события или название свойства объекта Map
				@param {Function} cb Функция обработчик события
			*/
			unbind: function(type, cb) {
				if (map_events[this.__id][type] instanceof Array) {
					if (typeof cb == 'undefined') {
						delete map_events[this.__id][type];
						return;
					} else {
						for (var i in map_events[this.__id][type]) {
							if (map_events[this.__id][type][i] == cb) {
								map_events[this.__id][type].splice(i, 1);
								return;
							}
						}
					}
				}
			}
		};

		utils.simpleExtend(ext, map_proto);

		return fw.Construct.extend(ext, stat, {
			init: function(param){
				param = param || {};
				this.keys = [];
				utils.simpleExtend(param, default_param);

				if (typeof default_param.init == 'function') {
					default_param.init.apply(this, arguments);
				}

				if (typeof param == 'object') {
					for (var i in param) {
						if (i != 'init') {
							this[i] = param[i];
							this.keys.push(i);
						}
					}
				}

				/*
				*	Уникальный идентификатор объекта Map
				*/
				map_events.length++;
				var __id = 'map'+map_events.length;
				this.__id = __id;
				map_events[__id] = {};
			}
		});
	};

	/**
		Map
		@constructor
		@see fw.Map.extend
	*/
	
	fw.Map = map();

	/**
		Создание нового класса Map
		@see map
		@param {Object} ext Объект который будет расширять класс
		@param {Object} stat Статические свойства класса
		@param {Object} default_param Свойства и методы Map объекта
		@returns {Function} Функция конструктор класса Map
	*/
	fw.Map.extend = map;

	/**
		Создает новый класс List
		@see fw.Map.extend
		@private
		@param {Object} ext Объект который будет расширять класс
		@param {Object} stat Статические свойства класса
		@param {Object} default_param Свойства и методы List объекта
		@returns {Function} Функция конструктор класса List
	*/
	var list = function(ext, stat, default_param){
		if (typeof default_param == 'undefined') {
			default_param = stat;
			stat = {};
		}

		if (typeof default_param == 'undefined') {
			default_param = ext;
			ext = {};
		}

		ext = ext || {};
		default_param = default_param || {};

		return fw.Map.extend({
			/**
				Добавляет новый элемент в конец списка
				@see Array.prototype.push
				@param val Значение добавляемое в конец листа
			*/
			push: function(val) {
				this.attr(this.length++, val);
			},
			/**
				Извлекает последний элемент из списка
				@see Array.prototype.pop
				@returns Извлекаемое значение
			*/
			pop: function() {
				var val = this.attr(this.length-1);
				this.removeAttr(this.length-1);
				this.length--;
				return val;
			},
			/**
				Извлекает первый элемент из списка
				@see Array.prototype.shift
				@returns Извлекаемое значение
			*/
			shift: function() {
				var val = this.attr(0);
				this.removeAttr(0);
				for (var i = 1; i < this.length; i++) {
					this[i-1] = this[i];
				}
				delete this[this.length-1];
				this.length--;
				return val;
			}
		}, {
			init: function(param){
				this.length = 0;
				if (param instanceof Array) {
					this.length = param.length;
					for (var i = 0; i < param.length; i++) {
						this[i] = param[i];
					}
				} else if (arguments.length > 0) {
					this.length = arguments.length;
					for (var i = 0; i < arguments.length; i++) {
						this[i] = arguments[i];
					}
				}
			}
		});
	};

	/**
		List
		@constructor
		@see list
	*/
	fw.List = list();

	/**
		Создает новый класс List
		@see list
		@param {Object} ext Объект который будет расширять класс
		@param {Object} stat Статические свойства класса
		@param {Object} default_param Свойства и методы List объекта
		@returns {Function} Функция конструктор класса List
	*/
	fw.List.extend = list;

	fw.utils = utils;
	window.fw = fw;
})();