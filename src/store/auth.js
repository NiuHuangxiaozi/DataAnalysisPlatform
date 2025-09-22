import { defineStore } from 'pinia'
import axios from 'axios'
import { authAPI } from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    token: null
  }),

  getters: {
    // 获取认证状态
    getAuthStatus: (state) => state.isAuthenticated
  },

  actions: {
    // 账号密码登录
    async login(username, password) {
      try {
        // 简单的账号密码验证 (账号密码都是123)
        if (username === '123' && password === '123') {
          this.isAuthenticated = true
          this.user = { username }
          this.token = 'mock-token'
          return { success: true }
        } else {
          return { success: false, message: '账号或密码错误' }
        }
      } catch (error) {
        return { success: false, message: '登录失败' }
      }
    },

    // 单点登录验证token
    async verifyToken(token) {
      try {

        const response = await authAPI.verify_token()
        
        if (response.status === 200) {
          this.isAuthenticated = true
          this.token = token
          this.user = response.data.user || { username: 'SSO用户' }
          
          // 缓存这个token
          localStorage.setItem("assess_token", token)
          return { success: true }
        } else {
          return { success: false, message: 'Token验证失败' }
        }
      } catch (error) {
        console.error('Token验证错误:', error)
        return { success: false, message: 'Token验证失败' }
      }
    },

    // 登出
    logout() {
      this.isAuthenticated = false
      this.user = null
      this.token = null
    }
  }
})
