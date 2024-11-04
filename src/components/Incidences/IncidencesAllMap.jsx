import Reports from "./ReportsMap";
import "../../Styles/gis.scss";

export default function IncidencesAllMAp(props) {
  return (
    <div className="gis">
      <div className="map">
        <Reports  url={props.url} />
      </div>
    </div>
  );
}
