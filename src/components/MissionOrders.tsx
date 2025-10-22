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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#66ff00'
      case 'Medium':
        return '#ffff00'
      case 'Hard':
        return '#ff8800'
      case 'Extreme':
        return '#ff0000'
      default:
        return '#ffb300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🔴'
      case 'available':
        return '⚪'
      case 'completed':
        return '✅'
      default:
        return '❓'
    }
  }

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
                  }`}
                  onClick={() => setExpandedId(expandedId === mission.id ? null : mission.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mission-header-row">
                    <span className="mission-status-icon">{getStatusIcon(mission.status)}</span>
                    <h4 className="mission-title">{mission.title}</h4>
                    <span className="mission-difficulty" style={{ color: getDifficultyColor(mission.difficulty) }}>
                      {mission.difficulty.toUpperCase()}
                    </span>
                    <span className="mission-expand-icon">{expandedId === mission.id ? '▼' : '▶'}</span>
                  </div>
                  <p className="mission-objective">{mission.objective}</p>

                  {expandedId === mission.id && (
                    <div className="mission-details">
                      {mission.reward && (
                        <div className="detail-item">
                          <strong>Reward:</strong> {getRewardText(mission.reward)}
                        </div>
                      )}
                      {mission.expiration && (
                        <div className="detail-item">
                          <strong>Expires:</strong> {formatExpiration(mission.expiration)}
                        </div>
                      )}
                      {mission.progress && (
                        <div className="detail-item">
                          <strong>Progress:</strong> {mission.progress.map((p, i) => `${i + 1}: ${p}`).join(' • ')}
                        </div>
                      )}
                      {mission.tasks && mission.tasks.length > 0 && (
                        <div className="detail-item">
                          <strong>Tasks:</strong> {mission.tasks.length} task
                          {mission.tasks.length !== 1 ? 's' : ''}
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
