<template>
  <div class="form-group clearfix">
    <div class="col-sm-4 control-label">
      <label>Choose how components inside the container should be rendered</label>
    </div>
    <div class="col-sm-8">
      <div class="radio radio-icon">
        <input type="radio" id="render-default" v-model="renderingOption" value="default">
        <label for="render-default">
          <span class="check"><i class="fa fa-circle"></i></span> Early rendering (default)<br /><p class="small">Render components as soon as possible, while the data is being fetched. This requires children components to support <strong>reactive changes</strong> to the context data.</p>
        </label>
      </div>
      <div class="radio radio-icon">
        <input type="radio" id="render-wait" v-model="renderingOption" value="wait">
        <label for="render-wait">
          <span class="check"><i class="fa fa-circle"></i></span> Delayed rendering<br /><p class="small">Render components once all the data has been fetched and it's ready.</p>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import state from '../state.js';

export default {
  data() {
    return {
      provider: null,
      renderingOption: state.renderingOption || 'default'
    };
  },
  watch: {
    renderingOption(val) {
      state.renderingOption = val;
    }
  },
  mounted() {

  }
};
</script>


