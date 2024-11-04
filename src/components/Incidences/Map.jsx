import { useEffect } from "react";
import { useState } from "react";
import $ from "jquery";
// openlayers
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { useRef } from "react";
import { Cluster, OSM } from "ol/source";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import RippleLoading from "../Util/RippleLoading";
import { Text } from "ol/style";
import Overlay from "ol/Overlay";
import GeoJSON from "ol/format/GeoJSON";
import { asArray } from "ol/color";
import Popup from "../Map/Popup";
import TileWMS from "ol/source/TileWMS";
import { Heatmap as HeatmapLayer } from "ol/layer";
import XYZ from "ol/source/XYZ";
import Graticule from "ol/layer/Graticule";
import {
  ScaleLine,
  ZoomToExtent,
  defaults as defaultControls,
} from "ol/control";
import myData from "../../assets/data/data";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#003865",
  "#FF8042",
  "#7A4069",
  "#EAE509",
  "#5800FF",
  "#00D7FF",
  "#7DCE13",
  "#EF5B0C",
  "#A6D1E6",
  "#E8AA42",
  "#F637EC",
];

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

const Basemap = (props) => {
  useEffect(() => {
    if (props.selected === props.index) {
      props.layer.setSource(
        new XYZ({
          url: props.url,
          crossOrigin: "Anonymous",
        })
      );
    }
  }, [props.selected]);

  return (
    <div className="item">
      <input
        type="checkbox"
        onChange={(e) => {
          props.setSelected(props.index);
        }}
        name=""
        id=""
        checked={props.selected === props.index ? true : false}
      />
      <label htmlFor="">{props.label}</label>
    </div>
  );
};

const Analysis = (props) => {
  return (
    <select
      onChange={(e) => {
        props.setAnalysis(e.target.value);
      }}
    >
      {props.data.map((item, index) => {
        return (
          <option value={item} key={index}>
            {item}
          </option>
        );
      })}
    </select>
  );
};

