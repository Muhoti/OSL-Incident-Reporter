import { useRef } from "react";
import { useState } from "react";
import { useLayoutEffect } from "react";
import { useEffect } from "react";
import ChartLoading from "../Util/ChartLoading";

export default function Popup(props) {
  const ref = useRef(null);
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(250);
  const [blob, setBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
 
    if (props?.single?.Image) {
      const url = props?.single?.Image;
      setLoading(true);
      fetch(`/api/uploads/${url.replaceAll("uploads/","").replaceAll("uploads\\","")}`)
        .then((res) => {
          if (res.ok) return res.blob();
          else throw Error("");
        })
        .then((blob) => {
          const src = URL.createObjectURL(blob);
          setBlob(src);

          setLoading(false);
        })
        .catch((e) => {

          setLoading(false);
        });
    }
  }, [props?.single?.Image]);

  useLayoutEffect(() => {
    setWidth(ref.current.offsetWidth / 2);
    setHeight(ref.current.offsetHeight + 6);
  }, []);

  return (
    <div
      ref={ref}
      style={{ top: props.top - height, left: props.left - width }}
      className="popup"
    >
      <div className="wrapper">
        {props.many?.data ? (
          <div className="many">
            <h3>Details</h3>
            <div className="hd">
              <h4>Name</h4>
              <h4>AccountNo</h4>
              <h4>Meter No.</h4>
              <h4>Current Balance</h4>
              <h4>Previous Balance</h4>
              <h4>Invoice Amount</h4>
              <h4>Account Status</h4>
              <h4>Location</h4>
            </div>
            {props.many?.data.map((item, index) => {
              return (
                <div key={index} className="dt">
                  {<p>{item.Name}</p>}
                  {<p>{item.AccountNo}</p>}
                  {<p>{item.MeterNo}</p>}
                  {<p>{item.CurrentBal}</p>}
                  {<p>{item.PreviousBal}</p>}
                  {<p>{item.InvoiceAmount}</p>}
                  {<p>{item.AccountStatus}</p>}
                  <p>{item.Location}</p>
                </div>
              );
            })}
            <h4>Total customers in group: {props.many.count}</h4>
          </div>
        ) : (
          <div className="single">
            {props.current === "incidences" ? (
              <>
                <h3>
                  {new Date(props?.single?.Date).toLocaleString("en-US", {
                    timeZone: "Africa/Nairobi",
                  })}
                </h3>
                {loading ? (
                  <ChartLoading />
                ) : (
                  <img
                    src={blob}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    alt=""
                  />
                )}
                <div className="div2equal">
                  <p>
                  Type: <span>{props.single.Type}</span>
                </p>
                <p>
                  Serial No: <span>{props.single.SerialNo}</span>
                </p>
                </div>
                <div className="div2equal">
                  {props.single.Name && (
                  <p>
                    Reported By: <span>{props.single.Name}</span>
                  </p>
                )}
                 <p>
                  Phone:{" "}
                  {props.single.ReportedBy ? (
                    <span>{props.single.ReportedBy}</span>
                  ) : (
                    <span style={{ fontWeight: "bold" }}>Not Captured</span>
                  )}
                </p>
                </div>
                <p>Reporter Type: 
                  <span style={{ fontWeight: "bold" }}>{props.single.ReporterType}</span> 
                </p>
                
                <div className="div2equal">
                  {props.single.Location && (
                  <p>
                    Location: <span>{props.single.Location}</span>
                  </p>
                )}
                {props.single.Route && (
                  <p>
                    Route: <span>{props.single.Route}</span>
                  </p>
                )}
                </div>
                
                <p>
                  Description: <span>{props.single.Description}</span>
                </p>
                <p>
                  Status: <span>{props.single.Status}</span>
                </p>
               
                
                <p>
                  Assigned To:{" "}
                  {props.single.AssignedTo ? (
                    <span>{props.single.AssignedTo}</span>
                  ) : (
                    <span style={{ fontWeight: "bold" }}>None</span>
                  )}
                </p>
              </>
            ) : (
              <>
                <h3>Details</h3>
                <p>
                  Name: <span>{props.single.Name}</span>
                </p>
                <p>
                  Account No: <span>{props.single.AccountNo}</span>
                </p>
                <p>
                  Meter No: <span>{props.single.MeterNo}</span>
                </p>
                <p>
                  Current Balance: <span>{props.single.CurrentBal}</span>
                </p>
                <p>
                  Invoice Amount: <span>{props.single.InvoiceAmount}</span>
                </p>
                <p>
                  Previous Balance: <span>{props.single.PreviousBal}</span>
                </p>
                <p>
                  Account Status: <span>{props.single.AccountStatus}</span>
                </p>
                <p>
                  Location: <span>{props.single.Location}</span>
                </p>

                <h4>Explore more in the data section</h4>
              </>
            )}
          </div>
        )}
        <i className="fa fa-caret-down"></i>
      </div>
    </div>
  );
}
