# BB-Tools

崩崩数据分析工具，基于 Electron + Vite + Vue 3 构建，可在桌面端快速实现数据管理与可视化。

## 功能
- 团员信息文件一次性导入
- 团本、团战数据可视化查看与导入

## 主要依赖
- "electron": "^29.1.1"  
- "electron-builder": "^24.13.3"  
- "echarts": "^5.6.0"  
- "element-plus": "^2.9.1"  
- "vue": "^3.4.21"  
- "vue-router": "^4.5.0"  
- "vuex": "^4.1.0"  
- 以及其他脚手架和工具

## 使用说明
1. 克隆项目：  
   git clone
2. 安装依赖：  
   npm install
3. 开发模式：  
   npm run dev
4. 构建打包：  
   npm run build
5. 预览：  
   npm run preview

## 目录构成
- src：前端源码（Vue 组件、路由等）
- electron：Electron 主进程与预加载脚本
- package.json：项目配置与依赖管理

## 许可证
本项目使用 MIT 开源许可证，详细信息请查阅 LICENSE 文件。