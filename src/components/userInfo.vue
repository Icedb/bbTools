<template>
  <el-tabs type="border-card" v-model="nowTabs" @tab-click="tabClick">
    <el-tab-pane :label="item.groupName" :name="gIndex" v-for="(item, gIndex) in groupList" :key="gIndex"
      v-if="groupList && groupList.length > 0">
      <el-tabs tab-position="left" style="height: 350px;" v-if="item.group && item.group.length > 0"
        :stretch="false">
        <el-tab-pane v-for="(people, pIndex) in item.group" :key="pIndex">
          <template #label>
            <p v-if="people" class="fixed-width">{{ people.name }}</p>
            <el-tooltip v-else class="box-item" effect="light" content="此位置有成员但未获取数据" placement="top">
              <p class="fixed-width">成员占位 <el-icon><question-filled /></el-icon></p>
            </el-tooltip>
          </template>
          <el-scrollbar height="350px">
            <p v-for="(battle, bIndex) in getGroupDataComputed(people)?.history" :key="bIndex"
              v-if="people && getGroupDataComputed(people).history && getGroupDataComputed(people).history.length > 0">
              在{{ formatTime(battle.enter_time - startTime) }}进入了{{ letter[battle.level_id] }}点，
              通关时间{{ battle.pass_time }}秒，贡献了{{ contributeCompute(battle.contribute_rate) }}%同步率
            </p>
            <p v-else-if="people && people.message">{{`请求报错：${people.message}`}}</p>
            <p
              v-else>
              暂无参团数据或数据报错
            </p>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
      <el-empty description="暂无本分组数据" v-else style="height:350px;" />
    </el-tab-pane>
    <el-empty description="请前往数据管理添加用户数据" v-else style="height:350px;" />
  </el-tabs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue'
import { GroupItem, PeopleData } from '@/types/analysis'
import { battleLetter, levelLetter, formatTime, contributeCompute } from '@/utils/index'

const props = defineProps({
  groupList: {
    type: Array as () => GroupItem[],
    default: () => []
  },
  historyId: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Number,
    default: 0
  },
  modelValue: {
    type: Number,
    default: 0
  },
  groupType: {
    type: String,
    default: 'battle'
  }
})

const emit = defineEmits(['tabClick', 'update:modelValue'])

const getGroupDataComputed = computed(() => {
  return (people: PeopleData) => {
    if (props.groupType === 'battle') {
      return people.profile?.battle_info?.history[props.historyId] || [];
    } else {
      return people.profile?.level_info || [];
    }
  };
});

const letter = computed(() => {
  if (props.groupType === 'battle') {
    return battleLetter
  } else {
    return levelLetter
  }
})

const nowTabs = computed({
  get: () => props.modelValue,
  set: val => {
    emit("update:modelValue", val);
  },
});

const tabClick = (tab: any) => {
  emit('tabClick', tab)
}



</script>

<style scoped lang="scss">
  
</style>