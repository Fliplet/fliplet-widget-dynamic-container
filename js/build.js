Fliplet().then(function() {
  Fliplet.Widget.instance('dynamic-container', function(data, parentContext) {
    var $el = $(this);

    // TODO: fetch required data
    console.log(this, 'Data', data, 'parent context', parentContext);

    Fliplet.Widget.initializeChildren(this, { foo: 'bar'});
  }, {
    supportsDynamicContext: true
  });
});
