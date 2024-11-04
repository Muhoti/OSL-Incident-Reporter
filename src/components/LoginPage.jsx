import * as React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Eye as EyeIcon } from "@phosphor-icons/react";
import { EyeSlash as EyeSlashIcon } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import { Box, Card, CircularProgress } from "@mui/material";
import logo from "../assets/images/UM logo.png";
import lg_img from "../assets/images/lg.png";
import ForgotPassword from "./ForgotPassword";

const schema = zod.object({
  Email: zod.string().min(1, { message: "Email is required" }).email(),
  Password: zod.string().min(1, { message: "Password is required" }),
});

const defaultValues = { Email: "", Password: "" };

export default function LoginPage(props) {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [isError, setIsError] = React.useState("");
  const [showing, setShowing] = React.useState(false);

  const onSubmit = (data) => {
    setIsError("");
    setIsPending(true);

    fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else throw new Error("Login failed!");
      })
      .then((data) => {
        setIsPending(false);
        if (data.success) {
          localStorage.setItem("gdfhgfhtkn", data.token);
          setTimeout(() => {
            setIsError(data.success);
          }, 500);
          navigate("/home");
        } else {
          setIsError(data.error);
        }
      })
      .catch((err) => {
        setIsPending(false);
        setIsError("Login failed!");
      });
  };

  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "grid" },
        flexDirection: "column",
        gridTemplateColumns: "1fr 1fr",
        height: "100vh",
        background:
          "radial-gradient(50% 50% at 50% 50%,#8ed1fc  0%, #3F51B5 100%)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          height: "100%",
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: "450px",
            width: "100%",
            p: 4,
            borderRadius: "16px",
            boxShadow: "0 20px 50px #00000050",
          }}
        >
          <Stack spacing={4}>
            <Stack spacing={1}>
              <img
                style={{ maxHeight: "64px", objectFit: "contain" }}
                src={logo}
                alt=""
              />
            </Stack>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <Controller
                  control={control}
                  name="Email"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.Email)}>
                      <InputLabel>Email address</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="Email address"
                        type="email"
                      />
                      {errors.Email ? (
                        <FormHelperText>{errors.Email.message}</FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />
                <Controller
                  control={control}
                  name="Password"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.Password)}>
                      <InputLabel>Password</InputLabel>
                      <OutlinedInput
                        {...field}
                        endAdornment={
                          showPassword ? (
                            <EyeIcon
                              cursor="pointer"
                              fontSize="var(--icon-fontSize-md)"
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <EyeSlashIcon
                              cursor="pointer"
                              fontSize="var(--icon-fontSize-md)"
                              onClick={() => setShowPassword(true)}
                            />
                          )
                        }
                        label="Password"
                        type={showPassword ? "text" : "password"}
                      />
                      {errors.Password ? (
                        <FormHelperText>
                          {errors.Password.message}
                        </FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />
                <div>
                  <Link
                    component={RouterLink}
                    onClick={() => {
                      setShowing(true);
                    }}
                    variant="subtitle2"
                    sx={{ textAlign: "center", color: "#3F51B5" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  disabled={isPending}
                  type="submit"
                  variant="contained"
                  size="large"
                  color="primary"
                  startIcon={isPending ? <CircularProgress size={24} /> : null}
                >
                  {isPending ? "Signing in..." : "Sign in"}
                </Button>
              </Stack>
            </form>
            {isError && (
              <Alert
                color={isError.includes("successful") ? "success" : "warning"}
              >
                {isError}
              </Alert>
            )}
          </Stack>
        </Card>
      </Box>
      <Box
        sx={{
          alignItems: "center",

          color: "var(--mui-palette-common-white)",
          display: { xs: "none", lg: "grid" },
          gridTemplateRows: "auto 1fr",
          justifyContent: "center",
          p: 3,
          minHeight: "100%",
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography
              color="inherit"
              sx={{
                fontSize: "32px",
                color: "orange",
                lineHeight: "44px",
                textAlign: "center",
              }}
              variant="h1"
            >
              Welcome to <br></br>
              <Box component="span" sx={{ color: "white", fontWeight: "900" }}>
                OSL Utility Manager
              </Box>
            </Typography>
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              component="img"
              alt="Widgets"
              src={lg_img}
              sx={{ height: "auto", width: "100%", maxWidth: "500px" }}
            />
          </Box>
        </Stack>
      </Box>
      <ForgotPassword open={showing} showForgotPassword={setShowing} />
    </Box>
  );
}
