# AI事项推荐功能说明

## 概述

基于阿里云百炼AI的事项推荐功能，能够根据用户的事项列表和当前状态，智能推荐最适合处理的事项。系统采用模块化设计，具备完善的错误处理和降级机制。

## 功能特性

- 🤖 **智能推荐**: 基于AI分析事项优先级、时长、截止时间等因素
- 🎯 **个性化**: 考虑用户当前心情、精力水平、可用时间等上下文
- ⚡ **实时响应**: 快速返回推荐结果，支持多种推荐策略
- 📊 **详细分析**: 提供推荐理由、置信度、匹配度等详细评分
- 🛡️ **错误处理**: 完善的异常处理和降级机制
- 📝 **详细日志**: 完整的请求追踪和性能监控
- 🔄 **灵活配置**: 支持指定事项ID或自动获取今日事项

## 配置要求

### 1. 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# 阿里云百炼配置
QWEN_API_KEY=your_dashscope_api_key_here
DECISION_MODEL_APP_ID=your_bailian_app_id_here
QWEN_API_BASE=https://dashscope.aliyuncs.com
```

**注意**: 
- `QWEN_API_KEY` 需要使用阿里云DashScope的API Key
- `DECISION_MODEL_APP_ID` 是您在百炼平台创建的应用ID
- 可以在阿里云控制台获取API Key: https://dashscope.console.aliyun.com/
- 可以在百炼平台创建应用: https://bailian.console.aliyun.com/

### 2. 依赖安装

```bash
pip install dashscope httpx
```

## API接口

### 推荐接口

**POST** `/api/v1/ai/recommendations`

#### 请求参数

```json
{
  "task_ids": ["task-1", "task-2"],  // 可选：指定事项ID列表，为空则获取今日所有事项
  "user_context": {                  // 可选：用户上下文
    "mood": "focused",               // 心情：focused, tired, energetic, anxious
    "energy_level": 7,               // 精力水平：1-10
    "available_time": 120,           // 可用时间（分钟）
    "location": "办公室",            // 位置
    "current_time": "2024-01-15T10:30:00Z"  // 当前时间(ISO格式)
  },
  "count": 3,                        // 推荐数量：1-10，默认3
  "recommendation_type": "smart"     // 推荐类型：smart, priority, time_based, mood_based
}
```

#### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "recommendations": [
      {
        "item": {
          "id": "task-001",
          "title": "完成项目报告",
          "description": "需要整理本周的工作进展",
          "emoji": "📊",
          "category_id": 1,
          "project_id": "proj-001",
          "start_time": "2024-01-15T09:00:00Z",
          "end_time": "2024-01-15T17:00:00Z",
          "estimated_duration": 120,
          "time_slot_id": 1,
          "priority": 5,
          "status_id": 1,
          "is_overdue": false,
          "sub_tasks": [],
          "created_at": "2024-01-15T08:00:00Z",
          "updated_at": "2024-01-15T08:00:00Z",
          "completed_at": null
        },
        "reason": "高优先级且有时间限制，建议优先处理",
        "confidence_score": 0.9,
        "priority_score": 0.8,
        "time_match_score": 0.7,
        "suggested_duration": 120
      }
    ],
    "message": "基于您的当前状态和任务优先级，为您推荐以下事项",
    "total_available": 10,
    "recommendation_metadata": {
      "recommendation_type": "smart",
      "ai_model_used": "bailian",
      "user_context_provided": true
    },
    "ai_model_used": "bailian",
    "processing_time_ms": 1250.5
  }
}
```

## 使用示例

### 1. 测试脚本

运行测试脚本验证功能：

```bash
python tools/test_ai_recommendation.py
```

### 2. 前端调用示例

```javascript
// 获取AI推荐
const getRecommendations = async () => {
  const response = await fetch('/api/v1/ai/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      user_context: {
        mood: 'focused',
        energy_level: 7,
        available_time: 120,
        location: '办公室',
        current_time: new Date().toISOString()
      },
      count: 3,
      recommendation_type: 'smart'
    })
  });
  
  const result = await response.json();
  return result.data;
};
```

### 3. Python客户端示例

```python
import requests
from datetime import datetime

def get_ai_recommendations(token, user_context=None, task_ids=None):
    url = "http://localhost:8000/api/v1/ai/recommendations"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "task_ids": task_ids,
        "user_context": user_context,
        "count": 3,
        "recommendation_type": "smart"
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# 使用示例
user_context = {
    "mood": "focused",
    "energy_level": 7,
    "available_time": 120,
    "location": "办公室",
    "current_time": datetime.now().isoformat()
}

result = get_ai_recommendations(token, user_context)
```

## 推荐策略

### 1. 智能推荐 (smart)
- 综合考虑优先级、时间、用户状态等因素
- 最适合一般使用场景
- 默认推荐策略

### 2. 优先级推荐 (priority)
- 主要基于事项优先级排序
- 适合时间紧张的情况
- 快速决策场景

### 3. 时间推荐 (time_based)
- 考虑截止时间和可用时间
- 适合有明确时间限制的事项
- 时间管理场景

### 4. 心情推荐 (mood_based)
- 根据用户当前心情推荐合适的事项
- 适合需要情绪匹配的场景
- 心理健康关注

## 用户上下文说明

