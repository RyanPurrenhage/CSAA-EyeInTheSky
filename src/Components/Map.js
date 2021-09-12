import React, { useEffect, useState, useRef, useContext} from 'react'

import {CurrentStreamContext} from '../Context/CurrentStreamContext'
import {addMarker, 
    addSearchBox,
    handleSendDrone,
    countHouses} 
from '../Helpers/maps'

import '../CSS/mapPane.css'


function Map() {

    const API_KEY = process.env.REACT_APP_MAPS_API_KEY

    const ref = useRef()
    const [map, setMap] = useState()
    const [infoWindow, setinfoWindow] = useState(null) // to store one infoWindow object

    const stream = useContext(CurrentStreamContext).stream
    const [currentStream, setCurrentStream] = stream

    const dronesState = useContext(CurrentStreamContext).drones
    const [drones, setDrones] = dronesState

    const tok = useContext(CurrentStreamContext).token
    const csrfToken = tok[0]

    const droneout = useContext(CurrentStreamContext).droneOutputs
    const setdroneOutputs = droneout[1]

    const houses = useContext(CurrentStreamContext).houses
    const setnumOfProperties= houses[1]

    const [customers, setCustomers] = useState([])

    const [progress, setprogress] = useState([]) // coordinates of path of drone travelling

    const [isDone, setisDone] = useState(false)

    useEffect( () => {
        async function fetchData() {
            const res = await fetch('http://localhost:5000/get-customers');
            let data = await res.json();
            setCustomers(data);
        }
        fetchData();
    }, [])

    useEffect(() => {

        const defaultParameters =  {
            center: {lat: currentStream.location.lat, lng: currentStream.location.lng},
            zoom: 17,
            mapTypeId : "satellite",
            tilt: 0,
        }

        const onLoad = () => {
            setMap(new window.google.maps.Map(ref.current, defaultParameters))
            setinfoWindow(new window.google.maps.InfoWindow())
            // setMap( themap => {
            //     console.log("THE MAP: ", themap)
            // })
        }

        if(!window.google) {
            const mapScript = document.createElement('script')
            mapScript.src   = `https://maps.googleapis.com/maps/api/js?libraries=places,geometry&key=${API_KEY}&v=3`
            document.head.append(mapScript)
            mapScript.addEventListener('load', onLoad) 
            return () => mapScript.removeEventListener('load', onLoad) 
        } else onLoad()
  
    }, [API_KEY, currentStream])


    // Arrays to hold markers
    const houseMarkers = []

    useEffect(() => {

        

        drones.map( drone => {

            drone.marker.setMap(map)

            return drone
        })

    }, [map, infoWindow, drones])

    function addMapComponents() {
    //
    // Add components to the map
    //

    if(map && infoWindow) {


        

        // Searchbox
        //
        addSearchBox(map, csrfToken, setdroneOutputs)

        //
        // Add Markers of Drones
        //
        

        //
        // Add markers of customer houses on map
        //
        customers.map(customer => {

            const infoWindowContent = `<div class="marker-info-window">
            <h4> ${customer.name} </h4>
            <p> ${customer.email} </p>
            <p> ${customer.address} </p>
            <p id="firescore"> ${customer.firescore ? 'Firescore: ' + customer.firescore : ''} </p>
            <button onclick="document.getElementById('send-drone-btn').click()" class="send-drone-btn">Send Drone</button>
            </div>`


            // black ==> unvisited
            const black = '#000000'

            // Low:  0.0 - 0.59; [0.0 - 0.2) ==> (lighter blue),
            const lightBlue = '4d4dff'
                //               [0.2 - 0.4) ==> (blue)
            const blue = '#0000ff'
                //               [0.4 - 0.6) ==> (dark blue)
            const darkBlue = '#00008b'
            // High: 0.6 - 1.0;  [0.6 - 0.75) ==> (light red)
            const lightRed = '#ff3333'
                //               [0.75 - 0.9) ==> (red)
            const red = '#ff0000'
                //               [0.9 -  1.0] ==> (dark red)
            const darkRed = '#b30000'
            let fill;
            let riskLevel;

            if(customer.high_risk && customer.isvisited) {
                if (customer.firescore >= 0.6 && customer.firescore < 0.75) {
                    fill = lightRed;
                    riskLevel = "red"
                }
                else if (customer.firescore >= 0.75 && customer.firescore < 0.9) {
                    fill = red;
                    riskLevel = "red"
                }
                else if (customer.firescore >= 0.9 && customer.firescore <= 1.0) {
                    fill = darkRed;
                    riskLevel = "red"
                }
            }
            else if(!customer.high_risk && customer.isvisited) {
                if (customer.firescore >= 0.0 && customer.firescore < 0.2) {
                    fill = lightBlue;
                    riskLevel = "blue"
                }
                else if (customer.firescore >= 0.2 && customer.firescore < 0.4) {
                    fill = blue;
                    riskLevel = "blue"
                }
                else if (customer.firescore >= 0.4 && customer.firescore < 0.6) {
                    fill = darkBlue;
                    riskLevel = "blue"
                }
            }
            else { riskLevel = "black"; fill=black;}

            const svgMarker = {
                path: "m498.195312 222.695312c-.011718-.011718-.023437-.023437-.035156-.035156l-208.855468-208.847656c-8.902344-8.90625-20.738282-13.8125-33.328126-13.8125-12.589843 0-24.425781 4.902344-33.332031 13.808594l-208.746093 208.742187c-.070313.070313-.140626.144531-.210938.214844-18.28125 18.386719-18.25 48.21875.089844 66.558594 8.378906 8.382812 19.445312 13.238281 31.277344 13.746093.480468.046876.964843.070313 1.453124.070313h8.324219v153.699219c0 30.414062 24.746094 55.160156 55.167969 55.160156h81.710938c8.28125 0 15-6.714844 15-15v-120.5c0-13.878906 11.289062-25.167969 25.167968-25.167969h48.195313c13.878906 0 25.167969 11.289063 25.167969 25.167969v120.5c0 8.285156 6.714843 15 15 15h81.710937c30.421875 0 55.167969-24.746094 55.167969-55.160156v-153.699219h7.71875c12.585937 0 24.421875-4.902344 33.332031-13.808594 18.359375-18.371093 18.367187-48.253906.023437-66.636719zm0 0",
                fillColor : `${fill}`,
                fillOpacity: 1,       
                strokeWeight: 0.5,
                strokeColor: "white",
                rotation: 0,
                scale: 0.04,
            }

            houseMarkers.push({risk_level: riskLevel, marker: addMarker(map, customer.coordinates, svgMarker, infoWindowContent, infoWindow)})
            return customer;
        }) 

        // Add count houses
        countHouses(map, houseMarkers, setnumOfProperties)

    }
        
    }

    // add components to map
    addMapComponents()


    return (
        <>
        <div className="map-pane" id="google-map"
            ref={ref}
            style={{  height: "70vh",
                      width: "100%"  
                  }}
        />

        {/* hidden button for send drone button on infowindow */}
        <button type="button" style={{display: 'none'}} id="send-drone-btn" onClick={
            ()=>{
                
            const sendDroneParameters = {drones: drones,
                                         setDrones: setDrones,
                                         isDone: isDone,
                                         setisDone: setisDone,
                                         setdroneOutputs: setdroneOutputs,
                                         infoWindow: infoWindow,
                                         infoWindowPosition: infoWindow.getPosition(),
                                         map: map,
                                         currentStream: currentStream,
                                         setCurrentStream: setCurrentStream,
                                         progress: progress,
                                         setprogress: setprogress,
                                         csrfToken: csrfToken,
                                         }
            handleSendDrone(sendDroneParameters)
            }
        }/>
        </>
    )
}

export default Map
