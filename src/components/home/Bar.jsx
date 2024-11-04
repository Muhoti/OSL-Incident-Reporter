import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { alpha, useTheme } from "@mui/material/styles";
import { ArrowClockwise as ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Chart } from "../Chart"; // Update the import path as needed

export default function Bar({ data, title }) {
  const theme = useTheme();
  const [labels, setLabels] = React.useState([]);
  const [values, setValues] = React.useState([]);
  const [total, setTotal] = React.useState(1);
  const [chartOptions, setChartOptions] = React.useState({});

  React.useEffect(() => {
    if (data) {
      const newLabels = data.map((item) => item.name || "Unknown");
      const newValues = data.map((item) => item.value);
 

      let d = 0;
      newValues.map((item) => {
        d += item;
      });
      setTotal(d);
      setLabels(newLabels);
      setValues([
        {
          name: "",
          data: newValues,
        },
      ]);

      setChartOptions(createChartOptions(newLabels, theme));
    }
  }, [data, theme]);

  return (
    <Card
      style={{
        borderRadius: "16px",
        boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
      }}
    >
      <CardHeader
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={
              <ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />
            }
          >
            Sync
          </Button>
        }
        title={title}
      />
      <CardContent>
        <Chart
          height={350}
          options={chartOptions}
          series={values}
          type="bar"
          width="100%"
        />
      </CardContent>
    </Card>
  );
}

function createChartOptions(labels, theme) {
  return {
    chart: {
      background: "transparent",
      stacked: false,
      toolbar: { show: false },
    },
    colors: [
      theme.palette.primary.main,
      alpha(theme.palette.primary.main, 0.25),
    ],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: "solid" },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: { bar: { columnWidth: "90%" } },
    stroke: { colors: ["transparent"], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: labels,
      labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value > 0 ? `${value}` : `${value}`),
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
    },
  };
}
