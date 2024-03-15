import React, { createContext, useContext } from 'react';
import ROSLIB from 'roslib';

interface ROSContextType {
  ros: ROSLIB.Ros | null;
  isConnected: boolean;
  autoconnect: boolean;
  url: string;
  topics: any[];
  services: any[];
  listeners: ROSLIB.Topic[];
  setROS: React.Dispatch<React.SetStateAction<ROSContextType>>;
}

export const ROSContext = createContext<ROSContextType>({
  ros: null,
  isConnected: false,
  autoconnect: false,
  url: '',
  topics: [],
  services: [],
  listeners: [],
  setROS: () => {},
});

interface ROSProviderProps {
  children: React.ReactNode;
  masterUrl: string;
}

export const ROSProvider: React.FC<ROSProviderProps> = ({ children, masterUrl }) => {
  const [ros, setROS] = React.useState<ROSContextType>({
    ros: null,
    isConnected: false,
    autoconnect: false,
    url: 'ws://0.0.0.0:9090',
    topics: [],
    services: [],
    listeners: [],
    setROS: () => {},
  });

  React.useEffect(() => {
    const newRos = new ROSLIB.Ros({
      url: masterUrl,
    });

    setROS((prevROS) => ({ ...prevROS, ros: newRos }));

    return () => {
      newRos.close();
    };
  }, [masterUrl]);

  return <ROSContext.Provider value={{ ...ros, setROS }}>{children}</ROSContext.Provider>;
};

export const useROS = (): ROSContextType => {
  const context = useContext(ROSContext);

  if (!context) {
    throw new Error('useROS must be used within a ROSProvider');
  }

  return context;
};

// The ROS component code remains the same
