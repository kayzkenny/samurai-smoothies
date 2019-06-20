import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {fb,db} from './firebase/init'
require('firebase/firestore')

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
