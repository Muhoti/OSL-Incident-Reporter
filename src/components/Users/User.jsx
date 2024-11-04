import UserPopup from "./UserPopup";
import { useEffect, useState } from "react";

export default function User(props) {
  const [color, setColor] = useState("#fff");
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if ((props.index + 1) % 2 == 0) {
      setColor("#eaf5fd");
    }
  }, []);

  return (
    <>
      <div
        onClick={() => {
          setClicked(true);
        }}
        style={{ backgroundColor: color }}
        className="row"
      >
        <p>{props.page + props.index + 1}</p>
        <p>{props.item.Name}</p>
        <p>{props.item.Email}</p>
        <p>{props.item.Phone}</p>
        <p>{props.item.Role}</p>
      </div>
      {clicked && (
        <UserPopup
          refresh={props.refresh}
          setRefresh={props.setRefresh}
          item={props.item}
          setClicked={setClicked}
          url={props.url}
          
        />
      )}
    </>
  );
}
