import '../CSS/login.css'
import { useState, useContext } from 'react'

import {CurrentStreamContext} from '../Context/CurrentStreamContext'

function Login({csrfToken, setAuthenticated}) {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [error, seterror] = useState('')

    const csrftoken = useContext(CurrentStreamContext).token
    const settoken = csrftoken[1]

    async function handleLoginSubmit(e) {
        e.preventDefault()

        console.log("Form submitted")

        const res = await fetch('http://localhost:5000/login-user', {
        
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
                email: email,
                password: password,
            }), 

        })

        const data = await res.json()
        if( data.is_logged_in) {
            console.log("User successfully logged in!")
            setAuthenticated(true)
            settoken(csrfToken)
        }
        else{
            seterror(data.error)
            setAuthenticated(false) 
            settoken('')
        }

        console.log("Is logged in: ", data)
    }

    return(
        <div className="login-container">
            <h1 className="title"> Eye In The Sky </h1>
                <div className="login">
                    <form onSubmit={handleLoginSubmit}>
                        <p className="desc">Stream<span className="dot">.</span>Process<span className="dot">.</span>Predict</p>
                        <p>
                        <input className="login-input" type="text" placeholder="Email Address" name="email" required value={email} onChange={(e) => setemail(e.target.value)} />
                        </p>
                        <p>
                        <input className="login-input" type="password" placeholder="Password" name="password" required value={password} onChange={(e) => setpassword(e.target.value)} />
                        </p> 
                        <p style={{color: 'red', fontStyle: 'italic', fontSize: '0.8rem'}}> {error} </p>
                        <button className="login-btn" type="submit">Login</button> 
                    </form>
                </div>
         </div>
    );
}


export default Login