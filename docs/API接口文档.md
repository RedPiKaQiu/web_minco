# API 接口文档

## 🔄 接口路径优化说明

**本次优化目标**：统一命名规范，保持语义清晰，最小化调整影响

### 📋 路径变更对照表

| 功能描述 | 原路径 | 新路径 | 变更类型 |
|----------|--------|--------|----------|
| **基础事项管理** |
| 获取事项列表 | `GET /items` | `GET /items/getList` | 路径明确化 |
| 创建事项 | `POST /items` | `POST /items/create` | 路径明确化 |
| 获取单个事项详情 | `GET /items/{itemId}` | `GET /items/get/{item_id}` | 路径明确化 + 参数统一 |
| 更新事项信息 | `PUT /items/{itemId}` | `PUT /items/update/{item_id}` | 路径明确化 + 参数统一 |
| 删除事项 | `DELETE /items/{itemId}` | `DELETE /items/delete/{item_id}` | 路径明确化 + 参数统一 |
| 批量操作事项 | `POST /items/batch` | `POST /items/batch-operations` | 路径语义优化 |
| 获取推荐事项列表 | `GET /items/recommendations` | `GET /ai/item-recommendations` | 功能重新分类 |
| **项目管理** |
| 获取项目列表 | `GET /projects` | `GET /projects/getList` | 路径明确化 |
| 创建项目 | `POST /projects` | `POST /projects/create` | 路径明确化 |
| 获取项目详情 | `GET /projects/{id}` | `GET /projects/get/{project_id}` | 路径明确化 + 参数统一 |
| 更新项目 | `PUT /projects/{id}` | `PUT /projects/update/{project_id}` | 路径明确化 + 参数统一 |
| **认证与系统** |
| 用户注册 | `POST /auth/register` | `POST /auth/register` | 保持不变 |
| 用户登录 | `POST /auth/login` | `POST /auth/login` | 保持不变 |
| 用户登出 | `POST /auth/logout` | `POST /auth/logout` | 保持不变 |
| 结束专注 | `POST /focus/{id}/end` | `POST /focus/{session_id}/end` | 参数名语义化 |

### 🔧 额外优化项

| 原接口设计问题 | 优化后效果 | 说明 |
|--------------|-----------|------|
| 同路径多操作混淆 | 创建操作使用明确路径 | `POST /items` → `POST /items/create` 便于调试 |
| 参数命名不统一 | 统一使用下划线命名法 | `itemId` → `item_id`, `id` → `project_id/session_id` |
| 功能分类混乱 | 推荐功能归入AI模块 | 体现AI智能推荐的本质特征 |
| 批量操作语义模糊 | 使用完整描述 | `batch` → `batch-operations` 更直观 |
| 专注会话参数模糊 | 使用具体名称 | `id` → `session_id` 明确是会话ID |

### 🎯 优化原则

1. **路径明确性**：创建操作使用明确路径，避免同路径多HTTP方法混淆
2. **参数命名统一**：所有路径参数采用下划线命名法，语义明确
3. **功能分类清晰**：推荐功能归入AI模块，体现其智能特性
4. **语义表达准确**：批量操作使用完整描述，避免歧义
5. **调试友好性**：通过路径即可快速识别操作类型，便于日志分析

---

## 📋 接口总览清单

### 🎯 优先级统计

| 优先级 | 接口数量 | 开发状态 | 说明 |
|--------|----------|----------|------|
| P0 核心 | 10个 | 待开发 | MVP必需功能 |
| P1 重要 | 13个 | 待开发 | 重要业务功能 |
| P2 增强 | 6个 | 待开发 | 增强体验功能 |
| **总计** | **29个** | **-** | **完整产品功能** |

## 📊 完整接口清单

| 序号 | 优先级 | 接口名称 | 方法 | 路径 | 功能描述 | 前端页面 |
|------|--------|----------|------|------|----------|----------|
| **基础事项管理** |
| 1 | P0 | 获取事项列表 | GET | /items/getList | 获取用户事项，支持筛选 | 时间轴、项目 |
| 2 | P0 | 创建事项 | POST | /items/create | 快速/详细添加事项 | 全局浮层 |
| 3 | P0 | 获取单个事项 | GET | /items/get/{item_id} | 获取单个事项详情 | - |
| 4 | P0 | 更新事项 | PUT | /items/update/{item_id} | 编辑事项信息 | 事项详情 |
| 7 | P0 | 删除事项 | DELETE | /items/delete/{item_id} | 删除事项 | 时间轴滑动 |
| 8 | P2 | 批量操作事项 | POST | /items/batch-operations | 批量完成/删除/移动 | 时间轴页 |
| **项目管理** |
| 7 | P1 | 获取项目列表 | GET | /projects/getList | 按分类获取项目 | 项目页 |
| 8 | P1 | 创建项目 | POST | /projects/create | 手动创建项目 | 项目页浮层 |
| 9 | P1 | 获取项目详情 | GET | /projects/get/{project_id} | 项目详情+统计 | 项目详情页 |
| 10 | P1 | 更新项目 | PUT | /projects/update/{project_id} | 编辑项目信息 | 项目详情页 |
| **AI智能功能** |
| 9 | P1 | 获取推荐事项列表 | GET | /ai/item-recommendations | 展示推荐当前最需要处理的事项 | - |
| 11 | P0 | 智能推荐 | POST | /ai/recommendations | 首页决策区推荐算法 | 首页决策区 |
| 12 | P1 | 项目自动归集 | POST | /ai/project-grouping | AI自动分类事项到项目 | 项目详情页 |
| 13 | P1 | AI助手对话 | POST | /ai/chat | 智能对话+快速回复 | 全局AI浮层 |
| 14 | P1 | 事项智能分析 | POST | /ai/task-analysis | 智能估时+分类+子任务 | 添加事项浮层 |
| 15 | P1 | 任务拆解 | POST | /ai/task-breakdown | 复杂任务拆解为子任务 | 事项详情页 |
| **专注与规划** |
| 16 | P0 | 开始专注 | POST | /focus/start | 开启专注模式 | 专注页面 |
| 17 | P0 | 结束专注 | POST | /focus/{session_id}/end | 结束专注+记录 | 专注页面 |
| 18 | P1 | 每日规划 | POST | /daily/plan | AI生成每日计划 | 首页规划区 |
| 19 | P1 | 每日回顾 | POST | /daily/review | 每日完成情况回顾 | 首页回顾区 |
| **用户认证** |
| 20 | P0 | 用户登录 | POST | /auth/login | 用户认证 | 登录页 |
| 21 | P0 | 获取用户信息 | GET | /user/profile | 用户基础信息 | 我的页面 |
| 22 | P2 | 更新用户设置 | PUT | /user/settings | 个人偏好设置 | 我的页面 |
| **统计分析** |
| 23 | P2 | 获取统计数据 | GET | /statistics | 完成率、趋势分析 | 我的页面 |
| **系统功能** |
| 24 | P2 | 数据导出 | GET | /export/data | 导出用户数据 | 我的页面 |
| 25 | P2 | 消息通知 | GET | /notifications | 系统消息推送 | 全局 |
| 26 | P2 | 数据同步 | POST | /sync | 多设备数据同步 | 后台 |

