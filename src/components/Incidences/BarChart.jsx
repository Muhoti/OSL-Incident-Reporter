import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MapBarChart(props) {
  const [clicked, setClicked] = useState(null);
  const [aspect, setAspect] = useState(2.1);

  useEffect(() => {
    let d = (window.innerWidth / window.innerHeight).toFixed(1);
    setAspect(d);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#29B6F6",
            padding: "10px",
            borderRadius: "3px",
            border: "1px solid #60606040",
            boxShadow: "1px 1px #60606050",
          }}
          className="custom-tooltip"
        >
          <p
            style={{ fontSize: "small", border: "none" }}
            className="label"
          >{`${label} : ${withCommas(payload[0]?.value)}`}</p>
        </div>
      );
    }

    return null;
  };

  function withCommas(x) {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const CLabel = (props) => {
    if (props.width > 16) {
      return (
        <text
          x={props.x}
          y={props.y}
          dy={10}
          dx={props.width / 2}
          fontSize={8}
          textAnchor="middle"
          style={{
            fill: "#29B6F6",
          }}
        >
          {withCommas(props?.value)}
        </text>
      );
    } else return null;
  };

  const demoOnClick = (e) => {
    if (e.name) {
      props.filterLocation(e.name);
      setClicked(e.name);
    } else if (e.payload) {
      props.filterLocation(e.payload.name);
      setClicked(e.payload.name);
    }
  };

  return (
    <div className="chrt">
      <ResponsiveContainer height={"100%"} aspect={aspect}>
        <BarChart
          data={props?.data}
          cx="0%"
          style={{
            fontSize: "9px",
            letterSpacing: "1.5px",
            fontWeight: "100",
          }}
          margin={{
            top: 10,
            right: 30,
            left: -25,
            bottom: -15,
          }}
        >
          <YAxis
            style={{ fill: "#29B6F6" }}
            tick={{ fill: "#29B6F6" }}
            tickLine={{ stroke: "#29B6F6" }}
            dataKey="value"
          />
          <XAxis
            style={{ fill: "#29B6F6" }}
            tick={{ fill: "#29B6F6" }}
            tickLine={{ stroke: "#29B6F6" }}
            dataKey="name"
          />
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={<CustomTooltip />}
          />
          <Bar
            dataKey="value"
            label={<CLabel />}
            fill="#27BAD0"
            onClick={(data) => {
              // demoOnClick(data);
            }}
          >
            {props?.data?.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  props?.data[index]?.name === clicked ? "#ff9900" : "#27BAD0"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {clicked !== null && (
        <i
          onClick={() => {
            props.reset();
            setClicked(null);
          }}
          className="fa fa-refresh"
        >
          &#xf021;
        </i>
      )}
    </div>
  );
}
