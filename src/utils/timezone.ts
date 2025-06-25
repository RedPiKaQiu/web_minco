/**
 * 时区转换工具函数，处理本地时间与北京时间之间的转换
 */
import { format, parseISO, addHours } from 'date-fns';

// 北京时间偏移量 (UTC+8)
const BEIJING_OFFSET = 8;

/**
 * 判断当前本地时区是否为北京时间
 */
export const isLocalTimeBeijing = (): boolean => {
  const now = new Date();
  const localOffset = now.getTimezoneOffset();
  const localOffsetHours = -localOffset / 60;
  return localOffsetHours === BEIJING_OFFSET;
};

/**
 * 将本地时间转换为北京时间字符串 (用于API调用)
 */
export const localDateToBeijingString = (localDate: Date): string => {
  // 如果本地时区就是北京时间，直接格式化
  if (isLocalTimeBeijing()) {
    console.log('🕐 时区转换: 本地时区为北京时间，无需转换');
    return format(localDate, 'yyyy-MM-dd');
  }
  
  // 获取本地时区偏移量 (分钟)
  const localOffset = localDate.getTimezoneOffset();
  // 计算本地时间与UTC的差值 (小时)
  const localOffsetHours = -localOffset / 60;
  // 计算需要调整的小时数
  const adjustHours = BEIJING_OFFSET - localOffsetHours;
  
  console.log('🕐 时区转换: 本地时间转北京时间', {
    localOffset: localOffsetHours,
    beijingOffset: BEIJING_OFFSET,
    adjustHours,
    originalDate: format(localDate, 'yyyy-MM-dd HH:mm')
  });
  
  // 调整到北京时间
  const beijingDate = addHours(localDate, adjustHours);
  
  return format(beijingDate, 'yyyy-MM-dd');
};

/**
 * 将北京时间字符串转换为本地时间 (用于显示)
 */
export const beijingStringToLocalDate = (beijingTimeString: string): Date => {
  // 如果本地时区就是北京时间，直接解析
  if (isLocalTimeBeijing()) {
    return parseISO(beijingTimeString);
  }
  
  // 解析北京时间字符串
  const beijingDate = parseISO(beijingTimeString);
  
  // 获取当前本地时区偏移量
  const now = new Date();
  const localOffset = now.getTimezoneOffset();
  const localOffsetHours = -localOffset / 60;
  
  // 计算需要调整的小时数
  const adjustHours = localOffsetHours - BEIJING_OFFSET;
  
  console.log('🕐 时区转换: 北京时间转本地时间', {
    localOffset: localOffsetHours,
    beijingOffset: BEIJING_OFFSET,
    adjustHours,
    beijingTime: beijingTimeString
  });
  
  // 调整到本地时间
  return addHours(beijingDate, adjustHours);
};

/**
 * 格式化时间显示 (北京时间转本地时间显示)
 */
export const formatBeijingTimeToLocal = (beijingTimeString: string): string => {
  try {
    // 检查输入是否为有效字符串
    if (!beijingTimeString || typeof beijingTimeString !== 'string') {
      console.warn('⚠️ formatBeijingTimeToLocal: 无效的时间字符串', beijingTimeString);
      return '--:--';
    }

    // 处理只有时间部分的情况（如 "09:00"）
    let fullDateTimeString = beijingTimeString;
    if (beijingTimeString.length <= 5 && beijingTimeString.includes(':')) {
      // 如果只是时间格式，添加今天的日期
      const today = new Date().toISOString().split('T')[0];
      fullDateTimeString = `${today}T${beijingTimeString}:00`;
      console.log('🕐 时间格式转换: 补充日期部分', {
        original: beijingTimeString,
        converted: fullDateTimeString
      });
    }

    // 如果本地时区就是北京时间，直接格式化时间部分
    if (isLocalTimeBeijing()) {
      const date = parseISO(fullDateTimeString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date after parseISO');
      }
      return format(date, 'HH:mm');
    }
    
    const localDate = beijingStringToLocalDate(fullDateTimeString);
    if (isNaN(localDate.getTime())) {
      throw new Error('Invalid date from beijingStringToLocalDate');
    }
    return format(localDate, 'HH:mm');
  } catch (error) {
    console.error('❌ formatBeijingTimeToLocal: 时间格式化失败', {
      input: beijingTimeString,
      error: error instanceof Error ? error.message : error
    });
    return '--:--';
  }
}; 