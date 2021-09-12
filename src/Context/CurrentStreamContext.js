import { useState, createContext, useEffect} from 'react'

export const CurrentStreamContext = createContext();

export const CurrentStreamProvider = props => {

    //
    // Current Stream State
    //
    const [currentStream, setCurrentStream] = useState({
        name: 'Drone 1',
        url: 'https://www.youtube.com/embed/f0v3Ama8Sgg?controls=0',
        location: { lat: 37.872520, lng: -122.272920},
    });

    // const initialLocations = {
    //     drone1: { lat: 37.872520, lng: -122.272920 },
    //     drone2: { lat: 37.875490, lng: -122.273190},
    //     drone3: { lat: 37.871860, lng: -122.254520},
    //     drone4: { lat: 37.872670, lng: -122.283870 },
    //     drone5: { lat: 37.930350, lng: -122.059430},
    //     drone6: { lat: 37.930350, lng: -122.059430},
    // }

    //
    // Drones and Properties States
    //
    const [drones, setDrones] = useState([])
    const [numOfProperties, setnumOfProperties] = useState({total: 0, high_risk: 0, low_risk: 0, unvisited: 0})

    //
    //
    // CSRF Token and Drone Outputs States
    const [csrfToken, setcsrfToken] = useState('')

    const initialOutputs = {location: {lat: '', lng: ''}, address: '', firescore:''}
    const [droneOutputs, setdroneOutputs] = useState(initialOutputs)

    useEffect( () => {
        async function fetchData() {
            const res = await fetch('http://localhost:5000/get-drones');
            let data = await res.json();

            // Set default current stream
            setCurrentStream({
                name: data[0].name,
                url: 'https://www.youtube.com/embed/f0v3Ama8Sgg?controls=0',
                location: data[0].location,
            })

            const newData = data.map( drone => {

                const newMarker = new window.google.maps.Marker({
                    position: drone.location,
                    map: null,
                    label: 'D' + drone.name.slice(-1),
                })

                drone = {...drone, marker: newMarker}
                return drone
            })

            setDrones(newData);

        }
        fetchData();
    }, [])

    return(
        <CurrentStreamContext.Provider value={{stream: [currentStream, setCurrentStream], drones: [drones, setDrones], houses: [numOfProperties, setnumOfProperties], token: [csrfToken, setcsrfToken], droneOutputs: [droneOutputs, setdroneOutputs]}}>
            {props.children}
        </CurrentStreamContext.Provider>
    )
}

