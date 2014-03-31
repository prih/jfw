JFW - Model
===

Конструктор объектов типа Map для орзанизации удобной работы с REST API.

Example

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
