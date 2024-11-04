import "../../Styles/gis.scss";
import {
  getArea as getGeodeticArea,
  getLength as getGeodeticLength,
} from "ol/sphere";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Map from "ol/Map";
import { useState, useRef, useEffect } from "react";
import { OSM, XYZ } from "ol/source";
import {
  ZoomToExtent,
  defaults as defaultControls,
  ScaleLine,
  FullScreen,
  Attribution,
  Rotate,
  ZoomSlider,
} from "ol/control";
import { LineString, Polygon, Circle as CircleGeom } from "ol/geom";
import { Draw } from "ol/interaction";
import Overlay from "ol/Overlay";
import GeoJSON from "ol/format/GeoJSON";
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
import { fromLonLat } from "ol/proj";
import {
  CancelOutlined,
  RectangleOutlined,
  Timeline,
  TripOrigin,
} from "@mui/icons-material";
import FilterAndStyleBar from "./FilterAndStyleBar";
import { Layers, Satellite, Terrain } from "@mui/icons-material";

export default function NetworksMaps(props) {
  const [map, setMap] = useState(null);
  const [drawInteraction, setDrawInteraction] = useState(null);
  const mapElement = useRef();
  const mapRef = useRef();
  mapRef.current = map;
  const popupRef = useRef();
  const [popupContent, setPopupContent] = useState(null);
  const [loadingLayers, setLoadingLayers] = useState([]);
  const measureSource = new VectorSource();
  const [featureSelectEnabled, setFeatureSelectEnabled] = useState(true);
  const [activeBasemap, setActiveBasemap] = useState("OSM");

  const toggleBasemap = (label) => {
    setActiveBasemap(label);
    basemaps.forEach((basemap) => {
      basemap.layer.setVisible(basemap.label === label);
    });
  };

  useEffect(() => {
    const initialMap = new Map({
      target: mapElement.current,
      layers: basemaps.map((b) => b.layer),
      view: new View({
        projection: "EPSG:4326",
        center: [36.8275, -1.1623],
        zoom: 16,
        maxZoom: 32,
      }),
      controls: defaultControls().extend([
        new ScaleLine(),
        new FullScreen(),
        new Attribution(),
        new Rotate(),
        new ZoomSlider(),
        new ZoomToExtent({
          extent: [36.7388, -1.2214, 36.9083, -1.105],
        }),
      ]),
    });

    setMap(initialMap);
    return () => {
      initialMap.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (map) {
      const popupOverlay = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        stopEvent: false,
      });
      map.addOverlay(popupOverlay);
      map.on("singleclick", function (event) {
        if (featureSelectEnabled) {
          const features = map.getFeaturesAtPixel(event.pixel);

          if (features.length > 0) {
            const properties = features[0].getProperties();
            delete properties.geometry;
            delete properties.ID;
            delete properties.createdAt;
            delete properties.updatedAt;
            delete properties.User;
            delete properties.Coordinates;
            delete properties.Picture;

            if (properties?.RecTime != undefined) {
              properties.RecTime = properties.RecTime.split(" ")[0];
            }
            if (properties?.FRecTime != undefined) {
              properties.FRecTime = properties.FRecTime.split(" ")[0];
            }

            setPopupContent(properties);
            popupOverlay.setPosition(event.coordinate);
          } else {
            setPopupContent(null);
            popupOverlay.setPosition(undefined);
          }
        }
      });
    }
  }, [map, featureSelectEnabled]);

  const addDrawInteraction = (type) => {
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
    setFeatureSelectEnabled(false);

    const draw = new Draw({
      source: measureSource,
      type: type === "circle" ? "Circle" : type,
    });

    let sketch;
    let measureTooltipElement;
    let measureTooltip;

    const formatLengthOrArea = (geom) => {
      let output;
      if (geom instanceof LineString) {
        // Use getGeodeticLength to calculate the length in meters
        const length = getGeodeticLength(geom, { projection: "EPSG:4326" });
        output = `D: ${length.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        })} m`;
      } else if (geom instanceof Polygon) {
        // Use getGeodeticArea to calculate the area in square meters
        const area = getGeodeticArea(geom, { projection: "EPSG:4326" });
        output = `A: ${area.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        })} sq m`;
      } else if (geom instanceof CircleGeom) {
        const radius = geom.getRadius();
        const area = Math.PI * Math.pow(radius * 111320, 2); // Convert radius from degrees to meters and calculate area
        output = `R: ${(radius * 111320).toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        })} m, <br /> A: ${area.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        })} sq m`;
      }
      return output;
    };

    const createMeasureTooltip = () => {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement("div");
      measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: "bottom-center",
      });
      map.addOverlay(measureTooltip);
    };

    draw.on("drawstart", (evt) => {
      sketch = evt.feature;

      let tooltipCoord = evt.coordinate;

      sketch.getGeometry().on("change", (event) => {
        const geom = event.target;
        const output = formatLengthOrArea(geom);
        tooltipCoord = geom.getLastCoordinate();

        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    });

    draw.on("drawend", (event) => {
      const geom = event.feature.getGeometry();
      const output = formatLengthOrArea(geom);
      const tooltipCoord = getCenterCoordinate(geom);

      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);

      measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
      measureTooltip.setOffset([0, 5]);

      sketch = null;
      measureTooltipElement = null;
      createMeasureTooltip();

      // Ensure the sketch is added to the map layer (measureSource)
      const vectorLayer = new VectorLayer({
        title: "measure",
        source: measureSource,
        style: new Style({
          stroke: new Stroke({
            color: "#9acd32",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          image: new CircleStyle({
            radius: 7,
            stroke: new Stroke({
              color: "#9acd32",
              width: 2,
            }),
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
          }),
        }),
      });
      map.addLayer(vectorLayer);
    });

    createMeasureTooltip();
    map.addInteraction(draw);
    setDrawInteraction(draw);
  };

  const clearMeasurements = () => {
    setFeatureSelectEnabled(true); // Re-enable feature selection after drawing
    measureSource.clear(); // Clear the vector source
    map.getLayers().forEach((layer) => {
      if (layer instanceof VectorLayer && layer.get("title") === "measure") {
        map.removeLayer(layer); // Remove the measurement layer
      }
    });
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
    map.getOverlays().clear(); // Remove any measurement overlays
  };

  const getCenterCoordinate = (geom) => {
    if (geom instanceof LineString) {
      // Calculate the midpoint of the LineString
      const coordinates = geom.getCoordinates();
      const midIndex = Math.floor(coordinates.length / 2);
      return coordinates[midIndex];
    } else if (geom instanceof Polygon) {
      // Calculate the centroid of the Polygon
      const extent = geom.getExtent();
      return [
        (extent[0] + extent[2]) / 2, // (minX + maxX) / 2
        (extent[1] + extent[3]) / 2, // (minY + maxY) / 2
      ];
    } else if (geom instanceof CircleGeom) {
      // Get the center of the Circle
      return geom.getCenter();
    }
    return null;
  };

  useEffect(() => {
    if (map && props.legendItems.length > 0) {
      props.legendItems.map(async (item) => {
        setLoadingLayers((prev) => [...prev, item.label]);

        await fetch(`/api/geojson/${item.table}`)
          .then((res) => {
            if (res.ok) return res.json();
            else throw new Error("Failed to fetch GeoJSON data");
          })
          .then((data) => {
            if (data.features != null) {
              const vectorSource = new VectorSource({
                features: new GeoJSON({
                  dataProjection: "EPSG:4326",
                  featureProjection: map.getView().getProjection().getCode(),
                }).readFeatures(data),
              });

              const style = new Style({
                image: new CircleStyle({
                  stroke: new Stroke({
                    color: "white",
                    width: 1,
                  }),
                  fill: new Fill({
                    color: item.fill,
                  }),
                  radius: item.radius,
                }),
                stroke: new Stroke({
                  color: item.fill,
                  width: item.width,
                }),
                fill: new Fill({
                  color: item.fill,
                }),
              });

              const layer = new VectorLayer({
                title: item.label,
                source: vectorSource,
                style: style,
              });

              map.addLayer(layer);
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            setLoadingLayers((prev) =>
              prev.filter((label) => label !== item.label)
            );
          });
      });
    }
  }, [map, props.legendItems]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: "8px",
      }}
      className="gis"
    >
      <div
        ref={mapElement}
        style={{ width: "100%", height: "100%" }}
        id="map"
      ></div>
      <FilterAndStyleBar legendItems={props.legendItems} map={map} />
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

      <Card
        sx={{
          position: "absolute",
          bottom: "1.1rem",
          backgroundColor: "rgba(255,255,255,0.7)",
          right: "10px",
          py: 1,
          px: 2,
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6">Legend</Typography>
        <Divider sx={{ mb: "10px" }} />
        {props.legendItems.map((item, i) => (
          <LegendItem key={i} item={item} map={map} />
        ))}
      </Card>
      <Paper
        ref={popupRef}
        sx={{
          position: "absolute",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "8px",
          display: popupContent ? "block" : "none",
          zIndex: 10,
          transform: "translate(-50%, -100%)",
        }}
      >
        <Typography variant="subtitle1">Feature Details</Typography>
        <Divider sx={{ mb: "5px" }} />
        <List
          sx={{
            display: "grid",
            gap: "5px",
            p: 0,
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          {popupContent &&
            Object.keys(popupContent).map((key, index) => (
              <ListItem
                sx={{
                  display: "grid",
                  gap: "5px",
                  minWidth: "250px",
                  gridTemplateColumns: "1fr 2fr",
                }}
                key={index}
                dense
              >
                <Typography sx={{ fontSize: "small", color: "#131842" }}>
                  {key}
                </Typography>
                <Typography sx={{ fontSize: "small", color: "#698474" }}>
                  {popupContent[key]}
                </Typography>
              </ListItem>
            ))}
        </List>
      </Paper>
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "10px",
          zIndex: 11,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <ButtonGroup orientation="vertical">
          <Button onClick={() => addDrawInteraction("LineString")}>
            <Timeline fontSize="small" />
          </Button>
          <Button onClick={() => addDrawInteraction("Polygon")}>
            <RectangleOutlined fontSize="small" />
          </Button>
          <Button onClick={() => addDrawInteraction("circle")}>
            <TripOrigin fontSize="small" />
          </Button>
          <Button onClick={clearMeasurements}>
            <CancelOutlined fontSize="small" />
          </Button>
        </ButtonGroup>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "2.5rem",
          right: "1rem",
          zIndex: 11,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {loadingLayers.map((label, index) => (
          <LoadingBar key={index} label={label} />
        ))}
      </Box>
    </div>
  );
}

const LegendItem = (props) => {
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    if (props.map) {
      props.map.getLayers().forEach((layer) => {
        if (layer && layer.get("title") === props.item.label) {
          layer.setVisible(showing);
        }
      });
    }
  }, [showing, props.map, props.item.label]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: "3px",
        gap: 1,
      }}
    >
      <Checkbox
        checked={showing}
        sx={{
          height: 10,
          width: 10,
        }}
        onChange={(e) => setShowing(e.target.checked)}
      />
      <Box
        sx={{
          border: `1px solid ${props.item.fill}`,
          backgroundColor: props.item.fill,
          height: 16,
          width: 16,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      <Typography variant="body2">{props.item.label}</Typography>
    </Box>
  );
};

const LoadingBar = ({ label }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: "8px",
        borderRadius: "8px",
        mb: 1,
      }}
    >
      <CircularProgress size={20} sx={{ mr: 1 }} />
      <Typography variant="body2">{label} is loading...</Typography>
    </Box>
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
