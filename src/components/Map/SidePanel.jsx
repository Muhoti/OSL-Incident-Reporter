import { useState } from "react";
import Charts from "./SidePanel/Charts";
import Data from "./SidePanel/Data";
import Export from "./SidePanel/Export";
import Layers from "./SidePanel/Layers";
import Metadata from "./SidePanel/Metadata";
import Bar from "./SidePanel/Others/Bar";
import DataTopo from "./SidePanel/DataTopo";
import MyStyler from "./SidePanel/Topo/MyStyler";
import Styles from "./SidePanel/Topo/Styles";

export default function SidePanel(props) {
  const [show, setShow] = useState(false);
  const [showing, setShowing] = useState(0);
  const [styler, setStyler] = useState(null);

  const openStyler = (value) => {
    setStyler(value);
  };

  const toggle = (number) => {
    setShow(!show);
    setShowing(number);
  };

  return (
    <div className="sidepanel">
      <div className="bar">
        <Bar txt="Data" id={0} toggle={toggle} />
        {!props.worldData && props.body.attributes.Theme !== "Topo Map" && (
          <Bar txt="Analysis" id={1} toggle={toggle} />
        )}
        {!props.worldData && <Bar txt="Layers" id={2} toggle={toggle} />}
        <Bar txt="Metadata" id={3} toggle={toggle} />
        <Bar txt="Export" id={4} toggle={toggle} />
      </div>
      {show && (
        <>
          <div className="Popup">
            <i
              onClick={() => {
                toggle();
              }}
              className="fa fa-close"
            >
              &#xf00d;
            </i>
            {showing === 0 && !props.update && (
              <>
                {props.body.attributes.Theme === "Utility Network" ||
                props.body.attributes.Theme === "Sewer Network" ? (
                  <DataTopo body={props.body} updateBody={props.updateBody} />
                ) : (
                  <Data body={props.body} updateBody={props.updateBody} />
                )}
              </>
            )}
            {showing === 1 && (
              <Charts body={props.body} updateBody={props.updateBody} />
            )}
            {showing === 2 && (
              <>
                {props.body.attributes.Theme !== "Utility Network" ||
                props.body.attributes.Theme === "Sewer Network" ? (
                  <Styles
                    body={props.body}
                    updateBody={props.updateBody}
                    openStyler={openStyler}
                  />
                ) : (
                  <Layers body={props.body} updateBody={props.updateBody} />
                )}
              </>
            )}
            {showing === 3 && (
              <Metadata body={props.body} updateBody={props.updateBody} />
            )}
            {showing === 4 && (
              <Export body={props.body} updateBody={props.updateBody} />
            )}
          </div>
          {props.body.styles?.length > 0 && styler != null && (
            <MyStyler
              body={props.body}
              updateBody={props.updateBody}
              index={styler}
              openStyler={openStyler}
            />
          )}
        </>
      )}
    </div>
  );
}
