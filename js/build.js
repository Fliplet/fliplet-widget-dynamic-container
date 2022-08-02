Fliplet().then(function() {
  Fliplet.Widget.instance('dynamic-container', function(data, parentContext) {
    const $el = $(this);

    let loadData;

    if (data.dataSourceId) {
      loadData = Fliplet.DataSources.connect(data.dataSourceId).then((connection) => {
        return connection.find();
      });
    } else {
      loadData = Promise.resolve();
    }

    loadData.then((result) => {
      Fliplet.Widget.initializeChildren(this, result);
    });
  }, {
    supportsDynamicContext: true
  });
});
