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

  Fliplet.DynamicContainer.get = async function(filter, options = {}) {
    if (typeof filter === 'number' || typeof filter === 'string') {
      filter = { id: +filter };
    }

    await Fliplet();
 
    const containers = await Promise.all(Object.values(dynamicContainerInstances));
    const objectMatch = (obj, filter) => Object.keys(filter).every(key => obj[key] === filter[key]);
    const container = filter ? containers.find(c => objectMatch(c, filter)) : containers[0];

    // Containers can render over time, so we need to retry later in the process
    if (!container) {
      if (options.ts > 5000) {
        return Promise.reject(`Dynamic Container instance not found after ${Math.ceil(options.ts / 1000)} seconds.`);
      }

      if (options.ts === undefined) {
        options.ts = 10;
      } else {
        options.ts *= 1.5; // increase ts by 50% every time
      }

      await new Promise(resolve => setTimeout(resolve, options.ts)); // sleep

      return Fliplet.DynamicContainer.get(filter, options);
    }

    return container;
  };

  Fliplet.DynamicContainer.getAll = function(filter) {
    if (typeof filter !== 'object' || typeof filter !== 'function') {
      filter = { id: filter };
    }

    return Fliplet().then(function() {
      return Promise.all(Object.values(dynamicContainerInstances)).then(function(containers) {
        if (typeof filter === 'undefined') {
          return containers;
        }

        return _.filter(containers, filter);
      });
    });
  };
})();
