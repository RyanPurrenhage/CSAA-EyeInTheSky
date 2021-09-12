import { FaHome } from 'react-icons/fa'
import { useContext } from 'react'
import {CurrentStreamContext} from '../Context/CurrentStreamContext'

import '../CSS/rightPane.css'

function MapRightPane() {

    const houses = useContext(CurrentStreamContext).houses
    const numOfProperties= houses[0]

    return (
  
        <div className="map-right-pane">
            <h3>Map Info</h3>

            <div className="right-pane-items">

                <p> {numOfProperties.total} Total Properties </p>
                <p> {numOfProperties.low_risk} Low Risk </p>
                <p> {numOfProperties.high_risk} High Risk </p>
                <p> {numOfProperties.unvisited} Unvisited </p>
                
            </div>

            <div className="key-icons">
                    <p style={{color: "blue"}}>
                        <FaHome />  : Low Risk
                    </p>
                    <p style={{color: "red"}}>
                        <FaHome />  : High Risk
                    </p>
                    <p style={{color: "black"}}>
                        <FaHome />  : Unvisited
                    </p>
            </div>

        </div>
    )
}

export default MapRightPane
