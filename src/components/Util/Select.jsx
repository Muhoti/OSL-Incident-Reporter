import React from "react";

export default class Select extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.getValue = this.getValue.bind(this);
    this.state = {
      value: this.props.data[0],
    };
  }

  getValue() {
    return this.state.value;
  }

  render() {
    return (
      <div className="select">
        <label htmlFor="input">{this.props.label}</label>
        <select
          onChange={(e) => {
            this.setState({ value: e.target.value });
            if (this.props.setChanged) {
              this.props.setChanged(e.target.value);
            }
          }}
          ref={this.input}
          name="select"
          value={this.state.value}
        >
          {this.props.data &&
            this.props.data.map((item) => {
              return (
                <option key={item} value={item}>
                  {item}
                </option>
              );
            })}
        </select>
      </div>
    );
  }
}
