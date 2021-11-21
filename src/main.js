import Vue from 'vue'
import App from './App.vue'
import VueLayers from "vuelayers";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/css/bootstrap.css";
import "vuelayers/lib/style.css";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";

Vue.component('VueSlider', VueSlider)
Vue.config.productionTip = false
Vue.use(VueLayers);
new Vue({
  render: h => h(App),
}).$mount('#app')
