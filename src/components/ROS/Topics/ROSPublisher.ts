import ROSLIB from "roslib";
import config from '../../../configs'

let topic : any

export const initalRos = (options: {
    url?: string | undefined;
    groovyCompatibility?: boolean | undefined;
    transportLibrary?: "websocket" | "workersocket" | "socket.io" | RTCPeerConnection | undefined;
    transportOptions?: RTCDataChannelInit | undefined;
}) =>{
    // let rosMasterURI = config.ROSMasterURL
    return new ROSLIB.Ros((options));
    // topic = new ROSLIB.Topic({
    //     ros,
    //     name : '/iwsCommands',
    //     messageType : 'std_msgs/UInt16MultiArray'
    // })
    // console.log(topic);
}

export const createTopic = (ros : ROSLIB.Ros , topic : string , messageType : string ) =>{
    return new ROSLIB.Topic({
        ros: ros,
        name: topic, // adjust the topic name based on your setup
        messageType: messageType,
      });  
}


export const sendCommand = (commandIndex : number , command : number) => {
    let Uint16 = new ROSLIB.Message({
        data : [commandIndex,command]
    })

    topic.publish(Uint16)
}