Fliplet.Container = Fliplet.Container || {};

const instances = [];

Fliplet().then(function() {
  Fliplet.Widget.instance('dynamic-container', function(data, parent) {
    const container = new Promise((resolve) => {
      // const $el = $(this);

      let loadData;

      const vm = new Vue({
        data: {
          context: [],
          parent: parent
        },
        methods: {
          _setData(key, data) {
            return Fliplet.Hooks.run('containerDataRetrieved', { container: this, key, data }).then(() => {
              if (!data) {
                return;
              }

              if (Array.isArray(data)) {
                this[key].length = 0;
                this[key].push(...data);
              } else {
                this[key] = data;
              }
            });
          },
          load(key, fn) {
            if (typeof key === 'function') {
              fn = key;
              key = 'context';
            }

            let result = fn();

            if (!(result instanceof Promise)) {
              result = Promise.resolve(result);
            }

            return result.then(res => this._setData(key, res));
          }
        }
      });

      Fliplet.Widget.initializeChildren(this, vm);

      if (data.dataSourceId) {
        loadData = Fliplet.DataSources.connect(data.dataSourceId).then((connection) => {
          return connection.find();
        });
      } else {
        loadData = Promise.resolve();
      }

      loadData.then((result) => {
        vm._setData('context', result).then(() => {
          resolve(vm);
        });
      }).catch((err) => {
        console.error(err);
        resolve(vm);
      });
    });

    instances.push(container);
  }, {
    supportsDynamicContext: true
  });
});

Fliplet.Container.get = function(name) {
  return Fliplet().then(function() {
    return Promise.all(instances).then(function(containers) {
      var container;

      if (typeof name === 'undefined') {
        container = containers.length ? containers[0] : undefined;
      } else {
        containers.some(function(vm) {
          if (vm.name === name) {
            container = vm;

            return true;
          }
        });
      }

      return container;
    });
  });
};

Fliplet.Container.getAll = function(name) {
  return Fliplet().then(function() {
    return Promise.all(instances).then(function(containers) {
      if (typeof name === 'undefined') {
        return containers;
      }

      return containers.filter(function(form) {
        return form.name === name;
      });
    });
  });
};
