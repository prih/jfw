JFW
===

JavaScript Framework

Install
---
``` html
<html>
<head>
	<title></title>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="js/jfw.js"></script>
</head>
<body>

</body>
</html>
```

Guides
---

* [Construct](#fwconstruct)
* [Map](#fwmap)
* [List](#fwlist)

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

Реализует шаблон проектирования [Observer](http://ru.wikipedia.org/wiki/%D0%9D%D0%B0%D0%B1%D0%BB%D1%8E%D0%B4%D0%B0%D1%82%D0%B5%D0%BB%D1%8C_(%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD_%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F). Создает механизм у класса, который позволяет получать оповещения о изменении состояния объекта. Базируется на [fw.Construct](#fwconstruct).

Пример:
``` js
var map = new fw.Map();
map.attr('foo', 5);
console.log(map.attr('foo')); // 5
map.bind('change', function(key, how, old_val, new_val){
	console.log(key, how, old_val, new_val);
});
map.bind('some_key', function(old_val, new_val){
	console.log(old_val, new_val);
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

простейший итератор:
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

map.bind('change', function(key, how, old_val, new_val){
	console.log('change ->', key, how, old_val, new_val);
});
map.bind('foo', function(old_val, new_val){
	console.log('foo ->', old_val, new_val);
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

var change_handler1 = function(key, how, old_val, new_val) {
	console.log('map change 1');
};
var change_handler2 = function(key, how, old_val, new_val) {
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
