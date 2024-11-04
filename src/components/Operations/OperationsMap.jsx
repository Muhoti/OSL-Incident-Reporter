import { useState, useRef, useEffect } from "react";
import Map from "ol/Map";
import View from "ol/View";
import Overlay from "ol/Overlay";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { OSM, XYZ } from "ol/source";
import { Draw } from "ol/interaction";
import GeoJSON from "ol/format/GeoJSON";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import {
  getArea as getGeodeticArea,
  getLength as getGeodeticLength,
} from "ol/sphere";
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
import {
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
  Checkbox,
  Container,
  Chip,
} from "@mui/material";
import {
  CancelOutlined,
  RectangleOutlined,
  Timeline,
  TripOrigin,
  Layers,
  Satellite,
  Terrain,
} from "@mui/icons-material";

export default function OperationsMap() {
  const [map, setMap] = useState(null);
  const [drawInteraction, setDrawInteraction] = useState(null);
  const mapElement = useRef();
  const popupRef = useRef();
  const [popupContent, setPopupContent] = useState(null);
  const [loadingLayers, setLoadingLayers] = useState([]);
  const [activeBasemap, setActiveBasemap] = useState("OSM");
  const [legendItems, setLegendItems] = useState([]);
  const [selectedType, setSelectedType] = useState("All");

  const measureSource = new VectorSource();

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
      fetchGeoJSON(selectedType);

      const popupOverlay = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        stopEvent: false,
      });
      map.addOverlay(popupOverlay);
      map.on("singleclick", function (event) {
        const features = map.getFeaturesAtPixel(event.pixel);
        if (features.length > 0) {
          const properties = features[0].getProperties();
          delete properties.geometry;

          setPopupContent(properties);
          popupOverlay.setPosition(event.coordinate);
        } else {
          setPopupContent(null);
          popupOverlay.setPosition(undefined);
        }
      });
    }
  }, [map, selectedType]);

  const fetchGeoJSON = (type) => {
    setLoadingLayers([`Fetching ${type}...`]);
    fetch(`/api/reports/geojson/${type}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch GeoJSON data");
        return res.json();
      })
      .then((data) => {
        if (data) {
          const features = new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: map.getView().getProjection().getCode(),
          }).readFeatures(data);

          const vectorSource = new VectorSource({
            features: features,
          });

          const styleFunction = getStyleFunction(type);

          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: styleFunction,
          });

          map.getLayers().forEach((layer) => {
            if (layer instanceof VectorLayer) map.removeLayer(layer);
          });

          map.addLayer(vectorLayer);
          setLegendItems(generateLegendItems(type, data.features));
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoadingLayers([]);
      });
  };

  const getStyleFunction = (type) => {
    return (feature) => {
      const fillColor =
        type === "All"
          ? getColorByType(feature.get("Type"))
          : getColorByStatus(feature.get("Status"));
      return new Style({
        stroke: new Stroke({
          color: "white",
          width: 2,
        }),
        fill: new Fill({
          color: fillColor,
        }),
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({
            color: fillColor,
          }),
          stroke: new Stroke({
            color: "white",
            width: 1,
          }),
        }),
      });
    };
  };

  const getColorByType = (type) => {
    switch (type) {
      case "Leakage":
        return "#48CFCB";
      case "Sewer Burst":
        return "#674636";
      case "Illegal Connection":
        return "#7A1CAC";
      case "Vandalism":
        return "#821131";
      case "Supply Fail":
        return "#1E2A5E";
      case "Other":
        return "#6A9C89";
      default:
        return "#3C3D37";
    }
  };

  const getColorByStatus = (status) => {
    switch (status) {
      case "Received":
        return "#3C3D37";
      case "Assigned":
        return "#3F51B5";
      case "Resolved":
        return "#00712D";
      case "Not Resolved":
        return "#E85C0D";
      default:
        return "rgba(255, 255, 255, 0.5)";
    }
  };

  const generateLegendItems = (type, features) => {
    const uniqueItems = new Set();
    features.forEach((feature) => {
      const value =
        type === "All" ? feature.properties.Type : feature.properties.Status;
      uniqueItems.add(value);
    });

    return Array.from(uniqueItems).map((item) => ({
      label: item,
      fill: type === "All" ? getColorByType(item) : getColorByStatus(item),
    }));
  };

  const addDrawInteraction = (type) => {
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }

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
        const length = getGeodeticLength(geom, { projection: "EPSG:4326" });
        output = `D: ${length.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        })} m`;
      } else if (geom instanceof Polygon) {
        const area = getGeodeticArea(geom, { projection: "EPSG:4326" });
        output = `A: ${area.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        })} sq m`;
      } else if (geom instanceof CircleGeom) {
        const radius = geom.getRadius();
        const area = Math.PI * Math.pow(radius * 111320, 2);
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
    measureSource.clear();
    map.getLayers().forEach((layer) => {
      if (layer instanceof VectorLayer && layer.get("title") === "measure") {
        map.removeLayer(layer);
      }
    });
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
    map.getOverlays().clear();
  };

  const getCenterCoordinate = (geom) => {
    if (geom instanceof LineString) {
      const coordinates = geom.getCoordinates();
      const midIndex = Math.floor(coordinates.length / 2);
      return coordinates[midIndex];
    } else if (geom instanceof Polygon) {
      const extent = geom.getExtent();
      return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
    } else if (geom instanceof CircleGeom) {
      return geom.getCenter();
    }
    return null;
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  return (
    <Container sx={{ marginTop: 8 }} disableGutters>
      <Card
        sx={{
          p: 2,
          borderRadius: 5,
          boxShadow: "0px 3px 16px rgba(0, 0, 0, 0.08)",
          minHeight: "90vh",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Map View</Typography>
          <ButtonGroup variant="contained" color="primary">
            <Button
              sx={{ textTransform: "capitalize", fontSize: "small" }}
              onClick={() => handleTypeChange("All")}
              variant={selectedType === "All" ? "contained" : "outlined"}
            >
              All
            </Button>
            <Button
              sx={{ textTransform: "capitalize", fontSize: "small" }}
              onClick={() => handleTypeChange("Leakage")}
              variant={selectedType === "Leakage" ? "contained" : "outlined"}
            >
              Leakage
            </Button>
            <Button
              sx={{ textTransform: "capitalize", fontSize: "small" }}
              onClick={() => handleTypeChange("Vandalism")}
              variant={selectedType === "Vandalism" ? "contained" : "outlined"}
            >
              Vandalism
            </Button>
            <Button
              sx={{ textTransform: "capitalize", fontSize: "small" }}
              onClick={() => handleTypeChange("Supply Fail")}
              variant={
                selectedType === "Supply Fail" ? "contained" : "outlined"
              }
            >
              Supply Fail
            </Button>
            <Button
              sx={{ textTransform: "capitalize", fontSize: "small" }}
              onClick={() => handleTypeChange("Sewer Burst")}
              variant={
                selectedType === "Sewer Burst" ? "contained" : "outlined"
              }
            >
              Sewer Burst
            </Button>
            <Button
              sx={{ textTransform: "capitalize", fontSize: "small" }}
              onClick={() => handleTypeChange("Illegal Connection")}
              variant={
                selectedType === "Illegal Connection" ? "contained" : "outlined"
              }
            >
              Illegal Connection
            </Button>
          </ButtonGroup>
        </Box>
        <Box
          sx={{
            marginTop: 1,
            position: "relative",
            minHeight: "90vh",
            height: "100%",
          }}
        >
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
              <ButtonGroup
                sx={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                orientation="vertical"
              >
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
              {legendItems.map((item, i) => (
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
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography sx={{ flexGrow: 1 }} variant="subtitle1">
                  Incident Details
                </Typography>
                {popupContent && (
                  <Chip
                    label={new Date(
                      popupContent.createdAt
                    ).toLocaleDateString()}
                  />
                )}
                {popupContent && (
                  <Chip
                    color={
                      popupContent.Status === "Received"
                        ? "default"
                        : popupContent.Status === "Assigned"
                        ? "primary"
                        : popupContent.Status === "Resolved"
                        ? "success"
                        : "warning"
                    }
                    label={popupContent.Status}
                  />
                )}
              </Box>
              <Divider sx={{ my: "5px" }} />
              {popupContent && <ReportDetailsContent report={popupContent} />}
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
              <ButtonGroup
                sx={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                orientation="vertical"
              >
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
        </Box>
      </Card>
    </Container>
  );
}

const LegendItem = ({ item }) => {
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    if (item.map) {
      item.map.getLayers().forEach((layer) => {
        if (layer && layer.get("title") === item.label) {
          layer.setVisible(showing);
        }
      });
    }
  }, [showing, item.map, item.label]);

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
          border: `1px solid ${item.fill}`,
          backgroundColor: item.fill,
          height: 16,
          width: 16,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      <Typography variant="body2">{item.label}</Typography>
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

const ReportDetailsContent = ({ report }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (report && report.NRWUserID) {
      fetch(`/api/mobile/${report.NRWUserID}`)
        .then((res) => {
          if (!res.ok) {
            throw Error("Could not fetch data!!!");
          } else {
            return res.json();
          }
        })
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {});
    }
  }, [report]);

  return (
    <Box sx={{ width: { xs: "85vw", md: "50vw" } }}>
      {report.Image && (
        <img
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            border: "1px solid #60606050",
            boxShadow: "0px 4px 8px #60606030",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
          src={"/api/uploads/" + report.Image}
          alt=""
        />
      )}
      <Typography variant="body2">Type: {report.Type}</Typography>
      <Typography variant="body2">Description: {report.Description}</Typography>

      <Box
        sx={{
          display: { md: "grid", xs: "flex" },
          gridTemplateColumns: "1fr 2fr",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "small", marginTop: 1 }} variant="h6">
            Reported By
          </Typography>
          <Divider />
          <Box
            sx={{
              display: { md: "flex", xs: "block" },
              flex: { md: "1 1", xs: "1" },
              gap: 2,
            }}
          >
            <Typography variant="body2">{report.Name}</Typography>
            <Typography variant="body2">{report.Phone}</Typography>
          </Box>
        </Box>
        <Box>
          {report.NRWUserID && (
            <>
              <Typography sx={{ fontSize: "small", marginTop: 1 }} variant="h6">
                Assigned To
              </Typography>
              <Divider />
              <Box
                sx={{
                  display: { md: "flex", xs: "block" },
                  flex: { md: "1 1", xs: "1" },
                  gap: 2,
                }}
              >
                <Typography variant="body2">{user ? user.Name : ""}</Typography>
                <Typography variant="body2">
                  {user ? user.Phone : ""}
                </Typography>
                <Typography variant="body2">
                  {user ? user.Email : ""}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>
      {report.TaskDate && (
        <>
          <Typography sx={{ fontSize: "small", marginTop: 1 }} variant="h6">
            Resolution
          </Typography>
          <Divider />
          <Box>
            <Typography variant="body2">Remark: {report.TaskRemark}</Typography>
            <Typography variant="body2">
              Date: {new Date(report.TaskDate).toLocaleDateString()}{" "}
              {new Date(report.TaskDate).toLocaleTimeString()}
            </Typography>
            {report.TaskResources && (
              <Button marginTop={1} size="small" variant="outlined">
                View Report Image
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
