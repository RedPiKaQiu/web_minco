# 事项分类统一规范

## 概述

本文档说明了事项分类系统的统一规范，通过TypeScript枚举确保分类的一致性和类型安全。

## 统一的分类枚举

在 `src/types/index.ts` 中定义了统一的事项分类枚举：

```typescript
export enum TaskCategory {
  LIFE = '生活',
  HEALTH = '健康', 
  WORK = '工作',
  STUDY = '学习',
  RELAX = '放松',
  EXPLORE = '探索'
}
```

## 分类配置

为每个分类提供了标准的配置，包括emoji图标：

```typescript
export const TASK_CATEGORIES: TaskCategoryConfig[] = [
  { id: 'LIFE', label: TaskCategory.LIFE, emoji: '🏠' },
  { id: 'HEALTH', label: TaskCategory.HEALTH, emoji: '💪' },
  { id: 'WORK', label: TaskCategory.WORK, emoji: '💼' },
  { id: 'STUDY', label: TaskCategory.STUDY, emoji: '📚' },
  { id: 'RELAX', label: TaskCategory.RELAX, emoji: '🎮' },
  { id: 'EXPLORE', label: TaskCategory.EXPLORE, emoji: '🔍' },
];
```

## 更新的文件

### 1. `src/types/index.ts`
- 添加了 `TaskCategory` 枚举
- 添加了 `TaskCategoryConfig` 接口
- 添加了 `TASK_CATEGORIES` 常量
- 更新了 `Task` 接口中的 `category` 字段类型

### 2. `src/pages/NewTaskPage.tsx`
- 使用 `TASK_CATEGORIES` 替代硬编码的分类选项
- 更新了类型映射逻辑
- 确保编辑模式下的分类预填充正确

### 3. `src/pages/ProjectsPage.tsx`
- 使用统一的分类配置
- 更新了分类状态管理
- 统一了分类筛选逻辑

### 4. `src/context/AppContext.tsx`
- 添加了API数据到应用内部数据的类型映射
- 确保API返回的数据正确转换为 `TaskCategory` 类型

## API数据映射

由于后端API使用不同的类型值，添加了映射逻辑：

- `study` → `TaskCategory.STUDY`
- `career` → `TaskCategory.WORK`
- `health` → `TaskCategory.HEALTH`
- `art` → `TaskCategory.RELAX`
- `other` → `TaskCategory.LIFE` (默认)

## 优势

1. **类型安全**: TypeScript枚举确保只能使用预定义的分类值
2. **一致性**: 所有组件使用统一的分类配置
3. **可维护性**: 分类的修改只需在一个地方进行
4. **扩展性**: 新增分类只需更新枚举和配置数组
5. **国际化友好**: 分类显示值与内部枚举值分离

## 注意事项

- 所有新的事项创建/编辑功能都必须使用 `TaskCategory` 枚举
- UI组件应该使用 `TASK_CATEGORIES` 配置来渲染分类选项
- API数据需要通过映射函数转换为标准的分类值 