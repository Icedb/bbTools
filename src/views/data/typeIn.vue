<template>
  <el-scrollbar v-loading="fullLoading">
    <div class="home-box">
      <div class="title-box">
        <h2>米游社 cookie</h2>
        <el-tooltip class="box-item" effect="light" content="输入从米游社获取的cookie，详情请查看帮助" placement="right">
          <el-icon size="18px" color='#f56c6c'><question-filled /></el-icon>
        </el-tooltip>
      </div>
      <el-row align="middle" style="margin-bottom: 50px">
        <el-col :span="22">
          <el-input v-model="cookie" clearable autosize :disabled="cookieDisabled" />
        </el-col>
        <el-col :span="1" :offset="1">
          <el-icon :size="22" @click="cookieLock">
            <lock v-if="cookieDisabled" />
            <Unlock v-else />
          </el-icon>
        </el-col>
      </el-row>
      <div class="flex-between">
        <div class="title-box">
          <h2>分组信息 <span v-show="isModify" class="modify-tip">*</span></h2>
          <el-button type="primary" size='small' circle class="add-btn" @click="beforeAddGroup()"><el-icon
              style="font-size: 14px;">
              <plus />
            </el-icon></el-button>
        </div>
        <div>
          <el-link type="primary" class="down-template" @click="downloadTemplate" :icon="Download">下载成员名单模板</el-link>
          <el-button type="primary" @click="uploadExcel" :icon="Upload">导入成员信息
            <el-tooltip effect="light" content="下载名单模板，然后按照模板规则填写信息并导入" placement="top">
          <el-icon size="18px"  class="right-icon" ><question-filled /></el-icon>
        </el-tooltip></el-button>
        </div>
      </div>
      <el-row :gutter="20">
        <el-col :lg="8" :xs="24" :sm="12" v-for="(item, gIndex) in groupList" :key="gIndex">
          <div class="group-title">
            <div class="group-name">
              <h3>{{ item.groupName }}</h3>
              <el-button type="primary" size="small" circle
                @click="editGroupName(gIndex)"><el-icon><edit-pen /></el-icon></el-button>
            </div>
            <el-button type="danger" size="small" circle @click="deleteGroup(gIndex, item.groupName)"><el-icon>
                <Close />
              </el-icon></el-button>
          </div>
          <!-- 优化1：增加编辑分队和增加删除 -->
          <!-- <input type="text" class="my-input"> -->
          <el-scrollbar max-height="600px">
            <div class="list-group">
              <!-- 此处为表头 -->
              <div class="list-title">
                <el-row align="middle">
                  <el-col :span="2">
                    <p style="font-size: 12px;">移动</p>
                  </el-col>
                  <el-col :span="6">
                    <p>昵称</p>
                  </el-col>
                  <el-col :span="7">
                    <p>uid</p>
                  </el-col>
                  <el-col :span="2">
                    <p class="state">状态</p>
                  </el-col>
                  <el-col :span="7">
                    <p>操作</p>
                  </el-col>
                </el-row>
              </div>
              <draggable group="people" itemKey="name" handle=".rank-col" @start="startDrag" @add="addDrag">
                <template v-for="(element, index) in item.group" :key="index">
                  <div v-if="element.hasEdit == 0">
                    <el-row align="middle" class="list-item">
                      <el-col :span="2" class="rank-col">
                        <el-icon>
                          <expand />
                        </el-icon>
                      </el-col>
                      <el-col :span="6">
                        <p>{{ element.name }}</p>
                      </el-col>
                      <el-col :span="7">
                        <p>{{ element.uid }}</p>
                      </el-col>
                      <el-col :span="2">
                        <p class="state" v-if="!element.profile && !element.message">未获取</p>
                        <p class="state" v-else-if="element.profile && !element.message">已获取</p>
                        <el-tooltip class="box-item" effect="light" :content="element.message || '数据异常'" placement="top"
                          v-else>
                          <el-icon color="#f56c6c" class="col-warning">
                            <warning />
                          </el-icon>
                        </el-tooltip>
                      </el-col>
                      <el-col :span="7" class="operation-btn">
                        <el-tooltip class="box-item" effect="light" content="单独获取本成员数据" placement="top">
                          <el-icon @click="refreshPeople(element)" style="cursor: pointer">
                            <refresh />
                          </el-icon>
                        </el-tooltip>

                        <el-icon @click="editPeople(gIndex, index)" style="cursor: pointer"><edit-pen /></el-icon>
                        <el-icon @click="deletePeople(gIndex, index, element.name)"
                          style="cursor: pointer"><delete-filled /></el-icon>
                      </el-col>
                    </el-row>
                  </div>
                  <div v-else class="operation-box">
                    <el-row align="middle">
                      <el-col :span="2" class="rank-col">
                        <el-icon>
                          <expand />
                        </el-icon>
                      </el-col>
                      <el-col :span="6">
                        <input type="text" v-model="nowPeopleName" placeholder="请输入昵称">
                      </el-col>
                      <el-col :span="7">
                        <input type="number" v-model="nowPeopleUid" placeholder="请输入uid">
                      </el-col>
                      <el-col :span="2">
                        <p class="state">状态</p>
                      </el-col>
                      <el-col :span="7">
                        <el-button type="warning" size="small" @click="cancelEdit(gIndex, index)">取消</el-button>
                        <el-button type="primary" size="small" @click="saveEdit(gIndex, index)">保存</el-button>
                      </el-col>
                    </el-row>
                  </div>

                </template>
              </draggable>
              <div class="add-box">
                <div class="list-add justify-center" v-if="item.hasAdd == 0">
                  <el-button type="primary" @click="addPeople(gIndex)"><el-icon class="el-icon--left">
                      <Plus />
                    </el-icon>添加成员</el-button>
                </div>
                <div v-else class="operation-box">
                  <el-row align="middle">
                    <el-col :span="2" class="rank-col">
                    </el-col>
                    <el-col :span="6">
                      <input type="text" v-model="nowPeopleName" placeholder="请输入昵称">
                    </el-col>
                    <el-col :span="7">
                      <input type="number" v-model="nowPeopleUid" placeholder="请输入uid">
                    </el-col>
                    <el-col :span="2">
                      <p class="state">状态</p>
                    </el-col>
                    <el-col :span="7" class="operation-btn">
                      <el-button type="warning" size="small" @click="cancelAdd(gIndex)">取消</el-button>
                      <el-button type="primary" size="small" @click="saveAdd(gIndex)">保存</el-button>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </el-col>
        <!-- <el-col :lg="8" :xs="24">
          <div class="group-title">
            <div class="group-name">
              <h3>添加新的分组</h3>
            </div>
          </div>
          <el-card shadow="hover" class="add-card">
            <el-form
              ref="ruleFormRef"
              :model="addRuleForm"
              label-position='top'
              :rules="rules"
              label-width="120px"
            >
              <el-form-item prop="name" label="清输入分组名">
                <el-input v-model="addRuleForm.name" clearable placeholder="请输入分组名" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size='large' circle class="add-btn" @click="addGroup(ruleFormRef)"><el-icon style="font-size: 28px;"><plus /></el-icon></el-button>
              </el-form-item>
            </el-form>

          </el-card>
        </el-col> -->
      </el-row>

      <h2 style="margin-top: 50px;"> </h2>
      <el-button @click="getUserGroupData">获取数据</el-button>
      <el-button type="primary" @click="saveGroupAndEditChart"><el-icon
          class="el-icon--left"><document-add /></el-icon>保存分组数据</el-button>
      <el-button type="warning" @click="clearGroupData"><el-icon class="el-icon--left">
          <Delete />
        </el-icon>清空已获取数据</el-button>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
