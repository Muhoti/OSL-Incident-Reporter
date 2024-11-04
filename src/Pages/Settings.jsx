import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Box } from "@mui/material";

export default function Settings() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Add your password update logic here

    setError(null);

  };

  return (
    <Box marginTop={8} padding={1}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Settings</Typography>
        </div>
        <form onSubmit={handleSubmit}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
            }}
          >
            <CardHeader subheader="Update password" title="Password" />
            <Divider />
            <CardContent>
              <Stack spacing={3} sx={{ maxWidth: "sm" }}>
                <FormControl fullWidth>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput
                    label="Old Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput
                    label="New Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Confirm password</InputLabel>
                  <OutlinedInput
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </FormControl>
                {error && <Typography color="error">{error}</Typography>}
              </Stack>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Button variant="contained" type="submit">
                Update
              </Button>
            </CardActions>
          </Card>
        </form>
      </Stack>
    </Box>
  );
}
