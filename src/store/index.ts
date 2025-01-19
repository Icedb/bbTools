import { createStore } from 'vuex'

export default createStore({
  state: {
    cookie: '',
    teamName: "",
    serverName: "",
    isUpdate: null
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
    isUpdate: (state, newValue) => {
      state.isUpdate = newValue
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
    setIsUpdate: (ctx, value) => {
      ctx.commit('isUpdate', value)
    },
  }
})
