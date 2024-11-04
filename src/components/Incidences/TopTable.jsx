import { useEffect, useRef, useState } from "react";
import Loading from "../Util/Loading";
import TPagination from "./TPagination";

export default function TopTable(props) {
  const [popup, setPopup] = useState(null);
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");
  const [updated, setUpdated] = useState("");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setData([]);
    if (props?.data?.length !== 0) {
      setTotal(Math.ceil(props?.data?.length / 5));
      let x = [];
      let d =
        (offset + 1) * 5 < props.data.length
          ? (offset + 1) * 5
          : props.data.length;
      for (let i = offset * 5; i < d; i++) {
        x.push(props.data[i]);
      }
      setData(x);
    }
  }, [props?.data, offset]);

  function scrollPages(v) {
    setOffset(v);
  }

  return (
    <div className="top_table">
      <div className="title">
        <h3>Manage Reported Incidences</h3>
        <i
          onClick={() => props.setExpand(false)}
          className="fa fa-window-minimize"
        ></i>
      </div>
      <div className="table">
        <div className="bhead">
          <h4>SNo</h4>
          <h4>Type</h4>
          <h4>Status</h4>
          <h4>Assigned To</h4>
          <h4>Date Reported</h4>
        </div>
        <div className="brow">
          {data.length > 0 &&
            data.map((item, index) => {
              return (
                <Item
                  key={index}
                  index={index}
                  sn={offset * 5 + 1 + index}
                  item={item}
                  status={item.Status}
                  total={100}
                  offset={offset}
                  setPopup={setPopup}
                  setId={setId}
                  setStatus={setStatus}
                  setUpdated={setUpdated}
                  updated={updated}
                  map={props.map}
                />
              );
            })}
        </div>
      </div>
      <div className="footer">
        <TPagination
          offset={offset}
          setOffset={setOffset}
          total={props?.data?.length}
          scrollPages={scrollPages}
        />
        <p>
          Showing {offset + 1} - {total} of Reported Incidences
        </p>
      </div>
      {popup && (
        <Popup
          id={id}
          status={status}
          setUpdated={setUpdated}
          setPopup={setPopup}
          refresh={props.refresh}
          setRefresh={props.setRefresh}
        />
      )}
    </div>
  );
}

const Item = (props) => {
  const statuses = ["Received", "In Progress", "Resolved", "Not Resolved"];
  const [color, setColor] = useState("#60606005");
  const [item, setItem] = useState(props.item);
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (props.index % 2 == 0) {
      setColor("#60606010");
    }
  }, []);

  useEffect(() => {
    if (props.updated === item.ID) {
      fetch(`/api/reports/statusbyid/${item.ID}`)
        .then((res) => {
          if (res.status === 200) return res.json();
          else throw Error("");
        })
        .then((data) => {
          props.setUpdated("");
          props.setRefresh(!props.refresh);
          setItem(data);
          setValue(data.Status);
        })
        .catch((e) => {
          props.setUpdated("");
        });
    }
  }, [props.updated]);

  useEffect(() => {
    setItem(props.item);
  }, [props.item]);

  return (
    <div
      onClick={() => {
        props?.map?.getView().animate({
          zoom: 20,
          center: [
            parseFloat(item.geometry.flatCoordinates[0]) + 0.001,
            parseFloat(item.geometry.flatCoordinates[1]),
          ],
        });
      }}
      style={{ backgroundColor: color }}
      className="row"
    >
      <p>{item.SerialNo}</p>
      <p>{item.Type}</p>
      <select
        name=""
        id=""
        value={props.status}
        onChange={(e) => {
          setValue(e.target.value);
          props.setUpdated(item.ID);
          props.setId(item.ID);
          props.setStatus(e.target.value);
          props.setPopup(true);
        }}
      >
        {statuses.map((item) => {
          return (
            <option key={item} value={item}>
              {item}
            </option>
          );
        })}
      </select>
      <p>{item?.AssignedTo}</p>
      <p>
        {new Date(item?.Date).toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
        })}
      </p>
    </div>
  );
};

const Popup = (props) => {
  const [err, setErr] = useState(null);
  const [data, setData] = useState([]);

  const [userID, setUserID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (props.status === "In Progress") {
      getStaff();
    }
  }, [props.status]);

  function getStaff() {
    fetch(`/api/mobile`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data.length > 0) {
          setUserID(data[0].UserID);
          setData(data);
        }
      })
      .catch((err) => {});
  }

  const updateStatus = () => {
    if (props.status === "In Progress" && !userID)
      return setErr("No staff assigned");
    setIsLoading(true);
    let body =
      props.status === "In Progress"
        ? {
            NRWUserID: userID,
            Status: props.status,
          }
        : {
            Status: props.status,
          };

    if (props.status === "Received") {
      body = {
        NRWUserID: "",
        Status: props.status,
      };
    }

    //  setDrop(!drop);
    fetch(`/api/reports/update/${props.id}`, {
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
          props.setRefresh(!props.refresh);
          props.setUpdated(props.id);
          setErr(data?.success);
          setTimeout(() => {
            props.setPopup(null);
          }, 3000);
        } else setErr(data?.error);
      })
      .catch((err) => {
        setErr(err);
        setIsLoading(false);
      });
  };

  return (
    <div className="showPopUp">
      <div className="conf">
        <i
          onClick={() => {
            props.setPopup(null);
          }}
          className="fa fa-times"
        ></i>
        <h3>Incident Status</h3>
        <p>{err}</p>
        {props.status !== "In Progress" && (
          <p>
            Update status to: <b>{props.status}</b>
          </p>
        )}
        {data.length > 0 && (
          <>
            <p>Assign to: </p>
          </>
        )}
        {props.status === "In Progress" && (
          <select
            onChange={(e) => {
              setUserID(data[e.target.selectedIndex].UserID);
            }}
            name=""
            id=""
          >
            {data.map((item, i) => {
              return (
                <option key={i} value={item.Name}>
                  {item.Name}
                </option>
              );
            })}
          </select>
        )}
        <button
          className="ubtn"
          onClick={(e) => {
            updateStatus();
          }}
        >
          Submit
        </button>
        {isLoading && <Loading />}
      </div>
    </div>
  );
};
