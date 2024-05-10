Fliplet.Widget.generateInterface({
  fields: [
    {
      type: 'provider',
      name: 'dataSourceId',
      package: 'com.fliplet.data-source-provider',
      data: function(value) {
        return {
          dataSourceTitle: 'Your list data',
          dataSourceId: value,
          appId: Fliplet.Env.get('appId'),
          default: {
            name: 'Your list data',
            entries: [],
            columns: []
          },
          accessRules: [
            {
              allow: 'all',
              type: [
                'select'
              ]
            }
          ]
        };
      },
      beforeSave: function(value) {
        return value && value.id;
      }
    }
  ]
});
