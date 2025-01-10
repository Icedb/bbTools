<template>
  <layout>
    <RouterView />
  </layout>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElMessage } from 'element-plus';

window.ipcRenderer.on('message', (event, message, type='success') => {
  ElMessage({
    message: message,
    type: type
  });
});

</script>
<style>
@import '@/assets/base.css';

</style>
