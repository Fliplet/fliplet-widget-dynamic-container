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
          _setData(data) {
            return Fliplet.Hooks.run('containerDataRetrieved', data).then(() => {
              if (!data) {
                return;
              }

              if (Array.isArray(data)) {
                this.context.length = 0;
                this.context.push(...data);
              } else {
                this.context = data;
              }
            });
          },
          load(fn) {
            let result = fn();

            if (!(result instanceof Promise)) {
              result = Promise.resolve(result);
            }

            return result.then(this._setData);
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
        vm._setData(result).then(() => {
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
