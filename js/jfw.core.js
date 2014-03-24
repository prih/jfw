/**
	JavaScript Framework
	for single page application

	@version 0.0.1
	@author andrey prih <prihmail@gmail.com>
*/
define(function() {
	var fw = {};
	var utils = fw.utils || {};

	/**
		Простое наследование свойств
		@param {Object} child Объект наследник
		@param {Object} parent Расширяемый объект
	*/
	utils.simpleExtend = function(child, parent){
		for (var i in parent) {
			if (typeof child[i] == 'undefined' && i != 'init') child[i] = parent[i];
		}
	};

	fw.extend = function(ns, ns_string) {
		var parts = ns_string.split('.'), parent = ns, pl, i;
		if (parts[0] == "fw") parts = parts.slice(1);
		pl = parts.length;
		for (i = 0; i < pl; i++) {
			if (typeof parent[parts[i]] == 'undefined') {
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
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
		Construct.prototype['superclass'] = ext;
		Construct.prototype['constructor'] = Construct;

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
	// var map_events = {
	// 	length: 0
	// };

	var MapEvent = function(how, key, old_val, new_val) {
		this['how'] = how;
		this['key'] = key;
		this['old_val'] = old_val;
		this['new_val'] = new_val;
		this['stopPropagation'] = false;
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

						this.trigger(how, key, old_val, val);
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

						this.trigger(how, i, old_val, key[i]);
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

				this.trigger('remove', key, old_val, undefined);
			},
			/**
				Устанавливает функцию обработчик указанного события у объекта Map
				@param {String} type Тип события или название свойства объекта Map
				@param {Function} cb Функция обработчик события
			*/
			bind: function(type, cb) {
				if ( !(this.map_events[this.__id][type] instanceof Array) ) {
					this.map_events[this.__id][type] = [];
				}
				for (var i in this.map_events[this.__id][type]) {
					if (this.map_events[this.__id][type][i] == cb) {
						return;
					}
				}
				this.map_events[this.__id][type].push(cb);
			},
			/**
				Удаляет все обработчики указанного события у объекта Map
				@param {String} type Тип события или название свойства объекта Map
				@param {Function} cb Функция обработчик события
			*/
			unbind: function(type, cb) {
				if (this.map_events[this.__id][type] instanceof Array) {
					if (typeof cb == 'undefined') {
						delete this.map_events[this.__id][type];
						return;
					} else {
						for (var i in this.map_events[this.__id][type]) {
							if (this.map_events[this.__id][type][i] == cb) {
								this.map_events[this.__id][type].splice(i, 1);
								return;
							}
						}
					}
				}
			},
			/**
				Тригер обработки событий Map
				@param {String} how Тип события
				@param {String} key Название свойства
				@param old_val Старое значение или undefined
				@param new_val Новое значение свойства
			*/
			trigger: function(how, key, old_val, new_val) {
				var eventObj = null;
				var self = this;
				if (typeof this.map_events[this.__id][key] != 'undefined') {
					eventObj = new MapEvent(how, key, old_val, new_val);
					for (var i = 0; i < this.map_events[this.__id][key].length; i++) {
						this.events_fifo.push({
							fun: self.map_events[this.__id][key][i],
							cont: this,
							obj: eventObj
						});
						if (eventObj.stopPropagation) break;
					}
				}
				if (typeof this.map_events[this.__id][how] != 'undefined') {
					eventObj = eventObj || new MapEvent(how, key, old_val, new_val);
					for (var i = 0; i < this.map_events[this.__id][how].length; i++) {
						this.events_fifo.push({
							fun: self.map_events[this.__id][how][i],
							cont: this,
							obj: eventObj
						});
						if (eventObj.stopPropagation) break;
					}
				}
				if (typeof this.map_events[this.__id]['change'] != 'undefined') {
					eventObj = eventObj || new MapEvent('change', key, old_val, new_val);
					for (var i = 0; i < this.map_events[this.__id]['change'].length; i++) {
						this.events_fifo.push({
							fun: self.map_events[this.__id]['change'][i],
							cont: this,
							obj: eventObj
						});
						if (eventObj.stopPropagation) break;
					}
				}

				if (!this.events_work && this.events_fifo.length) {
					this.events_work = true;
					var e = null;
					while (e = this.events_fifo.shift()) {
						e.fun.call(e.cont, e.obj);
					}
					this.events_work = false;
				}
			}
		};

		utils.simpleExtend(ext, map_proto);

		return fw.Construct.extend(ext, stat, {
			'init': function(param){
				this.events_fifo = [];
				this.events_work = false;

				this.map_events = {
					length: 0
				};

				param = param || {};
				this.keys = [];

				utils.simpleExtend(param, default_param);

				if (typeof default_param.init == 'function') {
					default_param.init.apply(this, arguments);
				}

				if (typeof param == 'object') {
					for (var i in param) {
						this[i] = param[i];
						this.keys.push(i);
					}
				}

				/*
				*	Уникальный идентификатор объекта Map
				*/
				this.map_events.length++;
				var __id = 'map'+this.map_events.length;
				this.__id = __id;
				this.map_events[__id] = {};
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
		default_param = default_param || [];

		var list_proto = {
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
				var ret = Array.prototype.shift.apply(this);
				this.trigger('remove', '0', ret, undefined);
				return ret;
			},
			unshift: function() {
				var ret = Array.prototype.unshift.apply(this, arguments);
				if (arguments.length > 1) {
					var new_val = Array.prototype.slice.call(arguments, 0, arguments.length);
					this.trigger('add', '0', undefined, new_val);
				} else if (arguments.length == 1) {
					this.trigger('add', '0', undefined, arguments[0]);
				}
				return ret;
			},
			/**
				Возвращает часть списка в виде нового
				@see Array.prototype.slice
				@param {Number} start Индекс элемента, с которого будет начинается новый список
				@param {Number} [end] Индекс элемента, на котором новый список завершится
				@return {Object} Новый список
			*/
			slice: function(start, end) {
				arguments[0] = arguments[0] || 0;
				arguments[1] = arguments[1] || this.length;
				var ret_arr = Array.prototype.slice.apply(this, arguments);
				var ret = new fw.List(ret_arr);
				return ret;
			},
			/**
				Удаляет часть списка, заменяет новыми элементами
				@see Array.prototype.splice
				@param {Number} start Индекс элемента, с которого начать удаление
				@param {Number} count Кол-во элементов, которое требуется удалить
				@param Добавляемые элементы, добавление начинается с позиции start
				@return {Object} Новый список удаленных элементов
			*/
			splice: function(start, count) {
				arguments[0] = arguments[0] || 0;
				arguments[1] = arguments[1] || this.length;
				var ret_arr = Array.prototype.splice.apply(this, arguments);

				this.keys = [];
				for (var i = 0; i < this.length; i++) {
					this.keys.push(i);
				}
				
				this.trigger('remove', start, ret_arr, undefined);
				if (arguments.length > 2) {
					var new_val = Array.prototype.slice.call(arguments, 2, arguments.length);
					this.trigger('add', start, undefined, new_val);
				}
				var ret = new fw.List(ret_arr);
				return ret;
			},
			indexOf: function() {
				return Array.prototype.indexOf.apply(this, arguments);
			},
			join: function() {
				return Array.prototype.join.apply(this, arguments);
			},
			forEach: function() {
				Array.prototype.forEach.apply(this, arguments);
			},
			concat: function() {
				var arr = Array.prototype.slice.call(this, 0, this.length);
				return new fw.List(Array.prototype.concat.apply(arr, arguments));
			}
		};

		utils.simpleExtend(ext, list_proto);

		return fw.Map.extend(ext, stat, {
			'init': function(param){
				utils.simpleExtend(this, default_param);
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

	fw.compute = function(def_val, prop) {
		prop = prop || {};

		var Map = fw.Map.extend({
			'set': function(val) {
				this.attr('val', val);
			},
			'get': function() {
				return this.attr('val');
			}
		}, prop);

		var map = new Map({ 'val': def_val });

		var com = function(val) {
			if (typeof val != 'undefined') {
				map.set(val);
			} else {
				return map.get();
			}
		};

		com['on'] = map.bind.bind(map);
		com['off'] = map.unbind.bind(map);
		com['trigger'] = map.trigger.bind(map);

		return com;
	};

	fw.utils = utils;
	
	return fw;
});
