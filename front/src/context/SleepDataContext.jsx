import React, { createContext, useContext, useState, useEffect } from 'react'
import { analyzeSleepNote, analyzeMonthlySleepPatterns } from '../services/aiAnalysis'
import { supabase } from '../config/supabase'

const SleepDataContext = createContext()

export const useSleepData = () => {
  const context = useContext(SleepDataContext)
  if (!context) {
    throw new Error('useSleepData must be used within a SleepDataProvider')
  }
  return context
}

export const SleepDataProvider = ({ children }) => {
  const [sleepData, setSleepData] = useState([])
  const [aiAnalyses, setAiAnalyses] = useState({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)

  // 从 Supabase 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // 加载睡眠记录
        const { data: sleepRecords, error: sleepError } = await supabase
          .from('sleep_records')
          .select('*')
          .order('date', { ascending: false })

        if (sleepError) {
          console.error('加载睡眠记录失败:', sleepError)
        } else {
          setSleepData(sleepRecords || [])
        }

        // 加载AI分析结果
        const { data: analysisRecords, error: analysisError } = await supabase
          .from('sleep_analyses')
          .select('*')

        if (analysisError) {
          console.error('加载分析结果失败:', analysisError)
        } else {
          const analyses = {}
          analysisRecords?.forEach(record => {
            analyses[record.date] = {
              analysis: record.analysis,
              timestamp: record.created_at
            }
          })
          setAiAnalyses(analyses)
        }
      } catch (error) {
        console.error('数据加载失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 添加睡眠记录
  const addSleepRecord = async (date, status, note = '') => {
    try {
      const { data, error } = await supabase
        .from('sleep_records')
        .upsert(
          { date, status, note, updated_at: new Date().toISOString() },
          { onConflict: 'date' }
        )
        .select()

      if (error) {
        console.error('保存睡眠记录失败:', error)
        return false
      }

      // 更新本地状态
      setSleepData(prevData => {
        const existingIndex = prevData.findIndex(record => record.date === date)
        if (existingIndex !== -1) {
          const updatedData = [...prevData]
          updatedData[existingIndex] = { date, status, note }
          return updatedData
        } else {
          return [...prevData, { date, status, note }]
        }
      })

      return true
    } catch (error) {
      console.error('保存睡眠记录异常:', error)
      return false
    }
  }

  // AI分析睡眠备注
  const analyzeSleepRecord = async (date, note) => {
    if (!note || note.trim().length < 10) {
      return { success: false, error: '备注内容过短，无法分析' }
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeSleepNote(note, date)

      if (result.success) {
        // 保存分析结果到Supabase
        const { error } = await supabase
          .from('sleep_analyses')
          .upsert(
            {
              date,
              analysis: result.analysis,
              created_at: result.timestamp
            },
            { onConflict: 'date' }
          )

        if (error) {
          console.error('保存分析结果失败:', error)
          return { success: false, error: '保存分析结果失败' }
        }

        // 更新本地状态
        setAiAnalyses(prev => ({
          ...prev,
          [date]: {
            analysis: result.analysis,
            timestamp: result.timestamp
          }
        }))
      }

      return result
    } catch (error) {
      console.error('分析失败:', error)
      return { success: false, error: error.message }
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 获取特定日期的分析结果
  const getAnalysisForDate = (date) => {
    return aiAnalyses[date] || null
  }

  // 获取有分析结果的记录
  const getRecordsWithAnalysis = () => {
    return sleepData.filter(record => aiAnalyses[record.date])
  }

  // 月度睡眠模式综合分析
  const analyzeMonthlySleepRecords = async (records) => {
    if (!records || records.length === 0) {
      return { success: false, error: '没有可分析的记录' }
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeMonthlySleepPatterns(records)
      return result
    } catch (error) {
      console.error('月度分析失败:', error)
      return { success: false, error: error.message }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <SleepDataContext.Provider value={{
      sleepData,
      addSleepRecord,
      analyzeSleepRecord,
      analyzeMonthlySleepRecords,
      getAnalysisForDate,
      getRecordsWithAnalysis,
      isAnalyzing,
      aiAnalyses,
      loading
    }}>
      {children}
    </SleepDataContext.Provider>
  )
}