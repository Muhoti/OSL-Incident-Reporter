import {
  Home,
  People,
  Settings,
  Logout,
  MapOutlined,
  Build,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Box, SwipeableDrawer, useMediaQuery } from "@mui/material";
import Header2 from "./Util/Header";
import logo from "../assets/images/UM logo.png";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: 0,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer - 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: "100%",
  marginLeft: 0,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuItems = [
    { text: "Dashboard", icon: <Home />, path: "/Dashboard" },
    { text: "Management", icon: <Build />, path: "/Management" },
    { text: "Map", icon: <MapOutlined />, path: "/mymap" },
  ];

  const drawerContent = (
    <div>
      <DrawerHeader>
        {!isMobile && (
          <Box p={3}>
            <img src={logo} width={100} loading="lazy" />
            <Typography color="primary" variant="h6">
              INCIDENT REPORTER
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "rtl" ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem
              key={item.text}
              button
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {React.cloneElement(item.icon, {
                  color: isSelected ? "primary" : "textSecondary",
                })}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
        <Divider />
        <ListItem
          button
          selected={location.pathname === "/users"}
          onClick={() => navigate("/users")}
        >
          <ListItemIcon>
            <People
              color={
                location.pathname === "/users" ? "primary" : "textSecondary"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItem>
        <ListItem
          button
          selected={location.pathname === "/settings"}
          onClick={() => navigate("/settings")}
        >
          <ListItemIcon>
            <Settings
              color={
                location.pathname === "/settings" ? "primary" : "textSecondary"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button onClick={() => navigate("/")}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <Header2 handleDrawerOpen={handleDrawerOpen} open={open} />
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <SwipeableDrawer
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
          onOpen={handleDrawerOpen}
        >
          {drawerContent}
        </SwipeableDrawer>
      ) : (
        <Drawer variant="permanent" open={!isMobile}>
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}

export default Navbar;
