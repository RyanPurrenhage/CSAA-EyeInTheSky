import LeftPane from './LeftPane'
import RightPane from './RightPane'

import { useState } from 'react'
import '../CSS/droneFeed.css'

import Final_img from '../Assets/outputImages/Final_img.png'
import Final_mask from '../Assets/outputImages/Final_mask.png'


const DroneFeedTab = () => {

    const [isDebugMode, setisDebugMode] = useState(false)

    function handleClick() {
        setisDebugMode(!isDebugMode)
    }

    return(
        <div className="drone-feed">
            <div className="drone-feed-left">
                <LeftPane />
            </div>
            <div className="drone-feed-center">
                <div className="feed-pane">
                    <img onClick={handleClick} src={isDebugMode ? Final_mask : Final_img} alt="drone" width="100%" height="100%"/> 
                </div>  
            </div>
            <div className="drone-feed-right">
                <RightPane />
            </div>
        </div>
    );
}

export default DroneFeedTab