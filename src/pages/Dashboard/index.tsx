import React, { Component } from 'react';
import ROSLIB from 'roslib';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

import logo from './image/logo.png';
import wifi from './image/wifi.png';
import joy from './image/joy.png';

import configs from '../../configs';
import { initROSMasterURI } from '../../components/ROS/Connector/ROSConnector';
import ImageViewer from '../../components/ROS/ImageViewer';
import GamepadComponent from '../../components/GamepadAPI';

interface IProps { }

interface IState {
  ros: ROSLIB.Ros;
  robotConnection: boolean;
  joyConnection: boolean;
  cameraA: string;
  attachState: boolean;
  detection: boolean;
  startButton: boolean;
  showGazebo: boolean;
  readRobotFlipperAngleFront: number;
  readRobotFlipperAngleRear: number;
  readRobotSpeedLeft: number;
  readRobotSpeedRight: number;
  readRobotSpeed: number;
  readRobotPitchAngle: number;
  previousUpdate: number;
}

class App extends Component<IProps, IState> {
  private gazeboViewer: React.RefObject<HTMLIFrameElement>;

  constructor(props: IProps) {
    super(props);

    this.gazeboViewer = React.createRef();

    this.state = {
      ros: initROSMasterURI(configs.ROSMasterURL.url),
      robotConnection: false,
      cameraA: "",
      attachState: false,
      joyConnection: false,
      startButton: false,
      detection: false,
      showGazebo: false, // Default to not showing Gazebo
      readRobotFlipperAngleFront: 0,
      readRobotFlipperAngleRear: 0,
      readRobotSpeedRight: 0,
      readRobotSpeedLeft: 0,
      readRobotSpeed: 0,
      readRobotPitchAngle: 0,
      previousUpdate: 0,
    };
  }

  subscribeRobot(ros: ROSLIB.Ros, topicName: string) {
    const robotReadTopic = new ROSLIB.Topic({
      ros: ros,
      name: topicName,
      messageType: 'std_msgs/Float32MultiArray',
    });

    robotReadTopic.subscribe((message: ROSLIB.Message) => {
      const data = message as ROSLIB.Message & {
        layout: {
          dim: [],
          data_offset: 0,
        },
        data: [0, 0, 0, 0],
      };

      let flipperAngleFront = Math.floor(data.data[2] * (360/140) % 360);
      flipperAngleFront = flipperAngleFront > 180 ? flipperAngleFront - 360 : flipperAngleFront;
      
      let flipperAngleRear = Math.floor(data.data[3] * (360/140) % 360);
      flipperAngleRear = flipperAngleRear > 180 ? flipperAngleRear - 360 : flipperAngleRear;

      const leftSpeed = Math.floor(data.data[0] / 35.255);
      const rightSpeed = Math.floor(data.data[1] / 35.255);
      const avgSpeed = Math.floor((leftSpeed + rightSpeed) / 2);

      this.setState({
        readRobotSpeedLeft: leftSpeed,
        readRobotSpeedRight: rightSpeed,
        readRobotSpeed: avgSpeed,
        readRobotPitchAngle: data.data[3]
      });

      if (Math.abs(flipperAngleFront - this.state.previousUpdate) > 10) {
        this.setState({ readRobotFlipperAngleFront: flipperAngleFront });
      }
      
      if (Math.abs(flipperAngleRear - this.state.previousUpdate) > 10) {
        this.setState({ readRobotFlipperAngleRear: flipperAngleRear });
      }

      this.setState({ previousUpdate: flipperAngleFront });
    });
  }

  componentDidMount = () => {
    const { ros } = this.state;
    
    ros.on('connection', () => {
      console.log("ROS : Connected to ROS Master : ", configs.ROSMasterURL.url);
      this.subscribeRobot(ros, '/motor_array');
      this.setState({ robotConnection: true });
    });

    ros.on('close', () => {
      this.setState({ robotConnection: false });
    });
    
    ros.on('error', () => {
      console.log("ROS : Can't connect to ros master : ", configs.ROSMasterURL.url);
      this.setState({ robotConnection: false });
    });
  }

  toggleGazebo = () => {
    this.setState(prevState => ({ showGazebo: !prevState.showGazebo }));
  }