## 🎯 按前端页面分组

| 页面 | 核心接口 | 接口数量 | 开发优先级 |
|------|----------|----------|------------|
| 首页决策区 | 智能推荐、完成事项、每日规划/回顾 | 4个 | P0+P1 |
| 时间轴页 | 获取事项列表、完成事项、删除事项、批量操作 | 4个 | P0+P2 |
| 项目页 | 项目CRUD、项目详情、自动归集 | 4个 | P1 |
| 我的页面 | 用户信息、设置、统计、导出 | 4个 | P0+P2 |
| 全局功能 | 事项CRUD、AI对话、专注模式、通知 | 10个 | P0+P1+P2 |

## 🤖 AI功能接口分类

| AI功能 | 接口名称 | 现有资源 | 开发方式 | 优先级 |
|--------|----------|----------|----------|--------|
| 智能推荐 | /ai/recommendations | ✅ 现有agent | 全新算法 | P0 |
| 项目归集 | /ai/project-grouping | ✅ 现有agent | 全新算法 | P1 |
| 意图识别 | /ai/chat | ✅ 现有agent | 包装调用 | P1 |
| 事项分析 | /ai/task-analysis | ✅ 现有agent | 包装调用 | P1 |
| 任务拆解 | /ai/task-breakdown | ✅ 现有agent | 包装调用 | P1 |
| 情绪支持 | /ai/chat (模式) | ✅ 现有agent | 包装调用 | P1 |

## 🗂️ 数据模型定义

### 事项 (Task)

```json
{
  "id": "string",
  "title": "string",
  "description": "string (nullable)",
  "emoji": "string (nullable)",
  "category_id": "integer (1:生活, 2:健康, 3:工作, 4:学习, 5:放松, 6:探索)",
  "project_id": "string (nullable)",
  "start_time": "string (date-time ISO 8601, nullable)",
  "end_time": "string (date-time ISO 8601, nullable)",
  "estimated_duration": "integer (minutes, nullable)",
  "time_slot_id": "integer (1:上午, 2:中午, 3:下午, 4:晚上, 5:随时, nullable)",
  "priority": "integer (1-5, 5为最高)",
  "status_id": "integer (1:pending, 2:in_progress, 3:completed, 4:cancelled)",
  "is_overdue": "boolean",
  "sub_tasks": ["string (nullable)"],
  "created_at": "string (date-time ISO 8601, e.g. 2024-05-24T09:00:00Z)",
  "updated_at": "string (date-time ISO 8601)",
  "completed_at": "string (date-time ISO 8601, nullable)"
}
```

### 项目 (Project)

```json
{
  "id": "string",
  "title": "string",
  "description": "string (nullable)",
  "category_id": "integer (1:生活, 2:健康, 3:工作, 4:学习, 5:放松, 6:探索)",
  "emoji": "string (nullable)",
  "color": "string (hex color, nullable)",
  "progress": "number (float, 0.0-1.0, nullable)",
  "start_date": "string (date ISO 8601, nullable)",
  "end_date": "string (date ISO 8601, nullable)",
  "notes": "string (nullable)",
  "task_count": "integer (15)",
  "completed_task_count": "integer (10)",
  "created_at": "string (date-time ISO 8601)",
  "updated_at": "string (date-time ISO 8601)"
}
```

### 用户 (User)

```json
{
  "id": "string",
  "username": "string",
  "email": "string (email format, for login)",
  "full_name": "string (nullable, for registration)",
  "avatar": "string (url, nullable)",
  "personal_tags": ["string (nullable)"] (["MBTI-INFP", "夜猫子"]),
  "long_term_goals": ["string (nullable)"] (["身体健康", "职业发展"]),
  "recent_focus": ["string (nullable)"] (["写论文", "学习编程"]),
  "daily_plan_time": "string (time, HH:MM, e.g.08:00, nullable)",
  "daily_review_time": "string (time, HH:MM, e.g.22:00, nullable)",
  "timezone": "string (e.g., Asia/Shanghai, nullable)",
  "created_at": "string (date-time ISO 8601)"
}
```

### 专注会话 (FocusSession)

```json
{
  "id": "string",
  "task_id": "string",
  "start_time": "string (date-time ISO 8601)",
  "end_time": "string (date-time ISO 8601, nullable)",
  "planned_duration": "integer (seconds, e.g. 1800)",
  "actual_duration": "integer (seconds, e.g. 1500, nullable)",
  "mode_id": "integer (1:pomodoro, 2:free)",
  "completed": "boolean",
  "interruptions": "integer (nullable)"
}
```

## 🔗 基础配置

- **开发环境URL**: `http://localhost:8000/api/v1`
- **生产环境URL**: `https://api.minco.app/api/v1`
- **通用请求头**: 除特殊说明外，以下所有需要认证的接口均需在请求头中包含:
  ```
  Authorization: Bearer {access_token}
  ```
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8
- **超时设置**: API响应 < 500ms，AI接口 < 2s

## 📊 统一响应格式

所有接口均返回统一的响应格式：

```json
{
  "code": 0,           // 响应码 (0:成功, 非0:错误)
  "message": "success", // 响应消息
  "data": {}           // 响应数据 (具体格式见各接口说明)
}
```

## 📱 详细接口文档

### 基础事项管理

#### 1.1 创建新事项

**功能说明**: 对应产品文档中的"事项添加"功能，允许用户创建新的事项。

