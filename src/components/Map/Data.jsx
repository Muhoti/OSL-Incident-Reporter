import { useEffect, useState } from "react";
import ButtonMain from "../Util/Button";
import $ from "jquery";
import Select from "../Util/Select";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import TileWMS from "ol/source/TileWMS";
import TileLayer from "ol/layer/Tile";
import Circle from "ol/style/Circle";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { get as getProjection } from "ol/proj.js";
import { getTopLeft, getWidth } from "ol/extent.js";
import proj4 from "proj4";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";
import { register } from "ol/proj/proj4.js";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS.js";

export default function Data(props) {
  proj4.defs(
    "EPSG:32737",
    "+proj=utm +zone=37 +south +ellps=WGS84 +units=m +no_defs"
  );
  register(proj4);
  const parser = new WMTSCapabilities();
  const [workspaces, setWorkspaces] = useState([]);
  const [layers, setLayers] = useState([]);
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);

  const proj32737 = getProjection("EPSG:32737");
  proj32737.setExtent([166021.44, 1116915.04, 833978.56, 10000000.0]);
  // const [bounds, setBounds] = useState(null);
  const projection = getProjection("EPSG:900913");
  const projectionExtent = projection.getExtent();
  const size = getWidth(projectionExtent) / 256;
  const resolutions = new Array(14);
  const matrixIds = new Array(14);
  for (let z = 0; z < 14; ++z) {
    resolutions[z] = size / Math.pow(2, z + 1);
    matrixIds[z] = "EPSG:900913:" + z;
  }

  let dataType = "";
  const headers = {
    Authorization: `Basic ${Buffer.from("admin:geoserver", "utf-8").toString(
      "base64"
    )}`,
  };
  useEffect(() => {
    fetch("/api/geoserver/rest/workspaces", {
      credentials: "include",
      headers: headers,
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.workspaces.workspace.length > 0) {
          let list = [];
          data.workspaces.workspace.forEach((item) => {
            list.push(item.name);
          });
          setWorkspaces(list);
          setSelected(list[0]);
        }
      })
      .catch((e) => {});
  }, []);

  useEffect(() => {
    if (selected) {
      fetch(`/api/geoserver/rest/workspaces/${selected}/layers`, {
        credentials: "include",
        headers: headers,
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          if (data.layers !== "" && data.layers.layer.length > 0) {
            let list = [];
            data.layers.layer.forEach((item) => {
              list.push(item.name);
            });
            setLayers(list);
            setData(data.layers.layer);
            setSelectedLayer(list[0]);
          }
        })
        .catch((e) => {});
    }
  }, [selected]);

  async function addToMap(workspace, layer) {
    if (selected === null && selectedLayer === null) return;

    const i = data
      .map((e) => {
        return e.name;
      })
      .indexOf(selectedLayer);

    if (i !== -1) {
      props.setIsLoading(true);
      try {
        const dt = await fetch(
          data[i].href
            .replace("http://geoserver:8080", "")
            .replaceAll("+", " "),
          {
            credentials: "include",
            headers: headers,
          }
        ).then((res) => {
          if (res.ok) return res.json();
        });
        dataType = dt.layer.type;
      } catch (e) {
        alert("Invalid Layer!");
      }

      if (dataType === "RASTER") {
        fetch(
          encodeURI(
            `/api/geoserver/gwc/service/wmts?REQUEST=GetCapabilities&format=xml`
          ),
          {
            method: "get",
            credentials: "include",
          }
        )
          .then((res) => {
            if (!res.ok) {
              throw Error("Could not fetch messages!!!");
            }
            return res.text();
          })
          .then((text) => {
            const result = parser.read(text);
            const options = optionsFromCapabilities(result, {
              layer: `${workspace}:${layer}`,
              matrixSet: "EPSG:900913",
            });

            const pic = new TileLayer({
              title: layer,
              opacity: 1,
              source: new WMTS(options),
            });
            props.map.addLayer(pic);
            props.map.getView().fit(options.tileGrid.getExtent(), {
              padding: [100, 100, 100, 100],
            });
            let d = props.body;
            d.Data.push({
              url: `${workspace}:${layer}`,
              style: {
                type: "Basic",
                fill: "#000000",
                stroke: "red",
                width: 1,
              },
            });
            props.setBody(d);
            props.setIsLoading(false);
          })
          .catch((e) => {});
      } else if (dataType === "VECTOR") {
        var response = $.ajax({
          url: encodeURI(getUrl(workspace, layer)),
          dataType: "json",
          success: {},
          error: function (xhr) {
            props.setIsLoading(false);
          },
        });
        $.when(response).done(function (data) {
          props.setIsLoading(false);
          if (data.features.length !== 0) {
            const vector = new VectorLayer({
              title: layer,
              source: new VectorSource({
                features: new GeoJSON({}).readFeatures(response.responseJSON, {
                  featureProjection: props.map.getView().getProjection(),
                }),
              }),
            });
            props.setExtent(vector.getSource().getExtent());
            props.map.getView().fit(vector.getSource().getExtent(), {
              padding: [100, 100, 100, 100],
            });
            vector.setStyle(fillStyle);
            props.map.addLayer(vector);
            let d = props.body;
            d.Data.push({
              url: `${workspace}:${layer}`,
              style: {
                type: "Basic",
                fill: "#F0A04B",
                stroke: "#3A98B9",
                width: 1,
              },
            });
            props.setBody(d);
          }
        });
      } else props.setIsLoading(false);
    }
  }

  function getUrl(workspace, layer) {
    return `/api/geoserver/${workspace}/wfs?request=GetFeature&version=1.0.0&typeName=${workspace}:${layer}&outputFormat=json`;
  }

  const getSelected = (value) => {
    setSelected(value);
  };

  const getSelectedLayer = (value) => {
    setSelectedLayer(value);
  };

  function fillStyle() {
    return new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: "#F0A04B",
        }),
        stroke: new Stroke({
          color: "#3A98B9",
          width: 1,
        }),
      }),
      fill: new Fill({
        color: "#F0A04B",
      }),
      stroke: new Stroke({
        color: "#3A98B9",
        width: 1,
      }),
    });
  }

  return (
    <div className="data_popup">
      <div className="dat_cont">
        <h3>Load data</h3>
        <hr />
        <Select
          data={workspaces}
          getSelected={getSelected}
          label="Select Workspace"
        />
        <Select
          data={layers}
          getSelected={getSelectedLayer}
          label="Select Layer"
        />
        <ButtonMain
          handleClick={() => {
            addToMap(selected, selectedLayer);
          }}
          label="Add to Map"
        />
        <i
          onClick={() => {
            props.setDataSelector(null);
          }}
          className="fa fa-close"
        >
          &#xf00d;
        </i>
      </div>
    </div>
  );
}
