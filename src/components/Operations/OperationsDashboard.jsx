import React, { useState, useEffect } from "react";
import { Box, Card, Chip, Typography, Container } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { TopItem } from "../home/TopItem";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts";

const types = [
  { label: "Leakage", color: "#48CFCB" },
  { label: "Sewer Burst", color: "#674636" },
  { label: "Supply Fail", color: "#1E2A5E" },
  { label: "Vandalism", color: "#821131" },
  { label: "Illegal Connection", color: "#7A1CAC" },
  { label: "Other", color: "#6A9C89" },
];

function OperationsDashboard() {
  const [stats, setStats] = useState(null);
  const [chartsData, setChartsData] = useState({});

  useEffect(() => {
    // Fetch stats for TopItems
    fetch(`/api/reports/stats`)
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error("Failed to fetch data");
      })
      .then((data) => {
        setStats(data);
      })
      .catch((e) => {
        console.error("Error:", e); // Log the error message
      });
    // Fetch data for PieCharts and BarCharts for each type
    types.forEach((type) => {
      fetch(`/api/reports/charts/status/${type.label}`)
        .then((res) => res.json())
        .then((data) => {
          setChartsData((prevData) => ({
            ...prevData,
            [type.label]: { pieData: data },
          }));
        })
        .catch((e) => console.error(e));

      fetch(`/api/reports/charts/monthly/${type.label}`)
        .then((res) => res.json())
        .then((data) => {
          setChartsData((prevData) => ({
            ...prevData,
            [type.label]: { ...prevData[type.label], barData: data },
          }));
        })
        .catch((e) => console.error(e));
    });
  }, []);
  useEffect(() => {}, [types, chartsData]);

  return (
    <Container sx={{ marginTop: 8 }} disableGutters>
      <Card
        sx={{
          p: 2,
          borderRadius: 5,
          boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
          minHeight: "90vh",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        <Box marginTop={1} padding={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={2.4}>
              <TopItem title="Total" value={stats ? stats.Total : 0} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TopItem title="Received" value={stats ? stats.Received : 0} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TopItem title="Assigned" value={stats ? stats.Assigned : 0} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TopItem title="Resolved" value={stats ? stats.Resolved : 0} />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TopItem
                title="Not Resolved"
                value={stats ? stats.NotResolved : 0}
              />
            </Grid>
          </Grid>
          {types.map((type, index) => {
            const pieData = chartsData[type.label]?.pieData || [];
            const barData = chartsData[type.label]?.barData || [];
            const barXAxisData = barData.map((item) => item.name);
            const barSeriesData = barData.map((item) => item.value);

            return (
              <Grid container spacing={3} key={index}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <Box
                      sx={{ width: "16px", backgroundColor: type.color }}
                    ></Box>
                    <Typography p={1} color="primary" variant="h6">
                      {type.label}
                    </Typography>
                    <Chip
                      label={stats && stats[type.label] ? stats[type.label] : 0}
                      sx={{
                        margin: "auto 10px auto 0",
                        backgroundColor: type.color,
                        color: "white",
                      }}
                    />
                  </Card>
                </Grid>
                <Grid item md={5} xs={12}>
                  <Card
                    sx={{
                      borderRadius: "12px",
                      boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
                      height: "100%",
                      display: "flex", // Use flexbox
                      alignItems: "center", // Center vertically
                      justifyContent: "center", // Center horizontally
                      padding: 2, // Add some padding around the chart
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%", // Take full width
                        height: "100%", // Take full height
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PieChart
                        series={[
                          {
                            data:
                              pieData.length > 0
                                ? pieData
                                : [{ name: "No Data", value: 0 }],
                            highlightScope: {
                              fade: "global",
                              highlight: "item",
                            },
                            faded: {
                              innerRadius: 30,
                              additionalRadius: -30,
                              color: "gray",
                            },
                            innerRadius: 20,
                            outerRadius: "80%",
                          },
                        ]}
                      />
                    </Box>
                  </Card>
                </Grid>
                <Grid item md={7} xs={12}>
                  <Card
                    sx={{
                      borderRadius: "12px",
                      boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <BarChart
                      title="Monthly Performance"
                      xAxis={[
                        {
                          scaleType: "band",
                          data: barXAxisData.length > 0 ? barXAxisData : [""],
                        },
                      ]}
                      series={[
                        {
                          data: barSeriesData.length > 0 ? barSeriesData : [0],
                        },
                      ]}
                      height={300}
                    />
                  </Card>
                </Grid>
              </Grid>
            );
          })}
        </Box>
      </Card>
    </Container>
  );
}

export default OperationsDashboard;
