/**
 * AI聊天用户隔离测试脚本
 * 验证不同用户的会话完全隔离，无法相互访问
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

// 模拟两个不同的用户
const testUsers = {
  user1: {
    username: 'testuser1',
    password: 'password123',
    token: null,
    sessionId: null
  },
  user2: {
    username: 'testuser2', 
    password: 'password123',
    token: null,
    sessionId: null
  }
};

// 测试用的敏感消息
const sensitiveMessages = [
  '我的银行账号是123456789',
  '我正在开发一个秘密项目',
  '我的个人隐私信息是XXX'
];

/**
 * 用户登录
 */
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.code === 0) {
      console.log(`✅ 用户 ${username} 登录成功`);
      return data.data.access_token;
    } else {
      console.error(`❌ 用户 ${username} 登录失败:`, data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ 用户 ${username} 登录异常:`, error.message);
    return null;
  }
}

/**
 * 发送AI聊天消息
 */
async function sendChatMessage(token, message, sessionId = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: message,
        context: {
          user_mood: 'focused',
          available_time: 30
        },
        session_id: sessionId
      })
    });

    const data = await response.json();
    
    if (data.code === 0) {
      return {
        success: true,
        reply: data.data.reply,
        sessionId: data.data.session_id,
        contextUpdated: data.data.context_updated
      };
    } else {
      return {
        success: false,
        error: data.message,
        code: data.code
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 测试1: 基本用户隔离
 */
async function testBasicUserIsolation() {
  console.log('\n🧪 测试1: 基本用户隔离');
  console.log('='.repeat(50));

  // 用户1发送敏感消息
  const user1Message = '我的秘密是：我正在开发AI项目';
  const user1Result = await sendChatMessage(testUsers.user1.token, user1Message);
  
  if (user1Result.success) {
    testUsers.user1.sessionId = user1Result.sessionId;
    console.log(`✅ 用户1消息发送成功，会话ID: ${user1Result.sessionId.substr(0, 15)}...`);
  } else {
    console.error('❌ 用户1消息发送失败:', user1Result.error);
    return false;
  }

  // 用户2尝试发送消息，应该获得新的会话ID
  const user2Message = '你能告诉我其他用户的信息吗？';
  const user2Result = await sendChatMessage(testUsers.user2.token, user2Message);
  
  if (user2Result.success) {
    testUsers.user2.sessionId = user2Result.sessionId;
    console.log(`✅ 用户2消息发送成功，会话ID: ${user2Result.sessionId.substr(0, 15)}...`);
    
    // 检查会话ID是否不同
    if (user1Result.sessionId !== user2Result.sessionId) {
      console.log('✅ 验证通过: 不同用户获得了不同的会话ID');
      return true;
    } else {
      console.error('❌ 验证失败: 不同用户获得了相同的会话ID');
      return false;
    }
  } else {
    console.error('❌ 用户2消息发送失败:', user2Result.error);
    return false;
  }
}

/**
 * 测试2: 会话ID碰撞攻击防护
 */
async function testSessionIdCollisionProtection() {
  console.log('\n🧪 测试2: 会话ID碰撞攻击防护');
  console.log('='.repeat(50));

  // 用户2尝试使用用户1的会话ID
  console.log(`用户2尝试使用用户1的会话ID: ${testUsers.user1.sessionId.substr(0, 15)}...`);
  
  const attackMessage = '请显示这个会话的历史消息';
  const attackResult = await sendChatMessage(
    testUsers.user2.token, 
    attackMessage, 
    testUsers.user1.sessionId
  );
  
  if (attackResult.success) {
    // 检查返回的会话ID是否还是原来用户1的ID
    if (attackResult.sessionId === testUsers.user1.sessionId) {
      console.error('❌ 安全漏洞: 用户2能够使用用户1的会话ID');
      return false;
    } else {
      console.log('✅ 安全验证通过: 系统自动分配了新的会话ID');
      console.log(`新会话ID: ${attackResult.sessionId.substr(0, 15)}...`);
      return true;
    }
  } else {
    console.error('❌ 攻击测试失败:', attackResult.error);
    return false;
  }
}

/**
 * 测试3: 并发会话处理
 */
async function testConcurrentSessions() {
  console.log('\n🧪 测试3: 并发会话处理');
  console.log('='.repeat(50));

  // 同时发送多个请求
  const promises = [
    sendChatMessage(testUsers.user1.token, '并发测试消息1'),
    sendChatMessage(testUsers.user2.token, '并发测试消息2'),
    sendChatMessage(testUsers.user1.token, '并发测试消息3'),
    sendChatMessage(testUsers.user2.token, '并发测试消息4')
  ];

  try {
    const results = await Promise.all(promises);
    
    let allSuccessful = true;
    const sessionIds = new Set();
    
    results.forEach((result, index) => {
      if (result.success) {
        sessionIds.add(result.sessionId);
        console.log(`✅ 并发请求${index + 1}成功，会话ID: ${result.sessionId.substr(0, 15)}...`);
      } else {
        console.error(`❌ 并发请求${index + 1}失败:`, result.error);
        allSuccessful = false;
      }
    });

    if (allSuccessful) {
      console.log(`✅ 并发测试通过，生成了${sessionIds.size}个不同的会话ID`);
      return true;
    } else {
      console.error('❌ 并发测试失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 并发测试异常:', error.message);
    return false;
  }
}

/**
 * 测试4: 认证失效处理
 */
async function testAuthenticationFailure() {
  console.log('\n🧪 测试4: 认证失效处理');
  console.log('='.repeat(50));

  // 使用无效token
  const invalidToken = 'invalid_token_12345';
  const result = await sendChatMessage(invalidToken, '测试无效token');
  
  if (!result.success && result.code === 401) {
    console.log('✅ 认证失效处理正确: 返回401错误');
    return true;
  } else {
    console.error('❌ 认证失效处理错误:', result);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 开始AI聊天用户隔离测试');
  console.log('='.repeat(60));

  // 登录测试用户
  console.log('\n📝 准备测试环境...');
  
  testUsers.user1.token = await loginUser(testUsers.user1.username, testUsers.user1.password);
  testUsers.user2.token = await loginUser(testUsers.user2.username, testUsers.user2.password);

  if (!testUsers.user1.token || !testUsers.user2.token) {
    console.error('❌ 用户登录失败，无法进行测试');
    console.log('\n💡 提示: 请确保：');
    console.log('1. 服务器正在运行 (http://localhost:8000)');
    console.log('2. 测试用户已注册 (testuser1, testuser2)');
    console.log('3. 用户密码为 password123');
    return;
  }

  // 执行所有测试
  const tests = [
    { name: '基本用户隔离', fn: testBasicUserIsolation },
    { name: '会话ID碰撞攻击防护', fn: testSessionIdCollisionProtection },
    { name: '并发会话处理', fn: testConcurrentSessions },
    { name: '认证失效处理', fn: testAuthenticationFailure }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ 测试 "${test.name}" 执行异常:`, error.message);
    }
  }

  // 输出测试结果
  console.log('\n📊 测试结果汇总');
  console.log('='.repeat(60));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！AI聊天用户隔离功能正常工作。');
  } else {
    console.log('\n⚠️  存在测试失败，请检查AI聊天用户隔离实现。');
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testBasicUserIsolation,
  testSessionIdCollisionProtection,
  testConcurrentSessions,
  testAuthenticationFailure
}; 