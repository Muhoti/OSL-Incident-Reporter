import "../../Styles/users.scss";
import { useRef, useState } from "react";
import Button from "../Util/Button";
import UserInput from "./UserInput";
import UserSelect from "./UserSelect";
import WaveLoading from "../Util/WaveLoading";

export default function NewPortalUser(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fname = useRef();
  const gender = useRef();
  const email = useRef();
  const phone = useRef();
  const position = useRef();
  const department = useRef();
  const role = useRef();
  const password = useRef();

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
      Name: titleCase(fname.current.getValue().trim()),
      Gender: gender.current.getValue(),
      Phone: phone.current.getValue(),
      Email: email.current.getValue().toLowerCase().trim(),
      Department: titleCase(department.current.getValue()),
      Position: titleCase(position.current.getValue()),
      Password: password.current.getValue(),
      Role: role.current.getValue(),
    };

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
        !validatePassword(body.Password)
      ) {
        result = false;
        setError("Password must be at least 6 characters!");
        setLoading(false);
        return result;
      }
      if (!body.Phone || body.Phone.length !== 10) {
        result = false;
        setError("Enter a valid phone number");
        setLoading(false);
        return result;
      }
      if (!body.Name) {
        result = false;
        setError("Name is reqired!");
        setLoading(false);
        return result;
      }
      if (!body.Department) {
        result = false;
        setError("Department field is required!");
        setLoading(false);
        return result;
      }
      if (!body.Position) {
        result = false;
        setError("Position field is required!");
        setLoading(false);
        return result;
      }
      if (!body.Role) {
        result = false;
        setError("Role is required!");
        setLoading(false);
        return result;
      }
      return result;
    };

    if (validateForm()) {
      setLoading(true);
      fetch(`/api/auth/register`, {
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
          } else throw Error("");
        })
        .then((data) => {
          setLoading(false);
          if (data.success) {
            setError(data.success);
            setTimeout(() => {
              window.location.href = "/portal/Users";
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
        <h3>New Portal User</h3>
        <hr />
        <div className="new">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
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
              <UserInput ref={department} type="text" label="Department *" />
              <UserInput ref={position} type="text" label="Position *" />
            </div>

            <div className="div2equal">
              <UserSelect
                ref={role}
                label="Role *"
                data={["User", "Management", "NRW/O&M", "Commercial", "Admin"]}
              />
              <UserInput ref={password} type="password" label="Password *" value="123456"/>
            </div>
            <h6>{error}</h6>
            <Button handleClick={createUser} value="Submit" />
          </form>
          {loading && <WaveLoading />}
        </div>
      </div>
    </div>
  );
}
