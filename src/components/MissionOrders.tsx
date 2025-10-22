import { useEffect, useState } from 'react'
import HighCommandAPI from '../services/api'
import './MissionOrders.css'

interface Mission {
  id: string
  title: string
  objective: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme'
  priority: 'critical' | 'high' | 'normal'
  status: 'active' | 'available' | 'completed'
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

  useEffect(() => {
    const loadMissions = async () => {
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
              status: order.status || 'active',
              progress: order.progress,
              tasks: order.tasks,
              reward: order.reward,
              expiration: order.expiration,
              flags: order.flags
            }))
            setMissions(apiMissions)
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
    }

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

  const getOrderSuccessStatus = (progress: number[] | undefined) => {
    if (!progress) return false
    return progress.every((p) => p === 1)
  }

  const formatObjectivesList = (progress: number[] | undefined) => {
    if (!progress || progress.length === 0) return 'No objectives'
    return progress
      .map((p, idx) => `${idx + 1}. ${p === 1 ? '✅ Completed' : '⏳ In Progress'}`)
      .join(' • ')
  }

  const getTimeRemaining = (expiration: string | undefined) => {
    if (!expiration) return { hours: 0, formatted: 'No deadline', status: 'normal' }
    try {
      const expiryTime = new Date(expiration).getTime()
      const now = Date.now()
      const ms = expiryTime - now

      if (ms <= 0) {
        return { hours: 0, formatted: 'EXPIRED', status: 'expired' }
      }

      const hours = Math.floor(ms / (1000 * 60 * 60))
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

      let formatted = ''
      if (hours > 0) formatted += `${hours}h`
      if (mins > 0) formatted += ` ${mins}m`

      const status = hours < 24 ? (hours < 1 ? 'expired' : 'urgent') : 'normal'

      return { hours, formatted, status }
    } catch {
      return { hours: 0, formatted: 'Unknown', status: 'normal' }
    }
  }

  const getMissionCardClass = (expiration: string | undefined) => {
    const timeInfo = getTimeRemaining(expiration)
    if (timeInfo.status === 'expired') return 'time-expired'
    if (timeInfo.status === 'urgent') return 'time-urgent'
    return 'time-normal'
  }

  return (
    <div className="mission-orders-container">
      <div className="mission-header">
        <h2>⭐ MAJOR ORDERS</h2>
        <p className="mission-subheader">ACTIVE ASSIGNMENTS</p>
      </div>

      <div className="mission-sections">
        <div className="mission-briefing">
          <div className="missions-list">
            {missions
              .filter((m) => m.status === 'active')
              .map((mission) => (
                <div
                  key={mission.id}
                  className={`mission-card status-${mission.status} priority-${mission.priority} ${
                    expandedId === mission.id ? 'expanded' : ''
                  } ${getMissionCardClass(mission.expiration)}`}
                  onClick={() => setExpandedId(expandedId === mission.id ? null : mission.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mission-header-row">
                    <span
                      className="mission-status-emoji"
                      title={getOrderSuccessStatus(mission.progress) ? 'All objectives completed' : 'Objectives in progress'}
                    >
                      {getOrderStatusEmoji(mission.progress)}
                    </span>
                    <h4 className="mission-title">{mission.title}</h4>
                    <span className="mission-time-counter">
                      {getTimeRemaining(mission.expiration).formatted}
                    </span>
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
                      {mission.progress && (
                        <div className="detail-item">
                          <strong>📋 Objectives:</strong> {formatObjectivesList(mission.progress)}
                        </div>
                      )}
                      {mission.expiration && (
                        <div className="detail-item">
                          <strong>⏰ Expires:</strong> {formatExpiration(mission.expiration)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            {missions.filter((m) => m.status === 'active').length === 0 && (
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
