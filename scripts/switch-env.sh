#!/bin/bash

# API 环境切换脚本

case "$1" in
  "dev"|"development")
    echo "切换到开发环境..."
    echo "VITE_API_ENV=development" > .env
    echo "✅ 已切换到开发环境 (http://localhost:8000/api/v1)"
    ;;
  "prod"|"production")
    echo "切换到生产环境..."
    echo "VITE_API_ENV=production" > .env
    echo "✅ 已切换到生产环境 (https://api.minco.app/api/v1)"
    ;;
  "status"|"info")
    if [ -f .env ]; then
      echo "当前环境配置:"
      cat .env
    else
      echo "未找到 .env 文件，将使用默认开发环境"
    fi
    ;;
  *)
    echo "用法: $0 {dev|prod|status}"
    echo ""
    echo "命令:"
    echo "  dev, development  - 切换到开发环境"
    echo "  prod, production  - 切换到生产环境"
    echo "  status, info      - 显示当前环境配置"
    echo ""
    echo "示例:"
    echo "  $0 dev     # 切换到开发环境"
    echo "  $0 prod    # 切换到生产环境"
    echo "  $0 status  # 查看当前配置"
    exit 1
    ;;
esac 