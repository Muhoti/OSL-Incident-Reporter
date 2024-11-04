import * as React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CreateUser from "../components/users2/CreateUser";
import MyPagination from "../components/Pagination";
import CreateMobile from "../components/users2/CreateMobile";

export default function Users() {
  const [selectedNetwork, setSelectedNetwork] = React.useState("Portal Users");
  const [data, setData] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [changed, setChanged] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchData(selectedNetwork);
  }, [selectedNetwork, changed, currentPage]);

  const fetchData = (network) => {
    setLoading(true);
    setData(null);
    let url = "auth";
    if (network === "Mobile Users") {
      url = "mobile";
    } else if (network === "Public Users") {
      url = "publicusers";
    }

    fetch(`/api/${url}/paginated/${(currentPage - 1) * 12}`, {
      method: "get",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleNetworkChange = (users) => {
    setSelectedNetwork(users);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setChanged(!changed);
  };

  const handleMenuOpen = (event, user) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    let url = "/api/auth/";
    if (selectedNetwork === "Mobile Users") {
      url = "/api/mobile/";
    } else if (selectedNetwork === "Public Users") {
      url = "/api/publicusers/";
    }
    fetch(url + selectedUser.UserID, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setChanged(!changed);
        handleMenuClose();
      })
      .catch((err) => {
        console.error(err);
        handleMenuClose();
      });
  };

  const handleUpdate = () => {
    handleMenuClose();
    setDialogOpen(true);
  };

  const handleDeactivate = () => {
    let url = "/api/auth/";
    if (selectedNetwork === "Mobile Users") {
      url = "/api/mobile/";
    } else if (selectedNetwork === "Public Users") {
      url = "/api/publicusers/";
    }
    fetch(url + selectedUser.UserID, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Status: !selectedUser.Status }),
    })
      .then((res) => res.json())
      .then((data) => {
        setChanged(!changed);
        handleMenuClose();
      })
      .catch((err) => {
        console.error(err);
        handleMenuClose();
      });
  };

  const renderTableHeaders = () => {
    switch (selectedNetwork) {
      case "Portal Users":
        return (
          <>
            <TableCell>SN</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </>
        );
      case "Mobile Users":
        return (
          <>
            <TableCell>SN</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </>
        );
      case "Public Users":
        return (
          <>
            <TableCell>SN</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    if (!data || !data.result) return null;

    return data.result.map((user, index) => (
      <TableRow key={user.UserID}>
        <TableCell>{(currentPage - 1) * 12 + index + 1}</TableCell>
        <TableCell>{user.Name}</TableCell>
        {selectedNetwork !== "Public Users" && (
          <>
            <TableCell>{user.Email}</TableCell>
            <TableCell>{user.Phone}</TableCell>
          </>
        )}
        {selectedNetwork === "Portal Users" && (
          <>
            <TableCell>{user.Department}</TableCell>
            <TableCell>{user.Position}</TableCell>
            <TableCell>{user.Role}</TableCell>
          </>
        )}
        {selectedNetwork === "Mobile Users" && (
          <>
            <TableCell>{user.Position}</TableCell>
            <TableCell>{user.Department}</TableCell>
            <TableCell>{user.Role}</TableCell>
          </>
        )}
        <TableCell>
          <Chip
            color={user.Status ? "success" : "warning"}
            label={user.Status ? "Active" : "Inactive"}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={(event) => handleMenuOpen(event, user)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleUpdate}>Update</MenuItem>
            <MenuItem onClick={handleDeactivate}>
              {user.Status ? "Deactivate" : "Activate"}
            </MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box marginTop={8} padding={1}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Users</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialogOpen}
          >
            Create User
          </Button>
        </Box>
        <Card
          style={{
            borderRadius: "10px",
            boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <ButtonGroup
            variant="contained"
            sx={{ boxShadow: "none" }}
            aria-label="network toggle buttons"
          >
            <Button
              onClick={() => handleNetworkChange("Portal Users")}
              variant={
                selectedNetwork === "Portal Users" ? "contained" : "outlined"
              }
              sx={{ textTransform: "capitalize" }}
            >
              Portal Users
            </Button>
            <Button
              onClick={() => handleNetworkChange("Mobile Users")}
              variant={
                selectedNetwork === "Mobile Users" ? "contained" : "outlined"
              }
              sx={{ textTransform: "capitalize" }}
            >
              Mobile Users
            </Button>
            <Button
              onClick={() => handleNetworkChange("Public Users")}
              variant={
                selectedNetwork === "Public Users" ? "contained" : "outlined"
              }
              sx={{ textTransform: "capitalize" }}
            >
              Public Users
            </Button>
          </ButtonGroup>
          <Box sx={{ overflowX: "auto", minHeight: "50vh" }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Table sx={{ minWidth: "800px" }}>
                <TableHead>
                  <TableRow>{renderTableHeaders()}</TableRow>
                </TableHead>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            )}
          </Box>
          <Divider />
          <MyPagination
            totalPages={data ? Math.ceil(data.total / 12) : 0}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </Card>
      </Stack>
      {selectedNetwork === "Portal Users" && (
        <CreateUser
          open={dialogOpen}
          onClose={handleDialogClose}
          userType="portal"
        />
      )}
      {selectedNetwork === "Mobile Users" && (
        <CreateMobile
          open={dialogOpen}
          onClose={handleDialogClose}
          userType="mobile"
        />
      )}
      {selectedNetwork === "Public Users" && (
        <CreateUser
          open={dialogOpen}
          onClose={handleDialogClose}
          userType="public"
        />
      )}
    </Box>
  );
}
