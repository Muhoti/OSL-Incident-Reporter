import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Desktop as DesktopIcon } from "@phosphor-icons/react";
import { DeviceTablet as DeviceTabletIcon } from "@phosphor-icons/react";
import { Phone as PhoneIcon } from "@phosphor-icons/react";
import { Chart } from "../Chart"; // Update the import path as needed
import { Box } from "@mui/material";

const iconMapping = {
  Desktop: DesktopIcon,
  Tablet: DeviceTabletIcon,
  Phone: PhoneIcon,
};

export default function Pie({ title, data }) {
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
      setValues(newValues);
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
      <CardHeader title={title} />
      <CardContent>
        <Stack spacing={2}>
          <Chart
            height={300}
            options={chartOptions}
            series={values}
            type="donut"
            width="100%"
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {labels.map((item, index) => {
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <Typography
                    sx={{ textTransform: "capitalize", fontSize: "small" }}
                    variant="body1"
                  >
                    {item.toString().toLowerCase()}:{" "}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body1"
                    sx={{ fontWeight: "bold", fontSize: "small" }}
                  >
                    {((values[index] / total) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function createChartOptions(labels, theme) {
  return {
    chart: { background: "transparent" },
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
    ],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: {
      active: { filter: { type: "none" } },
      hover: { filter: { type: "none" } },
    },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}
