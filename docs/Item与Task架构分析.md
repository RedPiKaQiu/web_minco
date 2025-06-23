# Item与Task架构分析文档

## 📋 概述

本文档详细分析了项目中Item和Task两种数据结构的设计理念、使用场景和演进过程。

### 🎯 核心理念
- **Item**: 后端数据格式，完全对应API响应的原始数据
- **Task**: 前端展示格式，经过适配和计算的用户友好数据
- **适配器**: 桥梁组件，处理两种格式之间的无缝转换

---

## 🏗️ 数据结构对比

### Item（后端数据格式）
```typescript
export interface Item {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  category_id: number;        // 1:生活, 2:健康, 3:工作, 4:学习, 5:放松, 6:探索
  project_id?: string;
  start_time?: string;        // ISO 8601 格式: "2024-01-01T09:00:00Z"
  end_time?: string;          // ISO 8601 格式
  estimated_duration?: number; // 分钟数: 30, 60, 120
  time_slot_id?: number;      // 1:上午, 2:中午, 3:下午, 4:晚上, 5:随时
  priority: number;           // 1-5, 5为最高优先级
  status_id: number;          // 1:pending, 2:in_progress, 3:completed, 4:cancelled
  is_overdue: boolean;
  sub_tasks?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
```

**特点**：
- 使用snake_case命名（符合后端API规范）
- 数字ID表示分类、状态、优先级等
- ISO标准时间格式
- 完全对应数据库字段

### Task（前端展示格式）
```typescript
export interface Task extends Partial<Item> {
  // 基本必需字段
  id: string;
  title: string;
  
  // 前端友好的计算属性
  completed: boolean;         // 从status_id计算：status_id === 3
  dueDate?: string;          // 从start_time提取："2024-01-01"
  startTime?: string;        // 格式化显示："上午 9:00"
  endTime?: string;          // 格式化显示："上午 10:30"
  duration?: string;         // 友好格式："30分钟", "1小时30分钟"
  category?: ItemCategory;   // 枚举：ItemCategory.WORK
  
  // 前端特有字段
  project?: string;          // 项目标题（而非ID）
  icon?: string;             // 显示图标
  isAnytime?: boolean;       // 是否为"随时可做"
  postponedToTomorrow?: boolean;
  subtasks?: {id: string, title: string, completed: boolean}[];
}
```

**特点**：
- 继承Item的所有字段
- 添加前端友好的计算属性
- 可读性强的数据格式
- 符合React组件的使用习惯

---

## 🔄 数据流转架构

### 数据流向图
```
┌─────────────┐    adaptItemToTask()    ┌─────────────┐    组件渲染    ┌─────────────┐
│   后端API   │ ────────────────────→  │   适配器    │ ─────────→   │  React组件  │
│  (Item格式) │                       │             │             │ (Task格式)  │
└─────────────┘                       └─────────────┘             └─────────────┘
      ↑                                                                   │
      │                              ┌─────────────┐                      │
      └────────────────────────────── │   API调用   │ ←───────────────────┘
                                     │  (Item格式) │
                                     └─────────────┘
```

### 适配器核心逻辑
```typescript
export const adaptItemToTask = (apiItem: Item) => {
  return {
    ...apiItem, // 继承所有Item字段
    
    // 状态转换
    completed: apiItem.status_id === 3,
    
    // 时间格式化
    dueDate: apiItem.start_time ? apiItem.start_time.split('T')[0] : undefined,
    startTime: apiItem.start_time ? formatBeijingTimeToLocal(apiItem.start_time) : undefined,
    endTime: apiItem.end_time ? formatBeijingTimeToLocal(apiItem.end_time) : undefined,
    
    // 分类转换
    category: mapCategoryIdToEnum(apiItem.category_id),
    
    // 时长计算
    duration: calculateDuration(apiItem),
    
    // 前端逻辑
    isAnytime: !apiItem.start_time,
    icon: apiItem.emoji,
    project: undefined, // 待实现项目标题查询
  };
};
```

---

## 🎨 使用场景分析

### Item适用场景
1. **API通信**
   ```typescript
   // 获取事项列表
   const response: ItemListResponse = await getItems();
   const items: Item[] = response.items;
   
   // 创建新事项
   const newItem: Item = await createItem({
     title: "学习TypeScript",
     category_id: 4, // 学习分类
     priority: 3,
     estimated_duration: 120
   });
   ```

2. **数据存储**
   ```typescript
   // 缓存到SessionStorage
   sessionStorage.setItem('timeline-tasks', JSON.stringify(items));
   
   // 数据库操作
   await updateItem(itemId, {
     status_id: 3, // 标记为已完成
     completed_at: new Date().toISOString()
   });
   ```

### Task适用场景
1. **组件渲染**
   ```tsx
   const TaskCard = ({ task }: { task: Task }) => (
     <div className={`task-card ${task.completed ? 'completed' : ''}`}>
       <h3>{task.icon} {task.title}</h3>
       <span className="category">{task.category}</span>
       {task.duration && <span className="duration">⏱️ {task.duration}</span>}
       {task.startTime && <span className="time">📅 {task.startTime}</span>}
     </div>
   );
   ```

