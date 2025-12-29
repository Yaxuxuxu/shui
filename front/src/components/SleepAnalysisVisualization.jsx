import React from 'react'

const SleepAnalysisVisualization = ({ analysis }) => {
  if (!analysis || !analysis.success) return null

  // 从AI分析结果中提取关键信息
  const extractKeyInfo = (text) => {
    const info = {
      patterns: [],
      frequencies: {},
      suggestions: [],
      summary: ''
    }

    // 改进的文本解析逻辑
    const lines = text.split('\n').filter(line => line.trim())

    // 识别常见睡眠模式关键词
    const sleepPatterns = [
      '第二天有重要事情', '早起', '重要会议', '考试', '工作压力',
      '周末熬夜', '作息不规律', '睡前使用电子设备', '咖啡因',
      '环境噪音', '温度不适', '焦虑', '压力', '饮食习惯'
    ]

    // 识别频率信息
    const frequencyRegex = /(\d+)次|(\d+)回|出现(\d+)次|频率为(\d+)/g
    const suggestionRegex = /建议|改进|措施|方法|解决方案|可以|应该|推荐/g

    // 提取摘要（第一段）
    const firstParagraph = text.split('\n\n')[0] || text
    info.summary = firstParagraph.replace(/^[\d、.\-]*\s*/, '').trim()

    // 分析文本内容
    let currentSection = ''

    lines.forEach(line => {
      const cleanLine = line.trim()
      if (!cleanLine) return

      // 检测章节标题
      if (cleanLine.includes('总结') || cleanLine.includes('整体特点') ||
        cleanLine.includes('本月睡眠')) {
        currentSection = 'summary'
      } else if (cleanLine.includes('模式') || cleanLine.includes('问题') ||
        cleanLine.includes('原因')) {
        currentSection = 'patterns'
      } else if (cleanLine.includes('频率') || cleanLine.includes('统计') ||
        cleanLine.includes('出现')) {
        currentSection = 'frequency'
      } else if (cleanLine.includes('建议') || cleanLine.includes('改进') ||
        cleanLine.includes('措施')) {
        currentSection = 'suggestions'
      }

      // 根据当前章节处理内容
      if (currentSection === 'patterns') {
        // 检查是否包含睡眠模式关键词
        const matchedPatterns = sleepPatterns.filter(pattern =>
          cleanLine.includes(pattern)
        )

        if (matchedPatterns.length > 0 && cleanLine.length > 10) {
          info.patterns.push(cleanLine)
        }
      } else if (currentSection === 'frequency') {
        // 提取频率信息
        const matches = [...cleanLine.matchAll(frequencyRegex)]
        matches.forEach(match => {
          const count = parseInt(match[1] || match[2] || match[3] || match[4])
          if (count) {
            // 提取问题描述
            const problemMatch = cleanLine.match(/[^，。！？；：]+?(?=出现|频率|共|总计)/)
            if (problemMatch) {
              const problem = problemMatch[0].trim()
              info.frequencies[problem] = count
            }
          }
        })
      } else if (currentSection === 'suggestions') {
        // 提取建议
        if (cleanLine.length > 15 && suggestionRegex.test(cleanLine)) {
          info.suggestions.push(cleanLine.replace(/^[\d、.\-]*\s*/, ''))
        }
      }
    })

    // 如果没有提取到足够的信息，使用备选方案
    if (info.patterns.length === 0) {
      // 从文本中提取包含关键词的句子作为模式
      sleepPatterns.forEach(pattern => {
        const patternLines = lines.filter(line => line.includes(pattern))
        if (patternLines.length > 0) {
          info.patterns.push(...patternLines.slice(0, 3))
        }
      })
    }

    if (info.suggestions.length === 0) {
      // 提取以数字或项目符号开头的行作为建议
      const numberedLines = lines.filter(line =>
        /^[\d、.\-•]\s+/.test(line) && line.length > 10
      )
      info.suggestions.push(...numberedLines.slice(0, 5))
    }

    return info
  }

  const analysisInfo = extractKeyInfo(analysis.analysis)

  return (
    <div className="analysis-visualization">
      {/* 摘要卡片 */}
      <div className="summary-card">
        <h4>📊 本月睡眠分析摘要</h4>
        <p className="summary-text">{analysisInfo.summary}</p>
      </div>

      {/* 模式识别 */}
      {analysisInfo.patterns.length > 0 && (
        <div className="patterns-section">
          <h5>🔍 识别出的睡眠模式</h5>
          <div className="patterns-grid">
            {analysisInfo.patterns.map((pattern, index) => (
              <div key={index} className="pattern-card">
                <span className="pattern-icon">📈</span>
                <span className="pattern-text">{pattern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 频率统计 */}
      {Object.keys(analysisInfo.frequencies).length > 0 && (
        <div className="frequency-section">
          <h5>📈 问题出现频率</h5>
          <div className="frequency-chart">
            {Object.entries(analysisInfo.frequencies).map(([pattern, count]) => (
              <div key={pattern} className="frequency-item">
                <div className="frequency-bar">
                  <div
                    className="frequency-fill"
                    style={{ width: `${Math.min(count * 20, 100)}%` }}
                  ></div>
                  <span className="frequency-label">{pattern}</span>
                  <span className="frequency-count">{count}次</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      {analysisInfo.suggestions.length > 0 && (
        <div className="suggestions-section">
          <h5>💡 改进建议</h5>
          <div className="suggestions-list">
            {analysisInfo.suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <span className="suggestion-number">{index + 1}.</span>
                <span className="suggestion-text">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 原始分析结果（可折叠） */}
      <details className="raw-analysis">
        <summary>📋 查看详细分析报告</summary>
        <div className="raw-analysis-content">
          <p>{analysis.analysis}</p>
          <small>分析时间: {new Date(analysis.timestamp).toLocaleString()}</small>
        </div>
      </details>
    </div>
  )
}

export default SleepAnalysisVisualization