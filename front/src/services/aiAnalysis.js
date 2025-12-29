const API_KEY = '1165c6b79edb4a3782be2f7705d1e0bf.wTPgwO9uGlA7QIcj'
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

// 分析睡眠备注内容
export const analyzeSleepNote = async (note, date) => {
  if (!note || note.trim().length < 10) {
    return {
      success: false,
      error: '备注内容过短，无法进行有效分析',
      analysis: null
    }
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的睡眠健康分析师。请分析用户提供的睡眠备注，识别失眠模式、潜在原因和改进建议。
            分析要点：
            1. 识别睡眠问题类型（入睡困难、夜间醒来、早醒等）
            2. 分析可能的原因（压力、生活习惯、环境因素等）
            3. 提供具体的改进建议
            4. 用中文回复，保持专业但友好的语气
            5. 格式：先总结问题，再分析原因，最后给建议`
          },
          {
            role: 'user',
            content: `请分析以下睡眠记录：
            日期：${date}
            备注内容：${note}
            
            请从专业角度分析这个睡眠情况。`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()

    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        analysis: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      }
    } else {
      throw new Error('API返回数据格式异常')
    }
  } catch (error) {
    console.error('AI分析失败:', error)
    return {
      success: false,
      error: error.message,
      analysis: null
    }
  }
}

// 批量分析备注
export const batchAnalyzeSleepNotes = async (notesWithDates) => {
  const results = []

  for (const { note, date } of notesWithDates) {
    if (note && note.trim().length >= 10) {
      const result = await analyzeSleepNote(note, date)
      results.push({
        date,
        note,
        ...result
      })
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return results
}

// 月度睡眠模式综合分析
export const analyzeMonthlySleepPatterns = async (records) => {
  if (!records || records.length === 0) {
    return {
      success: false,
      error: '没有可分析的记录',
      analysis: null
    }
  }

  // 检查是否有足够的备注内容
  const validRecords = records.filter(record => record.note && record.note.trim().length >= 10)
  if (validRecords.length === 0) {
    return {
      success: false,
      error: '备注内容过短，无法进行有效分析',
      analysis: null
    }
  }

  try {
    // 构建所有备注的汇总内容
    const notesSummary = validRecords.map(record => 
      `日期：${record.date}，睡眠状况：${record.status}，备注：${record.note}`
    ).join('\n\n')

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的睡眠健康分析师。请分析用户提供的月度睡眠记录，识别睡眠模式、常见问题和改进建议。
            
分析要点：
1. 识别重复出现的睡眠问题模式（如：因第二天有重要事情导致的失眠、周末熬夜等）
2. 统计各类问题的出现频率和规律
3. 分析潜在的根本原因
4. 提供针对性的改进建议
5. 用中文回复，保持专业但友好的语气

回复格式要求：
- 先总结本月睡眠模式的整体特点
- 然后分类统计各类问题的出现情况
- 接着分析可能的原因
- 最后提供具体的改进建议
- 使用清晰的结构和具体的数字说明`
          },
          {
            role: 'user',
            content: `请综合分析以下月度睡眠记录，识别睡眠模式和问题：
            
${notesSummary}
            
请从专业角度分析这些睡眠记录，识别重复出现的模式，并提供有针对性的建议。`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data = await response.json()

    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        analysis: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
        recordsAnalyzed: validRecords.length
      }
    } else {
      throw new Error('API返回数据格式异常')
    }
  } catch (error) {
    console.error('月度睡眠模式分析失败:', error)
    return {
      success: false,
      error: error.message,
      analysis: null
    }
  }
}

// 获取分析结果缓存键
export const getAnalysisCacheKey = (note, date) => {
  return `sleep_analysis_${date}_${btoa(note).slice(0, 20)}`
}