/**
 * 事项适配器工具 - 处理Item和Task之间的转换
 * 在重构期间提供统一的转换逻辑
 */
import { Item, ItemCategory, RecommendedTask } from '../types';
import type { RecommendationItem } from '../services/RecommendationService';

/**
 * 从ISO时间字符串中提取时间部分 (HH:MM格式)
 */
const extractTimeFromISO = (isoString: string): string | undefined => {
  try {
    if (!isoString) return undefined;
    
    // 直接从ISO字符串中提取时间部分
    // 例如: "2025-06-25T09:00:00Z" -> "09:00"
    const timePart = isoString.split('T')[1];
    if (!timePart) return undefined;
    
    // 移除秒数和时区信息，只保留小时:分钟
    const timeOnly = timePart.split(':').slice(0, 2).join(':');
    return timeOnly;
  } catch (error) {
    console.error('❌ extractTimeFromISO: 时间提取失败', { isoString, error });
    return undefined;
  }
};

/**
 * Item到Task兼容格式的适配器
 * 将API返回的Item格式转换为现有组件期望的Task格式
 */
export const adaptItemToTask = (apiItem: Item) => {
  try {
    return {
      ...apiItem, // 继承所有Item字段（包括priority: number）
      // 兼容字段的计算属性
      completed: apiItem.status_id === 3, // 3表示已完成
      dueDate: apiItem.start_time ? apiItem.start_time.split('T')[0] : undefined,
      startTime: apiItem.start_time ? extractTimeFromISO(apiItem.start_time) : undefined,
      endTime: apiItem.end_time ? extractTimeFromISO(apiItem.end_time) : undefined,
      category: mapCategoryIdToEnum(apiItem.category_id), // 从category_id转换
      duration: calculateDuration(apiItem), // 计算时长
      isAnytime: !apiItem.start_time,
      icon: apiItem.emoji,
      project: undefined, // 项目关联暂时保持为空，后续可以根据project_id查询
    };
  } catch (error) {
    console.error('❌ adaptItemToTask: 事项数据转换失败', {
      itemId: apiItem.id,
      itemTitle: apiItem.title,
      startTime: apiItem.start_time,
      endTime: apiItem.end_time,
      error: error instanceof Error ? error.message : error
    });
    
    // 返回一个安全的默认值，避免应用崩溃
    return {
      ...apiItem,
      completed: false,
      dueDate: undefined,
      startTime: undefined,
      endTime: undefined,
      category: mapCategoryIdToEnum(apiItem.category_id),
      duration: undefined,
      isAnytime: true,
      icon: apiItem.emoji || '📝',
      project: undefined,
    };
  }
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

/**
 * 推荐项到包含推荐理由的任务的适配器
 * 优先从Item的扩展字段中读取推荐信息，如果不存在则从RecommendationItem中获取
 */
export const adaptRecommendationItemToTask = (itemOrRecommendation: Item | RecommendationItem): RecommendedTask => {
  try {
    let item: Item;
    let reason: string;
    let confidence: number | undefined;
    let priorityScore: number | undefined;
    let timeMatchScore: number | undefined;
    let suggestedDuration: number | undefined;
    
    // 判断输入类型并提取数据
    if ('item' in itemOrRecommendation) {
      // 输入是 RecommendationItem
      const recommendationItem = itemOrRecommendation as RecommendationItem;
      item = recommendationItem.item;
      reason = recommendationItem.reason;
      confidence = recommendationItem.confidence;
      priorityScore = recommendationItem.priorityScore;
      timeMatchScore = recommendationItem.timeMatchScore;
      suggestedDuration = recommendationItem.suggestedDuration;
    } else {
      // 输入是 Item，检查是否有推荐扩展字段
      item = itemOrRecommendation as Item;
      reason = item._recommendationReason || '现在是完成这个事项的好时机';
      confidence = item._confidence;
      priorityScore = item._priorityScore;
      timeMatchScore = item._timeMatchScore;
      suggestedDuration = item._suggestedDuration;
    }
    
    // 先使用标准适配器转换Item
    const task = adaptItemToTask(item);
    
    // 添加推荐相关的扩展字段
    return {
      ...task,
      recommendationReason: reason,
      confidence: confidence,
      priorityScore: priorityScore,
      timeMatchScore: timeMatchScore,
      suggestedDuration: suggestedDuration
    };
  } catch (error) {
    console.error('❌ adaptRecommendationItemToTask: 推荐项数据转换失败', {
      input: itemOrRecommendation,
      error
    });
    
    // 降级处理：只进行基本的Item适配，不包含推荐信息
    const fallbackItem = 'item' in itemOrRecommendation 
      ? (itemOrRecommendation as RecommendationItem).item 
      : itemOrRecommendation as Item;
    const task = adaptItemToTask(fallbackItem);
    return {
      ...task,
      recommendationReason: '现在是完成这个事项的好时机'
    };
  }
}; 