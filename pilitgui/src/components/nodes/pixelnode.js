import React, { Component } from 'react';
import chroma from 'chroma-js';
import Select from 'react-select';

// FontAwesome
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const dot = (color = '#ccc') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

const colorStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white', fontSize: '8pt' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.value);
    return {
      ...styles,
      fontSize: '8pt',
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? data.value
        : isFocused
        ? chroma.contrast(color, 'white') > 2 ? color.alpha(0.1).css() : '#ccc'
        : null,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? chroma.contrast(color, 'white') > 2
          ? 'white'
          : 'black'
        : chroma.contrast(color, 'white') > 2
        ? data.value
        : 'black',
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled && (isSelected ? data.value : color.alpha(0.3).css()),
      },
    };
  },
  input: styles => ({ ...styles, ...dot() }),
  placeholder: styles => ({ ...styles, ...dot() }),
  singleValue: (styles, { data }) => ({ ...styles, ...dot(data.value) }),
};
const animationStyles = {
  control: styles => ({...styles, fontSize: '8pt' }),
  option: styles => ({...styles, fontSize: '8pt', padding: '4pt'})
}

const colors = [
      { label: "Black / Off", value: "black" },
      { label: "White", value: "white" },
      { label: "Snow", value: "snow" },
      { label: "Silver", value: "silver" },
      { label: "Gray", value: "gray" },
      { label: "Dark Gray", value: "darkgray" },
      { label: "Red", value: "red" },
      { label: "Crimson", value: "crimson" },
      { label: "Dark Magenta", value: "darkmagenta" },
      { label: "Dark Red", value: "darkred" },
      { label: "Magenta", value: "magenta" },
      { label: "Maroon", value: "maroon" },
      { label: "Orange", value: "orange" },
      { label: "Orange Red", value: "orangered" },
      { label: "Dark Orange", value: "darkorange" },
      { label: "Yellow", value: "yellow" },
      { label: "Gold", value: "gold" },
      { label: "Green", value: "green" },
      { label: "Lime", value: "lime" },
      { label: "Dark Green", value: "darkgreen" },
      { label: "Forest Green", value: "forestgreen" },
      { label: "Cyan", value: "cyan" },
      { label: "Dark Cyan", value: "darkcyan" },
      { label: "Blue", value: "blue" },
      { label: "Deep Sky Blue", value: "deepskyblue" },
      { label: "Royal Blue", value: "royalblue" },
      { label: "Sky Blue", value: "skyblue" },
      { label: "Dark Blue", value: "darkblue" },
      { label: "Navy", value: "navy" },
      { label: "Blue Violet", value: "blueviolet" },
      { label: "Purple", value: "purple" },
      { label: "Violet", value: "violet" },
      { label: "Indigo", value: "indigo" },
      { label: "Dark Violet", value: "darkviolet" }
    ];

const animations = [
      {
        label: "Solid color",
        value: "solid_color",
        description: "Turn all LEDs to a single color"
      },
      {
        label: "Center-outwards",
        value: "center_out",
        description: "LEDs light up, one-by-one, from the center towards the end till the whole strip is on"
      },
      {
        label: "Edges-inward",
        value: "edges_in",
        description: "LEDs light up, one-by-one, from two ends towards the center till the whole strip is on"
      },
      {
        label: "Slinky",
        value: "slinky",
        description: "LEDs light up, one-by-one, starting from end closest to the microcontroller towards the other end till the whole strip is on"
      },
      {
        label: "Slinky backwards",
        value: "slinky_backwards",
        description: "LEDs light up, one-by-one, starting from end furthest from the microcontroller towards the other end till the whole strip is on"
      },
      {
        label: "Bounce",
        value: "bounce",
        description: "3 LEDs light up, then move as a group to the other end with the rest of the LEDs all off. Once they reach the far end, they move back towards the beginning."
      }
    ];


class PixelNode extends Component {

    // [
    //     {
    //         "label": "Animation",
    //         "displayPosition": 0,
    //         "mqttMessagePosition": 1,
    //         "type": "select",
    //         "values": ,
    //         "default": "solid_color"
    //     },
    //     {
    //         "label": "Repeat",
    //         "displayPosition": 1,
    //         "mqttMessagePosition": 2,
    //         "type": "boolean",
    //         "default": true
    //     },
    //     {
    //         "label": "Color",
    //         "displayPosition": 2,
    //         "mqttMessagePosition": 0,
    //         "type": "select",
    //         "values": [
    //         ],
    //         "default": "black"
    //     },
    //     {
    //         "label": "Loop Delay",
    //         "displayPosition": 3,
    //         "mqttMessagePosition": 3,
    //         "type": "integer",
    //         "default": 10
    //     },
    //     {
    //         "label": "Hold Time",
    //         "displayPosition": 4,
    //         "mqttMessagePosition": 4,
    //         "type": "integer",
    //         "default": 50
    //     }
    // ]

    isRepeatable(isChecked) {
      console.log(isChecked);
    }
    setLoopDelay(newValue) {
      console.log(newValue);
    }

    render() {
      return (
        <div className = "node-wrapper">
          <div className = "node-inner-wrapper">
            <div>
              <Select 
                className='react-select-container'
                classNamePrefix="react-select"
                placeholder="Animation"
                options={animations}
                styles={animationStyles} />
              <Form.Check type="checkbox" label="Repeat?" className="node-checkbox" style={{marginLeft: '10px', marginTop: '10pt'}} inline="true" defaultChecked onChange={e => this.isRepeatable(e.target.checked)}/>
            </div>
            <div>
              <Select 
                className='react-select-container'
                classNamePrefix="react-select"
                placeholder="Color"
                options={colors}
                styles={colorStyles} />
          </div>
          <div className="node-titles">
            <Form.Group as={Form.Row} controlId="formPlaintextEmail">
              <Form.Label column sm="2">
                Email
              </Form.Label>
              <Form.Col sm="10">
                <Form.Control plaintext readOnly defaultValue="email@example.com" />
              </Form.Col>
            </Form.Group>


            <Form.Label className="form-control">Loop Delay</Form.Label>
            <Form.Control type="text" className="form-control" defaultValue="10" onChange={e => this.setLoopDelay(e.target.value)}/>
          </div>
         </div>
       </div>
      )
    }
}

export default PixelNode;
