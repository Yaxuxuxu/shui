import React, { useState } from 'react'
import { useSleepData } from '../context/SleepDataContext'
import { calculateSleepScore } from '../utils/analytics'
import SleepAnalysisVisualization from '../components/SleepAnalysisVisualization'

function AnalyticsPage() {
  const { sleepData, analyzeMonthlySleepRecords, aiAnalyses, getAnalysisForDate, isAnalyzing } = useSleepData()
  const [monthlyAnalysis, setMonthlyAnalysis] = useState(null)
  const [analysisResults, setAnalysisResults] = useState({})

  const score = calculateSleepScore(sleepData)

  // 获取最近30天的记录
  const getLast30DaysData = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))
    return sleepData.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= thirtyDaysAgo
    })
  }

  const last30DaysData = getLast30DaysData()
  const last30DaysScore = calculateSleepScore(last30DaysData)

  // 统计各睡眠状况的数量
  const getStatusStats = () => {
    const stats = {}
    last30DaysData.forEach(record => {
      stats[record.status] = (stats[record.status] || 0) + 1
    })
    return stats
  }

  const statusStats = getStatusStats()

  // 获取有备注的记录
  const getRecordsWithNotes = () => {
    return last30DaysData.filter(record => record.note && record.note.trim() !== '')
  }

  const recordsWithNotes = getRecordsWithNotes()

  // 月度综合分析
  const handleMonthlyAnalysis = async () => {
    if (recordsWithNotes.length === 0) {
      setAnalysisResults({ success: false, error: '暂无有备注的记录可分析' })
      return
    }

    const result = await analyzeMonthlySleepRecords(recordsWithNotes)
    setMonthlyAnalysis(result)
    setAnalysisResults(prev => ({
      ...prev,
      monthly: result
    }))
  }

  return (
    <div className="analytics-page">
      <h2>睡眠分析</h2>

      {/* AI分析板块 */}
      <div className="analytics-section">
        <h3>月度睡眠模式分析</h3>
        {recordsWithNotes.length > 0 ? (
          <div className="ai-analysis-section">
            <div className="analysis-controls">
              <button
                className="batch-analyze-btn"
                onClick={handleMonthlyAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '分析中...' : '分析本月睡眠模式'}
              </button>
              <p className="analysis-info">
                共 {recordsWithNotes.length} 条有备注的记录，
                {monthlyAnalysis ? '已分析本月睡眠模式' : '点击按钮进行综合分析'}
              </p>
            </div>

            {monthlyAnalysis && monthlyAnalysis.success ? (
              <SleepAnalysisVisualization analysis={monthlyAnalysis} />
            ) : monthlyAnalysis && !monthlyAnalysis.success ? (
              <div className="analysis-error">
                <p>分析失败: {monthlyAnalysis.error}</p>
              </div>
            ) : (
              <div className="records-preview">
                <h4>本月备注记录预览:</h4>
                <div className="preview-list">
                  {recordsWithNotes.slice(0, 3).map((record, index) => (
                    <div key={index} className="preview-item">
                      <span className="preview-date">{record.date}</span>
                      <span className="preview-status">{record.status}</span>
                      <p className="preview-note">{record.note}</p>
                    </div>
                  ))}
                  {recordsWithNotes.length > 3 && (
                    <p className="more-preview">还有 {recordsWithNotes.length - 3} 条记录...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-notes-message">
            <p>暂无有备注的睡眠记录。请在日历页面添加备注后使用AI分析功能。</p>
          </div>
        )}
      </div>

      <div className="analytics-cards">
        <div className="analytics-card">
          <h3>总体睡眠评分</h3>
          <div className="score-display">{score}</div>
          <p>基于所有记录的平均评分</p>
        </div>
        <div className="analytics-card">
          <h3>最近30天评分</h3>
          <div className="score-display">{last30DaysScore}</div>
          <p>最近30天的睡眠质量评分</p>
        </div>
      </div>

      <div className="analytics-section">
        <h3>最近30天睡眠状况统计</h3>
        <div className="stats-grid">
          {Object.entries(statusStats).map(([status, count]) => (
            <div key={status} className="stat-item">
              <span className="stat-label">{status}</span>
              <span className="stat-count">{count}天</span>
            </div>
          ))}
        </div>
      </div>

      {recordsWithNotes.length > 0 && (
        <div className="analytics-section">
          <h3>最近备注记录</h3>
          <div className="notes-list">
            {recordsWithNotes.slice(0, 5).map((record, index) => (
              <div key={index} className="note-item">
                <div className="note-header">
                  <span className="note-date">{record.date}</span>
                  <span className="note-status">{record.status}</span>
                </div>
                <p className="note-content">{record.note}</p>
              </div>
            ))}
            {recordsWithNotes.length > 5 && (
              <p className="more-notes">还有 {recordsWithNotes.length - 5} 条备注记录...</p>
            )}
          </div>
        </div>
      )}

      <div className="analytics-section">
        <h3>睡眠建议</h3>
        <div className="suggestions">
          {last30DaysScore >= 80 ? (
            <p>🎉 你的睡眠质量非常好！继续保持规律的作息时间。</p>
          ) : last30DaysScore >= 60 ? (
            <p>👍 你的睡眠质量还不错，可以尝试改善睡眠环境来提升。</p>
          ) : (
            <p>😴 你的睡眠质量有待提高，建议保持规律的作息时间，避免睡前使用电子设备。</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage