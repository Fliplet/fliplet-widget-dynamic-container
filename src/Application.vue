<template>
  <div>
    <Data-Source-Provider ref="dataSourceProvider" v-on:saved="dataSourceProviderSave"></Data-Source-Provider>
  </div>
</template>

<script>
import state from './state';
import DataSourceProvider from './components/DataSourceProvider';

export default {
  data() {
    return {};
  },
  components: {
    DataSourceProvider
  },
  methods: {
    dataSourceProviderSave() {
      Fliplet.Widget.save(state).then(() => {
        Fliplet.Widget.complete();
      });
    }
  },
  mounted() {
    Fliplet.Widget.onSaveRequest(() => {
      this.$refs.dataSourceProvider.forwardSaveRequest();
    });
  }
};
</script>
