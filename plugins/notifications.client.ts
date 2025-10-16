// 注册通知插件
import { setNotificationInstance } from './notification'

export default defineNuxtPlugin((nuxtApp) => {
  // 通知组件挂载后调用这个函数设置实例
  nuxtApp.provide('setNotificationInstance', setNotificationInstance)
})