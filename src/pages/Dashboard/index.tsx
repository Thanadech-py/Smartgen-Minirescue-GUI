import React, { Component } from 'react';
import ROSLIB from 'roslib';
import { Button, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

import logo from './image/logo.png';
import wifi from './image/wifi.png';
import joy from './image/joy.png';

import configs from '../../configs';
import { initROSMasterURI } from '../../components/ROS/Connector/ROSConnector';
import ImageViewer from '../../components/ROS/ImageViewer';
import GamepadComponent from '../../components/GamepadAPI';
import FlipperVisualization from '/home/thxncdzch/Smartgen-MiniRescue-GUI/src/components/FlipperVisualization';
import RobotArmStatus from '../../components/RobotArmStatus';

interface IProps { }

interface IState {
  ros: ROSLIB.Ros;
  robotConnection: boolean;
  joyConnection: boolean;
  cameraA: string;
  attachState: boolean;
  readRobotFlipperAngleFront: number;
  readRobotFlipperAngleRear: number;
  readRobotSpeedLeft: number;
  readRobotSpeedRight: number;
  readRobotSpeed: number;
  readRobotPitchAngle: number;
  previousUpdate: number;
  // Arm status states
  joint1Angle: number;
  joint2Angle: number;
  joint3Angle: number;
  gripperStatus: string;
  ping: number;
  pingStatus: 'low' | 'medium' | 'high';
}

class App extends Component<IProps, IState> {
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      ros: initROSMasterURI(configs.ROSMasterURL.url),
      robotConnection: false,
      cameraA: "",
      attachState: false,
      joyConnection: false,
      readRobotFlipperAngleFront: 0,
      readRobotFlipperAngleRear: 0,
      readRobotSpeedRight: 0,
      readRobotSpeedLeft: 0,
      readRobotSpeed: 0,
      readRobotPitchAngle: 0,
      previousUpdate: 0,
      // Initialize arm status
      joint1Angle: 0,
      joint2Angle: 0,
      joint3Angle: 0,
      gripperStatus: 'closed',
      ping: 0,
      pingStatus: 'low',
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

    this.startPing();
  }

  componentWillUnmount() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  startPing = () => {
    // Ping every 2 seconds
    this.pingInterval = setInterval(() => {
      const startTime = Date.now();
      fetch('/api/ping')  // Replace with your actual API endpoint
        .then(() => {
          const pingTime = Date.now() - startTime;
          let pingStatus: 'low' | 'medium' | 'high' = 'low';
          
          if (pingTime > 200) {
            pingStatus = 'high';
          } else if (pingTime > 100) {
            pingStatus = 'medium';
          }
          
          this.setState({
            ping: pingTime,
            pingStatus
          });
        })
        .catch(() => {
          this.setState({
            ping: -1,
            pingStatus: 'high'
          });
        });
    }, 2000);
  };

  render() {
    const { 
      robotConnection, 
      joyConnection,
      readRobotFlipperAngleFront,
      readRobotFlipperAngleRear,
      readRobotPitchAngle,
      readRobotSpeed,
      readRobotSpeedLeft,
      readRobotSpeedRight,
      // Arm status props
      joint1Angle,
      joint2Angle,
      joint3Angle,
      gripperStatus,
      ping,
      pingStatus,
    } = this.state;

    return (
      <div className="app-container">
        <GamepadComponent 
          ros={this.state.ros} 
          joypadTopicName={'/gui/output/robot_control'} 
          onJoyStickConnection={(connection) => {
            this.setState({ joyConnection: connection });
          }}
          joyEnable={true}
        />
        
        <header className="app-header">
          <div className="header-logo">
            <img src={logo} alt="Logo" />
          </div>
          <div className="header-status">
            <div className="status-indicators">
              <div className="status-icon">
                <img src={wifi} alt="Wifi Status" />
                <div className="connection-status">
                  <span className={`connection-text ${robotConnection ? "connected" : "disconnected"}`}>
                    {robotConnection ? "Connected" : "Disconnected"}
                  </span>
                  <div className="ping-info">
                    <div className={`ping-dot ${robotConnection ? pingStatus : 'disconnected'}`} />
                    {robotConnection && <span>{ping === -1 ? 'N/A' : `${ping}ms`}</span>}
                  </div>
                </div>
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
          <Container fluid>
            <Row>
              <Col md={8}>
                <div className="camera-container">
                  <div className="primary-cameras">
                    <div className="camera-view">
                      <h3 className="camera-title">Front Camera</h3>
                      <ImageViewer 
                        ros={this.state.ros} 
                        ImageCompressedTopic={'/front_cam/image_raw/compressed'} 
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
                        ImageCompressedTopic={'/rear_cam/image_raw/compressed'} 
                        height={'100%'} 
                        width={'100%'} 
                        rotate={180} 
                        hidden={false}
                      />
                    </div>
                  </div>
                  
                  <div className="secondary-cameras">
                    <div className="camera-view">
                      <h3 className="camera-title">QR Detection</h3>
                      <ImageViewer 
                        ros={this.state.ros} 
                        ImageCompressedTopic={'/qr_detected_image/compressed'} 
                        height={'100%'} 
                        width={'100%'} 
                        rotate={360} 
                        hidden={false}
                      />
                    </div>
                    <div className="camera-view">
                      <h3 className="camera-title">Hazmat Detection</h3>
                      <ImageViewer 
                        ros={this.state.ros} 
                        ImageCompressedTopic={'/hazmat/detections'} 
                        height={'100%'} 
                        width={'100%'} 
                        rotate={360} 
                        hidden={false}
                      />
                    </div>
                    <div className="camera-view">
                      <h3 className="camera-title">Color Test</h3>
                      <ImageViewer 
                        ros={this.state.ros} 
                        ImageCompressedTopic={'/detection_result/compressed'} 
                        height={'100%'} 
                        width={'100%'} 
                        rotate={360} 
                        hidden={false}
                      />
                    </div>
                    <div className="camera-view">
                      <h3 className="camera-title">Motion Detection</h3>
                      <ImageViewer 
                        ros={this.state.ros} 
                        ImageCompressedTopic={'/detected_point/image/compressed'} 
                        height={'100%'} 
                        width={'100%'} 
                        rotate={360} 
                        hidden={false}
                      />
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <div className="flipper-visualization-panel">
                  <h4>Robot Visualization</h4>
                  <div className="visualization-container">
                    <FlipperVisualization 
                      pitchDegree={readRobotPitchAngle}
                      flipperDegreeFront={readRobotFlipperAngleFront}
                      flipperDegreeRear={readRobotFlipperAngleRear}
                    />
                  </div>
                </div>

                <div className="robot-metrics-panel">
                  <h4>Robot Metrics</h4>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-label">Speed</span>
                      <span className="metric-value">{readRobotSpeed} m/s</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Left Speed</span>
                      <span className="metric-value">{readRobotSpeedLeft} m/s</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Right Speed</span>
                      <span className="metric-value">{readRobotSpeedRight} m/s</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Pitch Angle</span>
                      <span className="metric-value">{readRobotPitchAngle}°</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Front Flipper</span>
                      <span className="metric-value">{readRobotFlipperAngleFront}°</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Rear Flipper</span>
                      <span className="metric-value">{readRobotFlipperAngleRear}°</span>
                    </div>
                  </div>
                </div>

                <div className="robot-arm-status-section">
                  <RobotArmStatus
                    joint1Angle={joint1Angle}
                    joint2Angle={joint2Angle}
                    joint3Angle={joint3Angle}
                    gripperStatus={gripperStatus}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </main> 
            
      </div>
    );
  }
}

export default App;