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
}

interface MissionOrdersProps {
  warStatus: any
}

const MissionOrders: React.FC<MissionOrdersProps> = ({ warStatus }) => {
  const [missions, setMissions] = useState<Mission[]>([])
  const [planets, setPlanets] = useState<any[]>([])

  useEffect(() => {
    const loadMissions = async () => {
      try {
        const planetsData = await HighCommandAPI.getPlanets()
        if (planetsData && Array.isArray(planetsData)) {
          setPlanets(planetsData.slice(0, 5))
        }
      } catch (error) {
        console.error('Failed to load planets:', error)
      }

      // Generate mission orders
      const missionList: Mission[] = [
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
        },
        {
          id: '3',
          title: 'RECON MISSION: SECTOR 7',
          objective: 'Scout enemy positions and gather intelligence. Avoid unnecessary engagement.',
          difficulty: 'Medium',
          priority: 'high',
          status: 'available'
        },
        {
          id: '4',
          title: 'SUPPLY LINE CONTROL',
          objective: 'Secure resource extraction zones. Neutralize opposing forces.',
          difficulty: 'Medium',
          priority: 'normal',
          status: 'available'
        },
        {
          id: '5',
          title: 'STRATEGIC STRIKE: BUG NEST',
          objective: 'Locate and destroy primary Terminid hive structure. High-risk operation.',
          difficulty: 'Extreme',
          priority: 'high',
          status: 'available'
        }
      ]

      setMissions(missionList)
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

  return (
    <div className="mission-orders-container">
      <div className="mission-header">
        <h2>⭐ MAJOR ORDERS</h2>
        <p className="mission-subheader">GALACTIC WAR CAMPAIGN DIRECTIVES</p>
      </div>

      <div className="mission-sections">
        <div className="mission-briefing">
          <h3>ACTIVE OPERATIONS</h3>
          <div className="missions-list">
            {missions
              .filter((m) => m.status === 'active')
              .map((mission) => (
                <div key={mission.id} className={`mission-card status-${mission.status} priority-${mission.priority}`}>
                  <div className="mission-header-row">
                    <span className="mission-status-icon">{getStatusIcon(mission.status)}</span>
                    <h4 className="mission-title">{mission.title}</h4>
                    <span className="mission-difficulty" style={{ color: getDifficultyColor(mission.difficulty) }}>
                      {mission.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="mission-objective">{mission.objective}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="mission-briefing">
          <h3>AVAILABLE MISSIONS</h3>
          <div className="missions-list">
            {missions
              .filter((m) => m.status === 'available')
              .map((mission) => (
                <div key={mission.id} className={`mission-card status-${mission.status} priority-${mission.priority}`}>
                  <div className="mission-header-row">
                    <span className="mission-status-icon">{getStatusIcon(mission.status)}</span>
                    <h4 className="mission-title">{mission.title}</h4>
                    <span className="mission-difficulty" style={{ color: getDifficultyColor(mission.difficulty) }}>
                      {mission.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p className="mission-objective">{mission.objective}</p>
                </div>
              ))}
          </div>
        </div>

        {planets.length > 0 && (
          <div className="mission-briefing">
            <h3>DEPLOYMENT ZONES</h3>
            <div className="planets-grid">
              {planets.map((planet, idx) => (
                <div key={idx} className="planet-card">
                  <div className="planet-name">{planet.name || `SECTOR ${idx + 1}`}</div>
                  <div className="planet-biome">{planet.biome_name || 'CLASSIFIED'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MissionOrders
