import { useState } from "react";

export default function TopPanel(props) {
  const [selected, setSelected] = useState("Search Data");
  return (
    <div className="TopPanel">
      <Item
        txt="Search Data"
        icon="fa-search"
        selected={selected}
        setSelected={setSelected}
        openPopup={() => {
          props.setQuerySelector(true);
          props.setStyleSelector(null);
          props.setDataSelector(null);
        }}
      />
    </div>
  );
}

const Item = (props) => {
  return (
    <p
      onClick={() => {
        props.openPopup();
        props.setSelected(props.txt);
      }}
      className={props.txt === props.selected ? "active" : ""}
    >
      <i className={"fa " + props.icon}></i> {props.txt}
    </p>
  );
};