/**
 * import 组件和库
 */
import { ref, onMounted, reactive, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { ElMessageBox, ElMessage } from 'element-plus';
import { getUserSingleData } from '@/utils/getData';
import type { PeopleData } from '@/utils/getData';
import loadExcel from '@/utils/loadExcel';

import {
  VueDraggableNext as draggable
} from 'vue-draggable-next'
import {
  Lock,
  Unlock,
  Upload,
  QuestionFilled,
  DocumentAdd,
  DeleteFilled,
  Download,
  Delete,
  EditPen,
  Plus,
  Close,
  Refresh,
  Expand,
  Warning
} from "@element-plus/icons-vue";
import type { FormInstance } from 'element-plus';

/**
 * 定义响应式数据
 */
let serverName = '';
const groupList = ref([
  { groupName: '分队 1', hasAdd: 0, group: <any>[] },
  { groupName: '分队 2', hasAdd: 0, group: <any>[] },
  { groupName: '分队 3', hasAdd: 0, group: <any>[] },
]);

const isModify = ref(false);
const nowPeopleName = ref('');
const nowPeopleUid = ref();
const groupIndex = ref(-1);
const peopleIndex = ref(-1);

const addRuleForm = reactive({ name: '' });

const cookieDisabled = ref(false);
const cookie = ref('');
const fullLoading = ref(false);



/**
 * 生命周期钩子
 */
onMounted(() => {
  serverName = <any>window.localStorage.getItem('serverName');
  const c = <any>window.localStorage.getItem('cookie');
  const cL = <any>window.localStorage.getItem('cookieLock');
  cookieDisabled.value = cL == 'true';
  if (c) cookie.value = c;
  const groupData = <any>window.localStorage.getItem('groupData');
  if (groupData) {
    groupList.value = JSON.parse(groupData);
  }
  // 监听groupList变化，更改isModify状态
  watch(groupList, () => {
    isModify.value = true;
  }, { deep: true, immediate: false });
});

onBeforeRouteLeave((to, from, next) => {
  if (!isModify.value) {
    next();
    return;
  }
  ElMessageBox.confirm('当前信息未保存，离开此页面将不做保存，是否离开？', 'Warning', {
    title: '警告',
    confirmButtonText: '离开',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => next())
    .catch(() => { });
});

/**
 * 方法逻辑
 */
// 保存groupList数据
const saveGroupAndEditChart = () => {
  try {
    window.localStorage.setItem('groupData', JSON.stringify(groupList.value));
    isModify.value = false;
    ElMessage({ type: 'success', message: '保存成功' });
  } catch (error) {
    ElMessage({ type: 'error', message: `保存失败，${error}` });
  }
};

// 编辑分组名称
const editGroupName = (index: number) => {
  ElMessageBox.prompt('请输入要修改的分组名称', 'Tip', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(({ value }) => {
      groupList.value[index].groupName = value;
      // isModify.value = true;
    })
    .catch(() => { });
};

// 删除分组
const deleteGroup = (index: number, groupName: string) => {
  ElMessageBox.confirm(`确认要删除分组：${groupName}吗？`, 'Warning', {
    title: '警告',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      groupList.value.splice(index, 1);
      ElMessage({ type: 'success', message: `已删除分组：${groupName}` });
      // isModify.value = true;
    })
    .catch(() => { });
};

// 添加分组
const beforeAddGroup = () => {
  ElMessageBox.prompt('请输入要添加的分组名称', 'Tip', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(({ value }) => {
      if (value) {
        groupList.value.push({ groupName: value, hasAdd: 0, group: [] });
        ElMessage({ type: 'success', message: '添加分组成功' });
        // isModify.value = true;
      }
    })
    .catch(() => { });
};

const addGroup = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      groupList.value.push({ groupName: addRuleForm.name, hasAdd: 0, group: [] });
      ElMessage({ type: 'success', message: '添加分组成功' });
      // isModify.value = true;
    }
  });
};

