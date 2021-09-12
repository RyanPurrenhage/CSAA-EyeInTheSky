import '../CSS/home.css'

import Tabs from '../Components/Tabs'
import CurrentStream from '../Components/CurrentStream'
import DroneFeedTab from '../Components/DroneFeedTab'
import CoverageMapTab from '../Components/CoverageMapTab'
import SearchBar from '../Components/SearchBar'

import { useState } from 'react'


function Home() {
    
    const [currentTab, setCurrentTab] = useState("Map");
    let content = null;

    if(currentTab === "Drone") {
        content = <DroneFeedTab />
    }
    else {
        content = <CoverageMapTab />
    }
    
    return(
        <div className="home">

            <div className="head-area">
                <Tabs onChangeTab={setCurrentTab} isActive={currentTab}/>

                <CurrentStream />

                <SearchBar />
            </div>

            <div className="body-area">
                { content }
            </div>

        </div>
    );
}


export default Home