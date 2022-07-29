Fliplet.Widget.instance('dynamic-container', function(data, parentContext) {
  console.log('Dynamic container initializing', this, data, 'with parent context', parentContext);
}, {
  supportsDynamicContext: true
});
