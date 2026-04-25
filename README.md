# 田智枢 AgriNexus

田间科研试验监测与决策平台。

`AgriNexus` 当前定位为一套面向稻田科研试验的 Web 平台原型与可运行全栈骨架，强调：

- 全生育期连续监测
- 主—再关键期专题分析
- 试验执行与样品管理
- 预警联动与决策支持
- 物联网设备与网关工程视图

当前仓库已经从早期的通用设施农业演示项目，重构为一套更贴近田间科研试验场景的中文桌面端平台。

## 当前定位

平台采用“两层结构”：

- 通用平台层：
  首页、田间监测、试验管理、数据分析、预警中心、设备与网关、系统设置
- 专题分析层：
  当前专题为“主—再关键期：水分调控与再生响应”，入口位于“试验管理”页面内部

当前 UI 重点围绕再生稻试验进行演示，但底层结构按通用科研平台组织，没有把专题逻辑写死到全部页面中。

## 技术栈

### 前端

- `Vite 8`
- `React 18`
- `React Router`
- `Tailwind CSS`
- `axios`
- `lucide-react`

### 后端

- `Node.js`
- `Fastify 5`
- `@fastify/cors`
- `better-sqlite3`
- `SQLite`

## 当前页面

### 1. 首页

平台总控页，主要回答：

- 当前试验是否稳定
- 当前处于哪个生育阶段
- 哪些小区存在高风险
- 当前是否进入关键窗口
- 应该进入哪个下一级页面继续分析

首页当前包含：

- KPI 总览
- 全生育期时间轴与关键窗口状态
- 关键实时参数概览
- 24 小区试验矩阵总览
- 当前报警与决策建议

### 2. 田间监测

单小区全过程监测页，包含：

- 整季过程
- 关键窗口
- 田间记录
- 科研样品

“整季过程”当前包含：

- 实时参数卡
- 设备状态区
- 全生育期田面水位变化曲线
- 全生育期土壤张力变化曲线
- 温度 / 湿度 / CO₂ 日变化
- PAR / 光照 / 冠层温度与降雨响应

### 3. 试验管理

科研试验执行中台，当前包含：

- 试验概况
- 试验设计可视化
- 关键事件日历
- 数据采集计划
- 样品管理
- 数据完整性面板
- “主—再关键期专题”入口卡

### 4. 主—再关键期专题页

位于：

- `/experiments/ratoon-water-window`

当前用于承载更学术、更专题化的深入展示，包括：

- 窗口期总览
- 水分控制分析
- 芽启动分析
- 气体脉冲分析
- 根际过程分析
- 13C 碳分配分析

### 5. 数据分析

通用科研数据中心，分为两层：

- 整季过程分析
- 关键窗口机制分析（摘要版）

### 6. 预警中心

科研试验报警平台，覆盖：

- 水分控制类报警
- 设备通讯类报警
- 试验执行类报警

### 7. 设备与网关

物联网工程页，当前展示：

- 田间监测节点
- LoRa 网关
- 4G 上行链路
- 电源与通讯状态
- 固件、缓存、心跳与传感器健康

### 8. 系统设置

底层配置页，当前展示：

- 报警阈值配置
- 水分控制规则
- 传感器校准记录
- 用户权限
- 数据导出
- 备份与恢复
- API 接入
- 日志审计

## 前端路由