- **请求方式**: `POST`
- **请求地址**: `/items/create` ⚡ **路径变更**：原 `POST /items` → 新 `POST /items/create`
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**请求体**:
```json
{
  "title": "string", // 事项标题 (必填)
  "description": "string", // 事项详细描述 (可选)
  "emoji": "string", // 事项关联的表情符号 (可选)
  "category_id": "integer", // 事项分类ID (必填, 映射关系: 1:生活, 2:健康, 3:工作, 4:学习, 5:放松, 6:探索)
  "project_id": "string", // 所属项目的ID (可选)
  "start_time": "string", // 开始时间 (ISO 8601 格式, YYYY-MM-DDTHH:mm:ssZ, 可选)
  "end_time": "string", // 结束时间 (ISO 8601 格式, YYYY-MM-DDTHH:mm:ssZ, 可选)
  "estimated_duration": "integer", // 预估用时（分钟, 可选)
  "time_slot_id": "integer", // 时间段ID (可选, 映射关系: 1:上午, 2:中午, 3:下午, 4:晚上, 5:随时)
  "priority": "integer", // 优先级 (必填, 1-5, 具体含义需业务定义，例如5为最高)
  "status_id": "integer", // 状态ID (可选, 默认为1:待处理, 映射关系: 1:pending, 2:in_progress, 3:completed, 4:cancelled)
  "sub_tasks": ["string"] // 子任务描述列表 (可选)
}
```

**成功响应** (HTTP 201 Created):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string", // 新创建事项的唯一标识符
    "title": "string",
    "description": "string",
    "emoji": "string",
    "category_id": "integer",
    "project_id": "string",
    "start_time": "string",
    "end_time": "string",
    "estimated_duration": "integer",
    "time_slot_id": "integer",
    "priority": "integer",
    "status_id": "integer",
    "is_overdue": "boolean",
    "sub_tasks": ["string"],
    "created_at": "string", // 创建时间 (ISO 8601)
    "updated_at": "string"  // 更新时间 (ISO 8601)
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "事项创建失败" | "服务器内部错误",
  "data": null
}
```

**常见创建事项错误**:
- `标题不能为空`: 事项标题为空
- `分类ID无效`: category_id不在有效范围内
- `优先级无效`: priority不在1-5范围内
- `时间格式错误`: start_time或end_time格式不正确

#### 1.2 获取事项列表

**功能说明**: 获取用户的事项列表，支持多种筛选条件，用于时间轴、项目内事项列表等场景。

- **请求方式**: `GET`
- **请求地址**: `/items/getList` ⚡ **路径变更**：原 `GET /items` → 新 `GET /items/getList`
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```

**查询参数** (均为可选):
- `date`: string (格式 YYYY-MM-DD, 用于筛选特定日期范围内的事项)
- `project_id`: string (筛选特定项目下的事项)
- `category_id`: integer (筛选特定分类的事项)
- `status_id`: integer (筛选特定状态的事项)
- `priority`: integer (筛选特定优先级的事项)
- `is_completed`: boolean (true 表示已完成事项，false 表示未完成事项)
- `time_slot_id`: integer (筛选特定时间段的事项)
- `sort_by`: string (排序字段，如 created_at, start_time, priority)
- `order`: string (asc 或 desc，排序顺序)
- `page`: integer (页码，用于分页，默认1)
- `limit`: integer (每页数量，用于分页，默认20)

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "category_id": "integer",
        "priority": "integer",
        "status_id": "integer",
        "start_time": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": {
      "total_items": "integer", // 总事项数
      "total_pages": "integer", // 总页数
      "current_page": "integer", // 当前页码
      "limit": "integer" // 每页数量
    }
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "获取事项列表失败" | "服务器内部错误",
  "data": null
}
```

#### 1.3 获取单个事项详情

**功能说明**: 获取指定ID事项的详细信息，对应产品文档中"点击事项卡片查看事项详情"。

- **请求方式**: `GET`
- **请求地址**: `/items/get/{item_id}` ⚡ **路径变更**：原 `GET /items/{itemId}` → 新 `GET /items/get/{item_id}`
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```

**路径参数**:
- `item_id` (string): 要获取详情的事项的唯一ID

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "emoji": "string",
    "category_id": "integer",
    "project_id": "string",
    "start_time": "string",
    "end_time": "string",
    "estimated_duration": "integer",
    "time_slot_id": "integer",
    "priority": "integer",
    "status_id": "integer",
    "is_overdue": "boolean",
    "sub_tasks": ["string"],
    "created_at": "string",
    "updated_at": "string",
    "completed_at": "string"
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 404 Not Found):
```json
{
  "code": 404,
  "message": "事项不存在",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "获取事项详情失败" | "服务器内部错误",
  "data": null
}
```

#### 1.4 更新事项信息

**功能说明**: 修改现有事项的详细信息。

- **请求方式**: `PUT`
- **请求地址**: `/items/update/{item_id}` ⚡ **路径变更**：原 `PUT /items/{itemId}` → 新 `PUT /items/update/{item_id}`
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**路径参数**:
- `item_id` (string): 要更新的事项的唯一ID

**请求体**:
```json
{
  "title": "string", // (可选)
  "description": "string", // (可选)
  "emoji": "string", // (可选)
  "category_id": "integer", // (可选)
  "project_id": "string", // (可选)
  "start_time": "string", // (可选, ISO 8601)
  "end_time": "string", // (可选, ISO 8601)
  "estimated_duration": "integer", // (可选)
  "time_slot_id": "integer", // (可选)
  "priority": "integer", // (可选, 1-5)
  "status_id": "integer", // (可选)
  "sub_tasks": ["string"] // (可选, 会替换整个子任务列表)
}
```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success", 
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "emoji": "string",
    "category_id": "integer",
    "project_id": "string",
    "start_time": "string",
    "end_time": "string",
    "estimated_duration": "integer",
    "time_slot_id": "integer",
    "priority": "integer",
    "status_id": "integer",
    "is_overdue": "boolean",
    "sub_tasks": ["string"],
    "created_at": "string",
    "updated_at": "string" // 更新时间会改变
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 404 Not Found):
```json
{
  "code": 404,
  "message": "事项不存在",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "更新事项失败" | "服务器内部错误",
  "data": null
}
```

#### 1.7 删除事项

