// Home.js
import React from "react";
import { Box, Card, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { TopItem } from "../components/home/TopItem";
import Pie from "../components/home/Pie";
import { BarChart } from "@mui/x-charts/BarChart";
import { useRef, useState, useEffect } from "react";
import Grid2 from "@mui/material/Unstable_Grid2";

function Home(props) {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState(null);
  const chrt = useRef(null);
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    setShowing(false);
    setTimeout(() => {
      setShowing(true);
    }, 1);
  }, [props.showing]);

  useEffect(() => {
    fetch(`/api/customers/all/stats`)
      .then((res) => {
        if (res.ok) return res.json();
        else throw Error("");
      })
      .then((data) => {
        setData(data);
      })
      .catch((e) => {});
  }, []);

  useEffect(() => {
    fetch(`/api/customers/all/charts`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setProjects(data);
      })
      .catch((e) => {});
  }, []);

  return (
    <Box marginTop={8} padding={1}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Box sx={{ width: "16px", backgroundColor: "orange" }}></Box>
            <Typography p={1} color="primary" variant="h6">
              Water Network
            </Typography>
          </Card>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              my: 2,
              md: { gridTemplateColumns: "1fr 1fr" },
            }}
            container
            spacing={2}
          >
            <TopItem title="Customers" value={data ? data?.Customers : 0} />
            <TopItem title="Tanks" value={data ? data?.Tanks : 0} />
            <TopItem
              title="Master Meters"
              value={data ? data?.MasterMeters : 0}
            />
            <TopItem title="Bulk Meters" value={data ? data?.BulkMeters : 0} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Box sx={{ width: "16px", backgroundColor: "orange" }}></Box>
            <Typography p={1} color="primary" variant="h6">
              Sewer Network
            </Typography>
          </Card>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              my: 2,
              md: { gridTemplateColumns: "1fr 1fr" },
            }}
            container
            spacing={2}
          >
            <TopItem title="Manholes" value={data ? data?.Manholes : 0} />
            <TopItem
              title="Connection Chambers"
              value={data ? data?.ConnectionChambers : 0}
            />
            <TopItem
              title="Customer Chambers"
              value={data ? data?.CustomerChambers : 0}
            />
            <TopItem title="Sewer Lines" value={data ? data?.SewerLines : 0} />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Box sx={{ width: "16px", backgroundColor: "orange" }}></Box>
            <Typography p={1} color="primary" variant="h6">
              Customer Meters
            </Typography>
          </Card>
        </Grid>
        <Grid md={4} xs={12}>
          <Pie
            title="Status"
            data={projects?.MeterStatus}
            chartSeries={[5, 1]}
            labels={["Support Issues", "Resolved"]}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid md={4} xs={12}>
          <Pie
            title="Material"
            data={projects?.Material}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid md={4} xs={12}>
          <Pie
            title="Size"
            data={projects?.Size}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid item xs={12}>
          <Card
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Box sx={{ width: "16px", backgroundColor: "orange" }}></Box>
            <Typography p={1} color="primary" variant="h6">
              Tanks
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12}>
          <Card
            sx={{
              borderRadius: "8px",
              boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
            }}
          >
            <BarChart
              title="Tanks Capacity"
              xAxis={[
                {
                  scaleType: "band",
                  data: projects ? projects.Tanks.map((item) => item.name) : [],
                },
              ]}
              series={[
                {
                  data: projects
                    ? projects.Tanks.map((item) => item.value)
                    : [],
                },
              ]}
              height={500}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
