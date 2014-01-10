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

Реализует шаблон проектирования [Observer](http://ru.wikipedia.org/wiki/%D0%9D%D0%B0%D0%B1%D0%BB%D1%8E%D0%B4%D0%B0%D1%82%D0%B5%D0%BB%D1%8C_(%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD_%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)). Создает механизм у класса, который позволяет получать оповещения о изменении состояния объекта. Базируется на [fw.Construct](#fwconstruct).

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
```
