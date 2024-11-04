import { useState, useEffect } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  TextField,
  Container,
} from "@mui/material";
import MyPagination from "../Pagination";
import { data } from "jquery";

export default function OperationsManagement() {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [changed, setChanged] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    fetchData();
  }, [changed, currentPage, selectedType]);

  const fetchData = () => {
    setLoading(true);
    setData(null);

    let typeQuery = selectedType !== "All" ? `${selectedType}` : "All";

    fetch(`/api/reports/paginated/${typeQuery}/${(currentPage - 1) * 12}`, {
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDialogOpen = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const handleMenuOpen = (event, report) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedReport(null);
  };

  const handleStatusUpdate = () => {
    // Implement status update logic here
    handleMenuClose();
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const renderTableHeaders = () => (
    <>
      <TableCell>SN</TableCell>
      <TableCell>Type</TableCell>
      <TableCell>Description</TableCell>
      <TableCell>Date</TableCell>
      <TableCell>Status</TableCell>
    </>
  );

  const renderTableRows = () => {
    if (!data || !data.data) return null;

    return data.data.map((report, index) => (
      <TableRow
        sx={{ cursor: "pointer" }}
        key={report.ID}
        onClick={() => handleDialogOpen(report)}
      >
        <TableCell>
          <Chip label={(currentPage - 1) * 12 + index + 1} />
        </TableCell>
        <TableCell>{report.Type}</TableCell>
        <TableCell>{report.Description}</TableCell>
        <TableCell>
          {new Date(report.createdAt).toLocaleDateString()}{" "}
          {new Date(report.createdAt).toLocaleTimeString()}
        </TableCell>
        <TableCell>
          <Chip
            color={
              report.Status === "Received"
                ? "default"
                : report.Status === "Assigned"
                ? "primary"
                : report.Status === "Resolved"
                ? "success"
                : "warning"
            }
            label={report.Status}
          />
        </TableCell>
      </TableRow>
    ));
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
        <Box marginTop={1}>
          <Stack spacing={3}>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">Incidences</Typography>
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
                <Button
                  sx={{ textTransform: "capitalize", fontSize: "small" }}
                  onClick={() => handleTypeChange("All")}
                  variant={selectedType === "All" ? "contained" : "outlined"}
                >
                  All
                </Button>
                <Button
                  sx={{ textTransform: "capitalize", fontSize: "small" }}
                  onClick={() => handleTypeChange("Leakage")}
                  variant={
                    selectedType === "Leakage" ? "contained" : "outlined"
                  }
                >
                  Leakage
                </Button>
                <Button
                  sx={{ textTransform: "capitalize", fontSize: "small" }}
                  onClick={() => handleTypeChange("Vandalism")}
                  variant={
                    selectedType === "Vandalism" ? "contained" : "outlined"
                  }
                >
                  Vandalism
                </Button>
                <Button
                  sx={{ textTransform: "capitalize", fontSize: "small" }}
                  onClick={() => handleTypeChange("Supply Fail")}
                  variant={
                    selectedType === "Supply Fail" ? "contained" : "outlined"
                  }
                >
                  Supply Fail
                </Button>
                <Button
                  sx={{ textTransform: "capitalize", fontSize: "small" }}
                  onClick={() => handleTypeChange("Sewer Burst")}
                  variant={
                    selectedType === "Sewer Burst" ? "contained" : "outlined"
                  }
                >
                  Sewer Burst
                </Button>
                <Button
                  sx={{ textTransform: "capitalize", fontSize: "small" }}
                  onClick={() => handleTypeChange("Illegal Connection")}
                  variant={
                    selectedType === "Illegal Connection"
                      ? "contained"
                      : "outlined"
                  }
                >
                  Illegal Connection
                </Button>
              </Box>
            </Box>
            <Card
              style={{
                borderRadius: "10px",
                boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Box
                sx={{
                  overflowX: "auto",
                  minHeight: "50vh",
                  width: "100%",
                  maxWidth: "73vw",
                }}
              >
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
                  <Table>
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

          <ReportDetails
            report={selectedReport}
            dialogOpen={dialogOpen}
            handleDialogClose={handleDialogClose}
          />
        </Box>
      </Card>
    </Container>
  );
}

const ReportDetails = (props) => {
  const { report, dialogOpen, handleDialogClose } = props;
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false); // State to handle update dialog
  const [refresh, setRefresh] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (report) {
      setSelectedReport(report);
      fetch(`/api/reports/${report.ID}`)
        .then((res) => {
          if (!res.ok) {
            throw Error("Could not fetch data!!!");
          } else {
            return res.json();
          }
        })
        .then((data) => {
          setSelectedReport(data);
        })
        .catch((err) => {});
    }
  }, [refresh, report]);

  useEffect(() => {
    if (selectedReport && selectedReport.NRWUserID) {
      fetch(`/api/mobile/${selectedReport.NRWUserID}`)
        .then((res) => {
          if (!res.ok) {
            throw Error("Could not fetch data!!!");
          } else {
            return res.json();
          }
        })
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {});
    }
  }, [selectedReport]);

  const handleAssignStaffClick = () => {
    setAssignDialogOpen(true);
  };

  const handleAssignDialogClose = () => {
    setAssignDialogOpen(false);
    setRefresh((prev) => !prev);
  };

  const handleUpdateStatusClick = () => {
    setUpdateDialogOpen(true);
  };

  const handleUpdateDialogClose = () => {
    setUpdateDialogOpen(false);
    setRefresh((prev) => !prev);
  };

  return (
    <>
      {selectedReport && (
        <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth>
          <DialogTitle sx={{ display: "flex" }}>
            <Typography sx={{ flexGrow: 1 }}>
              {selectedReport.Type} - {selectedReport.SerialNo}
            </Typography>
            <Chip
              color={
                selectedReport.Status === "Received"
                  ? "default"
                  : selectedReport.Status === "Assigned"
                  ? "primary"
                  : selectedReport.Status === "Resolved"
                  ? "success"
                  : "warning"
              }
              label={selectedReport.Status}
            />
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Box>
              <img
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  border: "1px solid #60606050",
                  boxShadow: "0px 4px 8px #60606030",
                  borderRadius: "8px",
                }}
                src={"/api/uploads/" + selectedReport.Image}
                alt=""
              />
              <Typography variant="body2">
                Description: {selectedReport.Description}
              </Typography>
              <Typography variant="body2">
                Date Reported:{" "}
                {new Date(selectedReport.createdAt).toLocaleDateString()}{" "}
                {new Date(selectedReport.createdAt).toLocaleTimeString()}
              </Typography>
              <Typography
                sx={{ fontSize: "medium", marginTop: 1 }}
                variant="h6"
              >
                Reported By
              </Typography>
              <Divider />
              <Box>
                <Typography variant="body2">
                  Name: {selectedReport.Name}
                </Typography>
                <Typography variant="body2">
                  Phone: {selectedReport.Phone}
                </Typography>
              </Box>
              {selectedReport.NRWUserID && (
                <>
                  <Typography
                    sx={{ fontSize: "medium", marginTop: 1 }}
                    variant="h6"
                  >
                    Assigned To
                  </Typography>
                  <Divider />
                  <Box>
                    <Typography variant="body2">
                      Name: {user ? user.Name : ""}
                    </Typography>
                    <Typography variant="body2">
                      Phone: {user ? user.Phone : ""}
                    </Typography>
                    <Typography variant="body2">
                      Email: {user ? user.Email : ""}
                    </Typography>
                  </Box>
                </>
              )}
              {selectedReport.TaskImage && (
                <>
                  <Typography
                    sx={{ fontSize: "medium", marginTop: 1 }}
                    variant="h6"
                  >
                    Resolution
                  </Typography>
                  <Divider />
                  <Box>
                    <Typography variant="body2">
                      Remark: {selectedReport.TaskRemark}
                    </Typography>
                    <Typography variant="body2">
                      Date:{" "}
                      {new Date(selectedReport.TaskDate).toLocaleDateString()}{" "}
                      {new Date(selectedReport.TaskDate).toLocaleTimeString()}
                    </Typography>
                    {selectedReport.TaskResources && (
                      <Button marginTop={1} size="small" variant="outlined">
                        View Report Image
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDialogClose}
              variant="outlined"
              color="secondary"
            >
              Close
            </Button>

            <Button
              onClick={handleAssignStaffClick}
              variant="contained"
              color="primary"
              disabled={
                selectedReport.Status === "Resolved" ||
                selectedReport.Status === "Not Resolved"
              }
            >
              {selectedReport.Status === "Received"
                ? "Assign Staff"
                : "Reassign Staff"}
            </Button>
            {selectedReport.Status !== "Received" && (
              <Button
                onClick={handleUpdateStatusClick}
                variant="contained"
                color="primary"
              >
                Update Status
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
      <AssignStaffPopup
        open={assignDialogOpen}
        onClose={handleAssignDialogClose}
        reportId={selectedReport?.ID}
        currentStatus={selectedReport?.Status}
      />
      <UpdateStatusDialog
        open={updateDialogOpen}
        onClose={handleUpdateDialogClose}
        reportId={selectedReport?.ID}
      />
    </>
  );
};

const AssignStaffPopup = ({ open, onClose, reportId, currentStatus }) => {
  const [err, setErr] = useState(null);
  const [data, setData] = useState([]);
  const [userID, setUserID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentStatus === "Received" || currentStatus === "Assigned") {
      getStaff();
    }
  }, [currentStatus]);

  const getStaff = () => {
    fetch(`/api/mobile`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data.length > 0) {
          setUserID(data[0].UserID);
          setData(data);
        }
      })
      .catch((err) => {
        console.error(err);
        setErr("Failed to fetch staff data");
      });
  };

  const updateStatus = () => {
    if (!userID) return setErr("No staff assigned");
    setIsLoading(true);

    let body = {
      NRWUserID: userID,
      Status: "Assigned",
    };

    fetch(`/api/reports/update/${reportId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not update report status!!!");
        }
        return res.json();
      })
      .then((data) => {
        setIsLoading(false);
        if (data?.success) {
          setErr(data?.success);
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setErr(data?.error);
        }
      })
      .catch((err) => {
        setErr("An error occurred during the update");
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Assign Incident</DialogTitle>
      <Divider />
      <DialogContent>
        <Box>
          {data.length > 0 && (
            <Box mb={2}>
              <Typography variant="body1">Assign to:</Typography>
              <Select
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                fullWidth
              >
                {data.map((item, index) => (
                  <MenuItem key={index} value={item.UserID}>
                    {item.Name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        </Box>
        {err && (
          <Alert color={err.includes("success") ? "success" : "warning"}>
            {err}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={updateStatus} color="primary" variant="contained">
          Submit
          {isLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UpdateStatusDialog = ({ open, onClose, reportId }) => {
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Resolved");
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleUpdateStatus = () => {
    setIsLoading(true);

    const body = {
      TaskRemark: remarks,
      TaskDate: new Date().toISOString(),
      Status: status,
    };

    fetch(`/api/reports/update/${reportId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not update report status!!!");
        }
        return res.json();
      })
      .then((data) => {
        setIsLoading(false);
        if (data?.success) {
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setErr(data?.error);
        }
      })
      .catch((err) => {
        console.error(err);
        setErr("An error occurred during the update");
        setIsLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Update Status</DialogTitle>
      <Divider />
      <DialogContent>
        {err && (
          <Alert color={err.includes("success") ? "success" : "error"}>
            {err}
          </Alert>
        )}
        <Box component="form">
          <TextField
            label="Remarks"
            multiline
            rows={4}
            fullWidth
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            margin="normal"
          />
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <FormControlLabel
                value="Resolved"
                control={<Radio />}
                label="Resolved"
              />
              <FormControlLabel
                value="Not Resolved"
                control={<Radio />}
                label="Not Resolved"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleUpdateStatus}
          color="primary"
          variant="contained"
          disabled={isLoading}
        >
          Submit
          {isLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
