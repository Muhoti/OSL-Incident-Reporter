import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
} from "@mui/material";
import { saveAs } from "file-saver"; // Import file-saver for downloading CSV
import MyPagination from "../Pagination";

export default function Data(props) {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null); // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility

  useEffect(() => {
    fetchData();
  }, [props.url, currentPage]);

  const fetchData = () => {
    setLoading(true);
    setData(null);

    let apiUrl = `/api/${props.url}/paginated/${(currentPage - 1) * 12}`;
    if (searchTerm && searchColumn) {
      apiUrl = `/api/${
        props.url
      }/paginated/search/${searchColumn}/${searchTerm}/${
        (currentPage - 1) * 12
      }`;
    }

    fetch(apiUrl, {
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

        // Set available columns for the search dropdown
        if (data && data.data && data.data.length > 0) {
          const columns = Object.keys(data.data[0]).filter(
            (key) =>
              key !== "geom" &&
              key !== "ID" &&
              key !== "createdAt" &&
              key !== "updatedAt" &&
              key !== "User" &&
              key !== "Coordinates"
          );
          setAvailableColumns(columns);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRow(null);
  };

  const handleDownloadCSV = () => {
    if (!data || !data.data || data.data.length === 0) return;

    const csvHeaders = Object.keys(data.data[0]);

    const csvContent = [
      csvHeaders.join(","), // Add headers
      ...data.data.map((row) =>
        csvHeaders
          .map((header) =>
            typeof row[header] === "object"
              ? JSON.stringify(row[header])
              : row[header]
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "data.csv");
  };

  const renderTableHeaders = () => {
    if (!data || !data.data || data.data.length === 0) return null;

    const columnNames = Object.keys(data.data[0]).filter(
      (key) =>
        key !== "geom" &&
        key !== "ID" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "User" &&
        key !== "Coordinates" &&
        key !== "Picture" &&
        key !== "FRecTime" &&
        key !== "RecTime"
    );

    return (
      <>
        {columnNames.map((columnName) => (
          <TableCell key={columnName}>{columnName}</TableCell>
        ))}
      </>
    );
  };

  const renderTableRows = () => {
    if (!data || !data.data) return null;

    return data.data.map((row, index) => (
      <TableRow
        key={index}
        onClick={() => handleRowClick(row)}
        style={{ cursor: "pointer" }}
      >
        <TableCell>
          <Chip label={(currentPage - 1) * 12 + index + 1} />
        </TableCell>
        {Object.keys(row)
          .filter(
            (key) =>
              key !== "geom" &&
              key !== "ID" &&
              key !== "createdAt" &&
              key !== "updatedAt" &&
              key !== "User" &&
              key !== "Coordinates" &&
              key !== "FRecTime" &&
              key !== "Picture" &&
              key !== "RecTime"
          )
          .map((key) => (
            <TableCell key={key}>
              {typeof row[key] === "object"
                ? JSON.stringify(row[key])
                : row[key]}
            </TableCell>
          ))}
      </TableRow>
    ));
  };

  const renderDialogContent = () => {
    if (selectedRow) {
      delete selectedRow.geom;
      delete selectedRow.ID;
      delete selectedRow.createdAt;
      delete selectedRow.updatedAt;
      delete selectedRow.FRecTime;
      delete selectedRow.RecTime;
      delete selectedRow.Picture;
    }

    return selectedRow ? (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
        }}
      >
        {Object.entries(selectedRow).map(([key, value], index) => (
          <Box
            key={index}
            sx={{ display: "grid", gap: 1, gridTemplateColumns: "1fr 1fr" }}
          >
            <Typography>
              <Chip label={key} />
            </Typography>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                px: "5px",
              }}
              variant="body2"
            >
              {typeof value === "object" ? JSON.stringify(value) : value}
            </Typography>
          </Box>
        ))}
      </Box>
    ) : null;
  };

  return (
    <Box padding={1}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <FormControl size="small" fullWidth="xs">
          <InputLabel>Search Column</InputLabel>
          <Select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
          >
            {availableColumns.map((column, index) => (
              <MenuItem key={index} value={column}>
                {column}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth="xs"
        />
        <Button
          variant="contained"
          fullWidth="xs"
          color="primary"
          onClick={handleSearch}
        >
          Search
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDownloadCSV}
          fullWidth="xs"
        >
          Download CSV
        </Button>
      </Box>

      {/* Table */}
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
          <Table sx={{ minWidth: "800px" }}>
            <TableHead>
              <TableRow>
                <TableCell>SN</TableCell>
                {renderTableHeaders()}
              </TableRow>
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

      {/* Dialog for Row Details */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Data Details</DialogTitle>
        <Divider />
        <DialogContent sx={{ maxWidth: "70vw", width: "100%" }}>
          {renderDialogContent()}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