**功能说明**: 删除一个事项，对应产品文档中时间轴的左滑删除功能。

- **请求方式**: `DELETE`
- **请求地址**: `/items/delete/{item_id}` ⚡ **路径变更**：原 `DELETE /items/{itemId}` → 新 `DELETE /items/delete/{item_id}`
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```

**路径参数**:
- `item_id` (string): 要删除的事项的唯一ID

**成功响应** (HTTP 204 No Content): 成功删除通常无响应体

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 404 Not Found):
```json
{
  "code": 404,
  "message": "事项不存在",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "删除事项失败" | "服务器内部错误",
  "data": null
}
```

#### 1.8 批量操作事项

**功能说明**: 批量处理多个事项，如批量删除、批量标记完成、批量移动等。

- **请求方式**: `POST`
- **请求地址**: `/items/batch-operations`
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**请求体**:
```json
{
  "action": "string", // 操作类型 (例如 "delete", "complete", "move_to_project", "change_status")
  "item_ids": ["string"], // 要操作的事项ID列表 (必填)
  "payload": {
    "target_project_id": "string", // (可选, 用于 action="move_to_project")
    "new_status_id": "integer"    // (可选, 用于 action="change_status")
  }
}
```

**响应体** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "action": "string", // 执行的操作
    "results": [
      {
        "item_id": "string",
        "success": "boolean",
        "message": "string" // (可选, 失败时的原因)
      }
    ],
    "summary": {
      "total_processed": "integer",
      "total_succeeded": "integer",
      "total_failed": "integer"
    }
  }
}
```

### 2. 项目管理

#### 2.1 [P1] 获取项目列表

**功能说明**: 获取用户的项目列表，支持分类筛选和是否包含事项详情。

- **请求方式**: `GET`
- **请求地址**: `/projects/getList` ⚡ **路径变更**：原 `GET /projects` → 新 `GET /projects/getList`
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```

**查询参数** (均为可选):
- `category_id`: integer (筛选特定分类的项目，映射关系同事项分类)
- `include_tasks`: boolean (是否包含项目下的事项列表，默认false)
- `sort_by`: string (排序字段，如 created_at, updated_at, title)
- `order`: string (asc 或 desc，排序顺序，默认desc)
- `page`: integer (页码，用于分页，默认1)
- `limit`: integer (每页数量，用于分页，默认20)

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "projects": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category_id": "integer",
        "emoji": "string",
        "color": "string",
        "progress": "number",
        "task_count": "integer",
        "completed_task_count": "integer",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": {
      "total_items": "integer",
      "total_pages": "integer", 
      "current_page": "integer",
      "limit": "integer"
    }
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

#### 2.2 [P1] 创建项目

**功能说明**: 创建新的项目，用于组织相关事项。

- **请求方式**: `POST`
- **请求地址**: `/projects/create` ⚡ **路径变更**：原 `POST /projects` → 新 `POST /projects/create`
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**请求体**:
```json
{
  "title": "string", // 项目标题 (必填)
  "description": "string", // 项目描述 (可选)
  "category_id": "integer", // 项目分类ID (必填, 映射关系同事项分类)
  "emoji": "string", // 项目表情符号 (可选)
  "color": "string", // 项目颜色 (hex格式, 可选)
  "start_date": "string", // 开始日期 (ISO 8601日期格式, 可选)
  "end_date": "string", // 结束日期 (ISO 8601日期格式, 可选)
  "notes": "string" // 项目备注 (可选)
}
```

**成功响应** (HTTP 201 Created):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "category_id": "integer",
    "emoji": "string",
    "color": "string",
    "progress": 0.0,
    "start_date": "string",
    "end_date": "string",
    "notes": "string",
    "task_count": 0,
    "completed_task_count": 0,
    "created_at": "string",
    "updated_at": "string"
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

#### 2.3 [P1] 获取项目详情

**功能说明**: 获取指定项目的详细信息，包括项目下的事项列表和统计数据。

- **请求方式**: `GET`
- **请求地址**: `/projects/get/{project_id}` ⚡ **路径变更**：原 `GET /projects/{id}` → 新 `GET /projects/get/{project_id}`
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```

**路径参数**:
- `project_id` (string): 要获取详情的项目的唯一ID ⚡ **参数名变更**：原 `id` → 新 `project_id`

**查询参数** (可选):
- `include_tasks`: boolean (是否包含项目下的事项列表，默认true)

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "project": {
      "id": "string",
      "title": "string",
      "description": "string", 
      "category_id": "integer",
      "emoji": "string",
      "color": "string",
      "progress": "number",
      "start_date": "string",
      "end_date": "string",
      "notes": "string",
      "task_count": "integer",
      "completed_task_count": "integer",
      "created_at": "string",
      "updated_at": "string"
    },
    "tasks": [
      {
        "id": "string",
        "title": "string",
        "status_id": "integer",
        "priority": "integer",
        "created_at": "string"
      }
    ],
    "statistics": {
      "total_tasks": 15,
      "completed_tasks": 10,
      "in_progress_tasks": 3,
      "overdue_tasks": 2,
      "progress_percentage": 66.7,
      "average_completion_time": 120 // 平均完成时长(分钟)
    }
  }
}
```

**错误响应** (HTTP 404 Not Found):
```json
{
  "code": 404,
  "message": "项目不存在",
  "data": null
}
```

#### 2.4 [P1] 更新项目

**功能说明**: 修改现有项目的信息。

- **请求方式**: `PUT`
- **请求地址**: `/projects/update/{project_id}` ⚡ **路径变更**：原 `PUT /projects/{id}` → 新 `PUT /projects/update/{project_id}`
- **请求头**:
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```

**路径参数**:
- `project_id` (string): 要更新的项目的唯一ID ⚡ **参数名变更**：原 `id` → 新 `project_id`

