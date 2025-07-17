/**
 * 推荐服务 - 使用Methods设计模式支持多种推荐策略
 * 提供AI推荐和本地推荐两种方法，可以简便地切换
 */
import { Item } from '../types';
import { getAiRecommendations, AiRecommendationRequest, AiRecommendationResponse } from '../api/ai';

// 推荐方法枚举
export type RecommendationMethod = 'ai' | 'local';

// 推荐配置
export interface RecommendationConfig {
  method?: RecommendationMethod;
  count?: number;
  userContext?: {
    mood?: 'focused' | 'tired' | 'energetic' | 'anxious';
    energy_level?: number;
    available_time?: number;
    location?: string;
  };
  recommendationType?: 'smart' | 'priority' | 'time_based' | 'mood_based';
}

// 统一的推荐结果格式
export interface RecommendationResult {
  recommendations: RecommendationItem[];
  message: string;
  totalAvailable: number;
  method: RecommendationMethod;
  processingTime: number;
}

// 推荐项格式
export interface RecommendationItem {
  item: Item;
  reason: string;
  confidence: number;
  priorityScore?: number;
  timeMatchScore?: number;
  suggestedDuration?: number;
}

/**
 * 推荐服务类
 * 使用Methods设计模式，支持多种推荐策略
 */
export class RecommendationService {
  private defaultConfig: RecommendationConfig = {
    method: 'ai', // 默认使用AI推荐，失败时自动降级
    count: 3,
    recommendationType: 'smart'
  };

