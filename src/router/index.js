import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import HomeDisplay from '../views/HomeDisplay.vue'
import InCaMa from '../views/IntelligentCapacityManagement.vue'
import Payload from '../views/Payload.vue'
import ElasticScaling from '../views/ResourceElasticScaling.vue'
import Business from '../views/Business.vue'
import VM from '../views/VM.vue'
import COR from  '../views/Cor.vue'
import Anomaly from '../views/Anomaly.vue'

// just for testcase
// import TestCase from '../views/Test.vue'
import { compile } from 'vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
    children:[
        {
          path:"homedisplay",
          component: HomeDisplay
        },
        {
          path:"inCaMa",
          component: InCaMa
        },
        {
          path:"payload",
          component: Payload
        },
        {
          path:"elasticscaling",
          component:ElasticScaling
        },
        {
          path: "business",
          component: Business
        },
        {
          path: "vm",
          component: VM
        },
        {
          path: "cor",
          component: COR
        },
        {
          path: "anomaly",
          component: Anomaly
        }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查URL中的token参数（单点登录）
  if (to.query.token && !authStore.isAuthenticated) {
    const result = await authStore.verifyToken(to.query.token)
    if (result.success) {
      // 验证成功，跳转到主页面
      next({ path: '/home' })
      return
    }
  }
  
  // 需要认证的页面
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } 
  // 已登录用户访问登录页面，重定向到主页面
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/home')
  } 
  else {
    next()
  }
})

export default router
