/**
 * 事项适配器工具 - 处理Item和Task之间的转换
 * 在重构期间提供统一的转换逻辑
 */
import { Item, ItemCategory } from '../types';
import { formatBeijingTimeToLocal } from './timezone';

/**
 * Item到Task兼容格式的适配器
 * 将API返回的Item格式转换为现有组件期望的Task格式
 */
export const adaptItemToTask = (apiItem: Item) => {
  return {
    ...apiItem, // 继承所有Item字段（包括priority: number）
    // 兼容字段的计算属性
    completed: apiItem.status_id === 3, // 3表示已完成
    dueDate: apiItem.start_time ? apiItem.start_time.split('T')[0] : undefined,
    startTime: apiItem.start_time ? formatBeijingTimeToLocal(apiItem.start_time) : undefined,
    endTime: apiItem.end_time ? formatBeijingTimeToLocal(apiItem.end_time) : undefined,
    category: mapCategoryIdToEnum(apiItem.category_id), // 从category_id转换
    duration: calculateDuration(apiItem), // 计算时长
    isAnytime: !apiItem.start_time,
    icon: apiItem.emoji,
    project: undefined, // 项目关联暂时保持为空，后续可以根据project_id查询
  };
};



// 不再需要priority转换 - 统一使用Item.priority (number 1-5)

/**
 * 将分类ID映射为ItemCategory枚举
 */
const mapCategoryIdToEnum = (categoryId: number): ItemCategory => {
  const categoryMap: Record<number, ItemCategory> = {
    1: ItemCategory.LIFE,
    2: ItemCategory.HEALTH,
    3: ItemCategory.WORK,
    4: ItemCategory.STUDY,
    5: ItemCategory.RELAX,
    6: ItemCategory.EXPLORE
  };
  return categoryMap[categoryId] || ItemCategory.LIFE;
};

/**
 * 计算事项的duration
 * 优先使用estimated_duration，其次根据start_time和end_time计算
 */
const calculateDuration = (item: any): string | undefined => {
  // 优先使用API提供的预估时长
  if (item.estimated_duration) {
    return `${item.estimated_duration}分钟`;
  }

  // 如果有开始和结束时间，计算时长
  if (item.start_time && item.end_time) {
    try {
      const startTime = new Date(item.start_time);
      const endTime = new Date(item.end_time);
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      if (diffMinutes > 0) {
        if (diffMinutes >= 60) {
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
        } else {
          return `${diffMinutes}分钟`;
        }
      }
    } catch (error) {
      console.warn('时间计算失败:', error);
    }
  }

  return undefined;
}; 