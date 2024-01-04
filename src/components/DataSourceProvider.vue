<template>
  <div id="data-source-provider"></div>
</template>

<script>
import state from '../state.js';

export default {
  data() {
    return {
      provider: null,
      settings: {
        dataSourceTitle: 'Your list data',
        dataSourceId: state.dataSourceId,
        appId: Fliplet.Env.get('appId'),
        default: {
          name: 'Your list data',
          entries: [],
          columns: []
        },
        accessRules: []
      }
    };
  },
  methods: {
    forwardSaveRequest() {
      return this.provider.forwardSaveRequest();
    }
  },
  mounted() {
    this.provider = Fliplet.Widget.open('com.fliplet.data-source-provider', {
      selector: '#data-source-provider',
      data: this.settings,
      onEvent: (event, dataSource) => {
        if (event === 'dataSourceSelect') {
          state.dataSourceId = dataSource.id;
        }
      }
    });

    this.provider.then((dataSource) => {
      state.dataSourceId = dataSource.data.id;
      this.provider = null;

      this.$emit('saved');
    });
  }
};
</script>


