import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'

import DisplayCustomer from './DisplayCustomer'
import '../CSS/customerDatabase.css'
import '../CSS/CustomerSearch.css'
import React from 'react'


function Database(props) {

    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState("")
    useEffect(() => {

        async function GetCustomers() {
            const res = await fetch('http://localhost:5000/get-customers');
            let data = await res.json();
            setCustomers(data);
        }
        GetCustomers();
    }, [])



    return (
        <div className="customer-db">

            <div className="head-area">
                <Link to="/home">
                    <button className="home-btn" type="submit">Home</button>
                </Link>
                <h1>Customers</h1>
                <div className="search-cus">
                    <div className="search-container-cus">
                        <input className="search-input-cus" 
                                type="text" 
                                placeholder="Search Customers"
                                onChange={(event) => {setSearch(event.target.value)}} />
                        <i className="fa"><FaSearch /></i>
                    </div> 
                </div>
            </div>

            <div className="body-area">

                <div className="information-header">
                        <div>
                            <h1>Name</h1>
                        </div>
                        <div>
                            <h1>Email</h1>
                        </div>
                        <div>
                            <h1>Address</h1>
                        </div>
                        <div>
                            <h1>FireScore</h1>
                        </div>
                </div>

                <div className="customer-entries">

                    {
                        customers.filter((customer) => {
                            if (search === "") {
                                return customer
                            }

                            else if (customer.name.toLowerCase().includes(search.toLowerCase()) || 
                                customer.email.toLowerCase().includes(search.toLowerCase()) || 
                                customer.address.toLowerCase().includes(search.toLowerCase())) 
                            {
                                return customer
                            }
                            return customer
                        }).map(customer => {
                            return <Link key={Math.random().toString(36)} to={{pathname: "/customer-profile", state: {currentCustomer: customer}}}>
                            <div className="customer-entry">
                                <DisplayCustomer name={customer.name} email={customer.email} firescore={customer.firescore} address={customer.address} />
                            </div>
                            </Link>
                        })
                    }

                </div>

            </div>

        </div>


    );
}

export default Database;







// <div className="customer-top">
// <h1>Filters</h1>
// <div className="customer-info">
//     <h2>Customers</h2>
//     <h3>Name   Email  FireScore  Confidence</h3>
//     <div class="customer-buttons">
//         <Link to="/customer-profile">
//             <p><button onClick="">JobDoe jon.doe.gmail.com 0.00543 91%</button></p>
//             <p><button onClick="">TohDoe joh.doe.gmail.com 0.00643 87%</button></p>
//             <p><button onClick="">PoaLoe poa.loe.gmail.com 0.00986 85%</button></p>
//             <p><button onClick="">JobDoe job.doe.gmail.com 0.00254 96%</button></p>
//             <p><button onClick="">JobDoe job.doe.gmail.com 0.00254 96%</button></p>
//         </Link>
//     </div>
// </div>
// </div>
