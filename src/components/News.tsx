import { useEffect, useState, useCallback } from 'react'
import HighCommandAPI from '../services/api'
import './News.css'

interface NewsItem {
  id: string
  title: string
  content: string
  timestamp: Date
  priority: 'critical' | 'high' | 'normal'
}

interface NewsProps {
  warStatus: any
}

// Helper function to parse timestamps from various field names
const parseTimestamp = (obj: any): Date => {
  if (obj?.published) return new Date(obj.published)
  if (obj?.timestamp) return new Date(obj.timestamp)
  if (obj?.created_at) return new Date(obj.created_at)
  if (obj?.date) return new Date(obj.date)
  return new Date()
}

// Helper function to render colored text with line breaks
const renderColoredText = (text: string, color: string, key: { current: number }): JSX.Element => {
  const lines = text.split('\n')
  return (
    <span key={key.current++} style={{ color }}>
      {lines.map((line, idx) => (
        <span key={idx}>
          {line}
          {idx < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  )
}

// Helper function to parse custom HTML tags in dispatch messages
const parseDispatchMessage = (message: string): JSX.Element => {
  // Custom tags: <i=0>...</i> = gray, <i=1>...</i> = yellow/emphasis, <i=3>...</i> = cyan/critical
  const tagMap: { [key: string]: string } = {
    '0': '#999999',      // Gray
    '1': '#ffff00',      // Yellow
    '3': '#00ffff'       // Cyan
  }

  // Replace tags with a marker and track colors
  let colorStack: string[] = ['inherit']
  let result: (string | JSX.Element)[] = []
  let currentText = ''
  const keyCounter = { current: 0 }

  // Process message character by character, handling tags
  const regex = /<i=(\d+)>|<\/i>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(message)) !== null) {
    // Add text before this tag
    const textBefore = message.substring(lastIndex, match.index)
    if (textBefore) {
      currentText += textBefore
    }

    // Handle tag
    if (match[0] === '</i>') {
      // Closing tag - render accumulated text with current color, then pop color
      if (currentText) {
        const color = colorStack[colorStack.length - 1]
        result.push(renderColoredText(currentText, color, keyCounter))
        currentText = ''
      }
      if (colorStack.length > 1) {
        colorStack.pop()
      }
    } else {
      // Opening tag - render any accumulated text first, then push new color
      if (currentText) {
        const color = colorStack[colorStack.length - 1]
        result.push(renderColoredText(currentText, color, keyCounter))
        currentText = ''
      }
      const tagNum = match[1]
      colorStack.push(tagMap[tagNum] || 'inherit')
    }

    lastIndex = match.index + match[0].length
  }

  // Handle remaining text
  if (lastIndex < message.length) {
    currentText += message.substring(lastIndex)
  }
  if (currentText) {
    const color = colorStack[colorStack.length - 1]
    result.push(renderColoredText(currentText, color, keyCounter))
  }

  return <>{result}</>
}

// Helper function to extract title from dispatch message
const extractTitleFromMessage = (message: string): string => {
  // First try to find <i=3>...</i> tag
  const match3 = message.match(/<i=3>(.*?)<\/i>/)
  if (match3 && match3[1]) {
    return match3[1]
  }
  
  // Otherwise, try to find any <i=\d>...</i> tag on first line
  const firstLine = message.split('\n')[0]
  const matchAny = firstLine.match(/<i=\d>(.*?)<\/i>/)
  if (matchAny && matchAny[1]) {
    return matchAny[1]
  }
  
  // Otherwise, strip tags from first line
  if (firstLine) {
    const stripped = firstLine.replace(/<\/?i=\d+>/g, '')
    if (stripped.length > 0) {
      return stripped
    }
  }
  
  return message.substring(0, 50)
}

// Helper function to remove first line (which becomes the title)
const stripTitleFromMessage = (message: string): string => {
  const lines = message.split('\n')
  if (lines.length > 1) {
    // Remove first line and any leading empty lines
    return lines.slice(1).join('\n').replace(/^\s*\n+/, '')
  }
  return ''
}

// Helper function to map dispatch to NewsItem
const mapDispatchToNewsItem = (dispatch: any, idx: number): NewsItem => {
  const message = dispatch.message || dispatch.content || 'No content available'
  return {
    id: dispatch.id || `${idx}`,
    title: extractTitleFromMessage(message),
    content: stripTitleFromMessage(message),
    timestamp: parseTimestamp(dispatch),
    priority: dispatch.priority || 'normal'
  }
}

const News: React.FC<NewsProps> = ({ warStatus }) => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [displayLimit, setDisplayLimit] = useState(5)

  const loadDispatches = useCallback(async () => {
    setIsRefreshing(true)
    const newsItems: NewsItem[] = []

    try {
      // Try to fetch from dispatches endpoint
      const dispatchesData = await HighCommandAPI.getDispatches()
      if (dispatchesData) {
        let dispatches: any[] = []
        
        if (Array.isArray(dispatchesData)) {
          dispatches = dispatchesData
        } else if (dispatchesData.dispatches && Array.isArray(dispatchesData.dispatches)) {
          dispatches = dispatchesData.dispatches
        }
        
        if (dispatches.length > 0) {
          // Sort by date (newest first) and get latest 50
          const sorted = dispatches.sort((a: any, b: any) => {
            const dateA = new Date(parseTimestamp(a)).getTime()
            const dateB = new Date(parseTimestamp(b)).getTime()
            return dateB - dateA
          }).slice(0, 50)
          
          const apiNews: NewsItem[] = sorted.map((dispatch: any, idx: number) =>
            mapDispatchToNewsItem(dispatch, idx)
          )
          setNews(apiNews)
          setLastRefresh(new Date())
          setIsRefreshing(false)
          return
        } else {
          // No dispatches available
          setNews([{
            id: 'no-dispatches',
            title: '📡 COMMAND STATUS',
            content: 'No dispatches at this time.',
            timestamp: new Date(),
            priority: 'normal'
          }])
          setLastRefresh(new Date())
          setIsRefreshing(false)
          return
        }
      }
    } catch (error) {
      console.error('Failed to load dispatches from API:', error)
    }

    setNews(newsItems)
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }, [])

  // Auto-refresh every hour (3600000 ms) and reload when warStatus changes
  useEffect(() => {
    loadDispatches()
    const interval = setInterval(loadDispatches, 3600000)
    return () => clearInterval(interval)
  }, [loadDispatches, warStatus])

  return (
    <div className="news-container">
      <div className="news-header">
        <div className="news-header-top">
          <h2>📡 COMMAND DISPATCHES</h2>
          <div className="news-header-right">
            <p className="last-refresh">Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
            <button 
              className="refresh-button" 
              onClick={loadDispatches} 
              disabled={isRefreshing}
              title="Manually refresh dispatches"
            >
              {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
            </button>
            <select 
              value={displayLimit} 
              onChange={(e) => setDisplayLimit(Number(e.target.value))}
              className="display-limit-select"
              title="Display limit"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <p className="news-subheader">LATEST NEWS & ANNOUNCEMENTS</p>
      </div>

      <div className="news-feed">
        {news.length === 0 ? (
          <div className="no-news">
            <p>No dispatches at this time.</p>
          </div>
        ) : (
          news.slice(0, displayLimit).map((item) => (
              <div key={item.id} className={`news-item priority-${item.priority}`}>
                <div className="news-priority-indicator">
                  {item.priority === 'critical' && '🔴'}
                  {item.priority === 'high' && '🟠'}
                  {item.priority === 'normal' && '🟡'}
                </div>
                <div className="news-content">
                  <h3 className="news-title">{item.title}</h3>
                  <div className="news-text">{parseDispatchMessage(item.content)}</div>
                  <span className="news-timestamp">
                    {item.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default News