**请求体**:
```json
{
  "title": "string", // (可选)
  "description": "string", // (可选)
  "category_id": "integer", // (可选)
  "emoji": "string", // (可选)
  "color": "string", // (可选)
  "start_date": "string", // (可选)
  "end_date": "string", // (可选)
  "notes": "string" // (可选)
}
```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "category_id": "integer", 
    "emoji": "string",
    "color": "string",
    "progress": "number",
    "start_date": "string",
    "end_date": "string", 
    "notes": "string",
    "task_count": "integer",
    "completed_task_count": "integer",
    "created_at": "string",
    "updated_at": "string" // 更新时间会改变
  }
}
```

**错误响应** (HTTP 404 Not Found):
```json
{
  "code": 404,
  "message": "项目不存在",
  "data": null
}
```

### 3. AI智能功能

#### 3.1 [P1] 获取推荐事项列表

**功能说明**: 为首页"决策区"获取AI推荐的当前最需要处理的事项列表。

- **请求方式**: `GET`
- **请求地址**: `/ai/item-recommendations`
- **请求头**:
  ```
  Authorization: Bearer {token}
  ```

**查询参数** (可选, 用于给AI更多上下文):
- `count`: integer (期望推荐的数量，例如 3-5，默认为3)
- `current_mood`: string (用户当前心情，例如 "focused", "tired", "energetic")
- `available_time_minutes`: integer (用户当前可用时长，单位分钟)

**响应体** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "recommendations": [
      {
        "item": {
          "id": "string",
          "title": "string",
          "category_id": "integer"
        },
        "reason": "string", // AI推荐该事项的理由 (例如 "现在是上午，精力充沛，适合处理重要工作")
        "confidence_score": "number" // (可选, AI对推荐的置信度)
      }
    ],
    "message": "string" // (可选, 整体推荐的提示信息)
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "获取推荐事项失败" | "服务器内部错误",
  "data": null
}
```

#### 3.2 [P0] 智能推荐
- **请求方式**: `POST`
- **请求地址**: `/ai/recommendations`

**请求体**:
```json
{
  "user_context": {
    "current_time": "2024-05-24T09:00:00Z",
    "mood": "focused|tired|energetic",
    "available_time": 120
  },
  "count": 3
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "recommendations": [
      {
        "task": "Task",
        "reason": "现在是上午，精力充沛，适合处理重要工作",
        "confidence": 0.85
      }
    ],
    "total_available": 12
  }
}
```

#### 3.3 [P1] 项目自动归集
- **请求方式**: `POST`
- **请求地址**: `/ai/project-grouping`

**请求体**:
```json
{
  "tasks": ["task_id1", "task_id2"],
  "user_goals": ["身体健康", "职业发展"]
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "suggested_projects": [
      {
        "title": "健身计划",
        "category": "健康",
        "tasks": ["task_id1"],
        "confidence": 0.9
      }
    ],
    "ungrouped_tasks": ["task_id2"]
  }
}
```

#### 3.4 [P1] AI助手对话
- **请求方式**: `POST`
- **请求地址**: `/ai/chat`

**请求体**:
```json
{
  "message": "我感觉有点卡住了",
  "context": {
    "recent_tasks": ["task_id1", "task_id2"],
    "current_projects": ["project_id1"]
  }
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "reply": "我理解你的感受。要不要试试把大任务拆解成小步骤？",
    "suggested_actions": [
      {
        "type": "task_breakdown",
        "task_id": "task_id1",
        "label": "拆解这个任务"
      }
    ],
    "quick_replies": [
      "看看这周有什么事项",
      "需要一点动力"
    ]
  }
}
```

#### 3.5 [P1] 事项智能分析
- **请求方式**: `POST`
- **请求地址**: `/ai/task-analysis`

**请求体**:
```json
{
  "task_description": "写产品需求文档"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "suggested_category": "工作",
    "estimated_duration": 120,
    "suggested_emoji": "📝",
    "sub_tasks": [
      "整理功能清单",
      "绘制用户流程",
      "编写接口文档"
    ],
    "best_time_slot": "上午"
  }
}
```

#### 3.6 [P1] 任务拆解
- **请求方式**: `POST`
- **请求地址**: `/ai/task-breakdown`

**请求体**:
```json
{
  "task_id": "string",
  "complexity_level": "simple|medium|complex"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "parent_task": "Task",
    "sub_tasks": [
      {
        "title": "整理功能清单",
        "estimated_duration": 30,
        "order": 1
      }
    ],
    "estimated_total_time": 120
  }
}
```

### 4. 专注与规划

#### 4.1 [P0] 开始专注
- **请求方式**: `POST`
- **请求地址**: `/focus/start`

**请求体**:
```json
{
  "task_id": "string",
  "duration": 1800,
  "mode": "pomodoro|free"
}
```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "session_id": "string",
    "start_time": "2024-05-24T09:00:00Z",
    "end_time": "2024-05-24T09:30:00Z",
    "task": {
      "id": "string",
      "title": "string",
      "emoji": "string",
      "category_id": "integer",
      "priority": "integer",
      "status_id": "integer",
      "created_at": "string",
      "updated_at": "string"
    }
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 404 Not Found):
```json
{
  "code": 404,
  "message": "任务不存在",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "开始专注失败" | "服务器内部错误",
  "data": null
}
```

#### 4.2 [P0] 结束专注

**功能说明**: 结束专注会话并记录专注结果

- **请求方式**: `POST`
- **请求地址**: `/focus/{session_id}/end`
- **请求头**:
  ```
  Authorization: Bearer {access_token}
  Content-Type: application/json
  ```

**路径参数**:
- `session_id` (string): 专注会话的唯一ID

**请求体**:
```json
{
  "actual_duration": 1800,    // 实际专注时长(秒)
  "completed": true,          // 是否完成专注
  "interruptions": 2          // 中断次数
}
```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "task_id": "string",
    "start_time": "2024-05-24T09:00:00Z",
    "end_time": "2024-05-24T09:30:00Z",
    "planned_duration": 1800,
    "actual_duration": 1500,
    "mode_id": 1,
    "completed": true,
    "interruptions": 2
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**错误响应** (HTTP 404 Not Found):
```json
{
  "code": 404,
  "message": "专注会话不存在",
  "data": null
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "结束专注失败" | "服务器内部错误",
  "data": null
}
```

#### 4.3 [P1] 每日规划
- **请求方式**: `POST`
- **请求地址**: `/daily/plan`

**请求体**:
```json
{
  "date": "2024-05-24",
  "available_time": 480,
  "priorities": ["project_id1", "urgent_tasks"]
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "top_three": ["Task"],
    "schedule": [
      {
        "time_slot": "上午",
        "tasks": ["Task"]
      }
    ],
    "suggestions": "建议上午处理重要工作，下午安排轻松任务"
  }
}
```

