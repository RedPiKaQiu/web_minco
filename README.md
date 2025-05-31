# Second Brain 事项管理应用

这是一个基于React + TypeScript + Vite开发的现代化事项管理应用。

## 如何获取和运行项目

### 从GitHub获取代码

1. 克隆仓库到本地
```bash
git clone https://github.com/RedPiKaQiu/web_minco.git
```

2. 安装依赖
```bash
npm install
```

3. 本地运行
```bash
npm run dev
```
应用将在本地启动，通常在 http://localhost:5173 可以访问。

4. 构建项目
```bash
npm run build
```
构建后的文件将输出到 `dist` 目录。

## 项目部署

本项目可以部署到Vercel平台：

1. 在[Vercel](https://vercel.com)上注册账户并连接到你的GitHub仓库
2. 导入该项目
3. Vercel将自动检测React应用并进行配置
4. 点击部署按钮即可完成部署

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (图标库)
- React Router
- Headless UI

## ESLint配置扩展

如果你正在开发生产应用，我们建议更新配置以启用类型感知的lint规则：

```js
export default tseslint.config({
  extends: [
    // 移除 ...tseslint.configs.recommended 并替换为以下内容
    ...tseslint.configs.recommendedTypeChecked,
    // 或者使用这个以获取更严格的规则
    ...tseslint.configs.strictTypeChecked,
    // 可选，添加这个以获取风格规则
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // 其他选项...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

你还可以安装 [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) 和 [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) 以获取React特定的lint规则：

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // 添加react-x和react-dom插件
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // 其他规则...
    // 启用其推荐的typescript规则
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
