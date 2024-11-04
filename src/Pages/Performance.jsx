import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";
import { RecentActivities } from "../components/home/RecentActivities";

function noop() {
  // do nothing
}

export default function Performance({
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
        <RecentActivities
          data={[
            {
              id: "1",
              name: "Jacktone Oguso",
              value: 2,
              type: "Client Calls",
            },
            {
              id: "1",
              name: "Jacktone Oguso",
              value: 1,
              type: "Quotes",
            },
            {
              id: "2",
              name: "Salome Ouru",
              value: 1,
              type: "Client Calls",
            },
            {
              id: "1",
              name: "Joelle Asumi",
              value: 2,
              type: "Client Calls",
            },
          ]}
          sx={{ height: "100%" }}
        />
      </Stack>
    </Box>
  );
}
