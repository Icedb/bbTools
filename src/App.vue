<template>
  <layout>
    <RouterView />
  </layout>
</template>
<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus';
import { onMounted } from 'vue';

const router = useRouter()

window.ipcRenderer.on('message', (event, message, type='success') => {
  ElMessage({
    message: message,
    type: type
  });
});

onMounted(() => {
  // 跳转首页，打包后默认不跳转
  router.push('/')
});

</script>
<style>
@import '@/assets/base.css';

</style>
