import Reports from "./ReportsMap";
import Header from "../Util/Header";
import Navigation from "../Util/Navigation";
import LeakagesMap from "./LeakagesMap";
import "../../Styles/incidencesnew.scss";

export default function IncidentsPage(props) {
  const pathname = window.location.href.split("/")[4];

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  return (
    <div className="gis">
      <div className="map">
        <Reports active={pathname} url={props.url} />
      </div>
    </div>
  );
}
