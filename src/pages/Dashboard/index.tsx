import React, { Component } from 'react';

import ROSLIB from 'roslib';

import logo from './image/logo.png';
import wifi from './image/wifi.png';
import joy from './image/joy.png';

import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import configs from '../../configs';
import { initROSMasterURI } from '../../components/ROS/Connector/ROSConnector';
import ImageViewer from '../../components/ROS/ImageViewer';
import GamepadComponent from '../../components/GamepadAPI';

import testImg from '../../components/ROS/ImageViewer/resources/connection_lost.jpg'

import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import FlipperVisualization from '../../components/FlipperVisualization';


// /usb_cam/image_raw/compressed

interface IProps { }

interface IState {
  ros: ROSLIB.Ros;
  robotConnection: boolean
  joyConnection: boolean
  cameraA: string
  attachState: boolean
  detection: boolean
  startButton: boolean
  readRobotFlipperAngleFront: number
  readRobotFlipperAngleRear: number
  readRobotSpeedLeft: number
  readRobotSpeedRight: number
  readRobotSpeed : number
  readRobotPitchAngle : number
  previousUpdate : number;
}

class App extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)

    this.state = {
      ros: initROSMasterURI(configs.ROSMasterURL.url),
      robotConnection: false,
      cameraA: "",
      attachState: false,
      joyConnection: false,
      startButton: false,
      detection: false,
      readRobotFlipperAngleFront: 0,
      readRobotFlipperAngleRear: 0,
      readRobotSpeedRight: 0,
      readRobotSpeedLeft: 0,
      readRobotSpeed : 0,
      readRobotPitchAngle : 0,
      previousUpdate : 0,
    }
  }

  // subscribeCameraA(ros: ROSLIB.Ros, topicName: string) {
  //   const { cameraA } = this.state;

  //   const imageTopic = new ROSLIB.Topic({
  //     ros: ros,
  //     name: topicName, // adjust the topic name based on your setup
  //     messageType: 'sensor_msgs/CompressedImage',
  //   });

  //   imageTopic.subscribe((message: ROSLIB.Message) => {
  //     const compressedImageMessage = message as ROSLIB.Message & { format: string; data: string };
  //     const format = compressedImageMessage.format;
  //     const imageData = compressedImageMessage.data;

  //     const imageUrl = `data:image/${format};base64,${imageData}`;


  //     this.setState({ cameraA: imageUrl });
  //   });
  // }

  subscribeRobot(ros: ROSLIB.Ros, topicName: string) {
    const { cameraA } = this.state;

    const robotReadTopic = new ROSLIB.Topic({
      ros: ros,
      name: topicName, // adjust the topic name based on your setup
      messageType: 'std_msgs/Float32MultiArray',
    });

    robotReadTopic.subscribe((message: ROSLIB.Message) => {
      const data = message as ROSLIB.Message &
      {
        layout: {
          dim: [],
          data_offset: 0,
        },
        data: [0,0,0,0],
      };

      let flipperAngleFront = Math.floor(data.data[2] * (360/140)  % 360) > 180 ?  Math.floor(data.data[2] * (360/140)  % 360) - 360 : Math.floor(data.data[2] * (360/140)  % 360)
      let flipperAngleRear = Math.floor(data.data[3] * (360/140)  % 360) > 180 ?  Math.floor(data.data[3] * (360/140)  % 360) - 360 : Math.floor(data.data[3] * (360/140)  % 360)

      this.setState({readRobotSpeedLeft : Math.floor(data.data[0] / 35.255) , readRobotSpeedRight : Math.floor(data.data[1] / 35.255)} )
      this.setState({readRobotPitchAngle : data.data[3]})

      if(flipperAngleFront - this.state.previousUpdate > 10){
        console.log("updated")
        this.setState({readRobotFlipperAngleFront : flipperAngleFront})
      }
      if(flipperAngleRear - this.state.previousUpdate > 10){
        console.log("updated")
        this.setState({readRobotFlipperAngleRear : flipperAngleRear})
      }


      this.setState({previousUpdate : flipperAngleFront})
      // const format = compressedImageMessage.format;
      // const imageData = compressedImageMessage.data;

      // const imageUrl = `data:image/${format};base64,${imageData}`;


      // this.setState({ cameraA: imageUrl });
    });
  }

  componentDidMount = () => {
    const { ros } = this.state
    console.log("did")
    ros.on('connection', () => {
      console.log("ROS : Connected to ROS Master : ", configs.ROSMasterURL.url);
      this.subscribeRobot(ros , '/motor_array')
      this.setState({ robotConnection: true })
    })

    ros.on('close', () => {
      this.setState({ robotConnection: false })
    })
    ros.on('error', () => {
      console.log("ROS : Can't connect to ros master : ", configs.ROSMasterURL.url);
      this.setState({ robotConnection: false })
    })
  }

  componentWillUnmount = () => {
    const { ros } = this.state
    // ros.close();
    // this.setState({attachState : true})
    // console.log("umount")
  }

  alignmentStyle: React.CSSProperties = {
    // transform: `rotate(${flipImageDeg ? flipImageDeg : 180}deg)`,
    paddingLeft: 0,
    paddingRight: 0,
    position: 'relative',
    display: 'flex',
    // transition: 'transform 0.5s ease', // Add a smooth transition for a better visual effect
  };

  render() {

    return (

      <body className='body'>
        <GamepadComponent ros={this.state.ros} joypadTopicName={'/gui/output/robot_control'} onJoyStickConnection={(connection) => {
          this.setState({ joyConnection: connection });
        }} joyEnable={this.state.startButton} />
        <div className="top">
          <div className="left">
            <div className="logo">
              <img src={logo} alt="" />
            </div>
          </div>
          <div className="right">
            <div className="robotflag">
              <img src={wifi} />
              <img src={joy} />
              <h3>Robot Status: {this.state.robotConnection ? "Connected" : "Disconnected"}</h3>
              <h3>Joy Status: {this.state.joyConnection ? "Connected" : "Disconnected"}</h3>
            </div>
              
          </div>

        </div>
        <div className="center">
          <div className='camerabox'>
            <div className="camerabox12">
            <div className="camera1">
              <ImageViewer ros={this.state.ros} ImageCompressedTopic={'/usb_cam/image_raw/compressed'} height={'100%'} width={'95%'} rotate={180} hidden={false}></ImageViewer>
            </div>
            <div className="camera2">
              <ImageViewer ros={this.state.ros} ImageCompressedTopic={'/usb_cam/image_raw'} height={'100%'} width={'95%'} rotate={180} hidden={false}></ImageViewer>
            </div>
          </div>
          <div className="cameraboxcv3">
            <div className="camera3"> 
              <ImageViewer ros={this.state.ros} ImageCompressedTopic={'/usb_cam/image_raw/compressed'} height={'100%'} width={'95%'} rotate={180} hidden={false}></ImageViewer>
            </div>
            <div className="boxcv">
              <div className="cv">
                  <ImageViewer ros={this.state.ros} ImageCompressedTopic={'/detect_marker/image_raw/compressed'} height={'100%'} width={'95%'} rotate={180} hidden={!this.state.detection} ></ImageViewer>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <div className="bottom-flag">
            <div className="bleft">
              <div className="boxflipper">
                <div className="flipperState">
                  <FlipperVisualization flipperDegreeFront={this.state.readRobotFlipperAngleFront} pitchDegree={this.state.readRobotPitchAngle} flipperDegreeRear={this.state.readRobotFlipperAngleRear}></FlipperVisualization>
                </div>
              </div>
            </div>
            <div className="bcenter">

            </div>
            <div className="bright"> 
              <div className="statusLabel">
                <h2>Flipper Front: {this.state.readRobotFlipperAngleFront}°, Flipper Rear: {this.state.readRobotFlipperAngleRear}°</h2>
                <h2>Pitch: {this.state.readRobotPitchAngle}°</h2>
                <h2>Robot Speed: {this.state.readRobotSpeed} Km/h</h2>
                <h2>SpeedL: {this.state.readRobotSpeedLeft} rpm , SpeedR: {this.state.readRobotSpeedRight} rpm</h2>
              </div>
              
              <div className="statusbox">
                <div className="startbox">
                {
                  !this.state.startButton ? <Button variant="primary" onClick={() => {
                    this.setState({ startButton: !this.state.startButton })
                  }}>
                    {!this.state.startButton ? "Start" : "Stop"}
                  </Button> : <Button variant="danger" onClick={() => {
                    this.setState({ startButton: !this.state.startButton })
                  }}>
                    {!this.state.startButton ? "Start" : "Stop"}
                  </Button> 
                }
                <Button variant="primary" onClick={() => {this.setState({ detection: !this.state.detection })}}>{this.state.detection ? "Detection Off" : "Detection On"}</Button>
                </div>
              </div> 
            </div>
          </div>
        </div>
        
      </body>
    );
  }
}

export default App;