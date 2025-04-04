请基于以下产品文档和前端技术框架方案，生成一个产品 Web 前端框架 Demo，视觉效果尽量高级，接近提供的图片效果。

**1. 产品描述**

*   **产品名称：** 航海日志（暂定）
*   **产品定位：** 一款结合任务管理与情绪支持的个人成长助手。
*   **核心理念：** 遵循用户自然节律，以身心健康为前提，用低压力、友好的方式帮助用户实现想做的事。
*   **核心用户：** 有自我探索需求的用户，关注包括但不限于女性 ADHD 在内的神经多样性人群需求。
*   **产品形态：** Web 页面（MVP 阶段，后续扩展到 iOS App + watch app + Web 端）。
*   **视觉风格：** 简约线条设计，避免过度拟物，注重流动感和节奏感，海洋色系为主，简单的动效。参考图片中APP的UI风格。

**2. 产品核心功能**

*   **首页（Home）：**
    *   今日任务概览（航线规划）。
    *   最近收集的票根/邮戳展示。
    *   快速添加任务入口。
    *   专注模式入口（启航入口）。
*   **任务管理页（Tasks）：**
    *   任务列表视图。
    *   任务事项（任务内容、任务性质、任务分类、重复、优先级、日期、估时、图标、子任务）。
    *   基础的任务编辑功能。
    *   完成任务盖章功能。
*   **专注模式页（Focus）：**
    *   简约的计时器。
    *   基础的船只航行动画。
    *   简单的海洋背景效果。
    *   最小化的干扰元素。
*   **票根收藏页（Collection）：**
    *   票根/邮戳展示墙。
    *   基础的票根查看功能。
    *   简单的时间线展示。
    *   航海日志记录。
*   **设置页（Settings）：**
    *   基础用户设置。
    *   提醒方式设置。
    *   AI 助手风格选择。
    *   简单的主题设置。

**3. 前端技术框架方案**

*   **核心框架：**
    *   React 18
    *   TypeScript（添加类型支持）
*   **样式和 UI：**
    *   Tailwind CSS
    *   @headlessui/react（轻量级组件）
    *   lucide-react（图标库）
*   **状态管理：**
    *   React Context + useReducer
    *   localStorage（持久化存储）
*   **路由：**
    *   React Router 6
*   **动画：**
    *   Framer Motion
*   **构建工具：**
    *   Vite（比 Create React App 更快的启动和热更新）
*   **开发工具：**
    *   ESLint
    *   Prettier

**4. 详细设计要求**

*   **首页：**
    *   使用 Tailwind CSS 打造一个简洁美观的今日任务概览区域，突出显示当前最重要的任务。
    *   票根/邮戳展示区域采用卡片式布局，使用 Framer Motion 实现简单的 Hover 动画效果。
    *   快速添加任务入口使用 @headlessui/react 的 Modal 组件实现，样式风格与整体 UI 保持一致。
    *   专注模式入口（启航入口）设计成一个醒目的按钮，使用海洋主题的图标。
*   **任务管理页：**
    *   任务列表视图使用 Tailwind CSS 的 Grid 布局，任务事项信息清晰展示。
    *   任务性质、任务分类、优先级等字段使用不同的颜色和图标进行区分。
    *   任务编辑功能使用 @headlessui/react 的 Dialog 组件实现，表单元素样式美观易用。
    *   完成任务盖章功能使用 Framer Motion 实现动画效果，增加趣味性。
*   **专注模式页：**
    *   计时器使用自定义 Hook 实现，样式简洁大方。
    *   船只航行动画使用 SVG 和 Framer Motion 实现，模拟航行效果。
    *   海洋背景效果使用 CSS 渐变和动画实现，营造沉浸式体验。
*   **票根收藏页：**
    *   票根/邮戳展示墙使用 Masonry 布局，自适应不同尺寸的票根。
    *   票根查看功能使用 @headlessui/react 的 Transition 组件实现，动画效果流畅自然。
    *   时间线展示使用 SVG 和 CSS 实现，突出显示重要事件。
*   **通用样式：**
    *   整体 UI 采用海洋色系，例如浅蓝色、白色、灰色等。
    *   使用 lucide-react 图标库，保持图标风格统一。
    *   使用 Framer Motion 实现页面过渡动画，提升用户体验。

**5. 参考图片**

*   请参考提供的图片，尽量使 Web 前端框架 Demo 的视觉效果接近图片效果。

**6. 其他要求**

*   代码结构清晰，注释完整，易于理解和维护。
*   使用 TypeScript 编写，提供类型定义。
*   使用 Vite 构建，确保启动和热更新速度快。
*   使用 ESLint 和 Prettier 规范代码风格。

请生成一个包含以上功能的、视觉效果高级的 Web 前端框架 Demo。请注意：

请将提供的图片作为参考，尽量还原其视觉风格。