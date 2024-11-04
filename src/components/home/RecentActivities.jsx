import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { DotsThreeVertical as DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/ssr/DotsThreeVertical";
import dayjs from "dayjs";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function RecentActivities({ data = [], sx }) {
  const navigate = useNavigate();

  return (
    <Card
      style={{
        borderRadius: "16px",
        boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
      }}
    >
      <CardHeader title="Recent Activities" />
      <Divider />
      <List>
        {data.map((product, index) => (
          <ListItem divider={index < data.length - 1} key={product.id}>
            <Typography variant="h4" sx={{ p: 2 }}>
              {product.id}
            </Typography>
            <ListItemText
              primary={product.name}
              primaryTypographyProps={{ variant: "subtitle1" }}
              secondary={`Updated ${dayjs(product.updatedAt).format(
                "MMM D, YYYY"
              )}`}
              secondaryTypographyProps={{ variant: "body2" }}
            />
            <Typography variant="p" sx={{ p: 2 }}>
              {product.type}
            </Typography>
            <Typography variant="h6" sx={{ p: 2 }}>
              {product.value}
            </Typography>
          </ListItem>
        ))}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={() => {
            navigate("/activities");
          }}
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
}
