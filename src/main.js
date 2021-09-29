import Vue from 'vue';
import App from './App.vue';
import mixin from './mixins';
import router from './router';
import { store } from "./store/";
// import Web3 from 'web3/lib';
import { ethers } from "ethers";
import 'material-icons/iconfont/material-icons.css';

import '@/assets/css/base.css';
import '@/assets/css/display.css';
import "@/plugins/element/index.js";
import '@/plugins/vuesax';
import '@/plugins/apexCharts';

Vue.mixin(mixin);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  beforeCreate () {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = signer.getAddress();
      store.commit('init')
      store.commit('read_contract', address)
      setInterval(() => {
        store.commit('read_contract', address)
      }, 10000)
    }
  },
  render: (h) => h(App),
}).$mount('#app');