export default function MyMap(props) {
  const [loading, setLoading] = useState(false);
  const [showing, setShowing] = useState([]);
  const [many, setMany] = useState({ data: null, count: 0 });
  const [single, setSingle] = useState(null);
  const [vector, setVector] = useState(null);
  const [analysis, setAnalysis] = useState("Regular");
  const [basemap, setBasemap] = useState(new TileLayer());
  const [subcounty, setSubCounty] = useState(
    new VectorLayer({ title: "subcounties" })
  );
  const [selected, setSelected] = useState(0);
  const [ward, setWard] = useState(new VectorLayer({ title: "wards" }));
  const [reports, setReports] = useState(new VectorLayer({ title: "reports" }));
  const [graticule, setGraticule] = useState(
    new Graticule({
      // the style to use for the lines, optional.
      strokeStyle: new Stroke({
        color: "rgba(0,0,0,0.5)",
        width: 2,
        lineDash: [0.5, 8],
      }),
      showLabels: true,
      wrapX: false,
    })
  );
  //set initial state
  const [map, setMap] = useState(null);
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  const tooltip = useRef();

  const popup = new Overlay({
    element: tooltip.current,
  });

  useEffect(() => {
    const initialMap = new Map({
      target: mapElement.current,
      layers: [basemap, ward, subcounty, reports, graticule],
      view: new View({
        projection: "EPSG:4326",
        center: [36.45, -0.1],
        zoom: 12,
        maxZoom: 20,
      }),
      controls: defaultControls().extend([
        new ZoomToExtent({
          extent: [34.36168, 0.41839, 35.06887, 1.14702],
        }),
        new ScaleLine({
          units: "metric",
          bar: true,
          steps: 2,
          text: "Scale",
          minWidth: 64,
        }),
      ]),
    });

    initialMap.addOverlay(popup);

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
        if (feature[0]?.values_?.features) {
          if (feature[0]?.length > 1) {
            let m = [];
            feature[0]?.values_?.features?.map((item, index) => {
              if (index < 5) {
                m.push({
                  Date: item.values_.Date,
                  Image: item.values_.Image,
                  Type: item.values_.Type,
                  Description: item.values_.Description,
                  SerialNo: item.values_.SerialNo,
                  Status: item.values_.Status,
                });
              }
            });
            let d = many;
            d.data = m;
            d.count = feature[0]?.values_?.features?.length;
            setMany(d);
            let s = [event.pixel[1], event.pixel[0]];
            setShowing(s);
          } else {
  
            let dd = {
              Date: feature[0]?.values_?.features[0].values_?.Date,
              Image: feature[0]?.values_?.features[0].values_?.Image,
              Type: feature[0]?.values_?.features[0].values_?.Type,
              Location: feature[0]?.values_?.features[0].Location,
              Route: feature[0]?.values_?.features[0].Route,
              Name: feature[0]?.values_?.features[0].Name,
              Description:
                feature[0]?.values_?.features[0].values_?.Description,
              SerialNo: feature[0]?.values_?.features[0].values_?.SerialNo,
              Status: feature[0]?.values_?.features[0].values_?.Status,
            };

            setSingle(dd);
            let s = [event.pixel[1], event.pixel[0]];
            if (showing?.length === 0) {
              setShowing(s);
            }
          }
        } else {
        
          let dd = {
            Date: feature[0]?.values_?.Date,
            Image: feature[0]?.values_?.Image,
            Type: feature[0]?.values_?.Type,
            Name: feature[0]?.values_?.Name,
            Location: feature[0]?.values_?.Location,
            Route: feature[0]?.values_?.Route,
            Description: feature[0]?.values_?.Description,
            SerialNo: feature[0]?.values_?.SerialNo,
            Status: feature[0]?.values_?.Status,
          };
          setSingle(dd);
          let s = [event.pixel[1], event.pixel[0]];
          if (showing?.length === 0) {
            setShowing(s);
          }
        }
      }
    });

    setMap(initialMap);
    return () => {
      initialMap.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (map) {
      map.updateSize();
    }
  }, [props.fullscreen]);

  useEffect(async () => {
    if (map) {
      loadMapData();
    }
  }, [map]);

  useEffect(() => {
    setAnalysis("Regular");
    if (props.filter !== "reset") {
      if (props.filter && props.filter !== "empty") {
        const source = new VectorSource({
          features: props.filter,
        });

        setVector(source);
        reports.setSource(new VectorSource());
        reports.setSource(vector);
        reports.setStyle(regularreportStyle);

        map.getView().fit(source?.getExtent(), {
          padding: [100, 100, 100, 100],
        });
      } else {
        reports.setSource(new VectorSource());
        setVector(new VectorSource());
      }
    } else {
      loadMapData();
    }
  }, [props.filter]);

  useEffect(() => {
    if (vector) {
      if (analysis === "Cluster") {
        reports.setSource(new VectorSource());
        const clusterSource = new Cluster({
          distance: parseInt(100, 10),
          minDistance: parseInt(0, 10),
          source: vector,
        });

        reports.setSource(clusterSource);
        reports.setStyle(reportStyle);
        map.getLayers().forEach((layer) => {
          if (layer && layer.get("title") === "Heatmap") {
            map.removeLayer(layer);
          }
        });
      } else if (analysis === "Regular") {
        reports.setSource(new VectorSource());
        reports.setSource(vector);
        reports.setStyle(regularreportStyle);
        map.getLayers().forEach((layer) => {
          if (layer && layer.get("title") === "Heatmap") {
            map.removeLayer(layer);
          }
        });
      } else if (analysis === "Heatmap") {
        reports.setSource(new VectorSource());
        updateHeatmap(map, vector);
      } else if (analysis === "Type") {
        reports.setSource(new VectorSource());
        reports.setSource(vector);
        reports.setStyle(typeReportStyle);
        map.getLayers().forEach((layer) => {
          if (layer && layer.get("title") === "Heatmap") {
            map.removeLayer(layer);
          }
        });
      }
    }
  }, [analysis]);

  const updateHeatmap = (map, vector) => {
    if (map) {
      map?.getLayers()?.forEach((layer) => {
        if (layer && layer.get("title") === "Heatmap") {
          map.removeLayer(layer);
        }
      });
      var blur = 20;
      var radius = 10;

      var heatmaplayer = new HeatmapLayer({
        title: "Heatmap",
        source: vector,
        blur: blur,
        radius: radius,
        weight: function (feature) {
          return 10;
        },
      });
      map.addLayer(heatmaplayer);
    }
  };

  function reportStyle(feature) {
    const styleCache = {};
    let size = feature?.values_?.features?.length;
    let style = styleCache[size];
    if (!style) {
      if (size === 1) {
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
        style = new Style({
          image: new CircleStyle({
            radius: 10,
            stroke: new Stroke({
              color: "#fff",
              width: 3,
            }),
            fill: new Fill({
              color: color,
            }),
          }),
        });
        styleCache[size] = style;
      } else {
        let r = Math.ceil(size / 5);
        if (r < 10) r = 10;
        else if (r > 40) r = 40;
        style = new Style({
          image: new CircleStyle({
            radius: r,
            stroke: new Stroke({
              color: getColor(),
              width: 3,
            }),
            fill: new Fill({
              color: "#00D7FF",
            }),
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: "#fff",
            }),
          }),
        });
        styleCache[size] = style;
      }
    }
    return style;
  }

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
        radius: 10,
        stroke: new Stroke({
          color: "#fff",
          width: 1,
        }),
        fill: new Fill({
          color: color,
        }),
      }),
    });
    return style;
  }

  function typeReportStyle(feature) {
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
        radius: 10,
        stroke: new Stroke({
          color: "#fff",
          width: 1,
        }),
        fill: new Fill({
          color: color,
        }),
      }),
    });
    return style;
  }

  function getColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const loadMapData = () => {
    setLoading(true);
    fetch("/api/reports")
      .then((res) => {
        if (res.ok) return res.json();
        else throw Error("");
      })
      .then((data) => {
        setLoading(false);

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
              Description: item.Description,
              Name: item.Name,
              Location: item.Location,
              Route: item.Route,
              SerialNo: item.SerialNo,
              Status: item.Status,
              ReportedBy: item.ReportedBy,
              AssignedTo: item.AssignedTo,
            })
          );
        });

        const source = new VectorSource({
          features: points,
        });

        setVector(source);

        reports.setSource(new VectorSource());
        reports.setSource(source);
        reports.setStyle(regularreportStyle);
        map.getView().fit(source.getExtent(), {
          padding: [100, 100, 100, 100],
        });
      })
      .catch((e) => {
        setLoading(false);
      });
  };

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
      link.setAttribute("download", "map.png");
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
        "Location",
        "Route",
        "Longitude",
        "Latitude",
      ],
    ];
    vector?.getFeatures()?.map((item) => {

      rows.push([
        item?.values_?.SerialNo,
        item?.values_?.Type,
        item?.values_?.Date,
        item?.values_?.ReportedBy,
        item?.values_?.Description,
        item?.values_?.AssignedTo,
        item?.values_?.Status,
        item?.values_?.Location,
        item?.values_?.Route,
        item?.values_?.geometry?.flatCoordinates[0],
        item?.values_?.geometry?.flatCoordinates[1],
      ]);
    });

    let csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mapdata.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="mp">
      <div ref={mapElement} className="map-container"></div>
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
      <div className="analyses">
        <Analysis
          data={["Regular", "Cluster", "Heatmap", "Type"]}
          setAnalysis={setAnalysis}
          active={analysis}
        />
      </div>

      <Layers
        basemap={basemap}
        setBasemap={setBasemap}
        selected={selected}
        setSelected={setSelected}
        graticule={graticule}
        ward={ward}
        subcounty={subcounty}
        reports={reports}
        current={props.current}
      />

      {analysis === "Regular" && <LegendRegular />}
      {analysis === "Cluster" && <LegendGroup />}
      {analysis === "Heatmap" && <LegendHeatmap />}
      {analysis === "Type" && <LegendType />}
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
  );
}

