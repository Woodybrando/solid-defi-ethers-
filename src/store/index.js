import Vue from 'vue'
import Vuex from 'vuex'
import foundry from './modules/foundry'

Vue.use(Vuex)

// const store = new Vuex.Store({ state: {} });

// export const store = new Vuex.Store({ state: {} })

export const store = new Vuex.Store({
  modules: {
    foundry
  },
})