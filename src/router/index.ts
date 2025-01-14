import { createRouter, createWebHistory } from 'vue-router'
import TypeIn from '../views/data/typeIn.vue'
import Home from '../views/home/index.vue'
import Battle from '../views/analysis/battle.vue'
import Level from '../views/analysis/level.vue'
import Help from '../views/about/help.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/typeIn',
      name: 'typeIn',
      component: TypeIn
    },
    {
      path: '/battle',
      name: 'battle',
      component: Battle
    },
    {
      path: '/level',
      name: 'level',
      component: Level
    },
    {
      path: '/help',
      name: 'Help',
      component: Help
    }
  ]
})

export default router
