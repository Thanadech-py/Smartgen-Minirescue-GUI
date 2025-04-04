import React, { Component, RefObject } from 'react';
import { Image } from 'react-bootstrap';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import background_map from './resources/robot_background_x.png';
import robot from '../FlipperVisualization/resources/Body.png';
import robot_lift_front from '../FlipperVisualization/resources/Flipper Front.png';
import robot_lift_rear from '../FlipperVisualization/resources/Flipper Rear.png';

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

    constructor(props: MapProps) {
        super(props);
        this.state = {
            state: false,
        };
        this.robotImageRef = React.createRef();
    }

    robotRenderComponents = () => {
        const robotImageStyle: React.CSSProperties = {
            position: 'absolute',
            top: '60%',
            left: '47%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: 'auto',
            zIndex: 2,
        };

        const flipperStyleA: React.CSSProperties = {
            position: 'absolute',
            top: '72%',
            left: '31.5%',
            transform: `translate(-50%, -50%) rotate(${this.props.flipperDegreeFront}deg)`,
            transformOrigin: 'center',
            width: '200px',
            height: 'auto',
            zIndex: 3,
        };

        const flipperStyleB: React.CSSProperties = {
            position: 'absolute',
            top: '75%',
            left: '68.25%',
            transform: `translate(-50%, -50%) rotate(${this.props.flipperDegreeRear}deg)`,
            transformOrigin: 'center',
            width: '200px',
            height: 'auto',
            zIndex: 3,
        };

        const containerStyle: React.CSSProperties = {
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        };

        return (
            <div style={containerStyle}>
                <Image
                    src={robot}
                    alt="Robot"
                    style={robotImageStyle}
                    className="robot-image img-fluid"
                    ref={this.robotImageRef}
                />
                <Image
                    src={robot_lift_front}
                    alt="Flipper"
                    style={flipperStyleA}
                    className="robot-image img-fluid"
                />
                <Image
                    src={robot_lift_rear}
                    alt="Flipper"
                    style={flipperStyleB}
                    className="robot-image img-fluid"
                />
            </div>
        );
    };

    render() {
        const containerStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            position: 'relative',
        };

        const backgroundStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        };

        const rotationContainerStyle: React.CSSProperties = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${this.props.pitchDegree}deg)`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%',
        };

        return (
            <div style={containerStyle}>
                <Image 
                    src={background_map} 
                    fluid 
                    style={backgroundStyle}
                />
                <div style={rotationContainerStyle}>
                    {this.robotRenderComponents()}
                </div>
            </div>
        );
    }
}

export default FlipperVisualization;