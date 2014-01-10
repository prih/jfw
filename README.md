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
fw.Construct([args..]) -> {Function}
fw.Construct([staticProperties,] instanceProperties) -> {Function}
fw.Construct.extend([extendObject,staticProperties] instanceProperties) -> {Function}
```

Простейшая реализация концепции классов. Все остальные "классы" базируются на этом функционале.

Для создания класса используется метод **fw.Construct.extend**:
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
```

Во время инициализации объект (new Foo) вызывается функция **init**:
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

Статические свойства "класса":
``` js
var Foo = fw.Construct.extend({
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
var Foo = fw.Construct.extend({
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

