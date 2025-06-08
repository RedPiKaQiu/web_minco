import { Task, TASK_CATEGORIES, TaskCategory } from '../types';

// 任务类型到图标的映射
const TASK_TYPE_ICONS: Record<string, string> = {
  // 工作相关
  '会议': '💼',
  '邮件': '📧',
  '文档': '📄',
  '报告': '📊',
  '编程': '💻',
  '设计': '🎨',
  '开发': '⚙️',
  
  // 学习相关
  '阅读': '📖',
  '学习': '📚',
  '练习': '✏️',
  '考试': '📝',
  '课程': '🎓',
  
  // 生活相关
  '购物': '🛒',
  '做饭': '🍳',
  '清洁': '🧹',
  '洗衣': '👔',
  '缴费': '💳',
  '维修': '🔧',
  
  // 健康相关
  '运动': '🏃‍♂️',
  '健身': '💪',
  '跑步': '🏃',
  '瑜伽': '🧘‍♀️',
  '医疗': '🏥',
  '体检': '🩺',
  
  // 放松相关
  '游戏': '🎮',
  '电影': '🎬',
  '音乐': '🎵',
  '旅行': '✈️',
  '散步': '🚶‍♂️',
  
  // 探索相关
  '研究': '🔍',
  '调查': '🕵️‍♂️',
  '实验': '🧪',
  '探索': '🗺️',
};

/**
 * 根据任务获取对应的图标
 * 优先级：task.icon > 任务类型图标 > 任务类别图标 > 默认图标
 */
export function getTaskIcon(task: Task): string {
  // 1. 如果任务已有自定义图标，直接使用
  if (task.icon) {
    return task.icon;
  }
  
  // 2. 根据任务类型查找图标
  if (task.type && TASK_TYPE_ICONS[task.type]) {
    return TASK_TYPE_ICONS[task.type];
  }
  
  // 3. 根据任务类别查找图标
  if (task.category) {
    const categoryConfig = TASK_CATEGORIES.find(config => config.label === task.category);
    if (categoryConfig) {
      return categoryConfig.emoji;
    }
  }
  
  // 4. 默认图标
  return '📌';
}

/**
 * 获取任务类别的图标
 */
export function getCategoryIcon(category: TaskCategory): string {
  const categoryConfig = TASK_CATEGORIES.find(config => config.label === category);
  return categoryConfig?.emoji || '📌';
} 