const LegendGroup = (props) => {
  return (
    <div className="legend">
      <h4 style={{ padding: "3px" }}>Legend</h4>
      <div className="cwrap">
        <div className="circle"></div>
        <p>Cluster of reports</p>
      </div>
    </div>
  );
};

const LegendRegular = (props) => {
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
};

const LegendHeatmap = (props) => {
  return (
    <div className="legend">
      <h4 style={{ padding: "3px" }}>Legend</h4>
      <div className="hwrap">
        <div className="circle"></div>
        <p>High to low concentration</p>
      </div>
    </div>
  );
};

const LegendType = (props) => {
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
};

const Layers = (props) => {
  const [display, setDisplay] = useState("none");
  return (
    <div
      className="layers"
      onMouseOut={() => {
        setDisplay("none");
      }}
      onMouseOver={() => {
        setDisplay("block");
      }}
    >
      <h3>
        Map Layers <i className="fa fa-angle-down"></i>
      </h3>
      <div className="container" style={{ display: display }}>
        <h4>Basemap</h4>
        <div className="basemaps">
          {myData.map((item, index) => {
            return (
              <Basemap
                key={index}
                index={index}
                label={item.name}
                layer={props.basemap}
                setLayer={props.setBasemap}
                url={item.url}
                selected={props.selected}
                setSelected={props.setSelected}
              />
            );
          })}
        </div>
        <h4>Map Grid</h4>
        <Item label="Graticule" layer={props.graticule} checked={true} />
        <h4>Layers</h4>
        <Item label="Reports" layer={props.reports} checked={true} />
        {props.current === "Progress" && (
          <>
            <h4>Navigation</h4>
            <Item label="ER Teams" layer={props.reports} checked={true} />
            <Item label="Routes" layer={props.reports} checked={true} />
          </>
        )}
      </div>
    </div>
  );
};
