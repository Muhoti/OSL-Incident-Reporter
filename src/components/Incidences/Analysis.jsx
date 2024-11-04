import { useEffect, useState, useRef, useLayoutEffect } from "react";
import Chart from "./Chart";
import TopTable from "./TopTable";

export default function Analysis(props) {
  const [data, setData] = useState([]);
  const [chart, setChart] = useState([]);
  const [expand, setExpand] = useState(false);
  const colors = ["red", "orange", "blue", "purple", "black"];
  const [monthlyStats, setMonthlyStats] = useState(null);

  function getMonth(e) {
    let month = "";
    switch (e) {
      case "01":
        return (month = "January");
      case "02":
        return (month = "February");
      case "03":
        return (month = "March");
      case "04":
        return (month = "April");
      case "05":
        return (month = "May");
      case "06":
        return (month = "June");
      case "07":
        return (month = "July");
      case "08":
        return (month = "August");
      case "09":
        return (month = "September");
      case "10":
        return (month = "October");
      case "11":
        return (month = "November");
      case "12":
        return (month = "December");
      default:
        return (month = "");
    }
  }

  useEffect(() => {
    if (props.map) {
      const d = props?.map?.getAllLayers();
      const f = d[2]?.getSource()?.getFeatures();
      if (props?.map && f !== undefined) {
        if (f !== undefined) {
          let x = [];
          let stats = [];
          let monthlyStats = [];
          const sortedArrayDescending = f.slice().sort((a, b) => {
            const dateA = new Date(a.values_.Date);
            const dateB = new Date(b.values_.Date);
            return dateB - dateA; // Sort in descending order (dateB - dateA)
          });
          sortedArrayDescending.map((e) => {
            let obj = e.values_;
            x.push(obj);
          });

          if (JSON.stringify(x) !== JSON.stringify(data)) {
            const unique = [...new Set(f.map((obj) => obj.values_.Status))];
            const monthly = [
              ...new Set(f.map((obj) => obj.values_.Date.split("-")[1])),
            ];

            unique.map((e) => {
              stats.push({
                name: e,
                value: f.filter((c) => c.values_.Status === e).length,
              });
            });

            monthly.map((e) => {
              let m = getMonth(e);
              monthlyStats.push({
                name: m,
                value: f.filter((c) => c.values_.Date.split("-")[1] === e)
                  .length,
              });
            });

            setChart(stats);
            setMonthlyStats(monthlyStats);
            setData(x);
          }
        }
      }
    }
  }, [props?.map, props?.map?.getAllLayers()]);

  return (
    <div>
      <div
        className={expand ? "expand_hidden" : "expand"}
        onClick={() => {
          setExpand(true);
        }}
      >
        <i className="fa fa-expand"></i>
      </div>
      {expand && (
        <div className={"r_analysis"}>
          {data && (
            <TopTable
              data={data}
              setExpand={setExpand}
              setRefresh={props.setRefresh}
              refresh={props.refresh}
              map={props.map}
            />
          )}

          <div className="divs">
            <Chart
              title="Distribution by Month"
              data={monthlyStats}
              colors={colors}
              legend={true}
            />
            <Chart
              title="Incident Status"
              data={chart}
              colors={colors}
              legend={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const Item = (props) => {
  const [v, setV] = useState(0);
  const [w, setW] = useState(0);

  useEffect(() => {
    const i = props.data
      .map((e) => {
        return e.name;
      })
      .indexOf(props.txt);

    const max = Math.max(...props.data.map((o) => o.value));
    setV(max);
    if (i !== -1) {
      setV(props.data[i].value);
      setW((props.data[i].value / max) * 100);
    }
  }, []);
  return (
    <p style={{ width: w + "%", background: props.color }}>
      {props.txt}
      {": "}
      {v}
    </p>
  );
};

const RowGraph = (props) => {
  const [aspect, setAspect] = useState(2.1);
  const refPie1 = useRef(null);

  useLayoutEffect(() => {
    let d = (
      refPie1.current.offsetWidth / refPie1.current.offsetHeight
    ).toFixed(1);
    setAspect(d);
  }, []);

  const onClick = () => {
    props.setActive(props.txt);
  };

  useEffect(() => {}, []);

  return (
    <div ref={refPie1} className="r_chart">
      <div className="title">{props.title}</div>
      <div className="r_content">
        <div className="categories">
          {props.data?.map((item, index) => {
            return (
              <Item
                txt={item.name}
                color={props.colors[index]}
                data={props.data}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
