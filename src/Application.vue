<template>
  <div>
    <Data-Source-Provider ref="dataSourceProvider" v-on:saved="dataSourceProviderSave"></Data-Source-Provider>
    <!--<Query-Option></Query-Option>-->
    <!--<Rendering-Option></Rendering-Option>-->
  </div>
</template>

<script>
import state from './state';
import DataSourceProvider from './components/DataSourceProvider';

// import QueryOption from './components/QueryOption';
// import RenderingOption from './components/RenderingOption';

export default {
  data() {
    return {};
  },
  components: {
    DataSourceProvider
    // QueryOption,
    // RenderingOption
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
