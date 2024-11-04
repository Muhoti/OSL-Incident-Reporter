import { useState } from "react";
import Loading from "../Util/Loading";

export default function UserPopup(props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateStatus = () => {
    setLoading(true);
    fetch(`/api/${props.url}/${props.item.UserID}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ Status: !props.item.Status }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw Error("");
      })
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setError(data.success);
          props.setRefresh(!props.refresh);
          setTimeout(() => {
            props.setClicked(false);
          }, 1000);
        } else {
          setError(data.error);
        }
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const deleteUser = () => {
    setLoading(true);
    fetch(`/api/${props.url}/${props.item.UserID}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => {

        if (res.ok) return res.json();
        else throw Error("");
      })
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setError(data.success);

          setTimeout(() => {
            props.setClicked(false);
            if (props.url == "mobile") {
              window.location.href = "/mobile/Users";
            } else if (props.url == "portal") {
              window.location.href = "/portal/Users";
            } else {
              window.location.href = "/public/Users";
            }
          }, 1000);
        } else {
          setError(data.error);
        }
      })
      .catch((e) => {
        setLoading(false);
      });
    
    
  };

  return (
    <div className="usrpopup">
      <div className="container">
        <div className="top">
          <h4>User Details</h4>
          <i
            onClick={() => {
              props.setClicked(false);
            }}
            className="fa fa-close"
          >
            &#xf00d;
          </i>
        </div>
        <hr />
        <h6>{error}</h6>{" "}
        <div className="div2equal">
          <p>Name: {props.item.Name}</p>
          <p>Role: {props.item.Role}</p>
        </div>
        <div className="div2equal">
          <p>Email: {props.item.Email}</p>
          <p>Phone: {props.item.Phone}</p>
        </div>
        <div className="div2equal">
          <p>Department: {props.item.Department}</p>
          <p>Position: {props.item.Position}</p>
        </div>
        <div className="buttons">
          <button
            onClick={() => {
              deleteUser();
            }}
          >
            Delete User
          </button>
        </div>
        {loading && <Loading />}
      </div>
    </div>
  );
}
