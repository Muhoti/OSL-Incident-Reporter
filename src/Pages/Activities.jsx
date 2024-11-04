import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

function noop() {
  // do nothing
}

export default function Activities({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}) {
  const rowIds = React.useMemo(() => {
    return rows.map((customer) => customer.id);
  }, [rows]);

  return (
    <Box marginTop={8} padding={1}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Staff Activities</Typography>
        </div>
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: "800px" }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox onChange={(event) => {}} />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Signed Up</TableCell>
                </TableRow>
              </TableHead>
              <TableBody></TableBody>
            </Table>
          </Box>
          <Divider />
          <TablePagination
            component="div"
            count={count}
            handlePageChange={noop}
            onRowsPerPageChange={noop}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Card>
      </Stack>
    </Box>
  );
}
