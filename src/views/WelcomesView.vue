<template>
  <div class="bg">
    <div class="title-box">
      <img src="@/assets/images/qiyana.png" alt="">
      <h1>团战信息查询分析工具<span>v {{ version }}</span></h1>
    </div>
    <div class="main-box">
      <!-- 使用帮助提示 -->
      <p class="suggest">
        欢迎使用，首次使用建议
        <el-link @click="goto('/help')">查看使用帮助</el-link>
        ，快速熟悉并使用本工具
      </p>
      <div class="select-server">
        <h2>请选择所在服务器</h2>
        <el-select
          v-model="serverName"
          class="m-2"
          style="width: 300px;"
          placeholder="Select"
          size="large"
          @change="changeServer"
        >
          <el-option
            v-for="item in serverList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>
    <el-button type="primary" class="goto" size="large" @click="goto('/home')">
      前往数据管理
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
// import { ipcRenderer } from 'electron'
// import { ipcRenderer } from 'electron'
// import type { Event } from 'electron'
import router from '@/router'
// import { getServerList } from '@/utils';

interface Server {
  name: string
  value: string
}

/* 从全局 store 中获取版本信息 */
const version = __APP_VERSION__
/* 服务器名称 */
const serverName = ref('')
const saved = window.localStorage.getItem('serverName')
if (saved) {
  serverName.value = saved
}

/* 服务器列表 */
const serverList = ref<Server[]>([])

/* 切换服务器并存储于本地存储 */
const changeServer = () => {
  window.localStorage.setItem('serverName', serverName.value)
}

/* 获取服务器数据 */
const receiveServerData = (event: any, server: Server[]) => {
  serverList.value = server
  if (!serverName.value) {
    serverName.value = serverList.value[0].value
  }
}
const getServer = () => {
  // 这里可以调用实际的获取服务器列表逻辑
  // 调用主进程的函数获取服务器列表
  window.ipcRenderer.on('getServer-reply', receiveServerData)
  window.ipcRenderer.send('getServer')

}

onMounted(() => {
  getServer()
})

/* 组件卸载前将目前选择的服务器写入本地存储 */
onBeforeUnmount(() => {
  window.localStorage.setItem('serverName', serverName.value)
})

/* 页面跳转函数 */
const goto = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.title-box {
  width: 100%;
  padding-top: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  img {
    width: 100px;
    height: 100px;
  }
  h1 {
    line-height: 1;
    margin-left: 10px;
    display: block;
    font-size: 24px;
    font-weight: 700;
    span {
      margin-left: 30px;
      font-weight: 500;
      font-size: 12px;
    }
  }
}
.main-box {
  margin: 50px auto 0;
  margin-top: 60px;
  padding: 0 40px;
  text-align: center;
  .suggest {
    font-size: 12px;
    margin-bottom: 30px;
    text-align: center;
    .el-link {
      font-size: 12px;
      vertical-align: baseline;
      cursor: pointer;
      color: var(--el-link-hover-text-color);
    }
  }
}
.select-server {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  h2 {
    margin: 10px 0 20px;
  }
}
.goto {
  display: block;
  margin: 160px auto 60px;
}
</style>