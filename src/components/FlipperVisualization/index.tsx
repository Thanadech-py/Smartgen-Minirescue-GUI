import React, { Component, ChangeEvent, RefObject } from 'react';
import { Image } from 'react-bootstrap';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import background_map from './resources/robot_bg.png';
import robot from '../FlipperVisualization/resources/Body.png';
import robot_lift1 from '../FlipperVisualization/resources/Flipper Front.png';
import robot_lift2 from '../FlipperVisualization/resources/Flipper Rear.png';

import 'bootstrap/dist/css/bootstrap.css';

interface MapProps {
   pitchDegree: number;
   flipperDegreeFront: number;
   flipperDegreeRear: number;
}

interface MapState {
    state: boolean;
}

class FlipperVisualization extends Component<MapProps, MapState> {
    private robotImageRef: RefObject<HTMLImageElement>;
    interval: NodeJS.Timeout | null = null;

    constructor(props: MapProps) {
        super(props);
        this.state = {
          state: false,
        };
        this.robotImageRef = React.createRef();
    }

    robotRenderComponents = () => {
        const robotImageStyleA: React.CSSProperties = {
            position: 'absolute',
            top: 'px',
            right: '10px',
            width: '280px',
            height: 'auto',
            justifyContent: 'center',
            backgroundColor: 'transparent', // Ensure transparency
        };

        const LiftImageStyleA: React.CSSProperties = {
            position: 'relative',
            top: '107px',
            left: '-15px',
            transformOrigin: '75% 50%',
            transform: `rotate(${this.props.flipperDegreeFront}deg) translate(0%,0%)`,
            width: '100px',
            height: 'auto',
            justifyContent: 'center',
            backgroundColor: 'transparent', // Ensure transparency
        };

        const LiftImageStyleB: React.CSSProperties = {
            position: 'relative',
            top: '55px',
            right: '-85px',
            transformOrigin: '75% 50%',
            transform: `rotate(${this.props.flipperDegreeRear}deg) translate(0%,0%)`,
            width: '100px',
            height: 'auto',
            justifyContent: 'center',
            backgroundColor: 'transparent', // Ensure transparency
        };

        const painterConfig: React.CSSProperties = {
            position: 'relative',
            top: '-50%',
            left: '0%',
            backgroundColor: 'transparent', // Ensure transparency
        };

        const setImagePoint: React.CSSProperties = {
            position: 'relative',
            top: '50%',
            left: '25%',
            width: '50%',
            height: '1%',
            justifyContent: 'center',
            backgroundColor: 'transparent', // Ensure transparency
        };

        return (
            <div style={painterConfig}>
                <div style={setImagePoint}>
                    <Image
                        src={robot}
                        alt="Robot"
                        style={robotImageStyleA}
                        className="robot-image img-fluid"
                        ref={this.robotImageRef}
                    />
                    <Image
                        src={robot_lift1}
                        alt="Flipper Front"
                        style={LiftImageStyleA}
                        className="robot-image img-fluid"
                        ref={this.robotImageRef}
                    />
                    <Image
                        src={robot_lift2}
                        alt="Flipper Rear"
                        style={LiftImageStyleB}
                        className="robot-image img-fluid"
                        ref={this.robotImageRef}
                    />
                </div>
            </div>
        );
    };

    render() {
        let axis_x = -80;
        let axis_y = -70;
        let scale = 1.5;

        const setImageOrigin: React.CSSProperties = {
            transformOrigin: '50% 50%',
            transform: `rotate(${this.props.pitchDegree}deg) translate(0%,0%)`,
            backgroundColor: 'transparent', // Ensure transparency
        };

        return (
            <TransformWrapper
                initialScale={scale} minScale={scale} maxScale={scale}
                initialPositionX={axis_x}
                initialPositionY={axis_y}
                minPositionX={axis_x}
                maxPositionX={axis_x}
                minPositionY={axis_y}
                maxPositionY={axis_y}
            >
                <TransformComponent>
                    <div style={setImageOrigin}>
                        <Image src={background_map} fluid className="responsive-image" style={{ backgroundColor: 'transparent' }} />
                        {this.robotRenderComponents()}
                    </div>
                </TransformComponent>
            </TransformWrapper> 
        );
    }
}

export default FlipperVisualization;
