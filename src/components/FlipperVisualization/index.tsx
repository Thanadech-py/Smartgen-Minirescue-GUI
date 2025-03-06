import React, { Component, ChangeEvent, RefObject } from 'react';
import { Container, Image, Form, Button, Card } from 'react-bootstrap';

import Draggable from 'react-draggable';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import background_map from './resources/robot_background_x.png'
import robot from '../FlipperVisualization/resources/Body.png'


import robot_lift1 from '../FlipperVisualization/resources/Flipper Front.png'
import robot_lift2 from '../FlipperVisualization/resources/Flipper Rear.png'

import 'bootstrap/dist/css/bootstrap.css';
import configs from '../../configs';
import ROSLIB from 'roslib';

interface MapProps {
   pitchDegree : number
   flipperDegreeFront : number
   flipperDegreeRear : number
}

interface MapState {
    state : boolean
}

class FlipperVisualization extends Component<MapProps, MapState> {
    private robotImageRef: RefObject<HTMLImageElement>;
    interval: NodeJS.Timeout | null = null;

    constructor(props: MapProps) {
        super(props);
        this.state = {
          state : false,
        };
        this.robotImageRef = React.createRef();
    }

    componentDidMount = () => {
        // this.moveRobot()
        // console.log("reset")/
        // this.interval = setInterval(this.moveRobot)
    }

    robotRenderComponents = () => {


        const robotImageStyleA: React.CSSProperties = {
            position: 'absolute',
            top: `${40}px`, //robotImagePosition.y
            left: `${10}px`, //robotImagePosition.x
            width: '800px',
            height: 'auto',
            justifyContent: 'center',
            // border: '1px solid red',

        };

        const LiftImageStyleA: React.CSSProperties = {
            position: 'relative',
            top: `${74}px`,  //liftImagePosition.y
            left: `${10}px`, // liftImagePosition.x
            transformOrigin: '75% 50%',
            transform: `rotate(${this.props.flipperDegreeFront}deg) translate(0%,0%)`,
            width: '100px',
            height: 'auto',
            justifyContent: 'center',
            // border: '1px solid red',
            
        };

        const LiftImageStyleB: React.CSSProperties = {
            position: 'relative',
            top: `${21}px`,  //liftImagePosition.y
            right: `${-100}px`, // liftImagePosition.x
            transformOrigin: '75% 50%',
            transform: `rotate(${this.props.flipperDegreeRear}deg) translate(0%,0%)`,
            width: '100px',
            height: 'auto',
            justifyContent: 'center',
            // border: '1px solid red',
        };

        const painterConfig: React.CSSProperties = {
            position: 'relative',
            top: '-90%',
            left: '0%',
            // border: '1px solid red',
        };

        // console.log(RobotOdometry);

        const setImagePoint: React.CSSProperties = {
            position: 'absolute',
            left: '25%',  // Adjust these values to position the origin point
            width: '50%',
            height: '1%',
        };



        return <>


            <div style={painterConfig}>
                <div style={setImagePoint}>
                    <Image
                        src={robot}
                        alt="Robot"
                        style={robotImageStyleA}
                        className="robot-image img-fluid"
                        ref={this.robotImageRef}
                        onClick={() => {
                        }}
                    />
                    <Image
                        src={robot_lift1}
                        alt="Robot"
                        style={LiftImageStyleA}
                        className="robot-image img-fluid"
                        ref={this.robotImageRef}
                        onClick={() => {
                        }}
                    />
                    <Image
                        src={robot_lift2}
                        alt="Robot"
                        style={LiftImageStyleB}
                        className="robot-image img-fluid"
                        ref={this.robotImageRef}
                        onClick={() => {
                        }}
                    />  
                </div>
            </div>
        </>
    }



    render() {
     
        let axis_x = -80
        let axis_y = -70
        let scale = 1.5


        const setImageOrigin: React.CSSProperties = {
            transformOrigin: '50% 50%',
            transform: `rotate(${this.props.pitchDegree}deg) translate(0%,0%)`,
        };


        return (
            <TransformWrapper initialScale={scale} minScale={scale} maxScale={scale}
                initialPositionX={axis_x}
                initialPositionY={axis_y}

                minPositionX={axis_x}
                maxPositionX={axis_x}

                minPositionY={axis_y}
                maxPositionY={axis_y}
            >
                {({ zoomIn, zoomOut }) => (
                    <TransformComponent >
                        <div style={setImageOrigin}>
                            <Image src={background_map} fluid className="responsive-image"/>
                            {this.robotRenderComponents()}
                        </div>
                    </TransformComponent>
                )}
            </TransformWrapper>

        );
    }
}

export default FlipperVisualization;