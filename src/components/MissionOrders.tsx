import { useEffect, useState } from 'react'
import HighCommandAPI from '../services/api'
import './MissionOrders.css'

interface Mission {
  id: string
  title: string
  objective: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme'
  priority: 'critical' | 'high' | 'normal'
  status: 'active' | 'available' | 'completed' | 'expired'
  // Additional API details
  progress?: number[]
  tasks?: any[]
  reward?: { type: number; amount: number }
  expiration?: string
  flags?: number
}

interface MissionOrdersProps {
  warStatus: any
}

const MissionOrders: React.FC<MissionOrdersProps> = ({ warStatus }) => {
  const [missions, setMissions] = useState<Mission[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [showActiveOnly, setShowActiveOnly] = useState(true)

  useEffect(() => {
    // Set up interval to update current time every second for countdown
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log('🎯 Mission filter state:', { showActiveOnly, totalMissions: missions.length, activeMissions: missions.filter(m => m.status === 'active').length })
  }, [showActiveOnly, missions])

  const loadMissions = async () => {
    setIsRefreshing(true)
    try {
      // Fetch assignments from API (exposed as major orders endpoint)
      const majorOrders = await HighCommandAPI.getMajorOrders()
      if (majorOrders) {
        // API returns array directly or wrapped in 'orders' property
        let assignments: any[] = []
        
        if (Array.isArray(majorOrders)) {
          assignments = majorOrders
        } else if (majorOrders.orders && Array.isArray(majorOrders.orders)) {
          assignments = majorOrders.orders
        }
        
        if (assignments.length > 0) {
          const apiMissions: Mission[] = assignments.map((order: any, idx: number) => ({
            id: order.id || `${idx}`,
            title: order.title || `MAJOR ORDER ${idx + 1}`,
            objective: order.briefing || order.description || order.objective || 'Objective classified',
            difficulty: order.difficulty || 'Medium',
            priority: order.priority || (order.flags === 1 ? 'critical' : 'normal'),
            // Determine status based on expiration: if expired, mark as 'expired', otherwise 'active'
            status: (order.expiration && new Date(order.expiration).getTime() < Date.now()) ? 'expired' : 'active',
            progress: order.progress,
            tasks: order.tasks,
            reward: order.reward,
            expiration: order.expiration,
            flags: order.flags
          }))
          setMissions(apiMissions)
          setLastRefresh(new Date())
          setIsRefreshing(false)
          return
        }
      }
    } catch (error) {
      console.error('Failed to load major orders:', error)
    }
    
    // Fallback: use default missions if API fails or no data
    const defaultMissions: Mission[] = [
      {
        id: '1',
        title: 'OPERATION: LIBERATION DAWN',
        objective: 'Eliminate Terminid forces and secure strategic positions. Maintain heavy weapons support.',
        difficulty: 'Hard',
        priority: 'critical',
        status: 'active'
      },
      {
        id: '2',
        title: 'PLANETARY DEFENSE PROTOCOL',
        objective: 'Protect civilian installations from Automaton incursions. Establish defensive perimeter.',
        difficulty: 'Extreme',
        priority: 'critical',
        status: 'active'
      }
    ]
    setMissions(defaultMissions)
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }

  // Auto-refresh every hour (3600000 ms)
  useEffect(() => {
    loadMissions() // Load on mount
    const interval = setInterval(loadMissions, 3600000)
    return () => clearInterval(interval)
  }, [])

  // Reload when warStatus changes
  useEffect(() => {
    loadMissions()
  }, [warStatus])

  const formatExpiration = (expiration: string | undefined) => {
    if (!expiration) return 'No expiration'
    try {
      const date = new Date(expiration)
      return date.toLocaleString()
    } catch {
      return expiration
    }
  }

  const getRewardText = (reward: any) => {
    if (!reward) return 'No reward'
    // Type 1 is typically Super Credits or Medals
    const typeLabel = reward.type === 1 ? '⭐ Medals' : `Type ${reward.type}`
    return `${typeLabel}: ${reward.amount}`
  }

  const getOrderStatusEmoji = (progress: number[] | undefined) => {
    if (!progress || progress.length === 0) return '⏳' // hourglass - no data

    // Check if all objectives completed (progress values are 1)
    const allCompleted = progress.every((p) => p === 1)
    if (allCompleted) return '✅' // checkmark - all completed

    // Check if any are in progress (have both 0 and 1)
    const hasInProgress = progress.some((p) => p === 0)
    if (hasInProgress) return '⚙️' // gear - in progress

    return '⏳' // hourglass - waiting to start
  }

  const getOrderStatusEmojiWithFailed = (progress: number[] | undefined, expiration: string | undefined) => {
    const isFailed = getOrderFailed(progress, expiration)
    if (isFailed) return '❌' // failed
    return getOrderStatusEmoji(progress)
  }

  const getOrderSuccessStatus = (progress: number[] | undefined) => {
    if (!progress) return false
    return progress.every((p) => p === 1)
  }

  const getTimeRemaining = (expiration: string | undefined) => {
    if (!expiration) return { hours: 0, minutes: 0, seconds: 0, formatted: 'No deadline', status: 'normal' }
    try {
      const expiryTime = new Date(expiration).getTime()
      const ms = expiryTime - currentTime

      if (ms <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, formatted: 'EXPIRED', status: 'expired' }
      }

      const hours = Math.floor(ms / (1000 * 60 * 60))
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((ms % (1000 * 60)) / 1000)

      let formatted = ''
      if (hours > 0) formatted += `${hours}h `
      if (mins > 0 || hours > 0) formatted += `${mins}m `
      formatted += `${secs}s`

      const status = hours < 24 ? (hours < 1 ? 'urgent' : 'urgent') : 'normal'

      return { hours, minutes: mins, seconds: secs, formatted, status }
    } catch {
      return { hours: 0, minutes: 0, seconds: 0, formatted: 'Unknown', status: 'normal' }
    }
  }

  const getMissionCardClass = (expiration: string | undefined) => {
    const timeInfo = getTimeRemaining(expiration)
    if (timeInfo.status === 'expired') return 'time-expired'
    if (timeInfo.status === 'urgent') return 'time-urgent'
    return 'time-normal'
  }

  const getOrderFailed = (progress: number[] | undefined, expiration: string | undefined) => {
    if (!progress) return false
    // Failed if expired AND not all objectives completed
    const allCompleted = progress.every((p) => p === 1)
    if (allCompleted) return false // Not failed if completed
    
    const timeInfo = getTimeRemaining(expiration)
    return timeInfo.status === 'expired' // Failed if expired and not complete
  }

  const formatObjectivesDetailed = (progress: number[] | undefined) => {
    if (!progress || progress.length === 0) return []
    return progress.map((p, idx) => ({
      number: idx + 1,
      status: p === 1 ? 'Completed' : 'In Progress',
      emoji: p === 1 ? '✅' : '⏳'
    }))
  }

  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority) return null
    const badges: { [key: string]: { emoji: string; label: string } } = {
      critical: { emoji: '🔴', label: 'CRITICAL' },
      high: { emoji: '🟠', label: 'HIGH' },
      normal: { emoji: '🟡', label: 'NORMAL' }
    }
    return badges[priority] || null
  }

  return (
    <div className="mission-orders-container">
      <div className="mission-header">
        <div className="mission-header-top">
          <h2>⭐ MAJOR ORDERS</h2>
          <div className="mission-header-right">
            <p className="last-refresh">Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
            <button 
              className="refresh-button" 
              onClick={loadMissions} 
              disabled={isRefreshing}
              title="Manually refresh major orders"
            >
              {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
            </button>
          </div>
        </div>
        <div className="mission-subheader-row">
          <p className="mission-subheader">ACTIVE ASSIGNMENTS</p>
          <label className="toggle-label">
            <input 
              type="checkbox" 
              checked={showActiveOnly}
              onChange={(e) => {
                console.log('Toggle changed:', e.target.checked)
                setShowActiveOnly(e.target.checked)
              }}
              className="toggle-checkbox"
            />
            <span>Active Only</span>
          </label>
        </div>
      </div>

      <div className="mission-sections">
        <div className="mission-briefing">
          <div className="missions-list">
            {missions
              .filter((m) => showActiveOnly ? m.status === 'active' : true)
              .map((mission) => (
                <div
                  key={mission.id}
                  className={`mission-card status-${mission.status} priority-${mission.priority} ${
                    expandedId === mission.id ? 'expanded' : ''
                  } ${getMissionCardClass(mission.expiration)} ${
                    getOrderFailed(mission.progress, mission.expiration) ? 'status-failed' : ''
                  }`}
                  onClick={() => setExpandedId(expandedId === mission.id ? null : mission.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mission-header-row">
                    <span
                      className="mission-status-emoji"
                      title={
                        getOrderFailed(mission.progress, mission.expiration)
                          ? 'Order Failed'
                          : getOrderSuccessStatus(mission.progress)
                          ? 'All objectives completed'
                          : 'Objectives in progress'
                      }
                    >
                      {getOrderStatusEmojiWithFailed(mission.progress, mission.expiration)}
                    </span>
                    <h4 className="mission-title">{mission.title}</h4>
                    <div className="mission-right-section">
                      <span className="mission-time-counter">
                        {getTimeRemaining(mission.expiration).formatted}
                      </span>
                      {getPriorityBadge(mission.priority) && (
                        <span className={`priority-badge priority-${mission.priority}`}>
                          {getPriorityBadge(mission.priority)?.emoji} {getPriorityBadge(mission.priority)?.label}
                        </span>
                      )}
                    </div>
                    <span className="mission-expand-icon">{expandedId === mission.id ? '▼' : '▶'}</span>
                  </div>
                  <p className="mission-objective">{mission.objective}</p>

                  {expandedId === mission.id && (
                    <div className="mission-details">
                      {mission.reward && (
                        <div className="detail-item">
                          <strong>🎁 Reward:</strong> {getRewardText(mission.reward)}
                        </div>
                      )}
                      {mission.progress && mission.progress.length > 0 && (
                        <div className="detail-item objectives-list">
                          <strong>📋 Objectives ({mission.progress.length}):</strong>
                          <div className="objectives-items">
                            {formatObjectivesDetailed(mission.progress).map((obj) => (
                              <div key={obj.number} className="objective-item">
                                {obj.number}. {obj.emoji} {obj.status}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {mission.expiration && (
                        <div className="detail-item">
                          <strong>⏰ Expires:</strong> {formatExpiration(mission.expiration)}
                          {getOrderFailed(mission.progress, mission.expiration) && (
                            <span className="failed-badge"> ❌ FAILED</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            {missions.filter((m) => showActiveOnly ? m.status === 'active' : true).length === 0 && (
              <div className="no-missions">
                <p>No active assignments at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MissionOrders
