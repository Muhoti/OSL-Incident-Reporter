import "../../Styles/incidencesdata.scss";
import { useEffect, useState } from "react";
import Header from "../Util/Header";
import Navigation from "../Util/Navigation";
import DataStats from "../Data/DataStats";
import AllData from "../Data/AllData";

const Item = (props) => {
  const onClick = () => {
    props.setActive(props.txt);
  };
  return (
    <>
      {props.txt === props.active ? (
        <h4
          onClick={() => {
            onClick();
          }}
          className="active"
        >
          {props.txt}
        </h4>
      ) : (
        <h4
          onClick={() => {
            onClick();
          }}
          className="item"
        >
          {props.txt}
        </h4>
      )}
    </>
  );
};

const Filter = (props) => {
  const onClick = () => {
    props.setFilter(props.txt);
  };

  return (
    <>
      {props.txt === props.active ? (
        <h5
          onClick={() => {
            onClick();
          }}
          className="active"
        >
          {props.txt}
        </h5>
      ) : (
        <h5
          onClick={() => {
            onClick();
          }}
          className="item"
        >
          {props.txt}
        </h5>
      )}
    </>
  );
};

export default function IncidencesData(props) {
  const [filter, setFilter] = useState("All Incidents");
  const [time, setTime] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    leaks: 0,
    bursts: 0,
    supply: 0,
    illegal: 0,
  });

  return (
    <div className="bdy-wrapper">
      <div className="bdy-container">
        <div className="bdy">
          <div className="incidencesdata">
            <DataStats
              total={stats.total}
              leaks={stats.leaks}
              bursts={stats.bursts}
              supply={stats.supply}
              illegal={stats.illegal}
              time={time}
            />
            <div className="bot">
              <div className="left">
                <Filter
                  active={filter}
                  setFilter={setFilter}
                  txt="All Incidents"
                />
                <Filter active={filter} setFilter={setFilter} txt="Received" />
                <Filter
                  active={filter}
                  setFilter={setFilter}
                  txt="In Progress"
                />
                <Filter active={filter} setFilter={setFilter} txt="Resolved" />
                <Filter
                  active={filter}
                  setFilter={setFilter}
                  txt="Not Resolved"
                />
              </div>
              <div className="main">
                <AllData
                  setStats={setStats}
                  setTime={setTime}
                  filter={filter}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
