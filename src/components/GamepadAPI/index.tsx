import React, { Component } from "react";
import ROSLIB from "roslib";

interface GamepadComponentProps {
  ros: ROSLIB.Ros
  joypadTopicName: string
  joyEnable: boolean
  onAxesChange?: (axes: number[]) => void;
  onButtonsChange?: (buttons: GamepadButton[]) => void;
  onJoyStickConnection?: (connection: boolean) => void;
}

interface GamepadComponentState {
  gamepad: Gamepad | null | any;
  joypadRosTopic: ROSLIB.Topic<ROSLIB.Message>
  sensorJoyTopic: ROSLIB.Topic<ROSLIB.Message>
  robotSpeedLeft: number;
  robotSpeedRight: number;
  robotSpeedFlipper: number;
  boostMode : boolean;
  onetimeTicker : boolean;
}


class GamepadComponent extends Component<GamepadComponentProps, GamepadComponentState> {
  constructor(props: GamepadComponentProps) {
    super(props);
    this.state = {
      gamepad: null,
      joypadRosTopic: new ROSLIB.Topic({
        ros: this.props.ros,
        name: this.props.joypadTopicName, // Adjust the topic name based on your setup, e.g., '/your_joy_topic'
        messageType: 'std_msgs/Float32MultiArray', // Adjust the message type based on your setup
      }),
      sensorJoyTopic: new ROSLIB.Topic({
        ros: this.props.ros,
        name: '/gui/output/joy', // Adjust the topic name based on your setup, e.g., '/your_joy_topic'
        messageType: 'sensor_msgs/Joy', // Adjust the message type based on your setup
      }),
      robotSpeedLeft: 0,
      robotSpeedRight: 0,
      robotSpeedFlipper: 0,
      boostMode : false,
      onetimeTicker : false,
    };
  }



  componentDidMount() {
    console.log("gameapi" , this.props.ros)
    window.addEventListener("gamepadconnected", this.handleGamepadConnection);
    window.addEventListener("gamepaddisconnected", this.handleGamepadDisconnection);

    // Start the game loop to continuously update gamepad state
    this.gameLoop();
  }

  componentWillUnmount() {
    window.removeEventListener("gamepadconnected", this.handleGamepadConnection);
    window.removeEventListener("gamepaddisconnected", this.handleGamepadDisconnection);
  }

  handleGamepadConnection = (event: any) => {
    this.setState({ gamepad: event.gamepad });

    if (event.gamepad && event.gamepad.vibrationActuator) {
      event.gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: 1000,
        weakMagnitude: 1.0,
        strongMagnitude: 1.0
      });
    }

    if (this.props.onJoyStickConnection) {
      this.props.onJoyStickConnection(true);
    }

    console.log("Gamepad connected:", event.gamepad);
  };

  handleGamepadDisconnection = (event: GamepadEvent) => {
    this.setState({ gamepad: null });


    if (this.props.onJoyStickConnection) {
      this.props.onJoyStickConnection(false);
    }


    console.log("Gamepad disconnected:", event.gamepad);
  };

  publishFloat32MultiArray = (data: number[]) => {
    const float32MultiArrayMessage = new ROSLIB.Message({
      layout: {
        dim: [],
        data_offset: 0,
      },
      data: data,
    });
    

    this.state.joypadRosTopic.publish(float32MultiArrayMessage);
  };

  publishJoyMessage = (axes: number[] , buttons :  GamepadButton[]) => {
    const pressedButtons = buttons.map(button => (button.pressed ? 1 : 0));
    const joyMessage = new ROSLIB.Message({
      header: {
        stamp: { sec: 0, nsec: 0 },
        frame_id: '',
      },
      axes: axes, // Assuming robotSpeedRight, robotSpeedLeft, robotSpeedFlipper
      buttons: pressedButtons, // You can add button data if needed
    });
  
    this.state.sensorJoyTopic.publish(joyMessage)
  };

  updateGamepadState = () => {

    const { gamepad } = this.state;
    if (gamepad) {
      if (this.props.onAxesChange) {
        this.props.onAxesChange([...gamepad.axes]);
        console.log(gamepad.axes)
      }

      if (this.props.onButtonsChange) {
        this.props.onButtonsChange([...gamepad.buttons]);
      }

      if (gamepad.buttons[4].pressed == 0 && gamepad.buttons[6].pressed == 0) {
        this.setState({ robotSpeedLeft: 0 })
      }
      else if (gamepad.buttons[4].pressed == 1) {
        this.setState({ robotSpeedLeft: this.state.boostMode ? 147 : 294 })
      }
      else if (gamepad.buttons[6].pressed == 1) {
        this.setState({ robotSpeedLeft: -(this.state.boostMode ? 147 : 294) })
      }


      if (gamepad.buttons[5].pressed == 0 && gamepad.buttons[7].pressed == 0) {
        this.setState({ robotSpeedRight: 0 })
      }
      else if (gamepad.buttons[5].pressed == 1) {
        this.setState({ robotSpeedRight: (this.state.boostMode ? 147 : 294) })
      }
      else if (gamepad.buttons[7].pressed == 1) {
        this.setState({ robotSpeedRight: - (this.state.boostMode ? 147 : 294) })
      }

      if (gamepad.buttons[3].pressed == 0 && gamepad.buttons[0].pressed == 0) {
        this.setState({ robotSpeedFlipper: 0 })
      }
      else if (gamepad.buttons[3].pressed == 1) {
        this.setState({ robotSpeedFlipper: 16999 })
      }
      else if (gamepad.buttons[0].pressed == 1) {
        this.setState({ robotSpeedFlipper: -16999 })
      }

      if(gamepad.buttons[2].pressed){
          if(this.state.onetimeTicker == false){
            this.setState({boostMode : !this.state.boostMode})
            this.setState({onetimeTicker : true})
          }
      }
      else{
        this.setState({onetimeTicker : false})
      }
      
      //(360/140)



      // console.log("flipper : " , this.state.robotSpeedFlipper)

      // console.log("L :", this.state.robotSpeedLeft)
      // console.log("R : ", this.state.robotSpeedRight)

      // console.log("L1 : ", gamepad.buttons[4].pressed)
      // console.log("L2 : ", gamepad.buttons[6].pressed)

      // console.log("R1 : ", gamepad.buttons[5].pressed)
      // console.log("R2 : ", gamepad.buttons[7].pressed)

      // console.log("R1 : ", gamepad.buttons[5].pressed)
      // console.log("R2 : ", gamepad.buttons[7].pressed)


      // console.log("Triangle : ", gamepad.buttons[3].pressed)
      // console.log("Rectangle : ", gamepad.buttons[2].pressed)
      // console.log("X : ", gamepad.buttons[0].pressed)
      // console.log("() : ", gamepad.buttons[1].pressed)



      // publishFloat32MultiArray()

      // Publish the message to the ROS topic
      if (this.props.joyEnable) {
        let publishFloat = [this.state.robotSpeedRight, this.state.robotSpeedLeft, this.state.robotSpeedFlipper]
        this.publishJoyMessage(gamepad.axes , gamepad.buttons)
        this.publishFloat32MultiArray(publishFloat);
      }
      else{
        this.publishFloat32MultiArray([0,0,0]);
      }

    }
  };

  gameLoop = () => {

    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      this.setState({ gamepad: gamepads[0] });
      this.updateGamepadState();
    }

    requestAnimationFrame(this.gameLoop);
  };

  render() {
    const { gamepad } = this.state;

    return (
      <div>

      </div>
    );
  }
}

export default GamepadComponent;
