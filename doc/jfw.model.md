JFW - Model
===

Конструктор объектов типа Map для орзанизации удобной работы с REST API.

```
fw.Model(param_object) -> {Function}
```

где:
param_object - объект содержащий настройки CRUD операций, такие как:

* findOne - поиск одного значения, по параметрам;
* findAll - поиск всех значений попадающих под параметры;
* create - создание сущности;
* update - обновление уже существующей;
* destroy - удаление сущности.

Эти свойства должны содержать строку следующего формата:

```
"GET|POST|PUT|DELETE path|path/{:property}"
```

Первым указывается тип HTTP запроса GET, POST, PUT или DELETE. Далее идет pathname, который может являться шаблоном, в котором будут подставляться значения свойств конкретного объекта, эти поля подставляються вместо выражений {:field_name}, где field_name - имя свойства объекта "модели".

Оперции findOne, findAll доступны у конструктора модели, а create, update, destroy - у экземпляров модели.

Все методы модели инкапсулируют jQuery ajax метод, взаимодействие проходит в асинхронном режиме:

```
findOne|findAll (request_data, success_function, error_function);
```

```
create|update|destroy (success_function, error_function);
```

###findOne, findAll

К примеру создадим модель:

``` js
var Model = fw.Model({
  findOne: 'GET /path',
  findAll: 'POST /path_all/{:prop1}'
});
```

Model - будет конструктор модели.

findOne:

``` js
Model.findOne({ prop1: 1, prop2: 'text2' }, function(obj){
  // при успешном запросе мы получаем obj - объект Map, содержащий необходимые данные
  console.log(obj.id); // 123
  console.log(obj.name); // 'some_name'
});
```

Таким образом формируется GET запрос с URL:
```
http://some_domain.com/path?prop1=1&prop2=text2
```
В ответ сервер должен сформировать JSON со значениями свойств объекта модели. В данном примере это мог быть:

``` json
{
  "id": 123,
  "name": "some_name"
}
```

findAll:

``` js
Model.findAll({ prop1: 1, prop2: 'text2' }, function(data){
  // при успешном запросе мы получим List объект data
  console.log(data[0].id); // 123
  console.log(data[1].id); // 777
});
```

URL запроса будет:

```
http://some_domain.com/path_all/1
```

JSON ответ сервера должен быть такого вида:

``` json
{
  "data": {
    "0": { "id": 123, "name": "test1" },
    "1": { "id": 777, "name": "test2" }
  }
}
```

###create, update, destroy, save

Пример:
``` js
require(['jfw.model'], function(fw){
  var model = fw.Model({
    findOne: 'GET /path/{:id}',
    findAll: 'GET /path_all',
    create: 'POST /path_create',
    update: 'POST /path_update',
    delete: 'GET /path_delete/{:id}'
  });
  
  var mod = new Model({ id: 2, name: 'Name' });
  mod.save(); // create
  mod.name = 'Some other name';
  mod.save(); // update
  
  model.findOne({ id: 123 }, function(item){
    item.name = 'Some_new_name';
    item.update();
  });
});
```
