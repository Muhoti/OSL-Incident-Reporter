import { useRef } from "react";
import { useState } from "react";
import { useLayoutEffect } from "react";

export default function NetworksPopup(props) {
  const ref = useRef(null);
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(250);

  useLayoutEffect(() => {
    setWidth(ref.current.offsetWidth / 2);
    setHeight(ref.current.offsetHeight + 6);
  }, []);

  // Function to render single data
  const renderSingleData = (single) => {
    if (!single) return null;

    return (
      <div className="single">
        <h3>Details</h3>
        {Object.entries(single).map(([key, value], index) => (
          <div className="item" key={index}>
            <div className="entry">
              <p style={{ fontWeight: "bold" }}>
                {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}:
              </p>
              <p>{typeof value === "object" ? JSON.stringify(value) : value}</p>
            </div>
          </div>
        ))}
        <h6>Explore more in the data section</h6>
      </div>
    );
  };

  // Function to render many data
  const renderManyData = (many) => {

    if (!many || !many.data) return null;

    return (
      <div className="many">
        <h3>Details</h3>
        {many.data.map((item, index) => (
          <div className="item" key={index}>
            {Object.entries(item).map(([key, value], i) => (
              <div className="entry" key={i}>
                {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}:
                <p>
                  {typeof value === "object" ? JSON.stringify(value) : value}
                </p>
              </div>
            ))}
          </div>
        ))}
        <h4>Total in group: {many.count}</h4>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      style={{ top: props.top - height, left: props.left - width }}
      className="popup"
    >
      <div className="wrapper">
        {props.single
          ? renderSingleData(props.single)
          : renderManyData(props.many)}
        <i className="fa fa-caret-down"></i>
      </div>
    </div>
  );
}
