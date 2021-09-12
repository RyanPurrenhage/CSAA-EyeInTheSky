import LeftPane from './LeftPane'
import MapRightPane from './MapRightPane'
import Map from './Map'

import React, { useMemo } from 'react'
import '../CSS/coverageMap.css'


const CoverageMapTab = () => {

    const MemoizedMap = useMemo(()=> <Map />, [])

    return(

        <div className="coverage-map">
                <div className="coverage-map-left">
                    <LeftPane />
                </div>
                <div className="coverage-map-center">
                    { MemoizedMap }
                </div>
                <div className="coverage-map-right">
                    <MapRightPane />
                </div>
        </div>

    );
}

export default CoverageMapTab