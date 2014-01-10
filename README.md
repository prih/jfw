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
* [Map](#map)
* [List](#list)

### fw.Construct

```
fw.Construct([args..]) -> {Function}
fw.Construct([staticProperties,] instanceProperties) -> {Function}
fw.Construct.extend([extendObject,staticProperties] instanceProperties) -> {Function}
```

Простейшая реализация концепции классов. Все остальные "классы" базируются на этом функционале.

Для создания класса используется метод **fw.Construct.extend**:
``` js
var Foo = fw.Construct.extend({}, {
  aaa: 123,
  bbb: function() {
    console.log(this.aaa);
  }
});

var bar = new Foo({ aaa: 777, ccc: 'test' });
console.log(bar.aaa); // 777
bar.bbb(); // 777
```
