import React from 'react'
import '../CSS/displayCustomer.css'


function DisplayCustomer({ name, email, firescore, address }) {
    return (
        <div className="display-cus-container">
                    <div className="name">
                        {name}
                    </div>
                    <div className="email">
                        {email}
                    </div>
                    <div className="address">
                        {address}
                    </div>
                    <div className="firescore">
                        {firescore}
                    </div>
        </div>
    )
}

export default DisplayCustomer

