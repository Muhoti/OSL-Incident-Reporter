import { useLayoutEffect, useRef, useState } from "react";
import MapPieChart from "../Charts/MapPieChart";
import Barchart from "../Util/bar";

export default function Chart(props) {
  const [aspect, setAspect] = useState(2.1);
  const refPie1 = useRef(null);

  useLayoutEffect(() => {
    let d = (
      (refPie1.current.offsetWidth * 1.2) /
      refPie1.current.offsetHeight
    ).toFixed(1);
    setAspect(d);
  }, []);

  return (
    <div ref={refPie1} className="r_chart">
      <div className="title">{props.title}</div>
      <div className="r_content">
        {props.title === "Incident Status" ? (
          <MapPieChart
            data={props.data}
            colors={props.colors}
            aspect={aspect}
            legend={props.legend}
          />
        ) : (
          <Barchart data={props.data} aspect={aspect} legend={props.legend} />
        )}
      </div>
    </div>
  );
}
