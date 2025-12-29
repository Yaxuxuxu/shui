import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { SleepDataProvider } from './context/SleepDataContext'

function App() {
  return (
    <SleepDataProvider>
      <Router>
        <div className="app">
          <nav className="navbar">
            <h1>睡眠记录助手</h1>
            <div className="nav-links">
              <Link to="/">日历记录</Link>
              <Link to="/analytics">分析</Link>
            </div>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SleepDataProvider>
  )
}

export default App