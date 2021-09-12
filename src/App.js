import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";

import React, { useState, useEffect } from 'react';

import Login from './Views/Login'
import Home from './Views/Home'
import CustomerProfileView from "./Views/CustomerProfileView"
import Customers from './Views/Customers'

import Header from './Components/Header'
import Footer from './Components/Footer'

import {CurrentStreamProvider} from './Context/CurrentStreamContext'

import './App.css'


function App() {

  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [csrfToken, setcsrfToken] = useState('')

  const PrivateRoute = ({component: Component, authenticated, ...rest}) => {
    return(
      <Route
        {...rest}
      >
        {
            (props) => authenticated === true
            ? <Component csrfToken={csrfToken} {...props} />
            : <Redirect to={{ pathname: '/login', state: {from: props.location}}} />
        }
      </Route>
    )
  }

  const PublicRoute = ({component: Component, authenticated, path, redirectpath}) => {

    return (
      <Route
        {...path}
      >
        {(props) => authenticated === false
          ? <Component csrfToken={csrfToken} setAuthenticated={setAuthenticated} {...props} />
          : <Redirect to={redirectpath} />
        }
      </Route>
    ) 
  }

  const csrf = () => {
    fetch("http://localhost:5000/api/getcsrf", {
      credentials: "include",
    })
    .then((res) => {
      setcsrfToken(res.headers.get(["X-CSRFToken"]));
      // console.log(csrfToken);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  useEffect(() => {

    async function fetchData() {
      const res = await fetch('http://localhost:5000/is-logged-in', { credentials: 'include' });
      let data = await res.json();
      console.log("In App -- logged in? : ", data.status)

      if(data.status) {
        setAuthenticated(true)
        setLoading(false)
      }
      else {
        setAuthenticated(false)
        setLoading(false)
        csrf();
      }
    }
    fetchData();

  }, [authenticated]);

  if (loading === true) {
    return(
      <h2>Loading...</h2>
    )
  }

  return (

    <CurrentStreamProvider>

    <div className="App">
    <Router>

    <Header />

      <Switch>
        <PublicRoute path='/login' redirectpath='/home' authenticated={authenticated} csrfToken={csrfToken} setAuthenticated={setAuthenticated} component={Login} />
        <PrivateRoute path='/home' authenticated={authenticated} component={Home} />
        <PrivateRoute path='/customers' authenticated={authenticated} component={Customers} />
        <PrivateRoute path='/customer-profile' authenticated={authenticated} csrfToken={csrfToken} component={CustomerProfileView} />
      </Switch>
     
    <Footer />
    
    </Router>

    </div>

    </CurrentStreamProvider>
  );
}

export default App;
