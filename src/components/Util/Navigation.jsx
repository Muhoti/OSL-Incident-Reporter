import { useEffect, useLayoutEffect, useRef, useState } from "react";
import logo from "../../assets/imgs/logo.png";
import { useLocation } from "react-router-dom";

export default function Navigation(props) {
  const [refresh, setRefresh] = useState(false);
  const [scroll, setScroll] = useState(false);
  const bot = useRef();
  const top = useRef();

  const scrollToTarget = (value) => {
    if (!value) {
      top.current.scrollIntoView({ behavior: "smooth" });
      setScroll(false);
    } else {
      setScroll(true);
      bot.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const Item = (params) => {
    const [showing, setShowing] = useState(false);

    const [active, setActive] = useState("");
    const location = useLocation();

    useEffect(() => {
      const pathname = location.pathname.split("/");
      setActive(pathname[pathname.length - 1]);
      if (params.options.includes(pathname[pathname.length - 1])) {
        setShowing(true);
      }
    }, [refresh]);

    return (
      <div
        style={{
          backgroundColor: showing ? "#60606010" : "transparent",
        }}
        onMouseLeave={() => {
          setRefresh(!refresh);
        }}
      >
        <div
          onClick={() => {
            setShowing(true);
            if (params.options.length === 0) {
              window.location.href = params.url;
            }
            if (params.url == "/logout") {
              localStorage.clear();
              window.location.href = "/login";
            }
          }}
          className="item"
          style={{
            padding: params.showing ? "1em" : "5x 0 5px 0",
            gridTemplateColumns: params.showing ? "auto 1fr auto" : "auto",
          }}
        >
          <i aria-hidden="true" className={"fa " + params.icon}>
            {params.code}
          </i>
          {params.showing && (
            <p
              style={{
                color:
                  active.toLowerCase() == params.txt.toLowerCase()
                    ? "#1a626b"
                    : params.txt == "Home" && active == ""
                    ? "#1a626b"
                    : "gray",
              }}
            >
              {params.txt}
            </p>
          )}
          {params.options.length > 0 && params.showing && (
            <i className="fa fa-angle-right"></i>
          )}
        </div>
        {showing &&
          params.options.length > 0 &&
          params.options.map((item, i) => {
            return (
              <a
                key={i}
                style={{ color: active == item ? "#1a626b" : "gray" }}
                onClick={() => {
                  setRefresh(!refresh);
                  window.location.href = params.url + "/" + item;
                }}
              >
                {item}
              </a>
            );
          })}
      </div>
    );
  };

  var jwt = require("jsonwebtoken");

  const token = localStorage.getItem("gdfhgfhtkn");
  var decoded = jwt.decode(token);

  const role = decoded?.Role;

  return (
    <div
      style={{ width: props.showing ? "250px" : "fit-content" }}
      className="navigation"
    >
      <div className="nvwrap">
        <p ref={top}></p>
        <div className="logo">
          <img
            style={{ maxWidth: props.showing ? "300px" : "100px" }} // Adjusted sizes
            src={logo}
            alt=""
          />
          {props.showing && (
            <>
              {/* <h3>Utility Manager</h3> */}
              <br />
              <hr />
            </>
          )}
        </div>
        <Item
          url="/"
          txt="Home"
          icon="fa-home"
          options={[]}
          showing={props.showing}
        />
        <Item
          url="/networks"
          txt="Networks"
          icon="fa-share-alt"
          options={["UtilityNetwork", "SewerNetwork", "Projects"]}
          showing={props.showing}
        />
        {role === "Admin" || role === "Management" || role === "Commercial" ? (
          <Item
            txt="Commercial Section"
            url="/billing"
            icon="fa-bars"
            options={["Dashboard", "Customers"]}
            showing={props.showing}
          />
        ) : (
          ""
        )}
        {role === "Admin" || role === "NRW/O&M" ? (
          <Item
            txt="NRW Management"
            url="/incidences"
            icon="fa-exclamation-triangle"
            options={[
              "Statistics",
              "AllIncidences",
              "Leakage",
              "SewerBursts",
              "IllegalConnections",
              "SupplyFail",
              "Vandalism",
              "Other",
              "Reports",
              "Categories",
            ]}
            showing={props.showing}
          />
        ) : (
          ""
        )}
        {role === "Management" ? (
          <Item
            txt="NRW Management"
            url="/incidences"
            icon="fa-exclamation-triangle"
            options={["Statistics", "AllIncidences", "Reports"]}
            showing={props.showing}
          />
        ) : (
          ""
        )}
        {role === "Admin" ? (
          <Item
            txt="Data"
            url="/data"
            icon="fa-address-book"
            options={[
              "Connections",
              "Tanks",
              "Valves",
              "MasterMeters",
              "Washouts",
              "Manholes",
              "Projects",
            ]}
            showing={props.showing}
          />
        ) : (
          ""
        )}
        {role === "Admin" ? (
          <Item
            txt="Users"
            url="/users"
            icon="fa-user-circle"
            options={[]}
            showing={props.showing}
          />
        ) : (
          ""
        )}
        {/* {role === "Admin" ? (
          <Item
            txt="Mobile Users"
            url="/mobile"
            icon="fa-user"
            options={["Users", "New"]}
            showing={props.showing}
          />
        ) : (
          ""
        )}
        {role === "Admin" ? (
          <Item
            txt="Public Users"
            url="/public"
            icon="fa-user"
            options={["Users"]}
            showing={props.showing}
          />
        ) : (
          ""
        )} */}
        <Item
          txt="Settings"
          url="/settings"
          icon="fa-gear"
          code="&#xf013;"
          options={[]}
          showing={props.showing}
        />
        <Item
          txt="Logout"
          icon="fa-lock"
          url="/logout"
          options={[]}
          showing={props.showing}
        />
        <br />
        <br />
        <br />
        <p ref={bot}></p>
      </div>
      <div
        onClick={() => {
          if (scroll) {
            scrollToTarget(false);
          } else {
            scrollToTarget(true);
          }
        }}
        className="bottom"
      >
        <i
          className={
            scroll ? "fa  fa-angle-double-up" : "fa  fa-angle-double-down"
          }
        ></i>
      </div>
    </div>
  );
}
