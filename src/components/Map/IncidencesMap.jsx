import $ from "jquery";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Map from "ol/Map";
import { useState, useRef, useEffect } from "react";
import { Cluster, TileWMS, XYZ } from "ol/source";
import { ZoomToExtent, defaults as defaultControls } from "ol/control";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { asArray } from "ol/color";
import Overlay from "ol/Overlay";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import RippleLoading from "../Util/RippleLoading";
import { Text } from "ol/style";
import Popup from "./Popup";
import myData from "../../assets/data/data";
import Graticule from "ol/layer/Graticule";

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

export default function Maps(props) {
  const colors = props.colors;
  const [map, setMap] = useState();
  const [featuresLayer, setFeaturesLayer] = useState();
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(false);
  const [legendItems, setLegendItems] = useState([]);
  const [legendItemsStyles, setLegendItemsStyles] = useState([]);
  const tooltip = useRef();
  const [showing, setShowing] = useState([]);
  const [many, setMany] = useState({ data: null, count: 0 });
  const [single, setSingle] = useState(null);
  const [vector, setVector] = useState(null);
  const [offset, setOffset] = useState(0);

  const [basemap, setBasemap] = useState(new TileLayer());
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
  const [vLayer, setVLayer] = useState(new VectorLayer({ title: "vLayer" }));

  const [reports, setReports] = useState(new VectorLayer({ title: "reports" }));
  const [selected, setSelected] = useState(0);

  const popup = new Overlay({
    element: tooltip.current,
  });

  let legItems = [];
  let legItemsStyles = [];

  useEffect(() => {
    const baselayer = new TileLayer({
      source: new XYZ({
        url:
          "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}" +
          "?access_token=pk.eyJ1IjoiZ2F0aG9nbzEiLCJhIjoiY2t0djhndnB4MGkzdDJucDg2bW5uNXNrcyJ9.mnbTMXxDrdYnTrb8Gr7_MA",
      }),
    });

    const Landmarks = new TileLayer({
      extent: [
        37.05507278442383, -0.558377325534821, 37.19850540161133,
        -0.367469221353531,
      ],
      source: new TileWMS({
        url: "/api/geoserver/Mathira/wms",
        params: { LAYERS: "Mathira:Landmarks", TILED: true },
        serverType: "geoserver",
        transition: 0,
      }),
    });

    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource(),
    });

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [basemap, Landmarks, initalFeaturesLayer, vLayer, reports],
      view: new View({
        projection: "EPSG:4326",
        center: [37.1274, -0.4832],
        zoom: props.zoomextend,
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
        if (feature[0]?.values_?.features?.length > 1) {
          let m = [];
          for (let count = 0; count < 5; count++) {
            m.push({
              Type: feature[0]?.values_?.features[count]?.values_?.Type,
              Description:
                feature[0]?.values_?.features[count]?.values_?.Description,
              Image: feature[0]?.values_?.features[count]?.values_?.Image,
              Date: feature[0]?.values_?.features[count]?.values_?.Date,
              Status: feature[0]?.values_?.features[count]?.values_?.Status,
              SerialNo: feature[0]?.values_?.features[count]?.values_?.SerialNo,
            });
          }

          let d = many;
          d.data = m;
          d.count = feature[0]?.values_.features.length;
          setMany(d);
          let s = [event.pixel[1], event.pixel[0]];
          if (showing.length === 0) {
            setShowing(s);
          }
        } else {
          setSingle({
            Type: feature[0]?.values_?.Type,
            Description: feature[0]?.values_?.Description,
            Image: feature[0]?.values_?.Image,
            Date: feature[0]?.values_?.Date,
            Status: feature[0]?.values_?.Status,
            SerialNo: feature[0]?.values_?.SerialNo,
          });
          let s = [event.pixel[1], event.pixel[0]];
          if (showing.length === 0) {
            setShowing(s);
          }
        }
      }
    });

    setMap(initialMap);
    setFeaturesLayer(initalFeaturesLayer);
     return () => {
       initialMap.setTarget(null);
     };
  }, []);

  useEffect(() => {
    if (map) {
      map.getView().fit(vector.getExtent(), {
        padding: props.mapPadding,
      });
    }
  }, [props.mapPadding]);

  useEffect(() => {
    if (map) {
      loadMapData()
        .then((res) => {
          if (res.ok) return res.json();
          else throw Error("");
        })
        .then((data) => {
          if (data.layers != "" && data.layers.layer.length > 0) {
            let d = [];
            for (let i = data.layers.layer.length; i > 0; i--) {
              setIndex(i);
              loadLayer(data.layers.layer[i - 1].name, colors[i]);
              d.push({ name: data.layers.layer[i - 1].name, color: colors[i] });
            }
            setLegendItems(d);
          }
        })
        .catch((e) => {});
    }
  }, [map]);

  useEffect(() => {
    if (vector) {
      reports.setSource(new VectorSource());
      reports.setSource(vector);
      reports.setStyle(reportsStyle);
      map.getLayers().forEach((layer) => {
        if (layer && layer.get("title") === "Heatmap") {
          map.removeLayer(layer);
        }
      });
    }
  }, []);

  function reportsStyle(feature) {
    const styleCache = {};
    let size = feature?.values_?.features?.length;
    let style = styleCache[size];
    if (!style) {
      if (size === 1) {
        style = new Style({
          image: new CircleStyle({
            radius: 10,
            stroke: new Stroke({
              color: "#fff",
              width: 3,
            }),
            fill: new Fill({
              color: "#5BB318",
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
    fetch(`/api/reports/type/${props.type}`)
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
        reports.setStyle(reportsTypeStyle);
        map.getView().fit(source.getExtent(), {
          padding: props.mapPadding,
        });
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  function reportsTypeStyle(feature) {
    let color = "blue";
    let type = feature.values_.Status;
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

  async function loadLayer(layer, color) {
    setLoading(true);
    legItems.push(layer);
    var wrd = await $.ajax({
      url: getUrl(layer),
      dataType: "json",
      success: {},
      error: function (xhr) {},
    });
    $.when(wrd).done(function (data) {
      let vLayer = new VectorLayer();

      const source = new VectorSource({
        features: new GeoJSON({}).readFeatures(data),
      });
      if (data?.features[0].geometry.type === "MultiPoint") {
        let f = [];
        data?.features?.forEach((item) => {
          f.push(
            new Feature({
              geometry: new Point([
                parseFloat(item?.geometry?.coordinates[0][0]),
                parseFloat(item?.geometry?.coordinates[0][1]),
              ]),
              Name: item?.properties?.name,
              MeterNo: item?.properties?.meterno,
              CurrentBal: item?.properties?.currentbal,
              ConnectionStatus: item?.properties?.connstatus,
              Location: item?.properties?.location,
              Material: item?.properties?.material,
            })
          );
        });
        const psource = new VectorSource({
          features: f,
        });
        const clusterSource = new Cluster({
          distance: parseInt(50, 10),
          minDistance: parseInt(0, 10),
          source: psource,
        });
        // vLayer.setSource(new VectorSource());
        vLayer.setSource(clusterSource);
        vLayer.setStyle(function (feature) {
          const styleCache = {};
          let size = feature.values_.features.length;
          let style = styleCache[size];
          if (!style) {
            if (size === 1) {
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
                    color: "#fff",
                    width: 3,
                  }),
                  fill: new Fill({
                    color: color,
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
        });

        setLoading(false);
      } else {
        vLayer = new VectorLayer({
          source: source,
          style: function (feature) {
            const style = new Style({
              fill: new Fill({
                color: color,
              }),
              stroke: new Stroke({
                color: getRandomColor(),
                width: 2,
              }),
            });

            legItemsStyles.push(style.stroke_["color_"]);
            return style;
          },
        });
      }
      setLegendItemsStyles(legItemsStyles);
      setLoading(false);
      map.addLayer(vLayer);
    });
  }

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function getUrl(url) {
    return `/api/geoserver/${props.url}/wfs?request=GetFeature&version=1.0.0&typeName=${props.url}:${url}&outputFormat=json`;
  }

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
        item?.values_?.SerialNo,
        item?.values_?.Type,
        item?.values_?.Date,
        item?.values_?.ReportedBy,
        item?.values_?.Description,
        item?.values_?.AssignedTo,
        item?.values_?.Status,
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

  return (
    <div className="maps">
      <div className="wrapper">
        <div
          ref={mapElement}
          style={{ width: "100%", height: "100%" }}
          id="map"
        ></div>
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

        <LegendRegular />

        {showing?.length > 0 && (
          <Popup
            many={many}
            single={single}
            top={showing[0]}
            left={showing[1]}
            current="incidences"
          />
        )}
        <Layers
          basemap={basemap}
          setBasemap={setBasemap}
          selected={selected}
          setSelected={setSelected}
          graticule={graticule}
          incidences={reports}
          utilities={reports}
          sewer={reports}
        />
        {loading && <RippleLoading />}
      </div>
    </div>
  );
}

const LegendRegular = (props) => {
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
        <h4>Layers</h4>
        <Item label="Incidences" layer={props.incidences} checked={true} />
      </div>
    </div>
  );
};