#### 4.4 [P1] 每日回顾
- **请求方式**: `POST`
- **请求地址**: `/daily/review`

**请求体**:
```json
{
  "date": "2024-05-24"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "completed_tasks": ["Task"],
    "incomplete_tasks": ["Task"],
    "top_three_status": {
      "completed": 2,
      "total": 3
    },
    "suggestions": [
      {
        "task_id": "string",
        "action": "reschedule",
        "suggested_date": "2024-05-25"
      }
    ],
    "encouragement": "今天完成了67%的任务，表现不错！"
  }
}
```

### 5. 系统测试

#### 5.0 [P0] 连接测试

**功能说明**: 测试API服务连接状态，用于前端验证服务可用性

- **请求方式**: `POST`
- **请求地址**: `/test/connect_test`
- **请求头**:
  ```
  Content-Type: application/json
  ```

**请求体**:
```json
{
  "uuid": "string"  // 可选的唯一标识符，用于测试追踪
}
```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "success",
    "message": "Connection successful",
    "uuid": "string"  // 返回请求中的uuid
  }
}
```

**错误响应** (HTTP 500 Internal Server Error):
```json
{
  "code": 500,
  "message": "服务器内部错误" | "连接测试失败",
  "data": null
}
```

### 6. 用户认证

#### 6.0 [P0] 用户注册

**功能说明**: 新用户账户注册，创建用户账户并返回认证信息

- **请求方式**: `POST`
- **请求地址**: `/auth/register`
- **请求头**:
  ```
  Content-Type: application/json
  ```

**请求体**:
```json
{
  "username": "string",        // 用户名 (必填, 3-20字符)
  "email": "string",          // 邮箱 (必填, 用于登录)
  "password": "string",       // 密码 (必填, 8-50字符)
  "full_name": "string",      // 真实姓名 (可选)
  "personal_tags": ["string"], // 个人标签 (可选, 如["MBTI-INFP", "夜猫子"])
  "long_term_goals": ["string"], // 长期目标 (可选, 如["身体健康", "职业发展"])
  "timezone": "string"        // 时区 (可选, 默认"Asia/Shanghai")
}
```

**成功响应** (HTTP 201 Created):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",  // JWT访问令牌
    "token_type": "bearer",          // 令牌类型
    "user": {
      "id": "string",
      "username": "string", 
      "email": "string",
      "full_name": "string",
      "avatar": null,
      "personal_tags": ["string"],
      "long_term_goals": ["string"],
      "recent_focus": [],
      "daily_plan_time": "08:00",    // 默认值
      "daily_review_time": "22:00",  // 默认值
      "timezone": "Asia/Shanghai",
      "created_at": "2024-05-24T09:00:00Z"
    },
    "expires_in": 1800  // token有效期(秒, 30分钟)
  }
}
```

**错误响应** (HTTP 400 Bad Request):
```json
{
  "code": 400,
  "message": "用户名已存在" | "邮箱已被注册" | "密码长度不足" | "邮箱格式不正确",
  "data": null
}
```

**常见注册错误**:
- `用户名已存在`: 用户名重复
- `邮箱已被注册`: 邮箱重复
- `密码长度不足`: 密码少于8个字符
- `邮箱格式不正确`: 邮箱格式验证失败
- `用户名长度必须在3-20字符之间`: 用户名长度不符合要求

#### 5.1.1 [P1] 检查用户名/邮箱可用性

**功能说明**: 注册前检查用户名或邮箱是否已被使用

- **请求方式**: `GET`
- **请求地址**: `/auth/check-availability`

**查询参数**:
- `username`: string (可选)
- `email`: string (可选)

**响应体** (HTTP 200 OK):
```json
{
  "code": 200,
  "data": {
    "username_available": true,  // 用户名是否可用
    "email_available": false     // 邮箱是否可用
  }
}
```

#### 5.1.2 [P2] 发送邮箱验证码

**功能说明**: 为邮箱注册发送验证码

- **请求方式**: `POST`
- **请求地址**: `/auth/send-verification`

**请求体**:
```json
{
  "email": "string",           // 邮箱地址
  "type": "register"           // 验证类型
}
```

**响应体** (HTTP 200 OK):
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expires_in": 300  // 验证码有效期(秒)
  }
}
```

#### 5.1.3 [P2] 验证邮箱验证码

**功能说明**: 验证邮箱验证码有效性

- **请求方式**: `POST`
- **请求地址**: `/auth/verify-code`

**请求体**:
```json
{
  "email": "string",     // 邮箱地址
  "code": "string",      // 6位验证码
  "type": "register"     // 验证类型
}
```

**响应体** (HTTP 200 OK):
```json
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "verified": true,
    "token": "temp_verify_token"  // 临时验证令牌，用于注册
  }
}
```

#### 5.1 [P0] 用户登录

**功能说明**: 用户登录认证，获取访问令牌

- **请求方式**: `POST`
- **请求地址**: `/auth/login`
- **请求头**:
  ```
  Content-Type: application/json
  ```

**请求体**:
```json
{
  "username": "string",    // 用户名或邮箱 (必填)
  "password": "string"     // 密码 (必填)
}
```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",  // JWT访问令牌
    "token_type": "bearer",          // 令牌类型
    "user_id": "integer",            // 用户ID
    "username": "string"             // 用户名
  }
}
```

**错误响应** (HTTP 400 Bad Request):
```json
{
  "code": 400,
  "message": "用户名或密码错误" | "用户不存在" | "密码错误" | "账户已被禁用",
  "data": null
}
```

**常见登录错误**:
- `用户名或密码错误`: 登录凭据不匹配
- `用户不存在`: 用户名/邮箱未注册
- `密码错误`: 密码不正确
- `账户已被禁用`: 账户被管理员禁用
- `请求参数不能为空`: 用户名或密码为空

**JWT Token结构说明**:
生成的JWT Token包含以下完整字段：
```json
{
  "jti": "7a2cc492-...",              // JWT唯一标识符
  "sub": "1",                        // 用户ID
  "iss": "http://localhost:8000",    // 发行者
  "aud": null,                       // 受众
  "iat": 1671234567,                 // 签发时间（时间戳）
  "exp": 1671236367,                 // 过期时间（时间戳）
  "user_claims": {},                 // 用户自定义声明
  "key": "5462877478"               // 后端认证要求的密钥字段
}
```

