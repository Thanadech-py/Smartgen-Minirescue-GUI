import ROSLIB from "roslib"
export const initROSMasterURI = (url : string)=>{
    const ros = new ROSLIB.Ros(({url}));
    console.log(url)
    return ros
}


export default {initROSMasterURI}