JFW
===

JavaScript Framework

Install
---
Весь функционал построен по идиологии AMD, все модули поддерживают асинхронную загрузку с помощю RequireJS.
``` html
<html>
<head>
  <title>Example</title>
  <script type="text/javascript" src="js/require.js"></script>
  <script type="text/javascript">
    require.config({
      baseUrl: 'js',
      paths: {
        jquery: 'jquery-1.10.1.min'
      }
    });

    require(['jfw.core', 'jfw.route', 'jfw.view', 'jfw.control', 'jfw.model'],
    function(fw){
      console.log(fw);
    });
  </script>
</head>
<body>
</body>
</html>
```

jfw.core.js
---

* [fw.extend](#fwextend)
* [fw.Construct](#fwconstruct)
* [fw.Map](#fwmap)
* [fw.List](#fwlist)
* [fw.compute](#fwcompute)

``` js
require(['jfw.core'], function(fw){
	// ...
});
```

### fw.extend

```
fw.extend(root_object, namespace) -> {Object}
```

Данный метод реализует Namespace шаблон. Функция получает объект в котором требуеться создать (получить) необходимое пространство имен.

Пример:
``` js
var app_module = fw.extend(fw, 'app.modules.some_module');
console.log(app_module == fw.app.modules.some_module); // true

var modules = fw.extend(fw, 'app.modules');
console.log(modules == fw.app.modules); // true
```

### fw.Construct

```
fw.Construct(instanceProperties) -> {Function}
fw.Construct([extendObject,] instanceProperties) -> {Function}
fw.Construct.extend([extendObject,staticProperties,] instanceProperties) -> {Function}
```

Простейшая реализация концепции классов. Все остальные "классы" базируются на этом функционале.

Пример:
``` js
var Foo = fw.Construct({ a: 1, b: 2 });
var obj = new Foo();
console.log(obj instanceof Foo); // true

// static prop
var Foo = fw.Construct({
  stat1: 123
}, { a: 1, b: 2 });

console.log(Foo.stat1); // 123
```

* [Construct.extend](#fwconstructextend)
* [init](#constructor-init)
* [static properties](#constructor-static)
* [extends object](#constructor-extends)

---

#### fw.Construct.extend

Используется для создания класса:
``` js
var Foo = fw.Construct.extend({
  aaa: 123,
  bbb: function() {
    console.log(this.aaa);
  }
});

var bar = new Foo();
console.log(bar.aaa); // 123
bar.bbb(); // 123
console.log(bar instanceof Foo); // true
```

#### Constructor init

Вызывается во время инициализации объект:
``` js
var Foo = fw.Construct.extend({
  init: function(arg) {
  	this.aaa = arg;
  },
  bbb: function() {
    console.log(this.aaa);
  }
});
var bar = new Foo('test');
console.log(bar.aaa); // test
bar.bbb(); // test
console.log(bar.init); // undefined
```

#### Constructor static

Статические свойства "класса":
``` js
var Foo = fw.Construct.extend({}, {
  stat1: 'test1',
  stat2: 123
}, {
  init: function(arg) {
  	this.aaa = arg;
  },
  bbb: function() {
    console.log(this.aaa);
  }
});
console.log(Foo.stat1); // test1
console.log(Foo.stat2); // 123
```

Свойство **constructor**, у объектов, указывает на функцию "класса":
``` js
var Foo = fw.Construct.extend({}, {
  count: 0
}, {
  init: function(arg) {
  	this.constructor.count++;
  }
});

var obj1 = new Foo();
var obj2 = new Foo();
console.log(Foo.count); // 2
```

#### Constructor extends

Наследование происходит путем расширения свойств другого объекта {Object}:
``` js
var Foo = fw.Construct.extend({
  prop1: 123,
  prop2: 'test'
}, {
  // some prop
});

var obj1 = new Foo();
console.log(obj1.prop1, obj1.prop2); // 123 test
obj1.prop1 = 777;
console.log(obj1.prop1, obj1.superclass.prop1); // 777 123
```

---

### fw.Map

```
new fw.Map(mapProperties) -> {Object}
new fw.Map([extendObject,] mapProperties) -> {Object}
new fw.Map([extendObject,staticProperties,] mapProperties) -> {Object}
fw.Map.extend(mapProperties) -> {Function}
fw.Map.extend([extendObject,] mapProperties) -> {Function}
fw.Map.extend([extendObject,staticProperties,] mapProperties) -> {Function}
```

Реализует шаблон проектирования [Observer](http://en.wikipedia.org/wiki/Observer_pattern). Создает механизм у класса, который позволяет получать оповещения о изменении состояния объекта. Базируется на [fw.Construct](#fwconstruct).

* [attr](#fwmap-attr)
* [removeAttr](#fwmap-removeattr)
* [each](#fwmap-each)
* [bind/unbind](#fwmap-bindunbind)
* [trigger](#fwmap-trigger)

Пример:
``` js
var map = new fw.Map();
map.attr('foo', 5);
console.log(map.attr('foo')); // 5
map.bind('change', function(e){
	console.log(e.key, e.how, e.old_val, e.new_val);
});
map.bind('some_key', function(e){
	console.log(e.old_val, e.new_val);
});
map.attr('foo', 777);
// foo set 5 777
map.removeAttr('foo');
// foo remove 777 undefined
map.attr('bar', 333);
// bar add undefined 333
map.attr('some_key', 222);
// undefined 222
map.attr('some_key', 444);
// 222 444
// some_key set 222 444
console.log(map.some_key); // 444
console.log(map.attr()); // Object { bar: 333, some_key: 444 }
```

[Map](#fwmap) построен на базе [Construct](#fwconstruct) и обладает теми же способностями:
``` js
var Map = fw.Map.extend({}, { foo: 1, bar: 2 });
var map1 = new Map();
console.log(map1.foo); // 1
console.log(map1.bar); // 2
```

статические свойства:
``` js
var Map = fw.Map.extend({}, { static_key: 777 }, { foo: 1, bar: 2 });
console.log(Map.static_key); // 777
```

наследование от объекта:
``` js
var Map = fw.Map.extend({ parent_key: 555 }, { foo: 1, bar: 2 });
var map1 = new Map();
console.log(map1.foo); // 1
console.log(map1.parent_key); // 555
```

так же имеется свой init:
``` js
var Map = fw.Map.extend({}, { foo: 1, init: function(){
	console.log('map init');
}});
var map1 = new Map();
// map init
console.log(map1.foo); // 1
console.log(map1.attr()); // Object { foo: 1 }
```

#### fw.Map attr

Для манипуляции свойствами объектов Map, используется метод *attr*. Только используя его возможно получить генерацию событий:
``` js
var map = new fw.Map({ foo: 'some_val', bar: 123 });
console.log(map.foo); // some_val
console.log(map.bar); // 123
console.log(map.attr('foo')); // some_val
console.log(map.attr('bar')); // 123
console.log(map.attr()); // Object { foo: 'some_val', bar: 123 }
console.log(map.keys); // ["foo", "bar"]
console.log(map.attr('foo', 777));
console.log(map.attr('foo')); // 777
console.log(map.foo); // 777
```

#### fw.Map removeAttr

удаление свойств:
``` js
var map = new fw.Map({ foo: 'some_val', bar: 123 });
console.log(map.attr()); // Object { foo: 'some_val', bar: 123 }
map.removeAttr('foo');
console.log(map.attr()); // Object { bar: 123 }
```

#### fw.Map each

итератор each:
``` js
var map = new fw.Map({ foo: 'some_val', bar: 123 });
map.each(function(key, val){
	console.log((this instanceof Map), key, val);
});
// true foo some_val
// true bar 123
```

#### fw.Map bind/unbind

установка/удаление обработчиков событий:
``` js
var map = new fw.Map();

map.bind('change', function(e){
	console.log('change ->', e.key, e.how, e.old_val, e.new_val);
});
map.bind('foo', function(e){
	console.log('foo ->', e.old_val, e.new_val);
});

map.attr('abc', 123);
// change -> abc add undefined 123
map.attr('abc', 456);
// change -> abc set 123 456
map.removeAttr('abc');
// change -> abc remove 456 undefined

map.attr('foo', 'bar');
// foo -> undefined bar
// change -> foo add undefined bar
map.attr('foo', 'test');
// foo -> bar test
// change -> foo set bar test

map.unbind('change');
map.attr('foo', 'bar');
// foo -> test bar
```

обработчиков может быть несколько, вызыватся они будут по очереди. Удаление обработчиков возможно как всех сразу, так и конкретной функции, указав её вторым параметром:
``` js
var map = new fw.Map();

var change_handler1 = function() {
	console.log('map change 1');
};
var change_handler2 = function() {
	console.log('map change 2');
};

map.bind('change', change_handler1);
map.bind('change', change_handler2);

map.attr('foo', 123);
// map change 1
// map change 2

map.unbind('change', change_handler1);

map.attr('foo', 456);
// map change 2
```

#### fw.Map trigger

Вызывает событие:
``` js
var map = new fw.Map();
map.bind('set', function(e){
	console.log(e.how, e.key, e.old_val, e.new_val);
});

map.trigger('set', 'some_key', 123, 456);
// set some_key 123 456
```

---

### fw.List

```
new fw.List(listProperties) -> {Object}
new fw.List([extendObject,] listProperties) -> {Object}
new fw.List([extendObject,staticProperties,] listProperties) -> {Object}
fw.List.extend(listProperties) -> {Function}
fw.List.extend([extendObject,] listProperties) -> {Function}
fw.List.extend([extendObject,staticProperties,] listProperties) -> {Function}
```

Создает [Map](#fwmap), похожий на Array:
``` js
var list = new fw.List(1,2,3);
console.log(list); // [1, 2, 3]

list.push(4);
console.log(list); // [1, 2, 3, 4]
console.log(list.keys); // ["0", "1", "2", "3"]

list.bind('add', function(e){
	console.log('add ->', e.key, e.new_val);
});

list.unshift(777);
// add -> 0 777

console.log(list); // [777, 1, 2, 3, 4]
console.log(list.length); // 5
```

В отличае от простого Map доступны следующие свойства, синтаксис такой же как и в Array:

* pop
* push
* shift
* unshift
* slice
* splice
* indexOf
* join
* forEach
* concat

### fw.compute

```
fw.compute(value [, extendObject]) -> {Function}
```

Создает функцию реализующую "наблюдаемое" значение:

``` js
var comp = fw.compute(123);
console.log(comp()); // 123
comp(456);
console.log(comp()); // 456

comp.on('change', function(e){
	console.log(e.old_val, e.new_val);
});

comp(789);
// 456 789

comp.off('change');
```

Функции on и off являются псевдонимами bind и unbind соответственно. Так же имеется функция trigger.

``` js
var comp = fw.compute(123);
console.log(comp()); // 123
comp(456);
console.log(comp()); // 456

comp.on('change', function(e){
	console.log(e.old_val, e.new_val);
});

comp.trigger('change', 'val', 456, 789);
// 456 789
```
