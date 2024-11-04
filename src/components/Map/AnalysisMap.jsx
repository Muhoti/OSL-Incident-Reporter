import $ from "jquery";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Map from "ol/Map";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
import WaveLoading from "../Util/WaveLoading";
import { useState, useRef, useEffect } from "react";
import { Cluster, OSM, XYZ, TileWMS } from "ol/source";
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

export default function Maps(props) {
  let colors = [
    "#241F07",
    "#4D6FA3",
    "#6E4181",
    "#F43FF3",
    "#64A782",
    "#EE496A",
    "#97DF59",
    "#BF1DF3",
    "#491FC6",
    "#703695",
    "#A091CE",
    "#21FFE5",
    "#FA19B6",
    "#E2FC56",
    "#F850DC",
    "#B5FB47",
    "#D36A0A",
    "#71B60D",
    "#286EE1",
    "#13AF16",
    "#657070",
    "#358F69",
    "#994AF2",
    "#C49C62",
    "#4DEF6B",
    "#799DD6",
    "#D4625D",
    "#E6CDE1",
    "#51A09B",
    "#61645E",
  ];
  const [map, setMap] = useState();
  const [featuresLayer, setFeaturesLayer] = useState();
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  const [loading, setLoading] = useState(false);
  const [waveLoading, setWaveLoading] = useState(false);
  const [index, setIndex] = useState(false);
  const [legendItems, setLegendItems] = useState([]);
  const [legendItemsStyles, setLegendItemsStyles] = useState([]);
  const tooltip = useRef();
  const [showing, setShowing] = useState([]);
  const [many, setMany] = useState({ data: null, count: 0 });
  const [single, setSingle] = useState(null);
  const [vector, setVector] = useState(null);
  const [cluster, setCluster] = useState(null);
  const [analysis, setAnalysis] = useState("Regular");
  const [vLayer, setVLayer] = useState(
    new VectorLayer({ title: "vLayer", name: "vName" })
  );

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
      layers: [baselayer, Landmarks, initalFeaturesLayer],
      view: new View({
        projection: "EPSG:4326",
        center: [37.1274, -0.4832],
        zoom: props.zoomextend,
      }),
      controls: defaultControls().extend([
        new ZoomToExtent({
          extent: [
            37.05507278442383, -0.558377325534821, 37.19850540161133,
            -0.367469221353531,
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
              Name: feature[0]?.values_?.features[count]?.values_?.Name,
              AccountNo: feature[0]?.values_?.features[count]?.values_?.Account,
              MeterNo: feature[0]?.values_?.features[count]?.values_?.MeterNo,
              CurrentBal:
                feature[0]?.values_?.features[count]?.values_?.CurrentBal,
              PreviousBal:
                feature[0]?.values_?.features[count]?.values_?.PreviousBal,
              InvoiceAmount:
                feature[0]?.values_?.features[count]?.values_?.InvoiceAmount,
              AccountStatus:
                feature[0]?.values_?.features[count]?.values_?.AccountStatus,
              Location: feature[0]?.values_?.features[count]?.values_?.Location,
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
          if (feature[0]?.values_?.Name) {
            setSingle({
              Name: feature[0]?.values_?.Name,
              AccountNo: feature[0]?.values_?.Account,
              MeterNo: feature[0]?.values_?.MeterNo,
              CurrentBal: feature[0]?.values_?.CurrentBal,
              PreviousBal: feature[0]?.values_?.PreviousBal,
              InvoiceAmount: feature[0].values_?.InvoiceAmount,
              AccountStatus: feature[0].values_?.AccountStatus,
              Location: feature[0]?.values_?.Location,
            });
          } else {
            setSingle({
              Name: feature?.values_?.features[0]?.values_?.Name,
              AccountNo: feature?.values_?.features[0]?.values_?.Account,
              MeterNo: feature?.values_?.features[0]?.values_?.MeterNo,
              CurrentBal: feature?.values_?.features[0]?.values_?.CurrentBal,
              PreviousBal: feature?.values_?.features[0]?.values_?.PreviousBal,
              InvoiceAmount:
                feature?.values_?.features[0]?.values_?.InvoiceAmount,
              AccountStatus:
                feature?.values_?.features[0]?.values_?.AccountStatus,
              Location: feature?.values_?.features[0]?.values_?.Location,
            });
          }
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
      const headers = {
        Authorization: `Basic ${Buffer.from(
          "admin:geoserver",
          "utf-8"
        ).toString("base64")}`,
      };
      fetch(`/api/geoserver/rest/workspaces/${props.url}/layers`, {
        headers: headers,
      })
        .then((res) => {
          if (res.ok) return res.json();
          else throw Error("");
        })
        .then((data) => {
          if (data.layers.layer.length > 0 && data.layers.layer != "") {
            let d = [];
            loadLayer("CustomerMeters", colors[0]);
          }
        })
        .catch((e) => {});
    }
  }, [map, props.searchValue]);

  useEffect(() => {
    if (analysis !== "Cluster") {
      props.setSearchValue(null);
      vLayer?.setSource(new VectorSource());
      vLayer.setSource(vector);
      vLayer.setStyle(regularMeterStyle);
      props.setShowAnalysis(true);
      if (props.analysis === "Current Balance") {
        vLayer.setStyle(meterStyle);
        setLegendItems([
          { name: "Below 0", color: colors[0] },
          { name: "0 to 250", color: colors[1] },
          { name: "250 to 500", color: colors[2] },
          { name: "500 to 1000", color: colors[3] },
          { name: "1,000 to 5000", color: colors[4] },
          { name: "5,000 to 10,000", color: colors[5] },
          { name: "10,000 to 20,000", color: colors[6] },
          { name: "Above 20,000", color: colors[7] },
          { name: "No data", color: "blue" },
        ]);
      }
      if (props.analysis === "Invoice Amount") {
        vLayer.setStyle(invoiceStyle);
        setLegendItems([
          { name: "Below 0", color: colors[0] },
          { name: "0 to 250", color: colors[1] },
          { name: "250 to 500", color: colors[2] },
          { name: "500 to 1000", color: colors[3] },
          { name: "1,000 to 5000", color: colors[4] },
          { name: "5,000 to 10,000", color: colors[5] },
          { name: "10,000 to 20,000", color: colors[6] },
          { name: "Above 20,000", color: colors[7] },
          { name: "No data", color: "blue" },
        ]);
      }
      if (props.analysis === "Previous Balance") {
        vLayer.setStyle(prevBalStyle);
        setLegendItems([
          { name: "Below 0", color: colors[0] },
          { name: "0 to 250", color: colors[1] },
          { name: "250 to 500", color: colors[2] },
          { name: "500 to 1000", color: colors[3] },
          { name: "1,000 to 5000", color: colors[4] },
          { name: "5,000 to 10,000", color: colors[5] },
          { name: "10,000 to 20,000", color: colors[6] },
          { name: "Above 20,000", color: colors[7] },
          { name: "No data", color: "blue" },
        ]);
      }
      if (props.analysis === "Account Status") {
        vLayer.setStyle(accstatusStyle);
        setLegendItems([
          { name: "ACTIVE", color: colors[0] },
          { name: "DORMANT", color: colors[1] },
          { name: "SEALED", color: colors[2] },
          { name: "CUT OFF", color: colors[3] },
          { name: "CLOSED", color: colors[4] },
          { name: "No data", color: "blue" },
        ]);
      }
    } else {
      vLayer.setSource(new VectorSource());
      vLayer.setSource(cluster);
      vLayer.setStyle(clusterMeterStyle);
      props.setShowAnalysis(false);
      setLegendItems(null);
    }
  }, [props.analysis, analysis]);

  function meterStyle(feature) {
    let color = "blue";
    let currentbal = feature.values_.CurrentBal;

    switch (true) {
      case currentbal < 0:
        color = colors[0];
        break;
      case currentbal >= 0 && currentbal < 250:
        color = colors[1];
        break;
      case currentbal >= 250 && currentbal < 500:
        color = colors[2];
        break;
      case currentbal >= 500 && currentbal < 1000:
        color = colors[3];
        break;
      case currentbal >= 1000 && currentbal < 5000:
        color = colors[4];
        break;
      case currentbal >= 5000 && currentbal < 10000:
        color = colors[5];
        break;
      case currentbal >= 10000 && currentbal < 20000:
        color = colors[6];
        break;
      case currentbal >= 20000:
        color = colors[7];
        break;
      default:
        break;
    }

    const style = new Style({
      image: new CircleStyle({
        radius: 5,
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

  function invoiceStyle(feature) {
    let color = "blue";
    let currentbal = feature.values_.InvoiceAmount;

    switch (true) {
      case currentbal < 0:
        color = colors[0];
        break;
      case currentbal >= 0 && currentbal < 250:
        color = colors[1];
        break;
      case currentbal >= 250 && currentbal < 500:
        color = colors[2];
        break;
      case currentbal >= 500 && currentbal < 1000:
        color = colors[3];
        break;
      case currentbal >= 1000 && currentbal < 5000:
        color = colors[4];
        break;
      case currentbal >= 5000 && currentbal < 10000:
        color = colors[5];
        break;
      case currentbal >= 10000 && currentbal < 20000:
        color = colors[6];
        break;
      case currentbal >= 20000:
        color = colors[7];
        break;
      default:
        break;
    }

    const style = new Style({
      image: new CircleStyle({
        radius: 5,
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

  function prevBalStyle(feature) {
    let color = "blue";
    let prevbal = feature.values_.PreviousBal;

    switch (true) {
      case prevbal < 0:
        color = colors[0];
        break;
      case prevbal >= 0 && prevbal < 250:
        color = colors[1];
        break;
      case prevbal >= 250 && prevbal < 500:
        color = colors[2];
        break;
      case prevbal >= 500 && prevbal < 1000:
        color = colors[3];
        break;
      case prevbal >= 1000 && prevbal < 5000:
        color = colors[4];
        break;
      case prevbal >= 5000 && prevbal < 10000:
        color = colors[5];
        break;
      case prevbal >= 10000 && prevbal < 20000:
        color = colors[6];
        break;
      case prevbal >= 20000:
        color = colors[7];
        break;
      default:
        break;
    }

    const style = new Style({
      image: new CircleStyle({
        radius: 5,
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

  function accstatusStyle(feature) {
    let color = "yellow";
    let accstatus = feature.values_.AccountStatus;
    switch (true) {
      case accstatus == "ACTIVE":
        color = colors[0];
        break;
      case accstatus == "DORMANT":
        color = colors[1];
        break;
      case accstatus == "SEALED":
        color = colors[2];
        break;
      case accstatus == "CUT OFF":
        color = colors[3];
        break;
      case accstatus == "CLOSED":
        color = colors[4];
        break;
      default:
        break;
    }

    const style = new Style({
      image: new CircleStyle({
        radius: 5,
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

  function clusterMeterStyle(feature) {
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
              color: "#2596be",
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

  function regularMeterStyle(feature) {
    const style = new Style({
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
        fill: new Fill({
          color: "#5BB318",
        }),
      }),
    });
    return style;
  }

  async function loadLayer(layer, color) {
    setLoading(true);
    legItems.push(layer);
    if (props.searchValue !== null) {
      if (props.searchBy === "currentbal") {
        var wrd = await $.ajax({
          url: getUrl(layer),
          data: {
            CQL_FILTER: `${props.searchBy} greaterThan '${parseFloat(
              props.searchValue
            )}'`,
          },
          dataType: "json",
          success: {},
          error: function (xhr) {},
        });
      } else {
        var wrd = await $.ajax({
          url: getUrl(layer),
          data: {
            CQL_FILTER: `${props.searchBy} ilike '%${props.searchValue}%'`,
          },
          dataType: "json",
          success: {},
          error: function (xhr) {},
        });
      }
      $.when(wrd).done(function (data) {
        vLayer.setSource(new VectorLayer());

        const source = new VectorSource({
          features: new GeoJSON({}).readFeatures(data),
        });

        if (data?.features[0]?.geometry.type === "Point") {
          setLoading(false);
        } else if (data?.features[0]?.geometry.type === "MultiPoint") {
        } else {
        }
        setLegendItemsStyles(legItemsStyles);
        setLoading(false);
      });
    } else {
      var wrd = await $.ajax({
        url: getUrl(layer),
        dataType: "json",
        success: {},
        error: function (xhr) {},
      });
      $.when(wrd).done(function (data) {
        vLayer.setSource(new VectorLayer());

        const source = new VectorSource({
          features: new GeoJSON({}).readFeatures(data),
        });

        if (data?.features[0].geometry.type === "Point") {
          let f = [];
          data?.features?.forEach((item) => {
            f.push(
              new Feature({
                geometry: new Point([
                  parseFloat(item?.geometry?.coordinates[0]),
                  parseFloat(item?.geometry?.coordinates[1]),
                ]),
                Name: item?.properties?.name,
                Account: item?.properties?.account,
                MeterNo: item?.properties?.meterno,
                CurrentBal: item?.properties?.currentbal,
                InvoiceAmount: item?.properties?.invoiceamo,
                PreviousBal: item?.properties?.previousba,
                AccountStatus: item?.properties?.accstatus,
                Location: item?.properties?.location,
                Material: item?.properties?.material,
              })
            );
          });
          const psource = new VectorSource({
            features: f,
          });
          setVector(psource);

          const clusterSource = new Cluster({
            distance: parseInt(50, 10),
            minDistance: parseInt(0, 10),
            source: psource,
          });

          setCluster(clusterSource);
          vLayer.setSource(new VectorLayer());

          vLayer.setSource(psource);
          vLayer.setStyle(regularMeterStyle);

          // vLayer.setSource(clusterSource);
          // vLayer.setStyle(clusterMeterStyle);

          setLoading(false);
        } else if (data?.features[0].geometry.type === "MultiPoint") {
          let f = [];
          data?.features?.forEach((item) => {
            f.push(
              new Feature({
                geometry: new Point([
                  parseFloat(item?.geometry?.coordinates[0][0]),
                  parseFloat(item?.geometry?.coordinates[0][1]),
                ]),
                Name: item?.properties?.name,
                Account: item?.properties?.account,
                MeterNo: item?.properties?.meterno,
                CurrentBal: item?.properties?.currentbal,
                InvoiceAmount: item?.properties?.invoiceamo,
                PreviousBal: item?.properties?.previousba,
                AccountStatus: item?.properties?.accstatus,
                Location: item?.properties?.location,
                Material: item?.properties?.material,
              })
            );
          });
          const psource = new VectorSource({
            features: f,
          });
          setVector(psource);

          const clusterSource = new Cluster({
            distance: parseInt(50, 10),
            minDistance: parseInt(0, 10),
            source: psource,
          });

          setCluster(clusterSource);
          // vLayer.setSource(new VectorLayer());

          vLayer.setSource(psource);
          vLayer.setStyle(regularMeterStyle);

          setLoading(false);
        } else {
          vLayer.setSource(new VectorLayer());
          vLayer.setSource(source);
          vLayer.setStyle();
        }
        setLegendItemsStyles(legItemsStyles);
        setLoading(false);
        map.addLayer(vLayer);
      });
    }
  }

  function getUrl(url) {
    return `/api/geoserver/${props.url}/wfs?request=GetFeature&version=1.0.0&typeName=${props.url}:${url}&outputFormat=json`;
  }

  const saveData = () => {
    let rows = [
      [
        "Name",
        "Account No",
        "Meter No",
        "Location",
        "Invoice Amount",
        "Previous Balance",
        "Current Balance",
        "Due Date",
      ],
    ];
    vector?.getFeatures()?.map((item) => {
      rows.push([
        item?.values_?.name,
        item?.values_?.account,
        item?.values_?.meterno,
        item?.values_?.location,
        item?.values_?.invoiceamo,
        item?.values_?.prevba,
        item?.values_?.currentba,
        item?.values_?.duedate,
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
  function addToMap(data, style) {
    setWaveLoading(true);
    let features = new Array(data.length);
    data.map((item, i) => {
      features[i] = new Feature({
        geometry: new Point([
          parseFloat(item.Longitude),
          parseFloat(item.Latitude),
        ]),
      });
      const obj = Object.entries(item);
      obj.map((dt) => {
        features[i].values_[dt[0]] = dt[1];
      });
    });

    const vs = new VectorSource({
      features: features,
      format: new GeoJSON(),
    });
    const f = new WebGLPointsLayer({
      title: "networks",
      style: style,
      disableHitDetection: false,
      source: vs,
    });
    map.addLayer(f);
    map.getView().fit(vs.getExtent(), {
      padding: [100, 100, 100, 100],
    });
    setWaveLoading(false);
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

        <div className="analyses">
          <Analysis
            data={["Regular", "Cluster"]}
            setAnalysis={setAnalysis}
            active={analysis}
          />
        </div>

        {showing?.length > 0 && (
          <Popup
            many={many}
            single={single}
            top={showing[0]}
            left={showing[1]}
          />
        )}
        {loading && <RippleLoading />}
        {legendItems && (
          <LegendGroup legendItems={legendItems} analysis={props.analysis} />
        )}
      </div>
    </div>
  );
}

const LegendGroup = (props) => {
  return (
    <div className="analysisLegend">
      {props.analysis === "Current Balance" ? (
        <h6>Current Balance</h6>
      ) : props.analysis === "Invoice Amount" ? (
        <h6>Invoice Amount</h6>
      ) : props.analysis === "Previous Balance" ? (
        <h6>Previous Balance</h6>
      ) : props.analysis === "Account Status" ? (
        <h6>Account Status</h6>
      ) : (
        <h6>Legend</h6>
      )}
      {props.legendItems &&
        props.legendItems.map((item, i) => {
          return (
            <div key={i} style={{ marginBottom: "3px" }} className="cwrap">
              <div
                style={{
                  border: `2px solid #fff`,
                  backgroundColor: item.color,
                  height: "16px",
                  width: "16px",
                  borderRadius: "24px",
                  fontSize: "x-large",
                  textAlign: "center",
                  lineHeight: "16px",
                }}
              ></div>
              <p>{item.name}</p>
            </div>
          );
        })}
    </div>
  );
};
