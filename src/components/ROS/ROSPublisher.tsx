import React, { useEffect } from 'react';
import ROSLIB from 'roslib';
import { useROS } from './ROSController';

interface ROSContextType {
  ros: ROSLIB.Ros | null;
  isConnected: boolean;
  // Other properties...
}

// ROSContext and ROSProvider components...

const ConnectToRosMasterExample: React.FC = () => {
  const { setROS } = useROS();

  useEffect(() => {
    const masterUrl = 'ws://0.0.0.0:9090/'; // Replace with your ROS master URL
    const ros = new ROSLIB.Ros({ url: masterUrl });

    ros.on('connection', () => {
      console.log('Connected to ROS master');
      setROS((prevROS) => ({ ...prevROS, ros, isConnected: true }));
    });

    ros.on('error', (error) => {
      console.error('Error connecting to ROS master:', error);
      setROS((prevROS) => ({ ...prevROS, ros: null, isConnected: false }));
    });

    ros.on('close', () => {
      console.log('Disconnected from ROS master');
      setROS((prevROS) => ({ ...prevROS, ros: null, isConnected: false }));
    });

    return () => {
      ros.close();
    };
  }, [setROS]);

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};

export default ConnectToRosMasterExample;
