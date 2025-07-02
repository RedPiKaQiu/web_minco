/**
 * AI聊天功能测试脚本
 * 测试与后端AI聊天API的连接和基本功能
 */

// 测试配置
const API_BASE_URL = 'http://localhost:8000/api/v1';
const TEST_TOKEN = 'your_test_token_here'; // 需要替换为有效的token

/**
 * 测试AI聊天功能
 */
async function testAiChat() {
  console.log('🤖 开始测试AI聊天功能...\n');

  const testCases = [
    {
      name: '新用户问候',
      message: '你好，我是新用户',
      context: {
        user_mood: 'curious',
        available_time: 30
      }
    },
    {
      name: '任务管理求助',
      message: '我有很多事情要做，感觉很混乱',
      context: {
        recent_tasks: ['task1', 'task2', 'task3'],
        user_mood: 'overwhelmed',
        available_time: 60
      }
    },
    {
      name: '寻求专注建议',
      message: '我想开始工作，但不知道先做什么',
      context: {
        user_mood: 'focused',
        available_time: 90
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 测试场景: ${testCase.name}`);
    console.log(`💬 用户消息: ${testCase.message}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify({
          message: testCase.message,
          context: testCase.context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.code === 0) {
        console.log(`✅ AI回复: ${data.data.reply}`);
        
        if (data.data.suggested_actions && data.data.suggested_actions.length > 0) {
          console.log(`💡 建议操作:`);
          data.data.suggested_actions.forEach((action, index) => {
            console.log(`   ${index + 1}. ${action.label} (${action.type})`);
          });
        }
        
        if (data.data.quick_replies && data.data.quick_replies.length > 0) {
          console.log(`⚡ 快速回复: ${data.data.quick_replies.join(', ')}`);
        }
        
        console.log(`🔗 会话ID: ${data.data.session_id}`);
      } else {
        console.log(`❌ API错误: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`);
    }
    
    console.log('─────────────────────────────────────────\n');
  }
}

/**
 * 测试AI推荐功能
 */
async function testAiRecommendations() {
  console.log('🎯 开始测试AI推荐功能...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        user_context: {
          current_time: new Date().toISOString(),
          mood: 'focused',
          available_time: 60
        },
        count: 3
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code === 0) {
      console.log(`✅ 获取到 ${data.data.recommendations.length} 个推荐任务:`);
      data.data.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.task.title} (置信度: ${rec.confidence})`);
        console.log(`   推荐理由: ${rec.reason}`);
      });
      console.log(`📊 可用任务总数: ${data.data.total_available}`);
    } else {
      console.log(`❌ API错误: ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
  }
  
  console.log('─────────────────────────────────────────\n');
}

/**
 * 测试连接性
 */
async function testConnection() {
  console.log('🔗 测试API连接...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/test/connect_test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uuid: 'test-ai-chat-' + Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code === 0) {
      console.log(`✅ API连接正常: ${data.data.message}`);
    } else {
      console.log(`❌ API连接失败: ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ 连接测试失败: ${error.message}`);
  }
  
  console.log('─────────────────────────────────────────\n');
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 AI聊天功能集成测试开始\n');
  console.log('─────────────────────────────────────────\n');
  
  // 1. 测试基础连接
  await testConnection();
  
  // 2. 测试AI聊天
  await testAiChat();
  
  // 3. 测试AI推荐
  await testAiRecommendations();
  
  console.log('🎉 测试完成！');
  console.log('\n📌 注意事项:');
  console.log('1. 请确保后端服务正在运行 (http://localhost:8000)');
  console.log('2. 请确保已配置有效的QWEN_API_KEY环境变量');
  console.log('3. 请将TEST_TOKEN替换为有效的认证令牌');
  console.log('4. 如果看到401错误，请先通过登录接口获取有效token');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testAiChat,
  testAiRecommendations,
  testConnection
}; 