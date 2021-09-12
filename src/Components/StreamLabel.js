import { useContext } from 'react'
import {CurrentStreamContext} from '../Context/CurrentStreamContext'

function StreamLabel({label, source, location}){
     
    const stream = useContext(CurrentStreamContext).stream;
    const setCurrentStream = stream[1];

    return(
        <p
        className="stream-label"
        onClick={() => setCurrentStream({name: label, url: source, location: location})}
        > 
        {label}
        </p>
    );
}

export default StreamLabel