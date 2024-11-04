import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Users from "../Pages/Users";
import Settings from "../Pages/Settings";
import NRWMap from "../components/Operations/OperationsMap";

import NRWDashboard from "../components/Operations/OperationsDashboard";
import NRWManagement from "../components/Operations/OperationsManagement";

function Dashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="Dashboard" element={<NRWDashboard />} />
          <Route path="Management" element={<NRWManagement />} />
          <Route path="users" element={<Users />} />
          <Route path="mymap" element={<NRWMap />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Dashboard;
