import React, { useState } from "react";
import { Box, ButtonGroup, Button, Container, Card } from "@mui/material";
import NRWDashboard from "../components/Operations/OperationsDashboard";
import NRWManagement from "../components/Operations/OperationsManagement";
import NRWMap from "../components/Operations/OperationsMap";

const selectList = ["Dashboard", "Management", "Map"];

export default function Operations() {
  const [selectedNetwork, setSelectedNetwork] = useState("Dashboard");

  const handleNetworkChange = (network) => {
    setSelectedNetwork(network);
  };

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
        <Box
          variant="contained"
          sx={{
            boxShadow: "none",
            marginBottom: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            height: "fit-content",
          }}
          aria-label="network toggle buttons"
        >
          {selectList.map((item, i) => {
            return (
              <Button
                key={i}
                onClick={() => handleNetworkChange(item)}
                variant={selectedNetwork === item ? "contained" : "outlined"}
                sx={{ textTransform: "capitalize" }}
              >
                {item}
              </Button>
            );
          })}
        </Box>

        <Box>{selectedNetwork == "Dashboard" && <NRWDashboard />}</Box>
        <Box>{selectedNetwork == "Management" && <NRWManagement />}</Box>
        <Box>{selectedNetwork == "Map" && <NRWMap />}</Box>
      </Card>
    </Container>
  );
}
