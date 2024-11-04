import {
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef, useState } from "react";
import Button from "../Util/Button";
import Input from "../Util/Input";
import Loading from "../Util/Loading";
import Select from "../Util/Select";
import Confirm from "../Util/Confirm";
import ConfirmSuccess from "../Util/ConfirmSuccess";

export default function SelectedCategory(props) {
  const [toggleBasic, setToggleBasic] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [active, setActive] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const deleteCategory = (id) => {
    fetch(`/api/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else throw Error("Failed to delete");    
    })
    .then((data) => {
      if (data.success) {
        openSucess();        
        props.setRefresh(!props.refresh);
      }
    })
    .catch((err) => {

    });
  }

  const openConfirm = () => {
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    setShowConfirm(false);
  };

  const openSucess = () => {
    setShowSuccess(true);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
  };

  const formatDate = (date) => {
    let d = new Date(date);
    return d.toDateString();
  }

  return (
    <div className="sbeneficiary">
      <div>
        <p>Name: {props?.beneficiaryDetails?.Name}</p>
        <p>Date Created: {formatDate(props?.beneficiaryDetails?.createdAt)}</p>
        <p>Status: {props?.beneficiaryDetails?.Status}</p>
      
        <br />
      </div>

      <div className="data">
        <div className="bars">
          <h4
            onClick={() => {
              setActive("Update Details");
              setToggleBasic(true);
            }}
            className={active === "Edit" ? "active" : ""}
          > 
            Edit
          </h4>
          <h4>
            {props.beneficiaryDetails.Status === "Active" ? "Deactivate" : "Activate"}
          </h4>
          <h4 
            onClick={() => {
              openConfirm();
            }}
            style={{color: "red"}}
          >
            Delete
          </h4>
        </div>

        <hr />
      </div>

      {toggleBasic && (
        <UpdateBasicDetails
          setToggleBasic={setToggleBasic}
          setRefresh={setRefresh}
          refresh={refresh}
          beneficiaryDetails={props.beneficiaryDetails}
        />
      )}
      {showConfirm && (
        <Confirm
          closeConfirm={closeConfirm}
          deleteFunction={() => {
            deleteCategory(props.beneficiaryDetails.ID);
          }}
          message="you want to delete?"
          action="delete"
        />
      )}
      {showSuccess && (
        <ConfirmSuccess closeConfirm={closeSuccess} action="deleted" />
      )}
    </div>
  );
}

const UpdateBasicDetails = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const name = useRef();
  const status = useRef();
  const fileRef = useRef();

  const updateBasicDetails = () => {

    const body = {
      Name: name.current.value,
      Type: status.current.value,
      Image: fileRef.current.files[0],
    };

    setError("");
    setLoading(true);
    fetch(`/api/waterproviders/update/${props.beneficiaryDetails.ID}`, {
      method: "PUT",
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
            props.setToggleBasic(false);
            window.location.href = "/mel";
            props.setRefresh(!props.refresh);
          }, 2000);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <div className="popup">
      <div className="wrap">
        <div className="head">
          <h3>{props?.beneficiaryDetails?.Name}</h3>
          <FontAwesomeIcon
            onClick={() => {
              props.setToggleBasic(false);
            }}
            className="fa-times"
            icon={faTimes}
          />
        </div>

        <hr />
        <div className="new">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="div2equal">
              <Input
                ref={name}
                value={props?.beneficiaryDetails?.Name}
                type="text"
                label="Category Name"
              />
              <Select
                ref={status}
                value={props?.beneficiaryDetails?.Status}
                data={["","Active", "Inactive"]}
                label="Status"
              />
            </div>
            <div>
              <Input 
                type="file"
                label="Image Thumbnail *"
                ref={fileRef}
              />
            </div>
            
            <p>{error}</p>
            <Button handleClick={updateBasicDetails} value="Submit" />
          </form>
          {loading && <Loading />}
        </div>
      </div>
    </div>
  );
};