// 还原上一操作状态
const restore = () => {
  if (groupIndex.value > -1) {
    if (peopleIndex.value > -1) {
      groupList.value[groupIndex.value].group[peopleIndex.value].hasEdit = 0;
    } else {
      groupList.value[groupIndex.value].hasAdd = 0;
    }
  }
};

const startDrag = () => {
  restore();
  groupIndex.value = -1;
  peopleIndex.value = -1;
};

const addDrag = () => {
  isModify.value = true;
};

const addPeople = (index: number) => {
  restore();
  groupIndex.value = index;
  peopleIndex.value = -1;
  nowPeopleName.value = '';
  nowPeopleUid.value = '';
  groupList.value[index].hasAdd = 1;
};

const cancelAdd = (index: number) => {
  groupList.value[index].hasAdd = 0;
};

const saveAdd = (index: number) => {
  if (!nowPeopleName.value) {
    ElMessage({ type: 'error', message: '成员名不能为空' });
    return;
  }
  if (!nowPeopleUid.value) {
    ElMessage({ type: 'error', message: '成员uid不能为空' });
    return;
  }
  groupList.value[index].group.push({
    name: nowPeopleName.value,
    uid: nowPeopleUid.value,
    hasEdit: 0,
  });
  groupList.value[index].hasAdd = 0;
  // isModify.value = true;
};