### 心情类型
- `focused`: 专注状态，适合处理复杂任务
- `tired`: 疲惫状态，建议简单任务
- `energetic`: 精力充沛，可以挑战困难任务
- `anxious`: 焦虑状态，建议轻松任务

### 精力水平
- `1-3`: 低精力，建议简单、短时间任务
- `4-6`: 中等精力，可以处理一般任务
- `7-10`: 高精力，适合复杂、长时间任务

### 位置信息
- 用于考虑环境因素对任务执行的影响
- 如：办公室、家里、咖啡厅等

## 错误处理

### 常见错误

1. **配置错误**
   ```
   错误: BAILIAN_API_KEY 未配置
   解决: 检查.env文件中的API密钥配置
   ```

2. **网络错误**
   ```
   错误: 百炼应用调用失败
   解决: 检查网络连接和API地址
   ```

3. **权限错误**
   ```
   错误: 用户未登录
   解决: 确保请求包含有效的JWT token
   ```

4. **数据错误**
   ```
   错误: 没有找到可推荐的事项
   解决: 检查用户是否有未完成的事项
   ```

### 降级策略

当AI推荐失败时，系统会自动降级为基于优先级的简单排序：

```python
# 优先级排序降级
sorted_tasks = sorted(tasks, key=lambda x: x.priority, reverse=True)
```

### 错误响应格式

```json
{
  "code": 500,
  "message": "AI推荐服务异常",
  "data": {
    "recommendations": [],
    "message": "AI推荐服务暂时不可用，请稍后再试",
    "total_available": 0
  }
}
```

## 性能优化

### 1. 模块化设计
- 将复杂逻辑拆分为独立函数
- 提高代码可维护性和可测试性
- 便于性能优化和错误定位

### 2. 缓存策略
- 相同用户上下文的推荐结果可以缓存5分钟
- 减少重复的AI调用
- 提高响应速度

### 3. 批量处理
- 支持一次推荐多个事项
- 减少API调用次数
- 优化资源使用

### 4. 超时控制
- AI调用超时设置为60秒
- 避免长时间等待
- 提供降级响应

### 5. 请求限制
- 最大任务数量限制为50个
- 推荐数量限制为1-10个
- 防止资源滥用

## 监控和日志

### 日志记录
- 记录所有AI调用请求和响应
- 包含处理时间和错误信息
- 便于问题排查和性能分析
- 使用结构化日志格式

### 性能指标
- 平均响应时间
- 成功率
- 推荐质量评分
- 错误率统计

### 日志示例

```
[2024-01-15 10:30:00] [req-123] 开始AI推荐，用户ID: user-001, 推荐数量: 3
[2024-01-15 10:30:01] [req-123] 找到 10 个候选事项
[2024-01-15 10:30:02] [req-123] AI推荐成功，用户ID: user-001, 推荐数量: 3, 用时: 1250.50ms
```

## 安全考虑

1. **用户数据隔离**: 每个用户只能访问自己的事项
2. **API密钥安全**: 环境变量存储，不在代码中硬编码
3. **请求限制**: 防止恶意调用和资源滥用
4. **数据隐私**: 不向第三方泄露用户数据
5. **输入验证**: 严格的参数验证和类型检查
6. **错误信息**: 不暴露敏感的系统信息

## 代码架构

### 主要组件

1. **API路由层** (`app/api/ai.py`)
   - 处理HTTP请求和响应
   - 参数验证和错误处理
   - 调用业务逻辑层

2. **业务逻辑层** (`app/services/recommendation_service.py`)
   - AI推荐核心逻辑
   - 与百炼API交互
   - 结果处理和格式化

3. **数据访问层** (`app/crud/task.py`)
   - 数据库操作
   - 任务数据查询
   - 数据转换

4. **模型层** (`app/schemas/`)
   - 请求响应模型定义
   - 数据验证规则
   - API文档生成

### 核心函数

- `get_ai_recommendations()`: 主推荐接口
- `_fetch_tasks_by_ids()`: 根据ID获取任务
- `_fetch_today_tasks()`: 获取今日任务
- `_process_ai_recommendations()`: 处理AI推荐结果
- `_build_user_context_info()`: 构建用户上下文

## 扩展功能

### 未来计划
- [ ] 支持更多推荐算法
- [ ] 添加用户反馈机制
- [ ] 实现推荐结果学习优化
- [ ] 支持团队协作推荐
- [ ] 集成更多AI模型
- [ ] 添加推荐历史记录
- [ ] 支持自定义推荐规则
- [ ] 实现A/B测试框架

### 可扩展点
- 推荐算法插件化
- 用户行为分析
- 推荐效果评估
- 多模态输入支持

## 技术支持

如有问题，请查看：
1. 日志文件: `minco-be.log`
2. API文档: `http://localhost:8000/docs`
3. 测试脚本: `test_ai_recommendation.py`
4. 代码仓库: 查看 `app/api/ai.py` 和 `app/services/recommendation_service.py`

### 常见问题

**Q: 为什么推荐结果为空？**
A: 可能原因：1) 用户没有未完成的事项 2) 指定的事项ID不存在 3) AI服务暂时不可用

**Q: 如何处理AI服务超时？**
A: 系统会自动降级为优先级排序，确保用户始终能获得推荐结果

**Q: 如何提高推荐准确性？**
A: 提供更详细的用户上下文信息，包括心情、精力水平、可用时间等 