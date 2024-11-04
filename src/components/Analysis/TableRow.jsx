import { useEffect, useState, useRef } from "react";

export default function TableRow(props) {
  const popup = "showPopUp";
  const [isLoading, setIsLoading] = useState(false);
  const [staff, setStaff] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [err, setErr] = useState(null);

  const statuses = [null, "In Progress", "Resolved", "Not Resolved"];

  const rfselectStaff = useRef();

  useEffect(() => {});

  const getStaff = () => {
    fetch(`/api/mobile`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        let d = setStaff(data);
        props.setDrop(!props.drop);
      })
      .catch((err) => {});
  };

  const updateStatus = (reportId, staffId, status) => {
    setIsLoading(true);
    const body = staffId
      ? {
          NRWUserID: staffId,
          Status: status,
        }
      : {
          Status: status,
        };

    //  setDrop(!drop);
    fetch(`/api/reports/${reportId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setIsLoading(false);
        if (data?.success) {
          setErr(data?.success);
          setTimeout(() => {
            setSelectedStatus("");
            setStaff(null);
          }, 1000);
        } else setErr(data?.error);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {props.item && (
        <div
          className="tablerow"
          onClick={() => {
            props.setDrop(false);
          }}
        >
          <p>{props.index + 1}</p>
          <p>{props.item.Type}</p>
          <p>{props.item.createdAt.split(".")[0].replace("T", "@")}</p>
          <select
            onChange={(e) => {
              if (e.target.value === "In Progress") {
                getStaff();
              }
              setSelectedStatus(e.target.value);
            }}
          >
            {statuses.map((item) => {
              return (
                <>
                  {item === props.item.Status && item !== null ? (
                    <option value={item} selected disabled>
                      {item}
                    </option>
                  ) : item === props.item.Status && item === null ? (
                    <option value="Received" selected disabled>
                      Received
                    </option>
                  ) : (
                    <option value={item}>{item}</option>
                  )}
                </>
              );
            })}
          </select>
          <p>{props.item.NRWUserID}</p>
        </div>
      )}
      {selectedStatus !== null && (
        <>
          {selectedStatus === "In Progress" ? (
            <>
              {staff && (
                <div className={popup}>
                  <div className="conf">
                    <h3>
                      Update Report Status from {props.item.Status} to{" "}
                      {selectedStatus}?
                    </h3>
                    <p>{err}</p>
                    <p className="msg">
                      To update the status from recieved to in Progress, please
                      assign the followup to a Staff
                    </p>
                    <select
                      className="staff"
                      name=""
                      id=""
                      defaultValue=""
                      ref={rfselectStaff}
                      onChange={(e) => {}}
                    >
                      <option value="none" selected disabled>
                        Select a Staff
                      </option>
                      {staff.map((item) => {
                        return (
                          <option value={item.ERTeamID}>{item.Name}</option>
                        );
                      })}
                    </select>
                    <p
                      className="ubtn"
                      onClick={(e) => {
                        updateStatus(
                          props.item.ID,
                          rfselectStaff.current.value,
                          selectedStatus
                        );
                      }}
                    >
                      Update
                    </p>
                    <p
                      className="li"
                      onClick={() => {
                        setSelectedStatus(null);
                        setStaff(null);
                      }}
                    >
                      Close
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={popup}>
              <div className="conf">
                <h3>
                  Confirm status update from {props.item.Status} to{" "}
                  {selectedStatus}
                </h3>
                <p
                  className="ubtn"
                  onClick={(e) => {
                    updateStatus(props.item.ID, null, selectedStatus);
                  }}
                >
                  Update
                </p>
                <p
                  className="li"
                  onClick={() => {
                    setSelectedStatus(null);
                  }}
                >
                  Close
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
