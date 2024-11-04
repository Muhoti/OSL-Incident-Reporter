import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function CategoryBox(props) {
  const [color, setColor] = useState("orange");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(150);
  const [height, setHeight] = useState(250);
  const [blob, setBlob] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (props.item !== null) {
      switch (props?.item?.Status) {
        case "Active":
          setColor("green");
          break;
        case "Inactive":
          setColor("redorange");
          break;
        default:
          break;
      }
    }
  }, [props.item]);

  useEffect(() => {
    if (props?.item?.File) {
      const url = props?.item?.File;
      setLoading(true);
      fetch(`/api/uploads/${url}`)
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
  }, [props?.item?.File]);

  return (
    <div
      className={props.ID === props.item.ID ? "user-box2 active" : "user-box2"}
      onClick={() => {
        props.setID(props?.item?.ID);
        props.setBeneficiaryDetails(props?.item);
        props?.selected?.current.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <div className="left">
        {props.item?.File ? (
          <img
            src={blob}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
            }}
            alt="thumbnail"
          />
        ) : (
          <h2 style={{ backgroundColor: color }}>{props?.item?.Name}</h2>
        )}
      </div>
      <div className="right">
        <h3 className="title">Name: {props?.item?.Name}</h3>
        <p className="dark">
          Status:
          {props?.item?.Status}
        </p>
      </div>
    </div>
  );
}
