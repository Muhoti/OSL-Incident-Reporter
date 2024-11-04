import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Map from "ol/Map";
import { useState, useRef, useEffect } from "react";
import { TileWMS, OSM, XYZ } from "ol/source";
import { ZoomToExtent, defaults as defaultControls } from "ol/control";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import RippleLoading from "../Util/RippleLoading";
import myData from "../../assets/data/data";
import Analysis from "./Analysis";
import Popup from "../Map/Popup";
import { Layers, Satellite, Terrain } from "@mui/icons-material";

import {
  Checkbox,
  Box,
  Typography,
  Card,
  Divider,
  Paper,
  List,
  ListItem,
  ButtonGroup,
  Button,
  CircularProgress,
} from "@mui/material";

export default function ReportsMap(props) {
  const [data, setData] = useState(null);
  const [total, setTotal] = useState();
  const [map, setMap] = useState();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [incidences, setIncidences] = useState(
    new VectorLayer({ title: "Incidences" })
  );
  const [refresh, setRefresh] = useState(false);
  const [showing, setShowing] = useState([]);
  const [many, setMany] = useState({ data: null, count: 0 });
  const [single, setSingle] = useState(null);
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  const [vector, setVector] = useState(null);
  const pathname = window.location.href.split("/")[4];
  const [activeBasemap, setActiveBasemap] = useState("OSM");

  const toggleBasemap = (label) => {
    setActiveBasemap(label);
    basemaps.forEach((basemap) => {
      basemap.layer.setVisible(basemap.label === label);
    });
  };

  useEffect(() => {
    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
          title: "OSM",
          visible: true,
        }),
        incidences,
      ],
      view: new View({
        projection: "EPSG:4326",
        center: [37.1274, -0.4832],
        zoom: 12,
        maxZoom: 18,
      }),
      controls: defaultControls().extend([
        new ZoomToExtent({
          extent: [
            813079.7791264898, 5929220.284081122, 848966.9639063801,
            5936863.986909639,
          ],
        }),
      ]),
    });

    initialMap.on("moveend", function (e) {
      setShowing([]);
      setMany({ data: null, count: null });
      setSingle(null);
    });

    initialMap?.on("singleclick", function (event) {
      setShowing([]);
      setMany({ data: null, count: null });
      setSingle(null);
      var feature = initialMap.getFeaturesAtPixel(event.pixel);
      if (feature?.length > 0) {
        setSingle({
          Type: feature[0]?.values_?.Type,
          Description: feature[0]?.values_?.Description,
          Location: feature[0]?.values_?.Location,
          Route: feature[0]?.values_?.Route,
          Name: feature[0]?.values_?.Name,
          Image: feature[0]?.values_?.Image,
          ReportedBy: feature[0]?.values_?.ReportedBy,
          ReporterType: feature[0]?.values_?.ReporterType,
          Date: feature[0]?.values_?.Date,
          AssignedTo: feature[0]?.values_?.AssignedTo,
          Status: feature[0]?.values_?.Status,
          SerialNo: feature[0]?.values_?.SerialNo,
          ID: feature[0]?.values_?.ID,
        });
        let s = [event.pixel[1], event.pixel[0]];
        if (showing.length === 0) {
          setShowing(s);
        }
      }
    });

    setMap(initialMap);
    return () => {
      initialMap.setTarget(null);
    };
  }, []);

  useEffect(() => {
    let url = props.url;
    if (props.url === "leaks") url = "Leakage";
    else if (props.url === "bursts") url = "Sewer Bursts";
    else if (props.url === "supply%20fail") url = "Supply Fail";
    else if (props.url === "illegal%20connections") url = "Illegal Connections";
    if (map) {
      loadMapData(props.url);
    }
  }, [map, refresh]);

  const loadMapData = (url) => {
    setLoading(true);
    if (url === "all") {
      fetch("/api/reports")
        .then((res) => {
          if (res.ok) return res.json();
          else throw Error("");
        })
        .then((data) => {
          setLoading(false);
          let points = [];
          data?.data?.forEach((item) => {
            points.push(
              new Feature({
                geometry: new Point([
                  parseFloat(item.Longitude),
                  parseFloat(item.Latitude),
                ]),
                Date: item.DateReported,
                Image: item.Image,
                Type: item.Type,
                Description: item.Description,
                Name: item.Name,
                Location: item.Location,
                Route: item.Route,
                SerialNo: item.SerialNo,
                Status: item.Status,
                ReportedBy: item.ReportedBy,
                ReporterType: item.ReporterType,
                AssignedTo: item.AssignedTo,
              })
            );
          });

          const source = new VectorSource({
            features: points,
          });

          setVector(source);

          incidences.setSource(new VectorSource());
          incidences.setSource(source);
          incidences.setStyle(regularreportStyle);
          map.getView().fit(source.getExtent(), {
            padding: [100, 100, 100, 100],
          });
        })
        .catch((e) => {
          setLoading(false);
        });
    } else {
      fetch(`/api/reports/joined/${url}`)
        .then((res) => {
          if (res.status === 200) return res.json();
          else throw Error("");
        })
        .then((data) => {
          setLoading(false);
          if (data?.length > 0) {
            let points = [];
            data?.forEach((item) => {

              points.push(
                new Feature({
                  geometry: new Point([
                    parseFloat(item.Longitude),
                    parseFloat(item.Latitude),
                  ]),
                  Date: item.DateReported,
                  Image: item.Image,
                  Type: item.Type,
                  Name: item.Name,
                  Location: item.Location,
                  Route: item.Route,
                  Description: item.Description,
                  SerialNo: item.SerialNo,
                  Status: item.Status,
                  ReportedBy: item.ReportedBy,
                  ReporterType: item.ReporterType,
                  AssignedTo: item.AssignedTo,
                  ID: item.ID,
                })
              );
            });

            const source = new VectorSource({
              features: points,
            });

            setVector(source);

            incidences.setSource(new VectorSource());
            incidences.setSource(source);
            incidences.setStyle(styleReports);
            map.getView().fit(source.getExtent(), {
              padding: [50, 50, 50, 50],
            });
          }
        })
        .catch((e) => {
          setLoading(false);
        });
    }
  };

  function regularreportStyle(feature) {
    let color = "gray";
    switch (feature?.values_?.Type) {
      case "Leakage":
        color = "orange";
        break;
      case "Sewer Burst":
        color = "red";
        break;
      case "Illegal Connection":
        color = "purple";
        break;
      case "Supply Fail":
        color = "blue";
        break;
      case "Vandalism":
        color = "green";
        break;
      case "Other":
        color = "black";
        break;
      default:
        break;
    }
    const style = new Style({
      image: new CircleStyle({
        radius: 8,
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
        fill: new Fill({
          color: color,
        }),
      }),
    });
    return style;
  }

  function styleReports(feature) {
    let color = "blue";
    switch (feature?.values_?.Status) {
      case "In Progress":
        color = "orange";
        break;
      case "Received":
        color = "red";
        break;
      case "Not Resolved":
        color = "blue";
        break;
      case "Resolved":
        color = "green";
        break;
      default:
        break;
    }

    const style = new Style({
      image: new CircleStyle({
        radius: 8,
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
        fill: new Fill({
          color: color,
        }),
      }),
    });
    return style;
  }

  const saveMap = () => {
    map.once("rendercomplete", function () {
      const mapCanvas = document.createElement("canvas");
      const size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext("2d");
      Array.prototype.forEach.call(
        map.getViewport().querySelectorAll(".ol-layer canvas, canvas.ol-layer"),
        function (canvas) {
          if (canvas.width > 0) {
            const opacity =
              canvas.parentNode.style.opacity || canvas.style.opacity;
            mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
            let matrix;
            const transform = canvas.style.transform;
            if (transform) {
              // Get the transform parameters from the style's transform matrix
              matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(",")
                .map(Number);
            } else {
              matrix = [
                parseFloat(canvas.style.width) / canvas.width,
                0,
                0,
                parseFloat(canvas.style.height) / canvas.height,
                0,
                0,
              ];
            }
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix
            );
            const backgroundColor = canvas.parentNode.style.backgroundColor;
            if (backgroundColor) {
              mapContext.fillStyle = backgroundColor;
              mapContext.fillRect(0, 0, canvas.width, canvas.height);
            }
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);

      var link = document.createElement("a");
      link.setAttribute("href", mapCanvas.toDataURL());
      link.setAttribute("download", "Map.png");
      document.body.appendChild(link);
      link.click();
    });
    map.renderSync();
  };

  const saveData = () => {
    let rows = [
      [
        "Serial Number",
        "Type",
        "Date Reported",
        "Reported By",
        "Description",
        "AssignedTo",
        "Status",
        "Longitude",
        "Latitude",
      ],
    ];

    vector?.getFeatures()?.map((item) => {
      rows.push([
        `"${item?.values_?.SerialNo}"`,
        `"${item?.values_?.Type}"`,
        `"${item?.values_?.Date}"`,
        `"${item?.values_?.ReportedBy}"`,
        `"${item?.values_?.Description}"`,
        `"${item?.values_?.AssignedTo}"`,
        `"${item?.values_?.Status}"`,
        `"${item?.values_?.geometry?.flatCoordinates[0]}"`,
        `"${item?.values_?.geometry?.flatCoordinates[1]}"`,
      ]);
    });

    let csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Incidences.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={{ marginTop: "10px" }} className="gis">
      <div className="mp">
        <div
          ref={mapElement}
          style={{ width: "100%", height: "100%" }}
          className="map"
        ></div>
        <Box
          sx={{
            position: "absolute",
            bottom: "3rem",
            left: "10px",
            zIndex: 12,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <ButtonGroup orientation="vertical">
            {basemaps.map((basemap, index) => (
              <Button
                key={index}
                onClick={() => toggleBasemap(basemap.label)}
                variant={
                  activeBasemap === basemap.label ? "contained" : "outlined"
                }
              >
                {basemap.icon}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <div className="download">
          <div>
            <a
              onClick={() => {
                saveData();
              }}
              role="button"
            >
              <i className="fa fa-download"></i>Data
            </a>
          </div>
          <div>
            <a
              onClick={() => {
                saveMap();
              }}
              role="button"
            >
              <i className="fa fa-download"></i>Map
            </a>
          </div>
        </div>
        <LegendRegular pathname={pathname} />

        {pathname !== "AllIncidences" && (
          <Analysis
            data={data}
            total={total}
            offset={offset}
            setRefresh={setRefresh}
            refresh={refresh}
            setOffset={setOffset}
            type="Leakage"
            map={map}
          />
        )}

        {showing?.length > 0 && (
          <Popup
            many={many}
            single={single}
            top={showing[0]}
            left={showing[1]}
            current="incidences"
          />
        )}

        {loading && <RippleLoading />}
      </div>
    </div>
  );
}

const LegendRegular = (props) => {
  if (props.pathname === "AllIncidences") {
    return (
      <div className="legend">
        <h4 style={{ padding: "3px" }}>Legend</h4>
        <div className="rwrap">
          <div style={{ backgroundColor: "orange" }} className="circle"></div>
          <p>Leakage</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "blue" }} className="circle"></div>
          <p>Supply Fail</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "purple" }} className="circle"></div>
          <p>Illegal Connection</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "red" }} className="circle"></div>
          <p>Sewer Burst</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "green" }} className="circle"></div>
          <p>Vandalism</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "black" }} className="circle"></div>
          <p>Other</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="legend">
        <h4 style={{ padding: "3px" }}>Legend</h4>
        <div className="rwrap">
          <div style={{ backgroundColor: "orange" }} className="circle"></div>
          <p>In Progress</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "red" }} className="circle"></div>
          <p>Received</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "blue" }} className="circle"></div>
          <p>Not Resolved</p>
        </div>
        <div className="rwrap">
          <div style={{ backgroundColor: "green" }} className="circle"></div>
          <p>Resolved</p>
        </div>
      </div>
    );
  }
};

const Item = (props) => {
  const [checked, setChecked] = useState(props.checked);

  useEffect(() => {
    props.layer.setVisible(props.checked);
  }, []);

  return (
    <div className="item">
      <input
        type="checkbox"
        onChange={(e) => {
          setChecked(e.target.checked);
          props.layer.setVisible(e.target.checked);
        }}
        name=""
        id=""
        checked={checked}
      />
      <label htmlFor="">{props.label}</label>
    </div>
  );
};

const basemaps = [
  {
    label: "OSM",
    layer: new TileLayer({
      source: new OSM(),
      title: "OSM",
      visible: true,
    }),
    icon: <Layers fontSize="small" />,
  },
  {
    label: "Satellite",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/mapServer/tile/{z}/{y}/{x}", // Replace this with a proper Satellite tile URL
      }),
      title: "Satellite",
      visible: false,
    }),
    icon: <Satellite fontSize="small" />,
  },
  {
    label: "Terrain",
    layer: new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/mapServer/tile/{z}/{y}/{x}", // OpenTopoMap
      }),
      title: "Terrain",
      visible: false,
    }),
    icon: <Terrain fontSize="small" />,
  },
];
