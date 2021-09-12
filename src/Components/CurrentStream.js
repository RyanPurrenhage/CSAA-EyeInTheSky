import {useContext} from 'react'
import {CurrentStreamContext} from '../Context/CurrentStreamContext'


const CurrentStream = () => {

    const stream = useContext(CurrentStreamContext).stream;
    const currentStream = stream[0];

    return(
        <div className="current-stream">
            <p> { currentStream.name } - Stream</p>
        </div>
    );
}

export default CurrentStream