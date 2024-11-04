import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartLoading from "../Util/ChartLoading";

export default function CustomLineChart(props) {
  const [lchrt, setLchrt] = useState(true);
  const [achrt, setAchrt] = useState(false);
  const [bchrt, setBchrt] = useState(false);

  function withCommas(x) {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const CustomTooltip = ({ payload, label, active }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }}>{`${
              item.name
            }: ${withCommas(item.value)}`}</p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {props.data && props.data.length ? (
        <div className="mychart">
          <ResponsiveContainer width="100%" aspect={3}>
            <ComposedChart
              data={props.data}
              margin={{
                top: 5,
                right: 30,
                left: 60,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={withCommas} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {achrt && (
                <Area
                  type="monotone"
                  dataKey="PreviousBalance"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              )}

              {bchrt && <Bar dataKey="InvoiceAmount" fill="#1a626b"></Bar>}
              {lchrt && (
                <Line
                  type="monotone"
                  dataKey="CurrentBalance"
                  stroke="red"
                  strokeWidth={1}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartLoading />
      )}

      <div className="options">
        <div className="option">
          <input
            type="checkbox"
            onChange={(e) => {
              setBchrt(e.target.checked);
            }}
            checked={bchrt}
            name=""
            id=""
          />
          <label htmlFor="">Invoiced Amount</label>
        </div>
        <div className="option">
          <input
            onChange={(e) => {
              setLchrt(e.target.checked);
            }}
            type="checkbox"
            checked={lchrt}
            name=""
            id=""
          />
          <label htmlFor="">Current Balance</label>
        </div>
        <div className="option">
          <input
            onChange={(e) => {
              setAchrt(e.target.checked);
            }}
            type="checkbox"
            checked={achrt}
            name=""
            id=""
          />
          <label htmlFor="">Previous Balance</label>
        </div>
      </div>
    </>
  );
}