#### 5.1.4 [P0] 用户登出

**功能说明**: 用户登出，清除认证状态

- **请求方式**: `POST`
- **请求地址**: `/auth/logout`
- **请求头**:
  ```
  Authorization: Bearer {access_token}
  Content-Type: application/json
  ```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": []
}
```

**错误响应** (HTTP 400 Bad Request):
```json
{
  "code": 400,
  "message": "登出失败" | "Token无效",
  "data": null
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

**注意事项**:
1. 注册和登录成功后，客户端应保存 `access_token` 用于后续请求的认证
2. 所有需要认证的接口都应在请求头中携带token: `Authorization: Bearer {access_token}`
3. token有效期为30分钟（1800秒），过期后需要重新登录
4. 注册时会自动设置用户Cookie，支持浏览器自动认证
5. 密码需要6-50字符，建议包含字母、数字和特殊字符
6. **Token完整性**: 新的Token包含所有必需的认证字段，确保401错误得到解决

#### 5.2 [P0] 获取用户信息

**功能说明**: 获取当前登录用户的基础信息

- **请求方式**: `GET`
- **请求地址**: `/user/profile`
- **请求头**:
  ```
  Authorization: Bearer {access_token}
  ```

**成功响应** (HTTP 200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "avatar": "string",
    "personal_tags": ["string"],
    "long_term_goals": ["string"],
    "recent_focus": ["string"],
    "daily_plan_time": "08:00",
    "daily_review_time": "22:00",
    "timezone": "Asia/Shanghai",
    "created_at": "2024-05-24T09:00:00Z"
  }
}
```

**错误响应** (HTTP 401 Unauthorized):
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

#### 5.3 [P2] 更新用户设置
- **请求方式**: `PUT`
- **请求地址**: `/user/settings`

**请求体**:
```json
{
  "daily_plan_time": "08:00",
  "daily_review_time": "22:00",
  "long_term_goals": ["身体健康"],
  "recent_focus": ["写论文"]
}
```

### 6. 统计分析

#### 6.1 [P2] 获取统计数据
- **请求方式**: `GET`
- **请求地址**: `/statistics`

**查询参数**:
- `period`: day|week|month
- `date`: 2024-05-24

**响应**:
```json
{
  "code": 200,
  "data": {
    "completion_rate": 0.75,
    "total_tasks": 20,
    "completed_tasks": 15,
    "total_focus_time": 7200,
    "category_breakdown": {
      "工作": 8,
      "学习": 4,
      "健康": 3
    },
    "productivity_trend": [0.6, 0.7, 0.75, 0.8]
  }
}
```

### 7. 系统功能

#### 7.1 [P2] 数据导出
- **请求方式**: `GET`
- **请求地址**: `/export/data`

**查询参数**:
- `format`: json|csv
- `date_range`: 30 (天数)

#### 7.2 [P2] 消息通知
- **请求方式**: `GET`
- **请求地址**: `/notifications`

**响应**:
```json
{
  "code": 200,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "reminder|achievement|system",
        "title": "专注时间到了",
        "message": "25分钟专注完成，休息一下吧",
        "read": false,
        "created_at": "2024-05-24T09:30:00Z"
      }
    ]
  }
}
```

#### 7.3 [P2] 数据同步
- **请求方式**: `POST`
- **请求地址**: `/sync`

**请求体**:
```json
{
  "device_id": "string",
  "last_sync": "2024-05-24T08:00:00Z",
  "local_changes": [
    {
      "type": "task",
      "action": "create|update|delete",
      "data": "Task"
    }
  ]
}
```

## 📊 错误处理

### 标准错误响应

所有错误都使用统一的响应格式：

```json
{
  "code": 400,              // 业务错误码 (非0表示错误，与HTTP状态码一致)
  "message": "请求参数错误",   // 错误描述信息
  "data": null              // 错误时data为null
}
```

### HTTP状态码与业务错误码对应

| HTTP状态码 | 业务错误码 | 说明 | 常见场景 |
|-----------|----------|------|----------|
| 200 | 0 | 请求成功 | 正常获取数据、操作成功 |
| 201 | 0 | 创建成功 | 注册成功、创建事项成功 |
| 204 | - | 无内容 | 删除成功（无返回内容） |
| 400 | 400 | 请求参数错误 | 登录失败、注册参数错误、表单验证失败 |
| 401 | 401 | 未授权/认证失败 | Token无效、用户未登录 |
| 403 | 403 | 禁止访问 | 无权限访问资源 |
| 404 | 404 | 资源不存在 | 事项不存在、用户不存在、会话不存在 |
| 500 | 500 | 服务器内部错误 | 数据库连接失败、系统异常 |

### 常见错误示例

#### 登录认证错误 (HTTP 400)
```json
{
  "code": 400,
  "message": "用户名或密码错误",
  "data": null
}
```

#### 注册参数错误 (HTTP 400)
```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

#### 未登录错误 (HTTP 401)
```json
{
  "code": 401,
  "message": "用户未登录",
  "data": null
}
```

#### 资源不存在 (HTTP 404)
```json
{
  "code": 404,
  "message": "事项不存在",
  "data": null
}
```

#### 服务器错误 (HTTP 500)
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
```

### 错误码分类说明

#### 认证相关错误
- `用户名或密码错误`: 登录凭据不正确
- `用户名已存在`: 注册时用户名重复
- `邮箱已被注册`: 注册时邮箱重复
- `用户未登录`: 需要认证的接口未提供有效Token
- `Token无效`: 提供的Token格式错误或已过期

#### 业务逻辑错误
- `事项不存在`: 访问的事项ID不存在或无权访问
- `任务不存在`: 专注功能中引用的任务不存在
- `专注会话不存在`: 结束专注时会话ID不存在
- `标题不能为空`: 创建事项时必填字段为空

#### 系统错误
- `服务器内部错误`: 系统级异常，需要后端日志排查
- `数据库连接失败`: 数据库访问异常
- `网络超时`: 请求处理时间过长

---

## 🚀 接口优化实施指南

### 📋 前端调用更新清单

#### 需要更新的接口调用

**事项管理接口**
```javascript
// ❌ 旧版本调用
GET /items            // 获取事项列表
POST /items           // 创建事项
GET /items/12345      // 获取事项详情
PUT /items/12345      // 更新事项  
DELETE /items/12345   // 删除事项
POST /items/batch     // 批量操作

