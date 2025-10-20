import { useEffect, useState } from 'react'
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

const News: React.FC<NewsProps> = ({ warStatus }) => {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    // Generate news from war status data
    const generateNews = async () => {
      const newsItems: NewsItem[] = []

      if (warStatus) {
        // War status update
        newsItems.push({
          id: '1',
          title: 'ONGOING GALACTIC WAR STATUS',
          content: `Current mission success rate: ${warStatus.statistics?.missionSuccessRate}%. Total active personnel: ${warStatus.statistics?.playerCount?.toLocaleString()}. Continue spreading managed democracy.`,
          timestamp: new Date(),
          priority: 'normal'
        })

        // Victory announcement
        if (warStatus.statistics?.missionsWon > warStatus.statistics?.missionsLost) {
          newsItems.push({
            id: '2',
            title: '🏆 VICTORY IN SIGHT',
            content: `With ${warStatus.statistics?.missionsWon?.toLocaleString() || 'N/A'} missions won versus ${warStatus.statistics?.missionsLost?.toLocaleString() || 'N/A'} lost, our forces maintain strategic superiority. Morale is at peak levels.`,
            timestamp: new Date(Date.now() - 3600000),
            priority: 'high'
          })
        }

        // Impact alert
        if (warStatus.impactMultiplier) {
          newsItems.push({
            id: '3',
            title: '⚡ WAR EFFORT IMPACT',
            content: `Current war effort effectiveness multiplier: ${(warStatus.impactMultiplier * 100).toFixed(2)}%. All personnel are performing admirably in this sector.`,
            timestamp: new Date(Date.now() - 7200000),
            priority: 'normal'
          })
        }

        // Enemy intel
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

        // Personnel casualty update
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

    generateNews()
  }, [warStatus])

  return (
    <div className="news-container">
      <div className="news-header">
        <h2>📡 HELLDIVERS 2 COMMAND DISPATCH</h2>
        <p className="news-subheader">LIVE TACTICAL BRIEFINGS & WAR UPDATES</p>
      </div>

      <div className="news-feed">
        {news.length === 0 ? (
          <div className="no-news">
            <p>Loading tactical briefings...</p>
          </div>
        ) : (
          news.map((item) => (
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
                  {item.timestamp.toLocaleTimeString()}
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
