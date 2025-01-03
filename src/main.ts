// import { createApp } from 'vue'
// import App from './App.vue'

// import './style.css'

// import './demos/ipc'
// // If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// // import './demos/node'

// createApp(App)
//   .mount('#app')
//   .$nextTick(() => {
//     postMessage({ payload: 'removeLoading' }, '*')
//   })


  import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// import { Request } from '@/api/request';
// import VueAxios from 'vue-axios'

import Layout from "./components/layout.vue";

import 'element-plus/theme-chalk/display.css'
import "element-plus/theme-chalk/src/message.scss"
import "element-plus/theme-chalk/src/message-box.scss"
import "element-plus/theme-chalk/src/overlay.scss"
import "element-plus/theme-chalk/src/loading.scss"

const app = createApp(App)

app.use(store);
// app.use(router).use(VueAxios, Request.init())
app.use(router)


app.component('Layout', Layout).mount('#app')