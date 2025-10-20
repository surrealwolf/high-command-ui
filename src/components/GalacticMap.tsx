import MapView from './MapView'
import './GalacticMap.css'

interface GalacticMapProps {
  warStatus: any
}

const GalacticMap: React.FC<GalacticMapProps> = ({ warStatus }) => {
  return (
    <MapView warStatus={warStatus} />
  )
}

export default GalacticMap
