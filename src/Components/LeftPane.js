import {Link} from 'react-router-dom';
import StreamLabel from './StreamLabel';

import { useContext } from 'react';
import {CurrentStreamContext} from '../Context/CurrentStreamContext';

import '../CSS/leftPane.css';


function LeftPane() {
     
    const dronesState = useContext(CurrentStreamContext).drones;
    const drones = dronesState[0];

    return(
        <div className="left-pane">

        <h3> Drone Feeds </h3>

        <div className="left-pane-streams">
            { drones.map( drone => {
                return <StreamLabel key={drone._id.$oid} label={drone.name} source="https://www.youtube.com/embed/fKXztwtXaGo?autoplay=1&loop=1&controls=0" location={drone.location} />
            })}
        </div>

        <Link to="/Customers">
            <button className="customers-btn" type="submit">Customers</button>
        </Link>

    </div>
    );
}

export default LeftPane