2. **状态管理**
   ```typescript
   // AppContext中使用Task格式
   interface AppState {
     tasks: Task[]; // 前端状态使用Task格式
     projects: Project[];
     focusMode: boolean;
   }
   
   // 组件中的状态更新
   dispatch({
     type: 'UPDATE_TASK',
     payload: {
       ...task,
       completed: true,
       duration: "已完成"
     }
   });
   ```

---

## 🚀 设计优势

### ✅ 架构优势

1. **关注点分离**
   - Item: 专注数据结构和API兼容性
   - Task: 专注用户界面和交互体验

2. **类型安全**
   ```typescript
   // 编译时检查，避免运行时错误
   const task: Task = adaptItemToTask(apiItem);
   console.log(task.completed); // ✅ boolean
   console.log(task.category);  // ✅ ItemCategory | undefined
   ```

3. **渐进式重构**
   - 现有组件无需大改
   - 新功能可直接使用Item
   - 逐步减少适配层

4. **维护性**
   - API变更只需修改适配器
   - 前端显示逻辑集中管理
   - 数据转换逻辑可测试

### 📊 性能考虑

1. **内存使用**
   ```typescript
   // 继承模式，避免数据重复
   interface Task extends Partial<Item> {
     // 只添加计算属性，不重复存储
   }
   ```

2. **计算缓存**
   ```typescript
   // 适配器中的计算属性
   duration: calculateDuration(apiItem), // 一次计算，多次使用
   ```

---

## 🔮 演进规划

### 当前状态 (v1.0)
```
Item (后端) ──→ Adapter ──→ Task (前端)
```

### 短期目标 (v1.5)
```typescript
// 减少Task独有字段，增加计算属性
interface Task extends Item {
  readonly completed: boolean;    // getter属性
  readonly formattedDuration: string;
  readonly categoryLabel: string;
}
```

### 长期目标 (v2.0)
```typescript
// 完全统一，只使用Item + 计算属性
interface DisplayItem extends Item {
  // 添加UI专用的getter
  get isCompleted(): boolean;
  get displayTime(): string;
  get categoryName(): string;
}
```

### 迁移步骤
1. ✅ **第一阶段**: 统一priority类型（已完成）
2. ✅ **第二阶段**: 删除type字段，统一使用category（已完成）
3. 🔄 **第三阶段**: 将duration和category改为计算属性（已完成）
4. 📋 **第四阶段**: 统一时间格式处理
5. 📋 **第五阶段**: 合并重复字段，完全统一

---

## 🛠️ 最佳实践

### 开发规范

1. **新功能开发**
   ```typescript
   // ✅ 推荐：直接使用Item + 适配器
   const items = await getItems();
   const tasks = items.map(adaptItemToTask);
   
   // ❌ 避免：手动转换
   const tasks = items.map(item => ({
     ...item,
     completed: item.status_id === 3 // 重复逻辑
   }));
   ```

2. **组件设计**
   ```tsx
   // ✅ 推荐：接受Task类型，使用友好字段
   interface TaskCardProps {
     task: Task;
   }
   
   // ❌ 避免：直接使用Item的原始字段
   <div>{task.status_id === 3 ? '已完成' : '待完成'}</div>
   ```

3. **数据更新**
   ```typescript
   // ✅ 推荐：API使用Item格式
   await updateItem(id, {
     status_id: 3,
     completed_at: new Date().toISOString()
   });
   
   // 状态更新使用Task格式
   dispatch({
     type: 'UPDATE_TASK',
     payload: { ...task, completed: true }
   });
   ```

### 测试策略

1. **适配器测试**
   ```typescript
   describe('adaptItemToTask', () => {
     it('应该正确转换状态', () => {
       const item: Item = { status_id: 3, /* ... */ };
       const task = adaptItemToTask(item);
       expect(task.completed).toBe(true);
     });
     
     it('应该正确计算时长', () => {
       const item: Item = { estimated_duration: 90 };
       const task = adaptItemToTask(item);
       expect(task.duration).toBe('1小时30分钟');
     });
   });
   ```

2. **集成测试**
   ```typescript
   describe('数据流转', () => {
     it('从API到组件的完整流程', async () => {
       const apiResponse = await getItems();
       const tasks = apiResponse.items.map(adaptItemToTask);
       expect(tasks[0]).toHaveProperty('completed');
       expect(tasks[0]).toHaveProperty('category');
     });
   });
   ```

---

## 📚 参考资料

### 相关文件
- `src/types/index.ts` - 类型定义
- `src/utils/itemAdapters.ts` - 适配器实现
- `src/api/items.ts` - API接口
- `docs/API接口文档.md` - 后端接口说明

### 历史变更
- 2024-01: 初始设计，Item和Task分离
- 2024-02: 统一priority字段类型
- 2024-02: 删除type字段，使用category统一分类
- 2024-02: 实现duration和category计算属性

### 技术栈
- TypeScript 5.x - 类型安全
- React 18.x - 组件渲染
- Vite 6.x - 构建工具

---

*文档版本：v1.0*  
*最后更新：2024年12月*  
*维护者：项目开发团队* 