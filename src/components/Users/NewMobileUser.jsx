import { useRef, useState } from "react";
import Button from "../Util/Button";
import Loading from "../Util/Loading";
import UserInput from "./UserInput";
import UserSelect from "./UserSelect";

export default function NewMobileUser(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const roles = ["Enumerator", "Meter Reader"];
  const fname = useRef();
  const gender = useRef();
  const dpt = useRef();
  const pos = useRef();
  const role = useRef();
  const email = useRef();
  const phone = useRef();
  const password = useRef();
  const cpassword = useRef();

  function titleCase(str) {
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  }

  const createUser = () => {
    const body = {
      Name: titleCase(fname.current.getValue()),
      Phone: phone.current.getValue(),
      Email: email.current.getValue().toLowerCase().trim(),
      Role: role.current.getValue(),
      Department: titleCase(dpt.current.getValue()),
      Position: titleCase(pos.current.getValue()),
      Password: password.current.getValue(),
      Gender: gender.current.getValue(),
    };
    setLoading(true);
    setError("");

    const validateForm = () => {
      let result = true;
      if (!validateEmail(body.Email)) {
        result = false;
        setError("Please Enter a valid email address!");
        setLoading(false);
        return result;
      }
      if (
        !validatePassword(body.Password) ||
        !validatePassword(cpassword.current.getValue())
      ) {
        result = false;
        setError("Password must be at least 6 characters!");
        setLoading(false);
        return result;
      }
      if (body.Password !== cpassword.current.getValue()) {
        result = false;
        setError("Passwords do not match!!!");
        setLoading(false);
        return result;
      }
      if (!body.Phone || body.Phone.length !== 10) {
        result = false;
        setError("Enter a valid phone number");
        setLoading(false);
        return result;
      }
      if (!body.Name || !body.Department || !body.Position) {
        result = false;
        setError("All fields are required!");
        setLoading(false);
        return result;
      }
      return result;
    };

    if (validateForm()) {
      fetch(`/api/mobile/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else throw Error("Creation Failed!!!");
        })
        .then((data) => {
          setLoading(false);
          if (data.success) {
            setError(data.success);
            setTimeout(() => {
              window.location.href = "/mobile/Users";
            }, 1000);
          } else {
            setError(data.error);
          }
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  return (
    <div className="users">
      <div className="list">
        <h3>New Mobile User</h3>
        <hr />
        <div className="new">
          <h6>{error}</h6>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            autoComplete="off"
          >
            <input
              autoComplete="false"
              name="hidden"
              type="text"
              style={{ display: "none" }}
            />
            <div className="div2equal">
              <UserInput ref={fname} type="text" label="Name *" />
              <UserSelect
                ref={gender}
                label="Gender *"
                data={["Male", "Female"]}
              />
            </div>

            <div className="div2equal">
              <UserInput ref={email} type="email" label="Email *" />
              <UserInput ref={phone} type="number" label="Phone *" />
            </div>

            <div className="div2equal">
              <UserInput ref={dpt} type="text" label="Department *" />
              <UserInput ref={pos} type="text" label="Position *" />
            </div>

            <UserSelect ref={role} label="Role *" data={roles} />

            <div className="div2equal">
              <UserInput ref={password} type="password" label="Password *" />
              <UserInput
                ref={cpassword}
                type="password"
                label="Confirm Password *"
              />
            </div>
            <Button handleClick={createUser} value="Submit" />
          </form>
          {loading && <Loading />}
        </div>
      </div>
    </div>
  );
}
