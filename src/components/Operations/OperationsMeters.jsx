import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Stack,
  Typography,
  TableCell,
  TableRow,
  Chip,
  Table,
  TableHead,
  TableBody,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MyPagination from "../Pagination";

export default function OperationsMeters() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [trendDialogOpen, setTrendDialogOpen] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [selectedDMA, setSelectedDMA] = useState("");
  const [refresh, setRefresh] = useState(false);
  const today = new Date();
  const [startDate, setStartDate] = useState(today.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [refresh, startDate, endDate, currentPage]);

  const fetchData = () => {
    setLoading(true);
    const apiUrl = `/api/dmareading/daily/${startDate}/${endDate}/${
      (currentPage - 1) * 12
    }`;

    fetch(apiUrl, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not fetch data!!!");
        }
        return res.json();
      })
      .then((fetchedData) => {
        console.log("Fetched Data:", fetchedData); // Debugging line
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const fetchTrendData = (dmaName) => {
    setTrendLoading(true);
    const apiUrl = `/api/dmareading/bydma/${dmaName}`;

    fetch(apiUrl, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((fetchedTrendData) => {
        setTrendData(fetchedTrendData.data);
        setTrendLoading(false);
        setTrendDialogOpen(true);
      })
      .catch((err) => {
        setTrendLoading(false);
      });
  };

  const handleSearch = (value) => {
    if (value != "") {
      setLoading(true);
      const apiUrl = `/api/dmareading/searchdma/${value}`;
      fetch(apiUrl, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Could not fetch data!!!");
          }
          return res.json();
        })
        .then((fetchedData) => {
          setData(fetchedData);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      setRefresh(!refresh);
    }
  };

  const handlePageChange = (newPage) => {
    console.log(newPage);
    setCurrentPage(newPage);
  };

  const renderTableHeaders = () => (
    <>
      <TableCell>SN</TableCell>
      <TableCell>DMA</TableCell>
      <TableCell>Date</TableCell>
      <TableCell>Status</TableCell>
      {/* <TableCell>Image</TableCell> */}
      <TableCell>Units</TableCell>
      <TableCell>Consumption</TableCell>
      <TableCell>Actions</TableCell>
    </>
  );

  const renderTableRows = () => {
    if (!data || !data.data) return null;

    return data.data.map((report, index) => (
      <TableRow sx={{ cursor: "pointer" }} key={report.ID}>
        <TableCell>
          <Chip label={(currentPage - 1) * 12 + index + 1} />
        </TableCell>
        <TableCell>{report.DMAName}</TableCell>
        <TableCell>
          <Chip label={new Date(report.createdAt).toLocaleDateString()} />
          <Chip
            label={new Date(report.createdAt).toLocaleTimeString().slice(0, 5)}
          />
        </TableCell>
        <TableCell>
          <Chip
            label={report.MeterStatus}
            color={report.MeterStatus === "Okay" ? "success" : "warning"}
          />
        </TableCell>

        {/* <TableCell>
          <img
            style={{
              maxHeight: "64px",
              height: "100%",
              width: "100px",
              objectFit: "cover",
              cursor: "pointer",
            }}
            src={`/api/uploads/${report.Image}`}
            onClick={() => {
              setSelectedImage(`/api/uploads/${report.Image}`);
              setImageDialogOpen(true);
            }}
          />
        </TableCell> */}

        <TableCell>
          <Chip
            label={Number(report.Units).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            onClick={() => {
              setSelectedImage(`/api/uploads/${report.Image}`);
              setImageDialogOpen(true);
            }}
          />
        </TableCell>
        <TableCell>
          <Chip
            color={"secondary"}
            label={Number(report.Consumption).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          />
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedDMA(report.DMAName);
              fetchTrendData(report.DMAName);
            }}
          >
            {trendLoading && selectedDMA == report.DMAName
              ? "Fetching Data..."
              : "View Trend"}
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  const downloadCSV = () => {
    if (!data.data) return;

    const csvRows = [];

    // Add headers
    const headers = [
      "SN",
      "DMA Name",
      "Date",
      "Status",
      "Units",
      "Consumption",
    ];
    csvRows.push(headers.join(","));

    // Add data rows
    data.data.forEach((report, index) => {
      const row = [
        index + 1,
        report.DMAName,
        new Date(report.createdAt).toLocaleDateString(),
        report.MeterStatus,
        report.Units,
        report.Consumption,
      ];
      csvRows.push(row.join(","));
    });

    // Convert to CSV and download
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "meter_readings.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box sx={{ mt: 2, minHeight: "80vh", width: "100%" }}>
      <Stack spacing={3}>
        <Box
          display="flex"
          gap={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography flexGrow={1} variant="h5">
            Readings
          </Typography>
          <TextField
            label="DMA Filter"
            type="text"
            size="small"
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
          />
          <TextField
            value={startDate}
            label="Start Date"
            type="date"
            size="small"
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
          />
          <TextField
            value={endDate}
            label="End Date"
            type="date"
            size="small"
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
          />
          <Button variant="contained" onClick={downloadCSV}>
            Download CSV
          </Button>
        </Box>

        <Card>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
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
        </Card>
        <MyPagination
          totalPages={data ? Math.ceil(data.total / 12) : 0}
          handlePageChange={handlePageChange}
          currentPage={currentPage}
        />

        {/* Dialog for Image Preview */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
        >
          <DialogTitle>Image Preview</DialogTitle>
          <DialogContent>
            <img
              src={selectedImage}
              alt="Meter"
              style={{ width: "100%", height: "auto" }}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog for Trend Chart */}
        <Dialog
          open={trendDialogOpen}
          onClose={() => setTrendDialogOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {`Trend for ${selectedDMA}`}
            <IconButton
              aria-label="close"
              onClick={() => setTrendDialogOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Consumption" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </DialogContent>
        </Dialog>
      </Stack>
    </Box>
  );
}
