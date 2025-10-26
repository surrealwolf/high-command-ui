import { useEffect, useState, useCallback } from 'react'
import HighCommandAPI from '../services/api'
import './LiveStats.css'

interface Statistics {
  missionsWon: number
  missionsLost: number
  missionTime: number
  terminidKills: number
  automatonKills: number
  illuminateKills: number
  bulletsFired: number
  bulletsHit: number
  timePlayed: number
  deaths: number
  revives: number
  friendlies: number
  missionSuccessRate: number
  accuracy: number
  playerCount: number
}

interface LiveStatsProps {
  warStatus?: any
}

const LiveStats: React.FC<LiveStatsProps> = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadStatistics = useCallback(async () => {
    setLoading(true)
    try {
      const stats = await HighCommandAPI.getStatistics()
      if (stats) {
        console.log('Statistics loaded:', stats)
        setStatistics(stats)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStatistics()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStatistics, 60000)
    return () => clearInterval(interval)
  }, [loadStatistics])

  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <div className="live-stats-container">
      <div className="stats-header">
        <h2>📊 LIVE STATISTICS</h2>
        <div className="refresh-info">
          <button 
            className="refresh-button"
            onClick={loadStatistics}
            disabled={loading}
          >
            {loading ? '⟳ REFRESHING...' : '⟳ REFRESH NOW'}
          </button>
          <span className="last-refresh">Last updated: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {statistics && (
        <div className="stats-grid">
          {/* KILL STATISTICS */}
          <div className="stats-section">
            <h3>🔫 ENEMY KILLS (RAW NUMBERS)</h3>
            <div className="stat-row raw-stat">
              <div className="stat-label">Terminid Kills</div>
              <div className="stat-value raw-value">{formatNumber(statistics.terminidKills)}</div>
            </div>
            <div className="stat-row raw-stat">
              <div className="stat-label">Automaton Kills</div>
              <div className="stat-value raw-value">{formatNumber(statistics.automatonKills)}</div>
            </div>
            <div className="stat-row raw-stat">
              <div className="stat-label">Illuminate Kills</div>
              <div className="stat-value raw-value">{formatNumber(statistics.illuminateKills)}</div>
            </div>
            <div className="stat-row total-stat">
              <div className="stat-label">Total Enemy Kills</div>
              <div className="stat-value raw-value total-value">
                {formatNumber(statistics.terminidKills + statistics.automatonKills + statistics.illuminateKills)}
              </div>
            </div>
          </div>

          {/* MISSION STATISTICS */}
          <div className="stats-section">
            <h3>⭐ MISSION STATISTICS</h3>
            <div className="stat-row">
              <div className="stat-label">Missions Won</div>
              <div className="stat-value">{formatNumber(statistics.missionsWon)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Missions Lost</div>
              <div className="stat-value">{formatNumber(statistics.missionsLost)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Success Rate</div>
              <div className="stat-value">{statistics.missionSuccessRate}%</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Total Missions</div>
              <div className="stat-value">{formatNumber(statistics.missionsWon + statistics.missionsLost)}</div>
            </div>
          </div>

          {/* COMBAT STATISTICS */}
          <div className="stats-section">
            <h3>💥 COMBAT STATISTICS</h3>
            <div className="stat-row">
              <div className="stat-label">Total Deaths</div>
              <div className="stat-value">{formatNumber(statistics.deaths)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Total Revives</div>
              <div className="stat-value">{formatNumber(statistics.revives)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Friendlies Killed</div>
              <div className="stat-value">{formatNumber(statistics.friendlies)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{statistics.accuracy}%</div>
            </div>
          </div>

          {/* AMMUNITION STATISTICS */}
          <div className="stats-section">
            <h3>🔫 AMMUNITION STATISTICS</h3>
            <div className="stat-row">
              <div className="stat-label">Bullets Fired</div>
              <div className="stat-value">{formatNumber(statistics.bulletsFired)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Bullets Hit</div>
              <div className="stat-value">{formatNumber(statistics.bulletsHit)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Shots Fired (Total)</div>
              <div className="stat-value">{formatNumber(statistics.bulletsFired - statistics.bulletsHit)}</div>
            </div>
          </div>

          {/* TIME & PLAYER STATISTICS */}
          <div className="stats-section">
            <h3>⏱️ TIME & PLAYERS</h3>
            <div className="stat-row">
              <div className="stat-label">Time Played</div>
              <div className="stat-value">{formatTime(statistics.timePlayed)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Mission Time</div>
              <div className="stat-value">{formatTime(statistics.missionTime)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Active Players</div>
              <div className="stat-value">{formatNumber(statistics.playerCount)}</div>
            </div>
          </div>

          {/* KILL TO DEATH RATIO */}
          <div className="stats-section">
            <h3>📈 EFFICIENCY METRICS</h3>
            <div className="stat-row">
              <div className="stat-label">Kill/Death Ratio</div>
              <div className="stat-value">
                {(
                  (statistics.terminidKills + statistics.automatonKills + statistics.illuminateKills) / 
                  Math.max(statistics.deaths, 1)
                ).toFixed(2)}:1
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Kills per Mission</div>
              <div className="stat-value">
                {(
                  (statistics.terminidKills + statistics.automatonKills + statistics.illuminateKills) / 
                  Math.max(statistics.missionsWon + statistics.missionsLost, 1)
                ).toFixed(0)}
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Average Mission Duration</div>
              <div className="stat-value">
                {formatTime(
                  statistics.missionTime / Math.max(statistics.missionsWon + statistics.missionsLost, 1)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !statistics && (
        <div className="loading-state">
          <p>⟳ Loading statistics...</p>
        </div>
      )}
    </div>
  )
}

export default LiveStats
