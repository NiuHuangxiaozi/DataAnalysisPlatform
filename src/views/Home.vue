<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="logo-section">
          <Icon type="ios-cloud" size="32" color="#667eea" />
          <span class="system-name">云资源智能调度系统</span>
        </div>
        
        <div class="user-section">
          <Dropdown @on-click="handleUserAction">
            <a href="javascript:void(0)" class="user-info">
              <Icon type="ios-person" size="20" />
              <span>{{ userInfo.username }}</span>
              <Icon type="ios-arrow-down" />
            </a>
            <template #list>
              <DropdownMenu>
                <DropdownItem name="logout">
                  <Icon type="ios-log-out" />
                  退出登录
                </DropdownItem>
              </DropdownMenu>
            </template>
          </Dropdown>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <Layout style="height: 100%;">
        <Sider hide-trigger :style="{background: '#fff'}" :width="240">
          <div class="sidebar-logo">
            预测平台导航栏
          </div>
          <Menu theme="light" :active-name = "activeMenu" width="auto">
            
            <MenuItem name="home">
              <Icon type="ios-home" />
              <RouterLink to="/home/homedisplay" >首页</RouterLink>
            </MenuItem>
            
            <!-- 功能模块 -->
            <Submenu name="module">
  
                <template #title>功能模块</template>

                <!-- 资源行为模式智能容量管理 -->
                <MenuItem name="template">
                  <Icon type="ios-paper" />
                  <RouterLink to="/home/inCaMa" >
                    资源行为模式智能容量管理
                  </RouterLink>
                </MenuItem>

                <!-- 应用感知的智能资源分配 -->
                <Submenu name="resource">
                  <template #title>应用感知的智能资源分配  </template>
                  <MenuItem name="payload">
                    <Icon type="ios-paper" />
                    <RouterLink to="/home/payload" >
                      业务整体资源预测-负载数据
                    </RouterLink>
                  </MenuItem>
                  <MenuItem name="user">
                    <Icon type="ios-paper" />
                    <RouterLink to="/home/business" >
                      业务整体资源预测-业务数据
                    </RouterLink>
                  </MenuItem>
                  <MenuItem name="vm">
                    <Icon type="ios-paper" />
                    <RouterLink to="/home/vm" >
                        虚拟机资源分配
                    </RouterLink>
                  </MenuItem>
                </Submenu>

                <!-- 数据流挖掘的资源弹性伸缩 -->
                <MenuItem name="elastic">
                  <Icon type="ios-paper" />
                  <RouterLink to="/home/elasticscaling" >
                      数据流挖掘的资源弹性伸缩
                  </RouterLink>
                </MenuItem>
            </Submenu>


            <!-- just for testcase -->
            <!-- <MenuItem name="home">
              <Icon type="ios-home" />
              <RouterLink to="/home/test">测试iview风格组件</RouterLink>
            </MenuItem> -->
            </Menu>
        </Sider>
        
        <Layout :style="{padding: '24px'}">
          <Content class="content-wrapper">
            <RouterView></RouterView>
          </Content>
        </Layout>
      </Layout>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { Message, MenuItem } from 'view-ui-plus' // MenuItem 在模板中使用，无需在此导入

const router = useRouter()
const authStore = useAuthStore()

// 获取用户信息 (该部分遵照要求，未改动)
const userInfo = computed(() => authStore.user || { username: '用户' })

// 处理用户操作 (该部分遵照要求，未改动)
const handleUserAction = (name) => {
  if (name === 'logout') {
    handleLogout()
  }
}

// 处理登出 (该部分遵照要求，未改动)
const handleLogout = () => {
  authStore.logout()
  Message.success('已安全退出')
  router.push('/login')
}


// 组件挂载时的初始化
onMounted(() => {
  console.log('主界面加载完成')
  router.push('/home/homedisplay')

  
})

// 切换高亮
const currentRoute = ref("home"); // 假设这里记录当前路由

// 用 computed 动态生成 active-name
const activeMenu = computed(() => {
  return currentRoute.value;
});

</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  background: #f8f9fa;
  /* 使用 Flexbox 布局实现上/下结构 */
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.dashboard-header {
  background: white;
  border-bottom: 1px solid #e8eaed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative; /* 从 sticky 改为 relative，避免潜在的 z-index 问题 */
  z-index: 1000;
  /* 固定高度 */
  height: 64px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 100%;
  max-width: 100%; /* 宽度占满 */
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: #f0f2f5;
  color: #667eea;
}

/* 主内容区，使用 flex: 1 自动填充剩余空间 */
.dashboard-content {
  flex: 1;
  overflow-y: auto; /* 如果内容区本身需要滚动，可以在这里设置 */
}

/* 左侧边栏Logo样式 */
.sidebar-logo {
  height: 64px;
  line-height: 64px;
  padding-left: 24px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  background: #fff;
  border-bottom: 1px solid #dcdee2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧内容区域 */
.content-wrapper {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  /* 确保内容区高度至少填满其容器 */
  height: 100%; 
  /* 如果内容超出，wrapper 内部滚动 */
  overflow-y: auto;
}

/* 响应式设计 (保留原有代码) */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .system-name {
    font-size: 16px;
  }
}
</style>