import Header from "../Util/Header";
import Maps from "../Map/IncidencesMap";
import { useEffect, useState, useRef } from "react";
import Barchart from "../Util/bar";
import Linechart from "../Util/lineChart";
import MapPieChart from "../incidences/MapPieChart";
import { useLayoutEffect } from "react";
import Analysis from "../../components/incidences/Analysis";
import Navigation from "../Util/Navigation";

export default function Home(props) {
  const [padding, setPadding] = useState([100, 700, 100, 100]);
  const [data, setData] = useState(null);
  const [total, setTotal] = useState();
  const [rTypes, setRTypes] = useState(null);
  const [rStatus, setRStatus] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [offset, setOffset] = useState(0);
  const [expand, setExpand] = useState(false);
  const [refresh, setRefresh] = useState(null);
  // const analysis = expand ? "r_analysis" : "analysis_hidden";
  const max = expand ? "expand_hidden" : "expand";
  const [drop, setDrop] = useState(false);
  const dropdown = drop ? "dropdown" : "noDropdown";
  const [eventId, setEventId] = useState(null);
  const [months, setMonths] = useState([
    { index: "01", name: "Jan", value: 0 },
    { index: "02", name: "FeB", value: 0 },
    { index: "03", name: "Mar", value: 0 },
    { index: "04", name: "Apr", value: 0 },
    { index: "05", name: "May", value: 0 },
    { index: "06", name: "Jun", value: 0 },
    { index: "07", name: "Jul", value: 0 },
    { index: "08", name: "Aug", value: 0 },
    { index: "09", name: "Sep", value: 0 },
    { index: "10", name: "Oct", value: 0 },
    { index: "11", name: "Nov", value: 0 },
    { index: "12", name: "Dec", value: 0 },
  ]);

  const colors = ["red", "orange", "blue", "purple", "black"];

  useEffect(() => {
    fetch(`/api/reports/type`, {
      method: "get",
    })
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        }
        return res.json();
      })
      .then((data) => {
        let types = data?.result;
        let iTypes = [];
        types?.sort((a, b) => parseInt(b.count) - parseInt(a.count));
        types.map((item, index) => {
          let obj = {};
          obj.Type = item.Type;
          obj.count = parseInt(item.count);
          iTypes.push(obj);
        });
        setRTypes(iTypes);
      })
      .catch((err) => {});
  }, []);

  useEffect(() => {
    fetch(`/api/reports/type/Sewer Burst/${offset}`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setData(data.join);
        setTotal(data.total[0][0].count);
      })
      .catch((err) => {});
  }, [refresh, offset]);

  useEffect(() => {
    fetch(`/api/reports/monthly`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        data.result.map((item) => {
          let m = months;
          m.forEach((i) => {
            if (item.datetime.split("-")[1] === i.index) {
              i.value = item.reports_count;
            }
          });
          setMonths(m);
        });
        // setData(data.result);
      })
      .catch((err) => {});
  }, [refresh]);

  useEffect(() => {
    fetch(`/api/reports/status`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        let statuses = data?.status[0];
        let iStatuses = [];
        statuses?.sort((a, b) => parseInt(b.count) - parseInt(a.count));
        statuses.map((item, index) => {
          let obj = {};
          obj.name = item.Status;
          obj.value = parseInt(item.count);
          iStatuses.push(obj);
        });
        setRStatus(iStatuses);
      })
      .catch((err) => {});
  }, []);

  function scrollPages(offset) {
    setOffset(offset);
  }

  return (
    <div className="bdy-wrapper">
      <Header active="Incidences" />
      <div className="bdy-container">
        <Navigation active="Sewer Burst" />
        <div className="incidences">
          <div className="map">
            {rTypes && (
              <Maps
                zoomextend="16"
                mapPadding={padding}
                colors={colors}
                rTypes={rTypes}
                setOffset={setOffset}
                type="Sewer Burst"
              />
            )}
          </div>
          <Analysis
            data={data}
            total={total}
            offset={offset}
            setRefresh={setRefresh}
            refresh={refresh}
            setOffset={setOffset}
            type="Sewer Burst"
          />
        </div>
      </div>
    </div>
  );
}

const Item = (props) => {
  const [v, setV] = useState(0);
  const [w, setW] = useState(0);

  useEffect(() => {
    const i = props.data
      .map((e) => {
        return e.Type;
      })
      .indexOf(props.txt);

    const max = Math.max(...props.data.map((o) => o.count));
    setV(max);
    if (i !== -1) {
      setV(props.data[i].count);
      setW((props.data[i].count / max) * 100);
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

const Chart = (props) => {
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
        {props.title === "Categories" ? (
          <div className="categories">
            {props.rTypes?.map((item, index) => {
              return (
                <Item
                  txt={item.Type}
                  color={props.colors[index]}
                  data={props.rTypes}
                />
              );
            })}
          </div>
        ) : props.title === "Monthly Reports" ? (
          <Barchart data={props.data} />
        ) : props.title === "Status PieChart" ? (
          <MapPieChart
            aspect={aspect}
            data={props.data}
            colors={props.colors}
          />
        ) : (
          <Linechart data={props.data} />
        )}
      </div>
    </div>
  );
};