// 获取用户数据，refreshPeople和getUserGroupData两个方法使用，返回promise供getUserGroupData全量获取使用
const getUserData = (userData: PeopleData) => {
  return getUserSingleData({ uid: userData.uid, server: serverName }).then(
    (res: any) => {
      if (res && res.data && res.retcode == 0) {
        cookieDisabled.value = true;
        const singleData = res.data.profile;
        // isModify.value = true;
        return singleData;
      } else {
        cookieDisabled.value = false;
        throw new Error(res.message || '获取数据失败');
      }
    }
  )
}

// 刷新单个用户数据
const refreshPeople = (
  userData: PeopleData
) => {
  if (!cookie.value) {
    ElMessage({ type: 'error', message: '请输入cookie' });
    return;
  }
  ElMessageBox.confirm(`确认要单独获取成员 ${userData.name} 的团战数据吗？`, 'Warning', {
    title: '确认',
    confirmButtonText: '获取',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      fullLoading.value = true;
      return getUserData(userData);
    })
    .then((res) => {
      fullLoading.value = false;
      userData.message = '';
      if (res) {
        userData.profile = res || '';
        ElMessage({ type: 'success', message: '获取成功' });
      }
    })
    .catch((error) => {
      fullLoading.value = false;
      userData.message = error.message;
      userData.profile = '';
      ElMessage({ type: 'error', message: error.message });
     });
};

// 批量获取用户数据
const getUserGroupData = async () => {
  if (!cookie.value) {
    ElMessage({ type: 'error', message: '请输入cookie' });
    return;
  }
  let hasPeople = false;
  for (const g of groupList.value) {
    if (g.group.length) {
      hasPeople = true;
      break;
    }
  }
  if (!hasPeople) {
    ElMessage({ type: 'error', message: '请输入至少一个成员' });
    return;
  }
  window.localStorage.setItem('cookie', cookie.value);
  // 遍历groupList 获取每个分组的数据，如果有数据则不再获取
  fullLoading.value = true;
  const promiseAllData = []
  for (const gData of groupList.value) {
    for (const pData of gData.group) {
      if (!pData.profile) {
        promiseAllData.push(getUserData(pData).then((res) => {
          pData.message = '';
          pData.profile = res || '';
        }).catch((error) => {
          pData.message = error.message;
          pData.profile = '';
        }));
      }
    }
  }
  Promise.all(promiseAllData).then((res) => {
    fullLoading.value = false;
    cookieDisabled.value = true

    ElMessage({ type: 'success', message: '获取成功，请前往图表分析查看' });
  }).catch(() => {
    fullLoading.value = false;
  });
    

}

const editPeople = (index: number, people: number) => {
  restore();
  groupIndex.value = index;
  peopleIndex.value = people;
  nowPeopleName.value = groupList.value[index].group[people].name;
  nowPeopleUid.value = groupList.value[index].group[people].uid;
  groupList.value[index].group[people].hasEdit = 1;
};

const cancelEdit = (index: number, people: number) => {
  groupList.value[index].group[people].hasEdit = 0;
};

const saveEdit = (index: number, people: number) => {
  if (!nowPeopleName.value) {
    ElMessage({ type: 'error', message: '成员名不能为空' });
    return;
  }
  if (!nowPeopleUid.value) {
    ElMessage({ type: 'error', message: '成员uid不能为空' });
    return;
  }
  const gp = groupList.value[index].group[people];
  gp.name = nowPeopleName.value;
  gp.uid = nowPeopleUid.value;
  gp.hasEdit = 0;
  gp.battle_info = null;
  gp.message = '';
  // isModify.value = true;
};

const deletePeople = (index: number, people: number, peopleName: string) => {
  ElMessageBox.confirm(`确认要删除成员：${peopleName}吗？`, 'Warning', {
    title: '警告',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      restore();
      groupList.value[index].group.splice(people, 1);
      // isModify.value = true;
    })
    .catch(() => { });
};

const cookieLock = () => {
  cookieDisabled.value = !cookieDisabled.value;
  window.localStorage.setItem('cookieLock', String(cookieDisabled.value));
  if (cookieDisabled.value) {
    window.localStorage.setItem('cookie', cookie.value);
  }
};

