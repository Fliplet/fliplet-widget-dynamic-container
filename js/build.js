(function() {
  Fliplet.DynamicContainer = Fliplet.DynamicContainer || {};

  const dynamicContainerInstances = {};

  Fliplet().then(function() {
    Fliplet.Widget.instance('dynamic-container', function(data, parent) {
      const $container = $(this);
      const $emptyTemplate = $container.find('template[name="empty"]').eq(0);
      const emptyTemplate = $emptyTemplate.html();

      $emptyTemplate.remove();

      const container = new Promise((resolve) => {
        const instance = {
          id: data.id,
          uuid: data.uuid,
          parent,
          dataSourceConnection: undefined,
        };

        instance.connection = function() {
          if (!this.dataSourceConnection) {
            this.dataSourceConnection = Fliplet.DataSources.connect(data.dataSourceId);
          }

          return this.dataSourceConnection;
        };

        if (Fliplet.Interact) {
          new Fliplet.Interact.ViewContainer($container, {
            placeholder: emptyTemplate
          });
        }

        Fliplet.Widget.initializeChildren(this, instance);
        resolve(instance);
      });

      container.id = data.id;
      dynamicContainerInstances[data.id] = container;
    }, {
      supportsDynamicContext: true
    });
  });

  Fliplet.DynamicContainer.get = function(name, options) {
    options = options || { ts: 10 };

    return Fliplet().then(function() {
      return Promise.all(Object.values(dynamicContainerInstances)).then(function(containers) {
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

        if (!container) {
          if (options.ts > 5000) {
            return Promise.reject('Container not found after ' + Math.ceil(options.ts / 1000) + ' seconds.');
          }

          // Containers can render over time, so we need to retry later in the process
          return new Promise(function(resolve) {
            setTimeout(function() {
              options.ts = options.ts * 1.5;

              Fliplet.DynamicContainer.get(name, options).then(resolve);
            }, options.ts);
          });
        }

        return container;
      });
    });
  };

  Fliplet.DynamicContainer.getAll = function(name) {
    return Fliplet().then(function() {
      return Promise.all(Object.values(dynamicContainerInstances)).then(function(containers) {
        if (typeof name === 'undefined') {
          return containers;
        }

        return containers.filter(function(form) {
          return form.name === name;
        });
      });
    });
  };
})();
