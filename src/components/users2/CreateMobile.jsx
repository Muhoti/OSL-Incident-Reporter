import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Box,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z as zod } from "zod";
import {
  Eye as EyeIcon,
  EyeSlash as EyeSlashIcon,
} from "@phosphor-icons/react";

const schema = zod.object({
  Name: zod.string().min(1, { message: "Name is required" }),
  Phone: zod.string().min(1, { message: "Phone is required" }),
  Email: zod.string().min(1, { message: "Email is required" }).email(),
  Position: zod.string().min(1, { message: "Position is required" }),
  Department: zod.string().min(1, { message: "Department is required" }),
  Password: zod
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  Role: zod.string().min(1, { message: "Role is required" }),
});

const defaultValues = {
  Name: "",
  Phone: "",
  Email: "",
  Position: "",
  Department: "",
  Password: "",
  Role: "",
};

export default function CreateMobile({ open, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data) => {
    setLoading(true);
    fetch("/api/mobile/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setNotification({
            open: true,
            message: "User created successfully",
            severity: "success",
          });
          onClose();
          reset(defaultValues);
        } else {
          setNotification({
            open: true,
            message: data.error || "Failed to create user",
            severity: "error",
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        setNotification({
          open: true,
          message: "An error occurred.",
          severity: "error",
        });
        console.error("Error:", error);
      });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle color="primary">Create Mobile User</DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth margin="normal" error={Boolean(errors.Name)}>
              <Controller
                name="Name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Name"
                    variant="outlined"
                  />
                )}
              />
              {errors.Name && (
                <FormHelperText>{errors.Name.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              margin="normal"
              error={Boolean(errors.Phone)}
            >
              <Controller
                name="Phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Phone"
                    variant="outlined"
                  />
                )}
              />
              {errors.Phone && (
                <FormHelperText>{errors.Phone.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              margin="normal"
              error={Boolean(errors.Email)}
            >
              <Controller
                name="Email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Email"
                    variant="outlined"
                  />
                )}
              />
              {errors.Email && (
                <FormHelperText>{errors.Email.message}</FormHelperText>
              )}
            </FormControl>

            <Box sx={{ display: "flex", flex: "1 1", gap: 2 }}>
              <FormControl
                fullWidth
                margin="normal"
                error={Boolean(errors.Position)}
              >
                <InputLabel size="small">Position</InputLabel>
                <Controller
                  name="Position"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} size="small" label="Position">
                      <MenuItem value="MD">MD</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="Staff">Staff</MenuItem>
                    </Select>
                  )}
                />
                {errors.Position && (
                  <FormHelperText>{errors.Position.message}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                error={Boolean(errors.Department)}
              >
                <InputLabel size="small">Section</InputLabel>
                <Controller
                  name="Department"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} size="small" label="Section">
                      <MenuItem value="NRW">NRW</MenuItem>
                      <MenuItem value="O&M">O&M</MenuItem>
                      <MenuItem value="Customer Care">
                        Customer Care
                      </MenuItem>{" "}
                      <MenuItem value="GIS">GIS</MenuItem>
                      <MenuItem value="Commercial">Commercial</MenuItem>
                      <MenuItem value="Management">Management</MenuItem>
                    </Select>
                  )}
                />
                {errors.Department && (
                  <FormHelperText>{errors.Department.message}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <FormControl fullWidth margin="normal" error={Boolean(errors.Role)}>
              <InputLabel size="small">Role</InputLabel>
              <Controller
                name="Role"
                control={control}
                render={({ field }) => (
                  <Select {...field} size="small" label="Role">
                    <MenuItem value="Field Officer">Field Officer</MenuItem>
                    <MenuItem value="Meter Reader">Meter Reader</MenuItem>
                    <MenuItem value="Enumerator">Enumerator</MenuItem>
                  </Select>
                )}
              />
              {errors.Role && (
                <FormHelperText>{errors.Role.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              margin="normal"
              error={Boolean(errors.Password)}
            >
              <Controller
                name="Password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    label="Password"
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              {errors.Password && (
                <FormHelperText>{errors.Password.message}</FormHelperText>
              )}
            </FormControl>

            <DialogActions>
              <Button
                onClick={onClose}
                variant="outlined"
                color="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Create User"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
