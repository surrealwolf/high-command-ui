import { useEffect, useState } from 'react'
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

// Helper function to map dispatch to NewsItem
const mapDispatchToNewsItem = (dispatch: any, idx: number): NewsItem => {
  return {
    id: dispatch.id || `${idx}`,
    title: dispatch.title || dispatch.message?.substring(0, 50) || 'Dispatch',
    content: dispatch.message || dispatch.content || 'No content available',
    timestamp: parseTimestamp(dispatch),
    priority: dispatch.priority || 'normal'
  }
}

const News: React.FC<NewsProps> = ({ warStatus }) => {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    // Fetch dispatches from API
    const loadDispatches = async () => {
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
            // Sort by date (newest first) and get latest 10
            const sorted = dispatches.sort((a: any, b: any) => {
              const dateA = new Date(parseTimestamp(a)).getTime()
              const dateB = new Date(parseTimestamp(b)).getTime()
              return dateB - dateA
            }).slice(0, 10)
            
            const apiNews: NewsItem[] = sorted.map((dispatch: any, idx: number) =>
              mapDispatchToNewsItem(dispatch, idx)
            )
            setNews(apiNews)
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
            return
          }
        }
      } catch (error) {
        console.error('Failed to load dispatches from API:', error)
      }

      // Fallback: Generate news from war status data with varied timestamps
      if (warStatus) {
        // War status update
        newsItems.push({
          id: '1',
          title: 'ONGOING GALACTIC WAR STATUS',
          content: `Total active personnel: ${warStatus.statistics?.playerCount?.toLocaleString()}. Continue spreading managed democracy.`,
          timestamp: new Date(),
          priority: 'normal'
        })

        // Victory announcement (1 hour ago)
        if (warStatus.statistics?.missionsWon > warStatus.statistics?.missionsLost) {
          newsItems.push({
            id: '2',
            title: '🏆 VICTORY IN SIGHT',
            content: `With ${warStatus.statistics?.missionsWon?.toLocaleString() || 'N/A'} missions won versus ${warStatus.statistics?.missionsLost?.toLocaleString() || 'N/A'} lost, our forces maintain strategic superiority. Morale is at peak levels.`,
            timestamp: new Date(Date.now() - 3600000),
            priority: 'high'
          })
        }

        // Enemy intel (3 hours ago)
        const totalEnemyKills = (warStatus.statistics?.terminidKills || 0) + 
                                (warStatus.statistics?.automatonKills || 0) + 
                                (warStatus.statistics?.illuminateKills || 0)
        if (totalEnemyKills > 0) {
          newsItems.push({
            id: '4',
            title: '🎯 ENEMY ENGAGEMENT REPORT',
            content: `${(totalEnemyKills / 1e9).toFixed(1)}B total enemy casualties across all sectors. Terminids remain the primary threat. Strategic doctrine: maintain firepower and advance democracy.`,
            timestamp: new Date(Date.now() - 10800000),
            priority: 'normal'
          })
        }

        // Personnel casualty update (4 hours ago)
        if (warStatus.statistics?.deaths) {
          newsItems.push({
            id: '5',
            title: '⚠️ PERSONNEL STATUS UPDATE',
            content: `Total personnel casualties: ${warStatus.statistics.deaths?.toLocaleString() || 'N/A'}. Revive count: ${warStatus.statistics.revives || 0}. These soldiers have made the ultimate sacrifice for democracy.`,
            timestamp: new Date(Date.now() - 14400000),
            priority: 'high'
          })
        }
      }

      setNews(newsItems)
    }

    loadDispatches()
  }, [warStatus])

  return (
    <div className="news-container">
      <div className="news-header">
        <h2>📡 COMMAND DISPATCHES</h2>
        <p className="news-subheader">LATEST NEWS & ANNOUNCEMENTS</p>
      </div>

      <div className="news-feed">
        {news.length === 0 ? (
          <div className="no-news">
            <p>No dispatches at this time.</p>
          </div>
        ) : (
          news
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((item) => (
              <div key={item.id} className={`news-item priority-${item.priority}`}>
                <div className="news-priority-indicator">
                  {item.priority === 'critical' && '🔴'}
                  {item.priority === 'high' && '🟠'}
                  {item.priority === 'normal' && '🟡'}
                </div>
                <div className="news-content">
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-text">{item.content}</p>
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