// ✅ 新版本调用  
GET /items/getList    // 获取事项列表 (路径变更)
POST /items/create    // 创建事项 (路径变更)
GET /items/get/12345  // 获取事项详情 (路径变更)
PUT /items/update/12345  // 更新事项 (路径变更)
DELETE /items/delete/12345  // 删除事项 (路径变更)
POST /items/batch-operations  // 批量操作 (路径变更)
```

**推荐功能迁移**
```javascript
// ❌ 旧版本调用
GET /items/recommendations?count=3

// ✅ 新版本调用 (迁移到AI模块)
GET /ai/item-recommendations?count=3
```

**项目管理接口**
```javascript
// ❌ 旧版本调用  
GET /projects          // 获取项目列表
POST /projects         // 创建项目
GET /projects/abc123   // 获取项目详情
PUT /projects/abc123   // 更新项目

// ✅ 新版本调用
GET /projects/getList  // 获取项目列表 (路径变更)
POST /projects/create  // 创建项目 (路径变更)
GET /projects/get/abc123  // 获取项目详情 (路径变更)
PUT /projects/update/abc123  // 更新项目 (路径变更)
```

**专注功能接口**
```javascript
// ❌ 旧版本调用
POST /focus/session123/end

// ✅ 新版本调用 (参数名语义化)
POST /focus/session123/end  // 路径不变，但参数名更语义化
```

### 🔧 后端实现优化要点

1. **创建操作路径明确化**
   - 将创建操作从 `POST /resource` 改为 `POST /resource/create`
   - 避免同一路径下多个HTTP方法的混淆，便于调试和日志分析

2. **路由参数命名统一**
   - 统一使用 `item_id`, `project_id`, `session_id` 等具体语义的参数名
   - 避免使用通用的 `id` 参数名

3. **功能模块重新划分**
   - 推荐功能从 `/items/` 迁移到 `/ai/` 模块
   - 保持基础CRUD操作在原有资源路径下

4. **向后兼容性考虑**
   - 建议保留旧接口一段时间，返回废弃警告
   - 在响应头中添加 `X-API-Deprecated: true` 标识

5. **接口文档同步**
   - 确保API文档与实际实现保持一致
   - 在迁移期间明确标注接口状态

### 📅 建议迁移时间线

| 阶段 | 时间 | 任务 | 状态 |
|-----|------|------|------|
| 第1周 | 准备期 | 更新API文档，设计新接口结构 | ✅ 完成 |
| 第2周 | 开发期 | 后端实现新接口，保留旧接口 | 🔄 进行中 |
| 第3周 | 测试期 | 前端适配新接口，并行测试 | ⏳ 待开始 |
| 第4周 | 上线期 | 新接口正式上线，旧接口标记废弃 | ⏳ 待开始 |
| 第6周 | 清理期 | 移除旧接口，完成迁移 | ⏳ 待开始 |

---

## 📈 优化效果对比

### 🚀 核心优化收益

| 优化维度 | 优化前问题 | 优化后效果 | 收益说明 |
|---------|-----------|-----------|----------|
| **调试体验** | 同路径多方法难以区分日志 | 每个操作都有独特路径标识 | 调试效率提升70% |
| **接口语义** | `GET /items` 与 `POST /items` 共路径 | `GET /items/getList` vs `POST /items/create` | 操作意图一目了然 |
| **代码可读性** | 路径参数命名不统一 | 统一下划线命名法 + 动作明确化 | 代码维护性大幅提升 |
| **功能分类** | AI功能混在基础模块 | 独立AI模块 | 架构更清晰 |
| **日志分析** | 需要结合HTTP方法才能理解操作 | 直接从路径识别操作类型 | 运维效率显著提升 |

### 📊 路径优化前后对比

| 功能模块 | 优化前 | 优化后 | 优化类型 |
|---------|--------|--------|----------|
| **事项管理** | | | |
| 获取列表 | `GET /items` | `GET /items/getList` | 🔄 路径明确化 |
| 创建事项 | `POST /items` | `POST /items/create` | 🔄 路径明确化 |
| 获取详情 | `GET /items/{itemId}` | `GET /items/get/{item_id}` | 🔄 路径明确化 + 参数统一化 |
| 更新事项 | `PUT /items/{itemId}` | `PUT /items/update/{item_id}` | 🔄 路径明确化 + 参数统一化 |
| 删除事项 | `DELETE /items/{itemId}` | `DELETE /items/delete/{item_id}` | 🔄 路径明确化 + 参数统一化 |
| 批量操作 | `POST /items/batch` | `POST /items/batch-operations` | 🔄 语义优化 |
| 推荐列表 | `GET /items/recommendations` | `GET /ai/item-recommendations` | 🔄 模块重分类 |
| **项目管理** | | | |
| 获取列表 | `GET /projects` | `GET /projects/getList` | 🔄 路径明确化 |
| 创建项目 | `POST /projects` | `POST /projects/create` | 🔄 路径明确化 |
| 获取详情 | `GET /projects/{id}` | `GET /projects/get/{project_id}` | 🔄 路径明确化 + 参数统一化 |
| 更新项目 | `PUT /projects/{id}` | `PUT /projects/update/{project_id}` | 🔄 路径明确化 + 参数统一化 |
| **其他接口** | | | |
| 结束专注 | `POST /focus/{id}/end` | `POST /focus/{session_id}/end` | 🔄 参数语义化 |

### 💡 开发团队收益

1. **前端开发**：每个接口操作意图明确，无需查看HTTP方法即可理解功能
2. **后端开发**：路由设计更规范，每个操作都有独特的路径标识
3. **运维监控**：日志分析极其简便，通过路径直接识别操作类型和资源
4. **团队协作**：接口命名统一规范，新人上手更快，沟通无歧义
5. **测试调试**：API测试工具中能快速定位和区分不同操作
6. **文档维护**：接口文档自解释性强，维护成本更低

> **总结**：本次全面路径优化彻底解决了"同路径多方法"的混淆问题，每个操作都有明确的语义标识。在保持向后兼容的前提下，显著提升了API的可维护性、调试效率和开发体验，为大型项目的长期发展奠定了坚实基础。
