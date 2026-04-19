# JobTracker · 求职申请管理看板

一款面向校招 / 社招投递场景的 **单页 Web 应用**：用看板管理投递阶段，用日历与概览把握截止日与材料进度，数据保存在浏览器本地，开箱即用。

**仓库**：[github.com/Athena2026/job-tracker](https://github.com/Athena2026/job-tracker)

[English summary](#english-summary) · [在线演示](#在线演示)（部署后在此填写链接）

---

## 产品定位

把「投了哪些公司、卡在什么阶段、哪天截止、材料准备到哪一步」放在同一块屏幕里，减少表格与备忘录来回切换的成本。界面为深色主题，强调 **执行优先**：默认进入看板，概览与日历按需切换。

---

## 功能亮点

| 模块 | 说明 |
|------|------|
| **数据看板** | 总申请、进行中、本周截止、Offer、面试邀请率等 KPI 卡片，语义化配色 |
| **看板视图** | 多列流程（意向 → 投递 → 笔试 → 面试 → 待结果 → Offer / 结束），支持 **拖拽** 调整阶段与顺序（`@hello-pangea/dnd`） |
| **日历视图** | 月历展示每日截止分布；支持标签/城市筛选，并有「已应用筛选」提示与一键清除 |
| **本周概览** | 未来两周截止热力图（可点击某日查看当日明细抽屉）；材料准备进度与待办项高亮 |
| **申请详情抽屉** | 基本信息、标签、材料清单、面试时间线、备注；可跳转编辑弹窗 |
| **工具栏** | 看板：搜索 / 筛选 / 排序 / 新增申请；日历：精简筛选；概览页不展示列表工具，避免语义混淆 |
| **通知中心** | 截止临近提醒（含浏览器通知权限请求） |
| **持久化** | 使用 `zustand` + `persist` 将申请与通知写入 `localStorage`（键名：`job-tracker-storage`） |

---

## 技术栈

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS** 主题与布局
- **Zustand** 全局状态与持久化
- **date-fns** 日期处理
- **React Hook Form** + **Zod**（表单与校验，用于申请弹窗等）
- **ESLint** 静态检查

---

## 本地开发

```bash
npm install
npm run dev
```

浏览器访问终端提示的本地地址（通常为 `http://localhost:5173`）。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器（HMR） |
| `npm run build` | 类型检查 + 生产构建，产物在 `dist/` |
| `npm run preview` | 本地预览构建结果 |
| `npm run lint` | 全量 ESLint |

---

## 部署（静态托管）

构建命令：`npm run build`  
发布目录：`dist`

适用于 **腾讯云 EdgeOne Pages**、OSS 静态网站等：连接 Git 仓库后，将构建命令与输出目录按上表配置即可。`dist/` 与 `node_modules/` 已在 `.gitignore` 中忽略，云端构建即可。

---

## 目录结构（摘要）

```
src/
  App.tsx                 # 布局与主视图切换
  components/
    Board/                # 看板与拖拽
    Calendar/             # 日历
    Dashboard/            # 统计卡片与概览图表
    Drawer/               # 详情抽屉
    Modals/               # 新增/编辑申请
    UI/                   # 工具栏、通知中心
  store/useAppStore.ts    # 状态与持久化
  data/mockApplications.ts# 演示数据
  types/                  # 类型定义
  utils/                  # 工具函数
```

---

## English summary

**JobTracker** is a dark-themed SPA for tracking job applications: Kanban with drag-and-drop, a deadline calendar, a two-week overview with per-day drill-down, material progress, detail drawer, local persistence via Zustand, and optional deadline notifications. Stack: React 19, TypeScript, Vite, Tailwind, Zustand.

---

## 在线演示

> 部署完成后，将 EdgeOne Pages（或其他平台）的访问 URL 更新到本节。

---

## 版权声明

本仓库仅用于招聘测评，转载请注明出处，禁止商用。
