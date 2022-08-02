import Application from './Application.vue';

new Vue({
  el: '#dynamic-container-configuration',
  render: (createElement) => {
    return createElement(Application);
  }
});
