import { none } from "ol/centerconstraint";
import React, {
  PureComponent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function CustomPieChart(props) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const [clicked, setClicked] = useState(null);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
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
          >{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  const demoOnClick = (e) => {
    if (e.name) {
      props.filterDetails(props.column, e.name);
      setClicked(e.name);
    } else if (e.payload) {
      props.filterDetails(props.column, e.payload.name);
      setClicked(e.payload.name);
    }
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  function getColor(v) {
    let color = "gray";
    switch (v) {
      case "Received":
        return (color = "green");
      case "Resolved":
        return (color = "orange");
      case "Not Resolved":
        return (color = "red");
      case "In Progress":
        return (color = "purple");
      default:
        return (color = "gray");
    }
  }

  return (
    <div className="chrt">
      <ResponsiveContainer height={"100%"} aspect={props.aspect}>
        <PieChart style={{ margin: "auto" }}>
          {props.data && (
            <Pie
              dataKey="value"
              isAnimationActive={true}
              data={props.data}
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="80%"
              fill="#8884d8"
              labelLine={false}
              label={renderCustomizedLabel}
              onClick={(data) => {
                // demoOnClick(data);
              }}
            >
              {props?.data?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    props?.data[index]?.name === clicked
                      ? "#ff9900"
                      : props.colors[index]
                  }
                />
              ))}
            </Pie>
          )}
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={<CustomTooltip />}
          />
          <Legend
            height={30}
            formatter={(value, entry, index) => (
              <span
                style={{ color: props.color, fontSize: "medium" }}
                className="chart-text"
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p>{props.label}</p>
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
