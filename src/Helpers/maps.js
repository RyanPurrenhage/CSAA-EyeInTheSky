
var TIMES = 0

//
// Function to add a marker to a map
//
export function addMarker(map, position, icon, info, infoWindow) {

    const marker =  new window.google.maps.Marker({
        position: position,
        map: map,
        icon: icon,
    })

    marker.addListener('click', () => {
        infoWindow.setContent(info)
        infoWindow.open(map, marker)
    })

    return marker
}


//
// Function to add a searchbox feature to a map
//
export function addSearchBox(map, csrfToken, setdroneOutputs) {

    const API_KEY = process.env.REACT_APP_MAPS_API_KEY

    const input = document.getElementById("search-input");
    const searchBox = new window.google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        
        if (places.length === 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach((marker) => {
        marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        const bounds = new window.google.maps.LatLngBounds();
        places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
        }

        const icon = {
            url: place.icon,
            size: new window.google.maps.Size(71, 71),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(17, 34),
            scaledSize: new window.google.maps.Size(25, 25),
        };

        // Create a marker for each place.
        const marker = new window.google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
            })
    
        marker.addListener('click', async () => {
            
            console.log("Here is the location: ", place.geometry.location.lat())
            console.log("Here is the location: ", place.geometry.location.lng())
            // ${place.geometry.location.lat()}

           const res = await fetch('http://localhost:5000/get-current-map-image', {
        
                // Adding method type 
                method: "POST", 
                
                // Adding body or contents to send 
                body: JSON.stringify({ 
                    url: `https://maps.googleapis.com/maps/api/staticmap?center=${place.geometry.location.lat()},${place.geometry.location.lng()}&${place.geometry.location.lat()},${place.geometry.location.lng()}&zoom=19&size=256x256&scale=1&maptype=satellite&key=${API_KEY}`,
                    name: place.name,
                    coordinates: {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()},
                }), 
                
                // Adding headers to the request 
                headers: { 
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    "Content-type": "application/json; charset=UTF-8",
                    "X-CSRFToken": csrfToken,
                },

                credentials: 'include',
            })

            const data = await res.json()
            console.log("Results from model: ", data)

            if (data.firescore) {

                const out = { location: {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()},
                address: place.formatted_address,
                firescore: data.firescore,
                }   

                // update drone outputs state
                setdroneOutputs(out) 

            }

  

        })

        markers.push( marker );

        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
        });
        map.fitBounds(bounds);

    })
} 


async function getFireScore(location, csrfToken, houseCoords) {

    const API_KEY = process.env.REACT_APP_MAPS_API_KEY

    const name = houseCoords.lat.toString() + houseCoords.lng.toString()

    const res = await fetch('http://localhost:5000/get-current-map-image', {
        
        // Adding method type 
        method: "POST", 
        
        // Adding body or contents to send 
        body: JSON.stringify({ 
            url: `https://maps.googleapis.com/maps/api/staticmap?center=${houseCoords.lat},${houseCoords.lng}&${houseCoords.lat},${houseCoords.lng}&zoom=19&size=256x256&scale=1&maptype=satellite&key=${API_KEY}`,
            name: name,
            coordinates: houseCoords,
        }), 
        
        // Adding headers to the request 
        headers: { 
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            "Content-type": "application/json; charset=UTF-8",
            "X-CSRFToken": csrfToken,
        },

        credentials: 'include',
    })

    const data = await res.json()

    console.log("THE RESPONSE: ", data)
    
    if (data.firescore >= 0) {
        return {firescore: data.firescore ? data.firescore : '', photoURL:data.photoURL}
    }

    return {'error': 'Could not get firescore!'}
}

//
// Compute the distance(in metres) the drone has travelled so far
//
export function getDistance(initialTime, V) {
    return V * ((new Date() - initialTime) / 1000); // d = v * t
}

//
// Function to update drone information(location) in database
//
async function updateDroneDB(droneID, newLocation, csrfToken) {

    const res = await fetch('http://localhost:5000/update-drone', {
        
        // Adding method type 
        method: "POST", 

        // Adding headers to the request 
        headers: { 
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            "Content-type": "application/json; charset=UTF-8",
            "X-CSRFToken": csrfToken,
        },

        credentials: 'include',
        
        // Adding body or contents to send 
        body: JSON.stringify({ 
            droneID: droneID,
            newLocation: newLocation,
        }), 

    })

    const data = await res.json()

    console.log("Response after update: ", data)

}

//
// Function to draw Polyline on a map
//
async function animateDroneMovement(map, origin, destination, initialDate, velocity, progress, setprogress, totalDistance, path, marker, polyline, droneID, drones, setDrones, csrfToken, setdroneOutputs) {

    const distance = getDistance(initialDate, velocity)
    const percentage = distance / totalDistance

    if( percentage <= 1) {

        marker.setPosition(path[path.length - 1])
        polyline.setPath(path)

    }
    else {
        //
        // it's the end
        //
        
        TIMES = TIMES += 1  // Run only once
        if (TIMES === 1) {

            // update location and marker location
            path.push(destination)
            polyline.setPath(path)
            marker.setPosition(destination)

            const newLocation = { lat: destination.lat(), lng: destination.lng()}
            const newDrones = drones.map( drone => drone._id.$oid === droneID ? {...drone, location: newLocation} : drone)
            
            console.log('WE ARE DONE! : ', destination.lat(), destination.lng())

            // update drone location state
            setDrones(newDrones)

            // update drone location database
            updateDroneDB(droneID, newLocation, csrfToken)

            // get fire score and image
            const res = await getFireScore(origin, csrfToken, {lat: destination.lat(), lng: destination.lng()})
            console.log('WE ARE GOT IT: ', res)

            if( typeof res.firescore != 'undefined') {

                const out = { 
                    location: {lat: destination.lat(), lng: destination.lng()},
                    address: '',
                    firescore: res.firescore,
                }  
    
                setdroneOutputs(out)

            }

        }
        return; 
    }

    // ensure progress is defined
    if(progress.length) {
        
        //get the coordinate of the current location of the drone
        const coord = new window.google.maps.geometry.spherical.interpolate(
            progress[0],
            destination,
            percentage
        )

        path.push(coord)
        setprogress(path)

        console.log("Distance moved %: ", percentage)
        console.log("Position: ", coord.lat(), coord.lng())
        console.log('Destination: ', destination.lat(), destination.lng())
        // setprogress([...progress, coord])
        setprogress((state) => {
            // console.log("the state here: ", state)
            return state;
        })
    }

}


