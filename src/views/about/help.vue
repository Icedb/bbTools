<template>
  <el-container>
    <el-aside width="280px" class="hidden-sm-and-down">
      <el-menu
      class="sidebar-group"
      :default-active="activeIndex"
    >
      <el-menu-item index="#help1"><a href="#help1">一、选择社团所在服务器</a></el-menu-item>
      <el-menu-item index="#help2"><a href="#help2">二、输入cookie与分组成员信息</a></el-menu-item>
      <el-menu-item index="#help3"><a href="#help3">三、修改成员数据</a></el-menu-item>
      <el-menu-item index="#help4"><a href="#help4">四、查看团战/团本数据分析</a></el-menu-item>
      <el-menu-item index="#help5"><a href="#help5">附录一 cookie的获取</a></el-menu-item>
      <el-menu-item index="#help6"><a href="#help6">附录二 常见问题</a></el-menu-item>
      <el-menu-item index="#help7"><a href="#help7">附录三 关于服务器选择</a></el-menu-item>
      <el-menu-item index="#help8"><a href="#help7">附录四 问题反馈</a></el-menu-item>
      </el-menu>
      <!-- <section class="sidebar-group">
        <a href="#help1">一、选择社团所在服务器</a>
        <a href="#help2">二、输入cookie与分组成员信息</a>
        <a href="#help3">三、修改成员数据</a>
        <a href="#help4">四、查看数据分析</a>
        <a href="#help5">附录一 cookie的获取</a>
      </section> -->
    </el-aside>
    <el-main>
      <!-- 日后优化：理论上scrollbar应该放在 layout 组件的main内，可以让所有页面都滚动，但是这里有个aside组件需要显示并且会跳转，所以暂时不改 -->
      <!-- 优化方向为：把aside也放在layout内，增加控制的变量用以控制什么时候显示，显示什么内容 -->
      <el-scrollbar height="73vh">
      <div class="help">
        <h1>使用帮助</h1>
        <h2 id="help1"> 一、选择社团所在服务器</h2>
        <p>1. 点击首页的服务器选框，可以选择社团所在的服务器，选择完毕后点击数据管理进入具体数据输入页面，如下图所示</p>
        <el-image
          class="help-img"
          :src="srcList[0]"
          :preview-src-list="srcList"
          :initial-index="0"
          fit="cover"
        />
        <h2 id="help2">二、输入cookie与分组成员信息</h2>
        <p>1. 在cookie输入框内输入米游社cookie（cookie获取见下方附录一），输入分组信息与分组成员，成员输入完成后点击 获取数据 按钮，获取成员的参团数据，无论是否获取数据，离开时都应点击 保存分组数据 按钮进行数据保存，否则 所有数据都不会保存（包括成员数据与参团数据），因为所有数据统一放在一个对象内（别问为什么，问就是懒得弄）
        </p>
        <p>2. 清空已获取数据 按钮，删除的是成员的参团数据，而不是清空输入的成员数据，如果要删除成员数据清点击删除成员或删除分组按钮</p>
        <p>3. 获取数据 按钮为获取全部成员的数据，如改成员已有数据，则会取已有的历史数据，而不会获取新数据，以减少获取数据次数</p>
        <el-image
          class="help-img"
          :src="srcList[1]"
          :preview-src-list="srcList"
          :initial-index="1"
          fit="cover"
        />
        <h2 id="help3">三、修改成员数据</h2>
        <p>1. 成员可以修改、删除、重新（单独）获取、移动分组</p>
        <p>2. 获取按钮可获取当前成员的单独数据，旨在于解决成员信息不匹配导致错误的错误等</p>
        <p>3. 修改成员后为了防止成员混乱，默认会删除当前已获取的数据，需要手动点击获取按钮重新获取</p>
        <p>4. 修改、获取等操作完毕后，需要点击 保存分组数据 按钮进行数据保存，方可查看</p>
        <el-image
          class="help-img"
          :src="srcList[2]"
          :preview-src-list="srcList"
          :initial-index="2"
          fit="cover"
        />
        <h2 id="help4">四、查看团战/团本数据分析</h2>
        <p>1. 数据分析分为文字信息与图表信息，各有分工</p>
        <p>2. 如果当前用户的文字信息不正确或报错，需要点击回 数据管理 页进行用户修改或数据重新获取等操作，保存后再次返回 数据分析 页查看</p>
        <p>3. </p>
        <el-image
          class="help-img"
          :src="srcList[3]"
          :preview-src-list="srcList"
          :initial-index="3"
          fit="cover"
        />
        <h2 id="help5">附录一 cookie的获取</h2>
        <p>这里以 Firefox 浏览器为例，首先点击右上角的应用程序菜单，选择“新建隐私窗口”。</p>
        <el-image
          class="help-img"
          :src="srcList[4]"
          :preview-src-list="srcList"
          :initial-index="4"
          fit="cover"
        />
        <p>在地址栏输入 https://bbs.mihoyo.com/ys/，按下回车键，打开米游社原神社区。</p>
        <el-image
          class="help-img"
          :src="srcList[5]"
          :preview-src-list="srcList"
          :initial-index="5"
          fit="cover"
        />
        <p>然后，点击右上角的米游兔图标，登录你要获取 Cookie 的米游社账号。</p>
        <el-image
          class="help-img"
          :src="srcList[6]"
          :preview-src-list="srcList"
          :initial-index="6"
          fit="cover"
        />
        <p>登录成功后，米游兔的图标变为你的米游社论坛头像。</p>
        <el-image
          class="help-img"
          :src="srcList[7]"
          :preview-src-list="srcList"
          :initial-index="7"
          fit="cover"
        />
        <p>这时新建书签，将下面的代码保存为书签。</p>
        <p>javascript:(function () { prompt("", document.cookie); })();</p>
        <el-image
          class="help-img"
          :src="srcList[8]"
          :preview-src-list="srcList"
          :initial-index="8"
          fit="cover"
        />
        <p>然后，在刚才登录好的米游社原神论坛页面上，点击刚才保存的书签，就可以得到米游社 Cookie 了，按下组合键 Ctrl+A 和 Ctrl+C，就可以复制到你的粘贴板里了。</p>
        <el-image
          class="help-img"
          :src="srcList[9]"
          :preview-src-list="srcList"
          :initial-index="9"
          fit="cover"
        />
        <h2 id="help6">附录二 常见问题</h2>
        <p>1. Data is not public for the user：成员未绑定米游社或米游社信息未公开</p>
        <p>2. 用户信息不匹配：用户uid不正确或用户服务器不正确</p>
        <p>3. params error：服务器信息不正确，大多数为服务器标识不正确</p>
        <p>4. cookie无效或已过期：字面意思，需要更换cookie</p>
        <p>5. 官方数据时间超长Bug：有时官方返回的数据上，会有初始时间超长的问题，如下图所示，此时可以通过点击 数据分析 页面的 起始 按钮(下图蓝框所标位置)，通过手动输入起始时间，把超出的时间减去，从而得到正确的时间
          (注：输入的是分钟为单位的时间)。我相信官方会解决此类Bug，所以并不会对输入的起始时间数据进行缓存，以防污染源数据</p>
        <p>如输入的时间不对，进入别的页面再次返回即可</p>
        <el-image
          class="help-img"
          :src="srcList[10]"
          :preview-src-list="srcList"
          :initial-index="10"
          fit="cover"
        />
        <h2 id="help7">附录三 关于服务器选择</h2>
        <p>目前只做了混服的原2144和国服，因为获取服务器标识需要相应服务器的账号，所以其他服务器信息暂未收录，如果需求大后续版本会加进去</p>
        <h2 id="help8">附录四 问题反馈</h2>
        <p>如果加了好友请直接发消息，如果没有好友请发送邮件至：bbtools@126.com</p>

      </div>
      </el-scrollbar>
    </el-main>
    </el-container>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import help1 from '@/assets/images/help/help1.png';
import help2 from '@/assets/images/help/help2.png';
import help3 from '@/assets/images/help/help3.png';
import help4 from '@/assets/images/help/help4.png';
import help5 from '@/assets/images/help/help5.png';
import help6 from '@/assets/images/help/help6.png';
import help7 from '@/assets/images/help/help7.png';
import help8 from '@/assets/images/help/help8.png';
import help9 from '@/assets/images/help/help9.png';
import help10 from '@/assets/images/help/help10.png';
import help11 from '@/assets/images/help/help11.png';
const srcList = [
  help1,
  help2,
  help3,
  help4,
  help5,
  help6,
  help7,
  help8,
  help9,
  help10,
  help11
];

const activeIndex = ref('#help1')
</script>
<style lang="scss" scoped>
.sidebar-group{
  height: 100%;
  a{
    display: block;
    font-size: 16px;
    height: 100%;
    width: 100%;
    text-decoration: initial;
    color: var(--brand-color);
  }
}
h2{
  margin: 10px 0;
}
p{
  font-size: 18px;
}
.help-img{
  margin: 20px 0;
  max-width: 70%;
}
</style>