// 清空已获取缓存数据
const clearGroupData = () => {
  ElMessageBox.confirm('确认要清空已获取的成员缓存数据吗？（清空后需重新请求获取）', 'Warning', {
    title: '警告',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      for (const gData of groupList.value) {
        for (const pData of gData.group) {
          pData.message = '';
          pData.profile = null;
        }
      }
      ElMessage({ type: 'success', message: '已清空全部成员缓存数据' });
    })
    .catch(() => { });
};

// 上传
const uploadExcel = () => {
  // ElMessage({ type: 'info', message: '暂未开放' });
  fullLoading.value = true;
  loadExcel().then((res: any) => {
    console.log('获取结果：');
    console.log(res);
    fullLoading.value = false;
    if (!res || !res.length) {
      ElMessage({ type: 'error', message: '数据为空或不符要求' });
      return;
    }
    groupList.value = res;
  }).catch(() => {
    fullLoading.value = false;
    ElMessage({ type: 'error', message: '上传失败' });
  });
};

// 下载模板
const downloadTemplate = () => {
  // 改为主进程下载
  window.ipcRenderer.send('downloadTemplateFile');
}


  // getUserGroupData({ userObj: groupList.value, server: serverName }).then((res: any) => {
  //   loading.close();
  //   console.log('getUserGroupData==============');
  //   console.log(groupList.value);
  //   console.log(res);
  //   // if (res) {
  //   //   cookieDisabled.value = true;
  //   //   groupList.value = res.data;
  //   //   ElMessage({ type: 'success', message: '获取成功，请前往图表分析查看' });
  //   //   isModify.value = true;
  //   // } else {
  //   //   cookieDisabled.value = false;
  //   //   ElMessage({ type: 'error', message: 'cookie无效或已过期' });
  //   // }
  // }).catch(() => {
  //   loading.close();
  // });
</script>
<style scoped lang="scss">
.home-box {
  padding: 20px 50px 10px;

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .right-icon {
    margin-left: 4px;
  }

  .title-box {
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    h2 {
      margin-right: 10px;
    }
  }

  .down-template {
    margin-right: 10px;
    margin-top: 12px;
  }

  .group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    margin-top: 20px;
    margin-bottom: 10px;

    .group-name {
      display: flex;
      align-items: center;

      h3 {
        max-width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 15px;
      }
    }
  }

  .list-group {
    display: flex;
    flex-direction: column;
    padding-left: 0;
    margin-bottom: 0;
    border-radius: 5px;

    .list-title {
      width: 100%;
      background: #fff;

      .el-col {
        border: 1px solid var(--el-border-color);

        &+.el-col {
          border-left-width: 0;
        }

        p {
          height: 48px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.state {
            font-size: 12px;
          }
        }
      }
    }

    .list-item {
      background: #fff;

      .rank-col {
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .el-col {
        border: 1px solid var(--el-border-color);
        border-top-width: 0;
        min-height: 49px;

        &+.el-col {
          border-left-width: 0;
        }

        p {
          width: 100%;
          height: 49px;
          text-align: center;
          line-height: 49px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          &.state {
            font-size: 12px;
          }
        }
      }

      .operation-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
      }
    }

    .operation-box {
      .el-col {
        border: 1px solid var(--el-border-color);
        border-top-width: 0;
        min-height: 50px;

        &+.el-col {
          border-left-width: 0;
        }

        input {
          margin-left: 5px;
          border: none;
          height: 48px;
          width: 93%;
          outline: none;
        }

        .state {
          width: 100%;
          height: 50px;
          text-align: center;
          line-height: 50px;
          white-space: nowrap;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .el-button+.el-button {
          margin-left: 6px;
        }
      }
    }
  }

  .modify-tip {
    color: #f56c6c;
  }

  .list-add {
    position: relative;
    display: block;
    background-color: #fff;
    border: 1px solid var(--el-border-color);
    border-top-width: 0;
    height: 55px;
    align-items: center;
  }

  .add-box {
    .operation-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }

  .justify-center {
    display: flex;
    justify-content: center;
  }

  .fixed-width {
    width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .add-card {
    padding: 20px 0;
    text-align: center;

    .add-btn {
      margin: 35px auto 0;
    }
  }

  .col-warning {
    font-size: 20px;
    display: block;
    margin: 0 auto;
    height: 50px;
    line-height: 50px;
  }
}
</style>