export function handleSendDrone(parameters) {

    const drones = parameters.drones
    const setDrones = parameters.setDrones
    const setdroneOutputs = parameters.setdroneOutputs
    const destination = parameters.infoWindowPosition
    const map = parameters.map
    const currentStream = parameters.currentStream
    const setCurrentStream = parameters.setCurrentStream
    const infoWindow = parameters.infoWindow
    // const progress = parameters.progress
    const setprogress = parameters.setprogress
    const csrfToken = parameters.csrfToken
    
    const VELOCITY = 30 // metres per second
    const INITIAL_DATE = new Date()
    let shortestDistance = 10000000000
    let closestDrone;

    drones.map( drone => {

        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(

            new window.google.maps.LatLng(
                drone.location.lat,
                drone.location.lng
              ),

              destination
            )
        if (distance < shortestDistance) {
            shortestDistance = distance
            closestDrone = drone
        }

        return drone;

    })

    //
    // Set Current Stream if closestDrone is not the current stream
    const name = closestDrone.name;
    if( name !== currentStream.name) {
        setCurrentStream({name: closestDrone.name, url: 'https://www.google.com', location: closestDrone.location })
    }
    
    console.log("Shortest Distance: ", shortestDistance)
    console.log("Closest location: ", closestDrone)
    console.log("The drone has been sent!")

    //
    //
    // Initialize progress
    const origin = new window.google.maps.LatLng(closestDrone.location.lat, closestDrone.location.lng)
    setprogress([ origin ])

    //
    // Re-center the map
    map.setCenter(closestDrone.location)

    // Close the info window so map is not cluttered
    infoWindow.close()
    
    //
    // Animate drone movement
    const path = [origin]

    //
    // Draw Polyline between origin and destination
    const flightPath = new window.google.maps.Polyline({
        path: path,
        geodesic: false,
        strokeColor: "#00338e",
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
    flightPath.setMap(map);

    //
    // add marker at end of path

    let droneMarker;
    for( var i=0; i < drones.length; i++) {
        if(origin.equals(drones[i].marker.getPosition())) {
            droneMarker = drones[i].marker;
        }
    }

    // console.log("DNAME: ", )
    
    // d = s * t
    // t = d/s
    const time = shortestDistance / VELOCITY
    console.log("Time to finish: ", time)

    TIMES = 0
    setprogress((progressState) => {
        const ID = window.setInterval(animateDroneMovement, 500, map, origin, destination, INITIAL_DATE, VELOCITY, progressState, setprogress, shortestDistance, path, droneMarker, flightPath, closestDrone._id.$oid, drones, setDrones, csrfToken, setdroneOutputs)
        setTimeout(() => {  window.clearInterval(ID); }, (time + 0.85 ) * 1000);
        return progressState;
    })

    console.log("path in here: ", path) 
    
}


//
// Function to count number of properties in current viewport
//
export function countHouses(map, markers, setnumOfProperties) {


    var timer;
    function count() {

        clearTimeout(timer);

        timer = setTimeout(function() {
            
            let total = 0, high_risk = 0, low_risk = 0, unvisited = 0
            for( var i = markers.length, bounds = map.getBounds(); i--;) {
                if( ! bounds) continue;
                if(bounds.contains(markers[i].marker.getPosition())) {
                    if(markers[i].risk_level === "red") { high_risk += 1}
                    if(markers[i].risk_level === "blue") { low_risk += 1}
                    if(markers[i].risk_level === "black") { unvisited +=1 }
                    total += 1
                }
            }
    
            setnumOfProperties({total: total, high_risk: high_risk, low_risk: low_risk, unvisited: unvisited})

        }, 1000);

        return;  
    }


    var listener =  map.addListener("idle", count);

    console.log("COUNT HOUSES CALLED!")
    // return count()

    return () => map.removeListener(listener);

}


// export function countHouses(map, markers, setnumOfProperties) {

//     function count() {

//         let total = 0, high_risk = 0, low_risk = 0, unvisited = 0
//         for( var i = markers.length, bounds = map.getBounds(); i--;) {
//             if( ! bounds) continue;
//             if(bounds.contains(markers[i].marker.getPosition())) {
//                 if(markers[i].risk_level === "red") { high_risk += 1}
//                 if(markers[i].risk_level === "blue") { low_risk += 1}
//                 if(markers[i].risk_level === "black") { unvisited +=1 }
//                 total += 1
//             }
//         }
//         setnumOfProperties({total: total, high_risk: high_risk, low_risk: low_risk, unvisited: unvisited})
//         return;  
//     }

//     var listener =  map.addListener("idle", count);
//     console.log("COUNT HOUSES CALLED!")

//     return () => map.removeListener(listener);

// }