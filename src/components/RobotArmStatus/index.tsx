import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import './index.css';

interface ArmStatusProps {
    joint1Angle: number;
    joint2Angle: number;
    joint3Angle: number;
    gripperStatus: string;
}

const RobotArmStatus: React.FC<ArmStatusProps> = ({
    joint1Angle,
    joint2Angle,
    joint3Angle,
    gripperStatus,
}) => {
    return (
        <Card className="arm-status-panel">
            <Card.Header className="arm-status-header">
                <h4>Robot Arm Status</h4>
            </Card.Header>
            <Card.Body className="arm-status-body">
                <div className="joint-status">
                    <div className="joint-item">
                        <span>Joint 1</span>
                        <Badge bg="primary">{joint1Angle}°</Badge>
                    </div>
                    <div className="joint-item">
                        <span>Joint 2</span>
                        <Badge bg="primary">{joint2Angle}°</Badge>
                    </div>
                    <div className="joint-item">
                        <span>Joint 3</span>
                        <Badge bg="primary">{joint3Angle}°</Badge>
                    </div>
                </div>
                <div className="gripper-status">
                    <div className="gripper-item">
                        <span>Gripper</span>
                        <Badge bg={gripperStatus === 'open' ? 'success' : 'danger'}>
                            {gripperStatus}
                        </Badge>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default RobotArmStatus; 