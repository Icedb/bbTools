// 这里跟vue2有点区别，vue2中是直接导入vue，然后通过vue.use(xxx)
import { createStore } from 'vuex'

export default createStore({
  state: {
    cookie: '',
    teamName: "",
    serverName: "hun01"
  },
  mutations: {
    cookie: (state, newValue) => {
      state.cookie = newValue
    },
    teamName: (state, newValue) => {
      state.teamName = newValue
    },
    serverName: (state, newValue) => {
      state.serverName = newValue
    },
  },
  actions: {
    setCookie: (ctx, value) => {
      ctx.commit('cookie', value)
    },
    setTeamName: (ctx, value) => {
      ctx.commit('teamName', value)
    },
    setServerName: (ctx, value) => {
      ctx.commit('serverName', value)
    },
  }
})
