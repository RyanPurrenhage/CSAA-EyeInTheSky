import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom';
import '../CSS/CustomerProfile.css'


function CustomerProfileView(props) {

   const customer = props.location.state.currentCustomer;

   const [imageSrc, setimageSrc] = useState('')

   function validateResponse(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
   }

   useEffect( () => {

    async function getImage(path, csrfToken) {

        fetch('http://localhost:5000/get-image', {
            
            // Adding method type 
            method: "POST", 
            
            // Adding body or contents to send 
            body: JSON.stringify({ 
                path: path,
            }), 
            
            // Adding headers to the request 
            headers: { 
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                "Content-type": "application/json; charset=UTF-8",
                "X-CSRFToken": csrfToken,
            },
    
            credentials: 'include',
        })
        .then(validateResponse)
        .then(response => response.blob())
        .then(blob => {
            setimageSrc(URL.createObjectURL(blob))
        })
    
    
    }

    getImage(customer.photoURL, props.csrfToken)


    }, [customer.photoURL, props.csrfToken])


    return (
        <div className="customer-page">
            <div className="head-area">
                <Link to="/Customers">
                    <button className="customerss-btn" type="submit">Back to Customers</button>
                </Link>
                <h1>Customer Profile</h1>
            </div>

            <div className="body-area">
                <div className="profile-area">
                
                    <div className="information">
                        <h1> {customer.name} </h1>
                        <p>Address: {customer.address}</p>
                        <p>Email: {customer.email}</p>
                        <p>Phone: {customer.phone}</p>
                        <div className="customer-scores">
                            <p style={{ color: 'red', fontWeight: 'bold' }}>Fire Score: {customer.firescore}</p>
                            <p>Last accessed: {customer.last_accessed}</p>
                        </div>
                    </div>
                    <div className="fig">
                        <img src={imageSrc} alt="customer house"/> 
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerProfileView;