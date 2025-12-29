import React, { useState } from 'react'
import { generateCalendarDays } from '../utils/calendar'
import { sleepStatusOptions } from '../constants'
import { useSleepData } from '../context/SleepDataContext'

function CalendarPage() {
  const { sleepData, addSleepRecord } = useSleepData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [note, setNote] = useState('')

  const calendarDays = generateCalendarDays(currentDate)

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    const existingRecord = sleepData.find(record => record.date === date)
    setSelectedStatus(existingRecord ? existingRecord.status : null)
    setNote(existingRecord ? existingRecord.note || '' : '')
  }

  const handleStatusSelect = (status) => {
    if (!selectedDate) return
    addSleepRecord(selectedDate, status, note)
    setSelectedStatus(status)
  }

  const handleNoteChange = (e) => {
    setNote(e.target.value)
  }

  const handleSaveNote = () => {
    if (!selectedDate || !selectedStatus) return
    addSleepRecord(selectedDate, selectedStatus, note)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getStatusColor = (status) => {
    const option = sleepStatusOptions.find(opt => opt.value === status)
    return option ? option.color : ''
  }

  return (
    <div className="calendar-page">
      <h2>睡眠记录</h2>
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="month-nav-btn">←</button>
          <h3>{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
          <button onClick={handleNextMonth} className="month-nav-btn">→</button>
        </div>
        <div className="calendar-grid">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${day.isCurrentMonth ? '' : 'other-month'} ${selectedDate === day.date ? 'selected' : ''}`}
              onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
            >
              <span className="day-number">{day.day}</span>
              {sleepData.find(record => record.date === day.date) && (
                <div
                  className="sleep-indicator"
                  style={{ backgroundColor: getStatusColor(sleepData.find(record => record.date === day.date).status) }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedDate && (
        <div className="status-selection">
          <h3>记录{selectedDate}的睡眠</h3>
          <div className="status-options">
            {sleepStatusOptions.map(option => (
              <button
                key={option.value}
                className={`status-btn ${selectedStatus === option.value ? 'selected' : ''}`}
                style={{ backgroundColor: option.color }}
                onClick={() => handleStatusSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {selectedStatus && (
            <div className="note-section">
              <label htmlFor="sleep-note">备注（选填）:</label>
              <textarea
                id="sleep-note"
                className="note-input"
                placeholder="记录今天的睡眠情况，如：昨晚11点睡，今早7点醒，中途醒了2次..."
                value={note}
                onChange={handleNoteChange}
                rows="3"
              />
              <button className="save-note-btn" onClick={handleSaveNote}>
                保存备注
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CalendarPage