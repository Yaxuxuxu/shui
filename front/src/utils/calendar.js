// 生成指定月份的日历天数
export const generateCalendarDays = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // 获取该月第一天是星期几
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  // 获取该月的总天数
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // 获取上个月的总天数
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  const calendarDays = []
  
  // 添加上个月的日期
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    calendarDays.push({
      day,
      date: dateStr,
      isCurrentMonth: false
    })
  }
  
  // 添加当月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    calendarDays.push({
      day: i,
      date: dateStr,
      isCurrentMonth: true
    })
  }
  
  // 添加下个月的日期，使日历填满6行
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    calendarDays.push({
      day: i,
      date: dateStr,
      isCurrentMonth: false
    })
  }
  
  return calendarDays
}