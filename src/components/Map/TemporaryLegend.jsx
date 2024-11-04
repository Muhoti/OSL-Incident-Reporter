import React from "react";
import { Box, Typography, Checkbox, Divider } from "@mui/material";

const TemporaryLegend = ({ legendItems, onToggle }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        zIndex: 20,
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="body1">Classification Legend</Typography>
      <Divider sx={{ marginBottom: 1 }} />
      {legendItems.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: "4px",
          }}
        >
          <Box
            sx={{
              width: "16px",
              height: "16px",
              backgroundColor: item.visible ? item.color : "transparent",
              borderRadius: "4px",
              marginRight: "8px",
            }}
          />
          <Typography variant="body2">{item.label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default TemporaryLegend;
