# AI聊天功能使用指南

## 📖 功能概述

AI聊天功能集成了阿里云千问大语言模型，为用户提供智能的任务管理助手对话服务。支持上下文对话、意图识别和操作建议。

## 🔧 环境配置

### 1. 安装依赖

```bash
pip install openai==1.40.0
```

### 2. 配置千问API密钥

在环境变量中设置千问API密钥：

```bash
# Linux/Mac
export QWEN_API_KEY="your_qwen_api_key_here"

# Windows
set QWEN_API_KEY=your_qwen_api_key_here
```

### 3. 获取千问API密钥

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 创建应用并获取API-KEY
3. 参考官方文档：[通义千问API调用指南](https://help.aliyun.com/document_detail/2840915.html)

## 🚀 接口使用

### 接口地址
```
POST /api/v1/ai/chat
```

### 请求格式

```json
{
  "message": "我感觉有点卡住了",
  "context": {
    "recent_tasks": ["task_id1", "task_id2"],
    "current_projects": ["project_id1"],
    "user_mood": "focused",
    "available_time": 30
  },
  "session_id": "可选的会话ID，用于维护上下文"
}
```

### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "reply": "我理解你的感受。要不要试试把大任务拆解成小步骤？",
    "suggested_actions": [
      {
        "type": "task_breakdown",
        "task_id": "task_id1",
        "label": "拆解这个任务",
        "payload": {"action": "break_down_current_task"}
      }
    ],
    "quick_replies": [
      "看看这周有什么事项",
      "需要一点动力"
    ],
    "session_id": "uuid-session-id",
    "context_updated": true
  }
}
```

## 💬 对话功能特性

### 1. 上下文理解
- 维护多轮对话历史
- 理解用户当前任务状态
- 根据心情和可用时间提供建议

### 2. 意图识别
- **困难求助**: 识别"卡住"、"困难"等词汇，提供任务拆解建议
- **任务管理**: 识别任务相关需求，提供创建、查看操作
- **专注工作**: 识别专注需求，建议开始专注模式
- **情绪支持**: 识别焦虑、疲惫等情绪，提供正面支持

### 3. 智能建议

#### 建议操作类型
- `task_breakdown`: 任务拆解
- `create_task`: 创建新任务
- `view_tasks`: 查看任务列表
- `start_focus`: 开始专注模式

#### 快速回复
根据对话内容动态生成相关的快速回复选项。

## 🧪 测试使用

### 1. 启动服务
```bash
uvicorn app.main:app --reload
```

### 2. 运行测试脚本
```bash
# 设置API密钥
export QWEN_API_KEY="your_api_key"

# 运行测试
python test_ai_chat.py
```

### 3. 手动测试示例

```bash
# 基础对话测试
curl -X POST "http://localhost:8000/api/v1/ai/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，我是新用户",
    "context": {
      "user_mood": "curious"
    }
  }'
```

## 📊 使用场景

### 1. 新用户引导
```json
{
  "message": "你好，我是新用户，不知道从哪里开始",
  "context": {"user_mood": "curious"}
}
```

### 2. 任务管理困难
```json
{
  "message": "我有很多事情要做，感觉很混乱",
  "context": {
    "recent_tasks": ["task1", "task2", "task3"],
    "user_mood": "overwhelmed"
  }
}
```

### 3. 寻求专注建议
```json
{
  "message": "我想开始工作，但不知道先做什么",
  "context": {
    "available_time": 60,
    "user_mood": "focused"
  }
}
```

### 4. 情绪支持
```json
{
  "message": "今天工作压力很大，感觉有点焦虑",
  "context": {"user_mood": "anxious"}
}
```

## ⚠️ 注意事项

### 1. API密钥安全
- 不要在代码中硬编码API密钥
- 使用环境变量或密钥管理服务
- 定期轮换API密钥

### 2. 费用控制
- 千问API按tokens计费
- 设置合适的`max_tokens`限制
- 监控API使用量

### 3. 错误处理
- 接口包含完善的降级机制
- API失败时提供备用回复
- 记录详细的错误日志

### 4. 会话管理
- 当前使用内存存储会话
- 生产环境建议使用Redis
- 会话历史限制为10条消息

## 🔧 生产环境配置

### 1. 环境变量配置
```bash
# .env 文件
QWEN_API_KEY=your_production_api_key
QWEN_API_BASE=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-turbo
```

### 2. Redis缓存配置（推荐）
```python
# 在生产环境中替换内存存储
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)
```

### 3. 日志监控
- 监控API调用成功率
- 跟踪响应时间
- 记录用户满意度反馈

## 📞 技术支持

如有问题，请查看：
1. [阿里云百炼平台文档](https://help.aliyun.com/document_detail/2840915.html)
2. [OpenAI Python SDK文档](https://github.com/openai/openai-python)
3. 项目日志文件：`minco-be.log`

## 🔄 更新日志

### v1.0.0 (2024-12-19)
- ✅ 集成千问LLM
- ✅ 支持上下文对话
- ✅ 实现意图识别
- ✅ 添加智能建议操作
- ✅ 完成基础测试 

## 🔄 后续建议
生产环境优化：
    使用Redis替代内存存储会话
    添加API调用监控和限流
    优化提示词和回复质量
功能扩展：
    集成更多AI能力（任务分析、智能规划等）
    支持多种聊天模式
    添加用户偏好学习