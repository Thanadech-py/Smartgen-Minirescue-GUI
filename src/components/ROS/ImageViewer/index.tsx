import React, { Component } from 'react';
import * as ROSLIB from 'roslib';

import './css/image.css'
import ConnectionLostIMG from './resources/connection_lost.jpg'

interface IProps {
  ros : ROSLIB.Ros
  ImageCompressedTopic : string
  // ImageData?: string
  width : string
  height : string
  rotate : number
  hidden: boolean
  onImageRecevied?: (imageData: string) => void; // Callback function
}

interface IState {
  imageUrl: string;
  imageData : string;
  imageTopic :  ROSLIB.Topic<ROSLIB.Message>
}

class ImageViewer extends Component<IProps, IState> {
  ros: ROSLIB.Ros | null = null;

  constructor(props: IProps) {
    super(props);
    this.state = {
      imageUrl: '',
      imageData : '',
      imageTopic : new ROSLIB.Topic({
        ros: this.props.ros,
        name: this.props.ImageCompressedTopic, // adjust the topic name based on your setup
        messageType: 'sensor_msgs/CompressedImage',
      })
    };
  }

  subscribeCamera() {
    const {imageData , imageTopic} = this.state;

    imageTopic.subscribe((message: ROSLIB.Message) => {
      const compressedImageMessage = message as ROSLIB.Message & { format: string; data: string };
      const format = compressedImageMessage.format;
      const imageData = compressedImageMessage.data;

      const imageUrl = `data:image/${format};base64,${imageData}`;

      this.setState({ imageData : imageUrl});
      if (this.props.onImageRecevied) {
        this.props.onImageRecevied(imageUrl);
      }

    });
  }


  componentDidMount = () => {
    this.subscribeCamera()
  }

  render() {
    const imageStyle: React.CSSProperties = {
      transform: `rotate(${this.props.rotate}deg)`,
      // transition: 'transform 0.5s ease', // Add a smooth transition for a better visual effect
    };

    if(this.state.imageData.length > 0 && this.props.hidden == false){
      return (
          <img className='Image' style={imageStyle} id="ros-image" src={this.state.imageData} height={this.props.height} width={this.props.width}/>
      );

    }
    else{
      return (
        // <div id="image-container">
          <img className='Image' id="ros-image"  src={ConnectionLostIMG} height={this.props.height} width={this.props.width}/>
        // </div>
      );
    }
    
  }
}

export default ImageViewer;
