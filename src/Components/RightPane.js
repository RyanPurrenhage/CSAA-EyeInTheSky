import RightPaneItem from './RightPaneItem'

import { useContext } from 'react'
import {CurrentStreamContext} from '../Context/CurrentStreamContext'

import '../CSS/rightPane.css'

function RightPane() {

    const droneout = useContext(CurrentStreamContext).droneOutputs
    const droneOutputs = droneout[0]

    return(

        <div className="right-pane">
            <h3>Drone Outputs</h3>

            <div className="right-pane-items">
                <RightPaneItem title="Lat: " value={droneOutputs.location.lat}/>
                <RightPaneItem title="Lng: " value={droneOutputs.location.lng}/>
            </div>

            <div className="scores">
                <p>Firescore</p>
                <p className="score"> {droneOutputs.firescore} </p>
            </div>

        </div>

    );
}


export default RightPane