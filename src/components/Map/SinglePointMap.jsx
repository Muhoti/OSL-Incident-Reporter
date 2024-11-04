import "leaflet";
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
import { fromLonLat, toLonLat } from "ol/proj";
import { toStringHDMS } from "ol/coordinate";
import Popup from "./Popup";

export default function SinglePointMap(props) {
  const [loading, setLoading] = useState(false);
  const [showing, setShowing] = useState([]);
  const [data, setData] = useState();
  const [many, setMany] = useState({ data: null, count: 0 });

  //set initial state
  const [map, setMap] = useState(null);
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  const tooltip = useRef();

  const popup = new Overlay({
    element: tooltip.current,
  });

  //basemap
  const baseLayer = new TileLayer({
    source: new OSM(),
  });

  const [layer, setLayer] = useState(new VectorLayer());

  useEffect(() => {
    const initialMap = new Map({
      target: mapElement.current,
      layers: [baseLayer, layer],
      view: new View({
        projection: "EPSG:4326",
        center: [36.45, -0.1],
        zoom: 12,
        maxZoom: 20,
      }),
      controls: [],
    });
    initialMap.addOverlay(popup);
    setMap(initialMap);
     return () => {
       initialMap.setTarget(null);
     };
  }, []);

  useEffect(() => {
    if (map) {
      if (!props.clicked) {
        setLoading(true);
        setLoading(true);
        fetch(`/api/mawasco/${props.activeUrl}/paginated/${props.offset}`)
          .then((res) => {
            if (res.ok) return res.json();
            else throw Error("");
          })
          .then((data) => {
            setLoading(false);
            let points = [];
            data &&
              data.data?.forEach((item) => {
                points.push(
                  new Feature({
                    geometry: new Point([
                      parseFloat(item.Longitude),
                      parseFloat(item.Latitude),
                    ]),
                    ID: item.ID,
                  })
                );
              });

            data.rows?.forEach((item) => {
              points.push(
                new Feature({
                  geometry: new Point([
                    parseFloat(item.longitude),
                    parseFloat(item.latitude),
                  ]),
                  ID: item.ID,
                })
              );
            });

            const source = new VectorSource({
              features: points,
            });

            const clusterSource = new Cluster({
              distance: parseInt(100, 10),
              minDistance: parseInt(0, 10),
              source: source,
            });
            const styleCache = {};
            const style = function (feature) {
              let size = feature.values_.features.length;
              let style = styleCache[size];
              if (!style) {
                if (size === 1) {
                  style = new Style({
                    image: new CircleStyle({
                      radius: 15,
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
                  if (r < 20) r = 20;
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
            };
            layer.setSource(clusterSource);
            layer.setStyle(style);

            map.getView().fit(source.getExtent(), {
              padding: [0, 0, 0, 0],
            });
          })
          .catch((e) => {
            setLoading(false);
          });
      }

      if (props.clicked) {
        setLoading(true);
        layer.setSource(new VectorSource());

        fetch(`/api/mawasco/${props.activeUrl}/${props.clicked}`)
          .then((res) => {
            if (res.ok) return res.json();
            else throw Error("");
          })
          .then((data) => {
            setData(data);
            setLoading(false);
            let points = [
              new Feature({
                geometry: new Point([
                  parseFloat(data[0].longitude),
                  parseFloat(data[0].latitude),
                ]),
                ID: data[0].ID,
              }),
            ];

            const source = new VectorSource({
              features: points,
            });

            let style = function (feature) {
              let lt = new Style({
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
              return lt;
            };

            layer.setSource(source);
            layer.setStyle(style);

            map.getView().fit(source.getExtent(), {
              padding: [0, 0, 0, 0],
            });
          })
          .catch((e) => {
            setLoading(false);
          });
      }
    }
  }, [map, props.clicked, props.offset, props.vc]);

  map?.on("click", function (event) {
    setShowing([]);
    setMany({ data: null, count: null });

    map?.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
      let m = [];
      if (feature?.values_?.features?.length > 1) {
        for (let index = 0; index < 5; index++) {
          m.push(feature?.values_?.features[index]?.values_?.ID);
        }
      } else {
      }
      let d = many;
      d.data = m;
      d.count = feature?.values_?.features?.length;
      setMany(d);
      let s = [event.pixel[1], event.pixel[0]];
      setShowing(s);
    });
  });

  function getColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div
      className="mp"
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <div
        ref={mapElement}
        style={{ width: "100%", height: "100%" }}
        className="map-container"
      ></div>
      {loading && <RippleLoading />}
      {props.clicked && data && (
        <div className="details">
          <div className="div2equal">
            <p>Lat: {data[0].latitude}</p>
            <p>Lng: {data[0].longitude}</p>
          </div>
          <div className="div2equal">
            <p>Name: {data[0]?.name}</p>
            <p>Schemename: {data[0].schemename}</p>
          </div>
          <div className="div2equal">
            <p>Location: {data[0]?.location}</p>
            <p>Route: {data[0].route}</p>
          </div>
        </div>
      )}
    </div>
  );
}
