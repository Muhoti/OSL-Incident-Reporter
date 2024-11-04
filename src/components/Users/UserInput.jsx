import React from "react";

export default class UserInput extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.getValue = this.getValue.bind(this);
  }

  getValue() {
    return this.input.current.value;
  }

  render() {
    return (
      <div className="usrinput">
        <h4>{this.props.label}</h4>
        <input
          role="presentation"
          className="input"
          ref={this.input}
          type={this.props.type}
          placeholder={this.props.placeholder}
          required
          autoComplete="off"
        />
      </div>
    );
  }
}