| 路由 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/monitoring` | 田间监测 |
| `/experiments` | 试验管理 |
| `/experiments/ratoon-water-window` | 主—再关键期专题页 |
| `/analysis` | 数据分析 |
| `/alerts` | 预警中心 |
| `/devices` | 设备与网关 |
| `/settings` | 系统设置 |

兼容跳转：

- `/greenhouses` -> `/monitoring`
- `/research` -> `/experiments`

## 后端接口

后端当前采用兼容式结构：

- 旧 Smart-Agri 接口继续保留，避免破坏已有演示骨架
- 新增 AgriNexus 田间试验接口，用于小区、节点、读数、报警、样品、规则与同步
- 前端当前仍主要使用本地演示数据，后续可以逐步切换到 `/api/platform/*`

### 基础

- `GET /health`

### AgriNexus 平台接口

- `GET /api/platform/dashboard`
- `GET /api/platform/experiment`
- `GET /api/platform/treatments`
- `GET /api/platform/plots`
- `GET /api/platform/plots/:plotCode`
- `PATCH /api/platform/plots/:plotCode`
- `GET /api/platform/readings`
- `GET /api/platform/alerts`
- `PATCH /api/platform/alerts/:alertCode`
- `GET /api/platform/devices/gateways`
- `GET /api/platform/devices/nodes`
- `GET /api/platform/tasks`
- `GET /api/platform/samples`
- `POST /api/platform/samples`
- `GET /api/platform/timeline`
- `GET /api/platform/rules`
- `PATCH /api/platform/rules/:code`
- `GET /api/platform/sync/changes`
- `POST /api/platform/sync/batch`

### IoT 接入接口

- `POST /api/iot/ingest`
- `POST /api/iot/heartbeat`

`/api/iot/ingest` 可接收 ESP32-S3 后续上报的数据。当前支持的常用字段包括：

- `plotCode`
- `nodeCode` / `deviceId`
- `timestamp`
- `metrics.temp`
- `metrics.hum`
- `metrics.waterLevelCm`
- `metrics.soilTensionKpa`
- `metrics.uvA`
- `metrics.uvB`
- `metrics.uvC`
- `metrics.latitude`
- `metrics.longitude`
- `metrics.altitudeM`
- `metrics.batteryV`
- `metrics.loraRssi`

示例：

```bash
curl -X POST http://127.0.0.1:3001/api/iot/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "plotCode": "P14",
    "nodeCode": "ESP32-S3-P14",
    "timestamp": "2026-04-25T12:00:00+08:00",
    "metrics": {
      "temp": 28.5,
      "hum": 72,
      "uvA": 1.23,
      "uvB": 0.18,
      "uvC": 0,
      "batteryV": 4.01,
      "loraRssi": -88,
      "latitude": 31.2987,
      "longitude": 120.5853
    }
  }'
```

### 旧兼容接口

这些接口保留用于兼容早期页面与旧演示数据。

### 首页 / 总览

- `GET /api/dashboard`

### 小区与监测对象

- `GET /api/greenhouses`

### 预警

- `GET /api/alerts`
- `PUT /api/alerts/:alertId/resolve`
- `PUT /api/alerts/resolve-all`
- `POST /api/alerts/export`

### 决策

- `POST /api/decisions/:decisionId/approve`
- `POST /api/decisions/:decisionId/ignore`

### 用户

- `GET /api/users`

### 系统设置

- `GET /api/settings`
- `PUT /api/settings/basic`
- `PUT /api/settings/rules`
- `POST /api/settings/rules/simulate`
- `PUT /api/settings/notifications`
- `POST /api/settings/notifications/test`
- `PUT /api/settings/security`
- `POST /api/settings/security/backup`
- `POST /api/settings/security/rotate-token`
- `PUT /api/settings/ops`
- `POST /api/settings/ops/health-check`
- `POST /api/settings/export`
- `POST /api/settings/integrations/:integrationId/toggle`
- `POST /api/settings/integrations/:integrationId/test`
- `POST /api/settings/integrations/:integrationId/rotate-key`
- `POST /api/settings/snapshots`
- `POST /api/settings/snapshots/:snapshotId/restore`
- `POST /api/settings/logs/archive`

## 项目结构

```text
AgriNexus/
├── frontend/
│   ├── src/
│   │   ├── components/        # 平台组件、布局组件
│   │   ├── config/            # 导航与页面标题配置
│   │   ├── data/              # 页面演示数据与平台 mock 数据
│   │   ├── hooks/             # App shell / message 等 hooks
│   │   ├── layouts/           # 主布局
│   │   ├── lib/               # axios 实例等基础库
│   │   └── pages/             # 页面模块
│   └── package.json
├── backend/
│   ├── data/                  # SQLite 数据文件
│   ├── src/
│   │   ├── database/          # 数据库初始化、重置、校验
│   │   ├── repositories/      # 数据访问层
│   │   ├── routes/            # API 路由
│   │   ├── app.js             # Fastify 应用构建
│   │   └── server.js          # 服务入口
│   └── package.json
├── package.json               # workspace 根配置
└── README.md
```

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+

如果当前 shell 没有自动加载 `nvm`，先执行：

```bash
source ~/.nvm/nvm.sh
```

### 安装依赖

```bash
source ~/.nvm/nvm.sh
npm install
```

### 启动前端

```bash
source ~/.nvm/nvm.sh
npm run dev:frontend
```

默认地址：

- 本机：[http://localhost:5173/](http://localhost:5173/)

### 启动后端

```bash
source ~/.nvm/nvm.sh
npm run dev:backend
```

默认地址：

- 本机：[http://127.0.0.1:3001/](http://127.0.0.1:3001/)
- 健康检查：[http://127.0.0.1:3001/health](http://127.0.0.1:3001/health)

### 常用命令

```bash
# 构建前端
npm run build:frontend

# 后端数据库校验
npm run db:verify --workspace backend

# 重置数据库
npm run db:reset --workspace backend
```

## 跨设备访问

当前开发环境已兼容局域网访问：

- 前端默认监听 Vite 开发地址
- 后端默认监听 `0.0.0.0:3001`
- 开发态 CORS 允许 `localhost`、`127.0.0.1` 和常见局域网地址访问
- 前端默认 API 地址会跟随当前页面主机名拼接 `:3001/api`

这意味着在同一局域网内，用其他设备打开前端页面时，可以直接连到当前机器上的后端。

## 数据库说明

项目当前使用 SQLite。

实际数据库文件路径由后端代码固定为：

- `backend/data/smart-agri.db`

说明：

- 品牌已经重构为 `AgriNexus`
- 但数据库文件名当前仍为 `smart-agri.db`
- 这是当前实现状态，不是文档笔误
- 数据库中同时包含旧兼容表与新的 AgriNexus 田间试验表
- 新表采用 `field_*` 前缀，例如 `field_plots`、`field_readings`、`field_alerts`
- 后端启动或执行 `db:verify` 时，会非破坏性初始化 AgriNexus 演示数据

## 当前状态

当前仓库的重点是：

- UI 与页面信息架构持续迭代
- 前端页面可直接运行和展示
- 后端接口可为首页、预警、设置等模块提供真实响应
- 适合作为科研项目汇报原型、交互演示和后续开发底座

## 仓库地址

- GitHub: [git@github.com:zhangsxphd/AgriNexus.git](git@github.com:zhangsxphd/AgriNexus.git)
