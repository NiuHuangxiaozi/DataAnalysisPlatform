<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 系统标题 -->
      <div class="system-title">
        <h1>基于多维数据流挖掘的云资源智能调度系统</h1>
      </div>
      
      <!-- 登录标题 -->
      <div class="login-title">
        <h2>登录</h2>
      </div>
      
      <!-- 登录表单 -->
      <Form ref="loginForm" :model="loginData" :rules="loginRules" @submit.native.prevent="handleLogin">
        <FormItem prop="username">
          <Input
            v-model="loginData.username"
            type="text"
            placeholder="请输入账号"
            size="large"
            prefix="ios-person-outline"
            clearable
          />
        </FormItem>
        
        <FormItem prop="password">
          <Input
            v-model="loginData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix="ios-lock-outline"
            show-password
            clearable
          />
        </FormItem>
        
        <FormItem>
          <Button
            type="primary"
            size="large"
            long
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </Button>
        </FormItem>
      </Form>
      
      <!-- 登录提示 -->
      <div class="login-tips">
        <p>提示：输入账号和密码</p>
        <p>或通过URL参数 <code>?token=bearer_token</code> 进行单点登录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '../store/auth'
  import { Message } from 'view-ui-plus'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  // 响应式数据
  const loading = ref(false)
  const loginForm = ref(null)

  // 登录表单数据
  const loginData = reactive({
    username: '',
    password: ''
  })

  // 表单验证规则
  const loginRules = {
    username: [
      { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ]
  }

  // 处理登录
  const handleLogin = async () => {
    // 表单验证
    const valid = await new Promise((resolve) => {
      loginForm.value.validate((valid) => {
        resolve(valid)
      })
    })
    
    if (!valid) return
    
    loading.value = true
    
    try {
      // 调用登录接口
      const result = await authStore.login(loginData.username, loginData.password)
      
      if (result.success) {
        Message.success('登录成功')
        // 跳转到主页面
        router.push('/home')
      } else {
        Message.error(result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      Message.error('登录过程中发生错误')
    } finally {
      loading.value = false
    }
  }

    // 组件挂载时检查URL中的token
    onMounted(async () => {
      const token = route.query.token
      if (token) {
        loading.value = true
        try {
          console.log("token", token)
          const result = await authStore.verifyToken(token)
          if (result.success) {
            Message.success('单点登录成功')
            router.push('/home')
          } else {
            Message.error('Token验证失败，请使用账号密码登录')
          }
        } catch (error) {
          console.error('Token验证错误:', error)
          Message.error('单点登录失败，请使用账号密码登录')
        } finally {
          loading.value = false
        }
      }
    })
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.system-title {
  margin-bottom: 30px;
}

.system-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
  letter-spacing: 1px;
}

.login-title {
  margin-bottom: 40px;
}

.login-title h2 {
  font-size: 28px;
  font-weight: 500;
  color: #34495e;
  margin: 0;
}

.login-tips {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-tips p {
  margin: 8px 0;
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}

.login-tips strong {
  color: #e74c3c;
  font-weight: 600;
}

.login-tips code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #e74c3c;
}

/* 表单项间距 */
:deep(.ivu-form-item) {
  margin-bottom: 24px;
}

/* 输入框样式优化 */
:deep(.ivu-input-wrapper) {
  border-radius: 8px;
}

:deep(.ivu-input) {
  border-radius: 8px;
  border: 2px solid #e8eaed;
  transition: all 0.3s ease;
}

:deep(.ivu-input:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 按钮样式优化 */
:deep(.ivu-btn-primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.ivu-btn-primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .system-title h1 {
    font-size: 20px;
  }
  
  .login-title h2 {
    font-size: 24px;
  }
}
</style>
