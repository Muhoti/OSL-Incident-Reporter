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

export default function MapPieChart(props) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const [clicked, setClicked] = useState(null);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "red",
            padding: "10px",
            borderRadius: "3px",
            border: "1px solid #60606040",
            boxShadow: "1px 1px 5px #60606050",
          }}
          className="custom-tooltip"
        >
          <p
            style={{ fontSize: "small", border: "none" }}
          >{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
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

  const demoOnClick = (e) => {
    if (e.name) {
      props.filterDetails(props.column, e.name);
      setClicked(e.name);
    } else if (e.payload) {
      props.filterDetails(props.column, e.payload.name);
      setClicked(e.payload.name);
    }
  };

  function getColor(v) {
    let color;
    switch (v) {
      case "Received":
        return (color = "red");
      case "Resolved":
        return (color = "green");
      case "Not Resolved":
        return (color = "blue");
      case "In Progress":
        return (color = "orange");
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
              innerRadius="0%"
              outerRadius="80%"
              fill="#8884d8"
              labelLine={false}
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
                      : getColor(props?.data[index]?.name)
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
            height={70}
            formatter={(value, entry, index) => (
              <span className="chart-text">{value}</span>
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
