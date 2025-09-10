import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'


// 创建一个应用
const app = createApp(App)


// 使用插件

app.use(createPinia())

// 路由器
app.use(router)


// iview插件
app.use(ViewUIPlus)


// 挂在到app容器
app.mount('#app')




