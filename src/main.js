import Application from './Application.vue';

new Vue({
  el: '#dynamic-container',
  render: (createElement) => {
    return createElement(Application);
  }
});