  render() {
    const { 
      robotConnection, 
      joyConnection, 
      startButton, 
      detection,
      showGazebo,
      readRobotFlipperAngleFront,
      readRobotFlipperAngleRear,
      readRobotPitchAngle,
      readRobotSpeed,
      readRobotSpeedLeft,
      readRobotSpeedRight
    } = this.state;

    return (
      <div className="app-container">
        <GamepadComponent 
          ros={this.state.ros} 
          joypadTopicName={'/gui/output/robot_control'} 
          onJoyStickConnection={(connection) => {
            this.setState({ joyConnection: connection });
          }} 
          joyEnable={startButton} 
        />
        
        <header className="app-header">
          <div className="header-logo">
            <img src={logo} alt="Logo" />
          </div>
          <div className="header-status">
            <div className="status-indicators">
              <div className="status-icon">
                <img src={wifi} alt="Wifi Status" />
                <span className={robotConnection ? "connected" : "disconnected"}>
                  {robotConnection ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="status-icon">
                <img src={joy} alt="Joystick Status" />
                <span className={joyConnection ? "connected" : "disconnected"}>
                  {joyConnection ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="app-content">
            <div className="camera-container">
              <div className="primary-cameras">
                <div className="camera-view">
                  <h3 className="camera-title">Front Camera</h3>
                  <ImageViewer 
                    ros={this.state.ros} 
                    ImageCompressedTopic={'/usb_cam/image_raw/compressed'} 
                    height={'100%'} 
                    width={'100%'} 
                    rotate={360} 
                    hidden={false}
                  />
                </div>
                <div className="camera-view">
                  <h3 className="camera-title">Rear Camera</h3>
                  <ImageViewer 
                    ros={this.state.ros} 
                    ImageCompressedTopic={'/usb_cam/image_raw/compressed'} 
                    height={'100%'} 
                    width={'100%'} 
                    rotate={360} 
                    hidden={false}
                  />
                </div>
              </div>
              
              <div className="secondary-cameras">
                <div className="camera-view">
                  <h3 className="camera-title">QR Detection</h3>
                  <ImageViewer 
                    ros={this.state.ros} 
                    ImageCompressedTopic={'/usb_cam/image_raw/compressed'} 
                    height={'100%'} 
                    width={'100%'} 
                    rotate={360} 
                    hidden={detection}
                  />
                </div>
                <div className="camera-view">
                  <h3 className="camera-title">Hazmat Detection</h3>
                  <ImageViewer 
                    ros={this.state.ros} 
                    ImageCompressedTopic={'/usb_cam/image_raw/compressed'} 
                    height={'100%'} 
                    width={'100%'} 
                    rotate={360} 
                    hidden={detection}
                  />
                </div>
                <div className="camera-view">
                  <h3 className="camera-title">Color Test</h3>
                  <ImageViewer 
                    ros={this.state.ros} 
                    ImageCompressedTopic={'/usb_cam/image_raw/compressed'} 
                    height={'100%'} 
                    width={'100%'} 
                    rotate={360} 
                    hidden={detection}
                  />
                </div>
                <div className="camera-view">
                  <h3 className="camera-title">Motion Detection</h3>
                  <ImageViewer 
                    ros={this.state.ros} 
                    ImageCompressedTopic={'/usb_cam/image_raw/compressed'} 
                    height={'100%'} 
                    width={'100%'} 
                    rotate={360} 
                    hidden={detection}
                  />
                </div>
              </div>
            </div>
        </main>
        
        <footer className="app-footer">
          <div className="footer-content">
            <div className="robot-control-section">
              
              
              <div className="robot-status-wrapper">
                <div className="robot-visualization">
                  <h4>Robot Visualization</h4>
                  <div className="visualization-container">
                    {/* Gazebo simulation iframe instead of FlipperVisualization component */}
                    <iframe 
                      src={`http://${window.location.hostname}:8080/vnc.html?autoconnect=true`} 
                      title="Gazebo Robot Visualization"
                      className="gazebo-mini-viewer"
                    />
                  </div>
                </div>
                
                <div className="robot-status">
                  <h4>Robot Status</h4>
                  <div className="status-panels">
                    <div className="status-panel flipper-status">
                      <h5>Flipper</h5>
                      <div className="status-item">
                        <span>Front:</span> {readRobotFlipperAngleFront}°
                      </div>
                      <div className="status-item">
                        <span>Rear:</span> {readRobotFlipperAngleRear}°
                      </div>
                    </div>
                    
                    <div className="status-panel orientation-status">
                      <h5>Orientation</h5>
                      <div className="status-item">
                        <span>Pitch:</span> {readRobotPitchAngle}°
                      </div>
                    </div>
                    
                  <div className="status-panel speed-status">
                      <h5>Speed</h5>
                      <div className="status-item">
                        <span>Average:</span> {readRobotSpeed} Km/h
                      </div>
                      <div className="status-item">
                        <span>Left:</span> {readRobotSpeedLeft} rpm
                      </div>
                      <div className="status-item">
                        <span>Right:</span> {readRobotSpeedRight} rpm
                      </div>
                  </div>
                  <div className="control-buttons">
                    <Button variant={startButton ? "danger" : "primary"} onClick={() => this.setState({ startButton: !startButton })} className="action-button">
                        {startButton ? "Stop" : "Start"}
                    </Button>
                    <Button variant={detection ? "danger" : "primary"} onClick={() => this.setState({ detection: !detection })} className="action-button">
                      {detection ? "Detection Off" : "Detection On"}
                    </Button>
                  </div>  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;