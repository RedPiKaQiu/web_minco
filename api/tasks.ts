import { Request, Response } from 'express'

// Mock API Data - 模拟后端数据
const MOCK_TASKS = [
  {
    id: '1',
    title: 'Mock 1 - 完成PPT制作',
    completed: false,
    startTime: '上午9:00',
    endTime: '下午5:30',
    duration: '2小时',
  },
  {
    id: '2',
    title: 'Mock 2 - 和团队开会',
    completed: false,
    startTime: '上午10:00',
    endTime: '上午11:30',
    duration: '1小时30分',
  },
  {
    id: '3',
    title: 'Mock 3 - 中午和Sarah吃饭',
    completed: false,
    startTime: '上午12:00',
    endTime: '下午1:00',
    duration: '1小时',
  },
  {
    id: '4',
    title: 'Mock 4 - 下班后锻炼小时',
    completed: false,
    startTime: '下午6:00之后',
    duration: '1小时',
  },
  {
    id: '5',
    title: 'Mock 5 - 给妈妈挑生日礼物',
    completed: false,
    isAnytime: true,
  }
]

export default function handler(
  req: Request,
  res: Response
) {
  if (req.method === 'GET') {
    // 返回任务列表
    res.status(200).json(MOCK_TASKS)
  } else if (req.method === 'POST') {
    // 添加新任务
    const newTask = {
      id: Date.now().toString(),
      ...req.body,
      completed: false
    }
    MOCK_TASKS.push(newTask)
    res.status(201).json(newTask)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
