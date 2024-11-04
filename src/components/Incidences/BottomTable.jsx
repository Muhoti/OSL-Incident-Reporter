import { useEffect, useState } from "react";
import Pagination from "../Util/Pagination";

export default function BottomTable(props) {
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/erteams/performance/${offset}`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch data!!!");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setData(data);
        setTotal(data.length);
      })
      .catch((err) => {});
  }, [offset]);

  function scrollPages(v) {
    setOffset(v);
  }

  return (
    <div className="bottom_table">
      <h3>Emergency Response Teams</h3>
      <div className="table">
        <div className="bhead">
          <h4>ID</h4>
          <h4>Name</h4>
          <h4>Phone</h4>
          <h4>Type</h4>
          <h4>Responses</h4>
        </div>
        <div className="brow">
          {data &&
            data.map((item, index) => {
              return (
                <Item key={index} index={index + 1} item={item} total={100} />
              );
            })}
        </div>
      </div>
      <div className="footer">
        <Pagination
          offset={offset}
          setOffset={setOffset}
          total={total}
          page={offset}
          scrollPages={scrollPages}
        />
        <div>
          Showing {offset + 1} - {offset + 5 < total ? offset + 5 : total} of{" "}
          {total} Incident Reports
        </div>
      </div>
    </div>
  );
}

const Item = (props) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth((props.item.TotalResponses / props.total) * 100);
  }, []);

  return (
    <div className="row">
      <p>{props.index}</p>
      <p>{props.item.Name}</p>
      <p>{props.item.Phone}</p>
      <p>{props.item.Service}</p>
      <p
        style={{
          width: width + "%",
          whiteSpace: "nowrap",
          backgroundColor: "red",
        }}
      >
        {props.item.TotalResponses}
      </p>
    </div>
  );
};
