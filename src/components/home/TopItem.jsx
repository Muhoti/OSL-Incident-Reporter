import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowDown as ArrowDownIcon, ChartLineUp } from "@phosphor-icons/react";
import { ArrowUp as ArrowUpIcon } from "@phosphor-icons/react";

export function TopItem({ title, diff, trend, icon, value }) {
  const TrendIcon = trend === "up" ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === "up" ? "green" : "orange";

  return (
    <Card
      sx={{
        borderRadius: "8px",
        boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.2)",
        width: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          spacing={1}
        >
          <Typography color="text.secondary" variant="overline">
            {title}
          </Typography>
          <Typography variant="h6">
            {Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 0,
            })}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
