import React, { PureComponent } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function CustomRadarChart(props) {


  return (
    <ResponsiveContainer width="100%" height="70%">
      <RadarChart
        cx="50%"
        cy="50%"
       
        outerRadius="80%"
        style={{ fontSize: "9px", letterSpacing: "1.5px", fontWeight: "100" }}
        data={props?.data}
      >
        <PolarGrid
          style={{ stroke: "gray" }}
          tick={{ fill: "gray" }}
          tickLine={{ stroke: "gray" }}
        />
        <PolarAngleAxis
          style={{ stroke: "#02897a" }}
          tick={{ fill: "#02897a" }}
          tickLine={{ stroke: "#02897a" }}
          dataKey="name"
        />
        <PolarRadiusAxis
          style={{ stroke: "gray" }}
          tick={{ fill: "gray" }}
          tickLine={{ stroke: "gray" }}
          angle={30}
          domain={[0, props.total]}
        />
        <Radar
          name="Value Chains"
          dataKey="value"
          stroke="#02897a"
          fill="#02897a"
          fillOpacity={0.6}
          style={{ fontSize: "12px" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
