Fliplet.DynamicContainer = Fliplet.DynamicContainer || {};

const dynamicContainerInstances = [];

Fliplet().then(function() {
  Fliplet.Widget.instance('dynamic-container', function(data, parent) {
    const renderingOption = data.renderingOption || 'default';

    const container = new Promise((resolve) => {
      // let loadData;

      const $emptyStateContainers = $(this).find('[data-widget-package="com.fliplet.empty-state-container"]');

      // Find child props
      const $props = $(this).findUntil('fl-prop[data-engine]', 'fl-dynamic-container, fl-helper, fl-list-repeater');

      const vm = new Vue({
        id: data.id,
        name: data.name,
        data: {
          context: [],
          renderingOption,
          parent: parent,
          dataSourceConnection: undefined
        },
        methods: {
          _setData(key, data) {
            return Fliplet.Hooks.run('containerDataRetrieved', { container: this, key, data }).then(() => {
              if (!data) {
                return;
              }

              if (typeof this[key] === 'undefined') {
                return this.$set(this.context, key, data);
              }

              if (Array.isArray(data) && typeof data.update !== 'function') {
                this.context.length = 0;
                this.context.push(...data);
              } else {
                this.context = data;
              }

              this._updateVisibility();
              this._updatePropTags();
            });
          },
          _updateVisibility() {
            $emptyStateContainers.toggleClass('visible', !this.context || !this.context.length);
          },
          _updatePropTags() {
            const $vm = this;

            $props.each(function() {
              const $el = $(this);
              const path = $el.data('path');

              if (!path) {
                return;
              }

              let value = _.get($vm, path);

              if (typeof value === 'object') {
                value = JSON.stringify(value);
              }

              $el.html(value);
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
          },
          connection() {
            if (!this.dataSourceConnection) {
              this.dataSourceConnection = Fliplet.DataSources.connect(data.dataSourceId);
            }

            return this.dataSourceConnection;
          }
        }
      });

      /*
      // Shared state context is disabled (ref ID-2919)

      if (data.dataSourceId) {
        loadData = Fliplet.DataSources.connect(data.dataSourceId).then((connection) => {
          const cursorData = _.pick(data, ['limit']);

          return Fliplet.Hooks.run('containerBeforeRetrieveData', { container: this, data: cursorData }).then(() => {
            return connection.findWithCursor(cursorData);
          });
        });
      } else {
        loadData = Promise.resolve();
      }

      loadData.then((result) => {
        vm._setData('context', result).then(() => {
          if (renderingOption === 'wait') {
            Fliplet.Widget.initializeChildren(this, vm);
          }

          resolve(vm);
        });
      }).catch((err) => {
        console.error('[DYNAMIC CONTAINER] Error fetching data', err);
        resolve(vm);
      });
      */

      Fliplet.Widget.initializeChildren(this, vm);
      resolve(vm);
    });

    dynamicContainerInstances.push(container);
  }, {
    supportsDynamicContext: true
  });
});

Fliplet.DynamicContainer.get = function(name, options) {
  options = options || { ts: 10 };

  return Fliplet().then(function() {
    return Promise.all(dynamicContainerInstances).then(function(containers) {
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
    return Promise.all(dynamicContainerInstances).then(function(containers) {
      if (typeof name === 'undefined') {
        return containers;
      }

      return containers.filter(function(form) {
        return form.name === name;
      });
    });
  });
};
