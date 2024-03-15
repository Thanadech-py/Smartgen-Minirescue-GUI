import React, { Component } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container, Button, Col, Row, Card, CardBody } from 'react-bootstrap';
// import Dashboard from ',,/page';

// import './css/dashboard.css'
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from './pages/Dashboard';

// import './App.css'

// import PingComponent from './pages/PingPong';

interface IProps {
  navigation?: Navigator
}

interface IState {

}

class MainControl extends Component<IProps, IState>{
  constructor(props: IProps) {
    super(props)

    this.state = {

    }
  }

  componentDidMount = async () => {
    // let ros = initROSMasterURI(configs.ROSMasterURL.url)

    // console.log(this.state.ros)
  }

  render() {
    return (
      <div>
          <Routes>
            <Route path='/' element={<Dashboard/>}/>
            {/* <Route path='/pingpong' element={<PingComponent/>}/> */}
          
            <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
          </Routes>
      </div>
    );
  }
}
export default MainControl;