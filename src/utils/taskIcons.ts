/**
 * 任务图标工具函数，根据任务类别提供对应的图标
 */
import { ITEM_CATEGORIES, ItemCategory } from '../types';

/**
 * 根据任务获取对应的图标
 * 优先级：task.icon > 任务类别图标 > 默认图标
 */
export function getItemIcon(task: any): string {
  // 1. 如果任务已有自定义图标，直接使用
  if (task.icon || task.emoji) {
    return task.icon || task.emoji;
  }
  
  // 2. 根据任务类别查找图标 (支持Task.category或根据Item.category_id计算)
  let category: ItemCategory | undefined;
  if (task.category) {
    category = task.category;
  } else if (task.category_id) {
    // 从category_id映射到ItemCategory
    const categoryMap: Record<number, ItemCategory> = {
      1: ItemCategory.LIFE,
      2: ItemCategory.HEALTH,
      3: ItemCategory.WORK,
      4: ItemCategory.STUDY,
      5: ItemCategory.RELAX,
      6: ItemCategory.EXPLORE
    };
    category = categoryMap[task.category_id];
  }
  
  if (category) {
    const categoryConfig = ITEM_CATEGORIES.find(config => config.label === category);
    if (categoryConfig) {
      return categoryConfig.emoji;
    }
  }
  
  // 3. 默认图标
  return '📌';
}

/**
 * 获取任务类别的图标
 */
export function getCategoryIcon(category: ItemCategory): string {
  const categoryConfig = ITEM_CATEGORIES.find(config => config.label === category);
  return categoryConfig?.emoji || '📌';
} 