  constructor(private config: Partial<RecommendationConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * 获取推荐 - 主要入口方法
   * 根据配置的方法自动选择推荐策略
   */
  async getRecommendations(
    tasks: Item[], 
    config?: Partial<RecommendationConfig>
  ): Promise<RecommendationResult> {
    const finalConfig = { ...this.config, ...config };
    const startTime = Date.now();

    console.log('🎯 RecommendationService: 开始获取推荐', { 
      method: finalConfig.method,
      taskCount: tasks.length,
      config: finalConfig
    });

    // 🚀 早期检查：如果没有任务，直接返回空结果，避免不必要的API调用
    if (tasks.length === 0) {
      console.log('📋 RecommendationService: 任务数量为0，跳过推荐计算');
      return {
        recommendations: [],
        message: '今日暂无事项，享受这难得的悠闲时光吧！ 🌸',
        totalAvailable: 0,
        method: finalConfig.method || 'ai',
        processingTime: Date.now() - startTime
      };
    }

    // 🔍 过滤未完成的任务
    const incompleteTasks = tasks.filter(task => task.status_id !== 3);
    if (incompleteTasks.length === 0) {
      console.log('🎉 RecommendationService: 所有任务都已完成');
      return {
        recommendations: [],
        message: '🎉 太棒了！所有事项都已完成，今天真是高效的一天！',
        totalAvailable: 0,
        method: finalConfig.method || 'ai',
        processingTime: Date.now() - startTime
      };
    }

         try {
       let result: RecommendationResult;

       switch (finalConfig.method) {
         case 'ai':
           result = await this.getAiRecommendations(incompleteTasks, finalConfig as Required<RecommendationConfig>);
           break;
         case 'local':
         default:
           result = await this.getLocalRecommendations(incompleteTasks, finalConfig as Required<RecommendationConfig>);
           break;
       }

      result.processingTime = Date.now() - startTime;
      
      console.log('✅ RecommendationService: 推荐获取成功', {
        method: finalConfig.method,
        count: result.recommendations.length,
        processingTime: result.processingTime
      });

      return result;
    } catch (error) {
      console.error('❌ RecommendationService: 推荐获取失败', error);
      
             // 降级到本地推荐
       if (finalConfig.method === 'ai') {
         console.log('🔄 RecommendationService: AI推荐失败，降级到本地推荐');
         return this.getLocalRecommendations(incompleteTasks, { ...finalConfig, method: 'local' } as Required<RecommendationConfig>);
       }
      
      throw error;
    }
  }

  /**
   * AI推荐方法
   */
  private async getAiRecommendations(
    tasks: Item[], 
    config: Required<RecommendationConfig>
  ): Promise<RecommendationResult> {
    console.log('🤖 RecommendationService: 使用AI推荐');

    const request: AiRecommendationRequest = {
      task_ids: tasks.map(task => task.id),
      user_context: {
        ...config.userContext,
        current_time: new Date().toISOString()
      },
      count: config.count || 3,
      recommendation_type: config.recommendationType || 'smart'
    };

    try {
      const response: AiRecommendationResponse = await getAiRecommendations(request);
      
      // 转换为统一格式
      const recommendations: RecommendationItem[] = response.recommendations.map(aiItem => ({
        item: this.mapAiItemToItem(aiItem.item),
        reason: aiItem.reason,
        confidence: aiItem.confidence_score,
        priorityScore: aiItem.priority_score,
        timeMatchScore: aiItem.time_match_score,
        suggestedDuration: aiItem.suggested_duration
      }));

      return {
        recommendations,
        message: response.message,
        totalAvailable: response.total_available,
        method: 'ai',
        processingTime: response.processing_time_ms
      };
    } catch (error) {
      console.error('🤖 AI推荐调用失败:', error);
      throw new Error('AI推荐服务暂时不可用');
    }
  }

  /**
   * 本地推荐方法
   * 保留原有的前端推荐算法
   */
  private async getLocalRecommendations(
    tasks: Item[], 
    config: Required<RecommendationConfig>
  ): Promise<RecommendationResult> {
    console.log('💻 RecommendationService: 使用本地推荐算法');

    const startTime = Date.now();
    
    // 注意：传入的tasks已经是过滤后的未完成任务
    const incompleteTasks = tasks;
    
    let recommendedTasks: Item[] = [];
    let strategy = '';

    // 策略1: 高优先级任务（≥4）
    const highPriorityTasks = incompleteTasks.filter(task => task.priority >= 4);
    if (highPriorityTasks.length > 0) {
      strategy = '高优先级优先';
      recommendedTasks = highPriorityTasks
        .sort((a, b) => b.priority - a.priority)
        .slice(0, config.count || 3);
    }
    // 策略2: 中等优先级任务（=3）
    else {
      const mediumPriorityTasks = incompleteTasks.filter(task => task.priority === 3);
      if (mediumPriorityTasks.length > 0) {
        strategy = '中等优先级';
        const withTime = mediumPriorityTasks.filter(task => task.start_time);
        const withoutTime = mediumPriorityTasks.filter(task => !task.start_time);
        recommendedTasks = [...withTime, ...withoutTime].slice(0, config.count || 3);
      }
      // 策略3: 所有剩余任务，有时间的优先
      else {
        strategy = '时间安排优先';
        const withTime = incompleteTasks.filter(task => task.start_time);
        const withoutTime = incompleteTasks.filter(task => !task.start_time);
        recommendedTasks = [...withTime, ...withoutTime].slice(0, config.count || 3);
      }
    }

    // 根据用户上下文调整推荐
    recommendedTasks = this.adjustRecommendationsByContext(recommendedTasks, config.userContext);

    // 转换为统一格式
    const recommendations: RecommendationItem[] = recommendedTasks.map((task, index) => ({
      item: task,
      reason: this.generateLocalReason(task, strategy, config.userContext),
      confidence: this.calculateLocalConfidence(task, index),
      priorityScore: task.priority / 5,
      timeMatchScore: task.start_time ? 0.8 : 0.5,
      suggestedDuration: task.estimated_duration || this.estimateDuration(task)
    }));

    return {
      recommendations,
      message: this.generateLocalMessage(strategy, recommendedTasks.length),
      totalAvailable: incompleteTasks.length,
      method: 'local',
      processingTime: Date.now() - startTime
    };
  }

  /**
   * 根据用户上下文调整推荐
   */
  private adjustRecommendationsByContext(tasks: Item[], userContext?: RecommendationConfig['userContext']): Item[] {
    if (!userContext) return tasks;

    // 根据精力水平过滤
    if (userContext.energy_level !== undefined) {
      if (userContext.energy_level <= 3) {
        // 低精力：优先推荐简单任务
        return tasks.filter(task => !task.estimated_duration || task.estimated_duration <= 30);
      } else if (userContext.energy_level >= 7) {
        // 高精力：可以推荐复杂任务
        return tasks;
      }
    }

    // 根据可用时间过滤
    if (userContext.available_time !== undefined) {
      return tasks.filter(task => 
        !task.estimated_duration || task.estimated_duration <= userContext.available_time!
      );
    }

    // 根据心情调整
    if (userContext.mood) {
      switch (userContext.mood) {
        case 'tired':
          // 疲惫时推荐轻松任务
          return tasks.filter(task => task.priority <= 3);
        case 'anxious':
          // 焦虑时推荐有明确时间安排的任务
          return tasks.filter(task => task.start_time);
        case 'energetic':
          // 精力充沛时推荐高优先级任务
          return tasks.filter(task => task.priority >= 4);
        default:
          return tasks;
      }
    }

    return tasks;
  }

  /**
   * 生成本地推荐理由
   */
  private generateLocalReason(task: Item, strategy: string, userContext?: RecommendationConfig['userContext']): string {
    const reasons = [];

    // 基于策略的理由
    if (strategy === '高优先级优先') {
      reasons.push('这是高优先级事项，建议优先处理');
    } else if (strategy === '中等优先级') {
      reasons.push('适合当前处理的中等优先级事项');
    } else if (strategy === '时间安排优先') {
      if (task.start_time) {
        reasons.push('已有时间安排，不要错过');
      } else {
        reasons.push('可以灵活安排时间处理');
      }
    }

    // 基于用户上下文的理由
    if (userContext?.mood === 'focused') {
      reasons.push('您现在很专注，适合处理这类事项');
    } else if (userContext?.mood === 'tired') {
      reasons.push('这个事项比较轻松，适合现在处理');
    } else if (userContext?.energy_level && userContext.energy_level >= 7) {
      reasons.push('您精力充沛，正是处理这个事项的好时机');
    }

    // 基于时间的理由
    if (task.estimated_duration && userContext?.available_time) {
      if (task.estimated_duration <= userContext.available_time) {
        reasons.push(`预计${task.estimated_duration}分钟，在您的可用时间内`);
      }
    }

    return reasons.length > 0 ? reasons.join('，') : '现在是完成这个事项的好时机';
  }

  /**
   * 计算本地推荐置信度
   */
  private calculateLocalConfidence(task: Item, index: number): number {
    let confidence = 0.8 - (index * 0.1); // 基础置信度递减
    
    // 根据优先级调整
    confidence += (task.priority - 3) * 0.1;
    
    // 有时间安排的任务置信度更高
    if (task.start_time) {
      confidence += 0.1;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * 生成本地推荐消息
   */
  private generateLocalMessage(strategy: string, count: number): string {
    const timeGreeting = this.getTimeGreeting();
    return `${timeGreeting}基于${strategy}策略，为您推荐${count}个事项`;
  }

  /**
   * 获取时间问候语
   */
  private getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '早上好！';
    } else if (hour >= 12 && hour < 14) {
      return '中午好！';
    } else if (hour >= 14 && hour < 18) {
      return '下午好！';
    } else if (hour >= 18 && hour < 22) {
      return '晚上好！';
    } else {
      return '夜深了，';
    }
  }

  /**
   * 估算任务时长
   */
  private estimateDuration(task: Item): number {
    // 根据标题长度和优先级简单估算
    const baseTime = 30;
    const priorityMultiplier = task.priority / 3;
    const titleMultiplier = Math.min(2, task.title.length / 10);
    
    return Math.round(baseTime * priorityMultiplier * titleMultiplier);
  }

  /**
   * 将AI返回的item格式转换为标准Item格式
   */
  private mapAiItemToItem(aiItem: any): Item {
    return {
      id: aiItem.id,
      title: aiItem.title,
      description: aiItem.description || '',
      emoji: aiItem.emoji || '📝',
      category_id: aiItem.category_id,
      project_id: aiItem.project_id || null,
      start_time: aiItem.start_time || null,
      end_time: aiItem.end_time || null,
      estimated_duration: aiItem.estimated_duration || null,
      time_slot_id: aiItem.time_slot_id || null,
      priority: aiItem.priority,
      status_id: aiItem.status_id,
      is_overdue: aiItem.is_overdue || false,
      sub_tasks: aiItem.sub_tasks || [],
      created_at: aiItem.created_at,
      updated_at: aiItem.updated_at,
      completed_at: aiItem.completed_at || null
    };
  }





  /**
   * 更新配置
   */
  updateConfig(config: Partial<RecommendationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): RecommendationConfig {
    return { ...this.config };
  }
} 