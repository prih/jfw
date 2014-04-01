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
* delete - удаление сущности.

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
