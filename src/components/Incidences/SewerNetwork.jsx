import Header from "../Components/Util/Header";
import Maps from "../components/Map/AnalysisMap";
import { useEffect, useState } from "react";

export default function Home(props) {
  const [active, setActive] = useState(null);
  const [data, setData] = useState(null);

  return (
    <div className="wrapper">
      <div className="MainContent">
        <Header active="Sewer Network" />
        <div className="home ">
          <Maps url="SewerNetwork" zoomextend="15" />
        </div>
      </div>
    </div>
  );
}
