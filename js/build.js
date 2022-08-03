Fliplet().then(function() {
  Fliplet.Widget.instance('dynamic-container', function(data, parent) {
    // const $el = $(this);

    let loadData;

    const vm = new Vue({
      data: {
        context: [],
        parent: parent
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
      vm.context.length = 0;
      vm.context.push(...result);
    });
  }, {
    supportsDynamicContext: true
  });
});
