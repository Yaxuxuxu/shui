import { sleepStatusOptions } from '../constants'

// 计算睡眠评分
export const calculateSleepScore = (sleepData) => {
  if (sleepData.length === 0) return 0
  
  const totalScore = sleepData.reduce((sum, record) => {
    const statusOption = sleepStatusOptions.find(opt => opt.value === record.status)
    return sum + (statusOption ? statusOption.score : 0)
  }, 0)
  
  return Math.round(totalScore / sleepData.length)
}

// 获取指定日期范围内的睡眠数据
export const getSleepDataInRange = (sleepData, startDate, endDate) => {
  return sleepData.filter(record => {
    const recordDate = new Date(record.date)
    return recordDate >= startDate && recordDate <= endDate
  })
}

// 统计各睡眠状况的分布
export const getSleepStatusDistribution = (sleepData) => {
  const distribution = {}
  
  // 初始化所有状态为0
  sleepStatusOptions.forEach(option => {
    distribution[option.value] = 0
  })
  
  // 统计每个状态的数量
  sleepData.forEach(record => {
    if (distribution.hasOwnProperty(record.status)) {
      distribution[record.status]++
    }
  })
  
  return distribution
}