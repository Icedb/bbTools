<template>
  <el-container class="container">
    <el-header class="header">
      <el-affix>
        <div class="affix">
          <div class="affix-left">
            <el-tooltip effect="light" content="返回首页" placement="right">
              <img src="@/assets/images/qiyana.png" alt="返回首页" class="affix-logo" @click="goto">
            </el-tooltip>
            <el-carousel height="40px" direction="vertical" :interval="10000" indicator-position='none'
              class="tips hidden-sm-and-down">
              <el-carousel-item v-for="item in tipText" :key="item">
                <p>{{ item }}</p>
              </el-carousel-item>
            </el-carousel>
          </div>
          <div class="affix-right">
            <el-menu class="el-menu-demo" mode="horizontal" :ellipsis='false' background-color="#545c64" text-color="#fff"
              :default-active='activeIndex' router active-text-color="#ffd04b">
              <el-menu-item index="/typeIn">
                <el-icon :size="14"><Odometer /></el-icon>
                数据管理</el-menu-item>
              <el-menu-item index="/battle">
                <el-icon :size="14"><PieChart /></el-icon>
                团战分析</el-menu-item>
              <el-menu-item index="/level">
                <el-icon :size="14"><DataLine /></el-icon>
                团本分析</el-menu-item>
              <el-menu-item index="/help">
                <el-icon :size="14"><Help /></el-icon>
                帮助</el-menu-item>
            </el-menu>
            <img @click="toGit" src="@/assets/images/github.png" alt="github" class="github" />
          </div>
        </div>
      </el-affix>
    </el-header>
    <el-main class="main">
      <slot></slot>
    </el-main>
    <el-footer class="footer">
      <p> 个人闲暇时间制作，有问题请发送至：bbtools@126.com <span class="by-line">(改不改不一定)</span></p>
      <p class="by">v {{ version }}</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { defineOptions, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { PieChart, Odometer, DataLine, Help } from '@element-plus/icons-vue'

defineOptions({
  name: 'Layout'
})

const version = __APP_VERSION__

const tipText = ref([
  '本工具旨在于帮助提升团员打团效率，请勿过度责怪团员',
  '和我打一辈子崩崩吧，我什么都会做的',
  '恢复全勤实物奖励！！！',
  '广告位招租'
])

const activeIndex = ref('')

const route = useRoute()

watch(
  () => route.path,
  (to) => {
    activeIndex.value = to
  }
)

function goto() {
  router.push('/')
}

function toGit() {
  window.open('https://github.com/Icedb/bbTools')
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  height: 100vh;
}

.el-carousel__item p {
  font-size: 14px;
  line-height: 40px;
  margin: 0;
}

.header {
  padding: 0;

  .affix {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #545c64;
    width: 100%;
    padding: 0 30px;

    .affix-left {
      display: flex;
      align-items: center;

      .affix-logo {
        width: 40px;
        cursor: pointer;
        height: 40px;
        margin-right: 10px;
      }

      p {
        color: #fff;
      }

      .tips {
        width: 500px;
      }
    }
    .affix-right{
      display: flex;
      align-items: center;
      .github{
        margin-left: 10px;
        width: 26px;
        height: 26px;
        cursor: pointer;
      }
    }
  }

  .el-menu-demo {
    justify-content: flex-end;
  }

  // display: flex;
  // padding: 0 2rem;
  // justify-content: flex-end;
}

.main {
  padding: 0;
  // background: #f8fafc;
  // font-weight: normal;
  // max-width: 1600px;
  // padding: torem(20) torem(50);
  // margin: 0 auto;

}

.footer {
  display: flex;
  background: #f8fafc;
  // justify-content: end;
  flex-direction: column;
  align-items: flex-end;
  // margin: 200px auto 20px;
  // margin-top: torem(20);
  padding-top: 1vw;
  box-sizing: content-box;
  border-top: 1px solid #dfdcdc;
  font-size: 16px;

  .by {
    font-size: 12px;
  }

  .by-line {
    font-size: 12px;
    text-decoration: line-through;
  }
}
</style>
