import React, { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import TemporaryLegend from "./TemporaryLegend";

const FilterAndStyleBar = ({ legendItems, map }) => {
  const [selectedLayer, setSelectedLayer] = useState("");
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedClassification, setSelectedClassification] = useState("");
  const [generatedLegend, setGeneratedLegend] = useState([]);
  const [originalStyle, setOriginalStyle] = useState(null);

  useEffect(() => {
    if (selectedLayer) {
      const layer = map
        .getLayers()
        .getArray()
        .find((layer) => layer.get("title") === selectedLayer);
      if (layer) {
        const features = layer.getSource().getFeatures();
        if (features.length > 0) {
          const featureProps = features[0].getProperties();
          const layerColumns = Object.keys(featureProps).filter(
            (key) => key !== "geometry"
          );
          setColumns(layerColumns);
          setOriginalStyle(layer.getStyle()); // Store the original style
        }
      }
    }
  }, [selectedLayer, map]);

  const applyStyle = () => {
    const layer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get("title") === selectedLayer);

    if (layer && selectedColumn && selectedClassification) {
      const source = layer.getSource();

      let styleFunction;
      let legend = [];

      switch (selectedClassification) {
        case "Equal Interval":
          styleFunction = createEqualIntervalStyle(
            source,
            selectedColumn,
            legend
          );
          break;
        case "Unique Classification":
          styleFunction = createUniqueClassificationStyle(
            source,
            selectedColumn,
            legend
          );
          break;
        default:
          break;
      }

      if (styleFunction) {
        layer.setStyle(styleFunction);
        setGeneratedLegend(legend); // Update the legend for the specific section
      }
    }
  };

  const createEqualIntervalStyle = (source, column, legend) => {
    const features = source.getFeatures();
    const values = features.map((feature) => feature.get(column));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const interval = (max - min) / 5; // 5 classes
    const colors = [
      getRandomColor(),
      getRandomColor(),
      getRandomColor(),
      getRandomColor(),
      getRandomColor(),
    ];

    legend.push(
      {
        label: `<= ${(min + interval).toFixed(2)}`,
        color: colors[0],
        visible: true,
      },
      {
        label: `<= ${(min + 2 * interval).toFixed(2)}`,
        color: colors[1],
        visible: true,
      },
      {
        label: `<= ${(min + 3 * interval).toFixed(2)}`,
        color: colors[2],
        visible: true,
      },
      {
        label: `<= ${(min + 4 * interval).toFixed(2)}`,
        color: colors[3],
        visible: true,
      },
      { label: `<= ${max.toFixed(2)}`, color: colors[4], visible: true }
    );

    return (feature) => {
      const value = feature.get(column);
      let color = "rgba(255, 255, 255, 0.5)";

      if (value <= min + interval && legend[0].visible) {
        color = colors[0];
      } else if (value <= min + 2 * interval && legend[1].visible) {
        color = colors[1];
      } else if (value <= min + 3 * interval && legend[2].visible) {
        color = colors[2];
      } else if (value <= min + 4 * interval && legend[3].visible) {
        color = colors[3];
      } else if (legend[4].visible) {
        color = colors[4];
      }

      return new Style({
        fill: new Fill({
          color: color,
        }),
        stroke: new Stroke({
          color: color,
          width: 1,
        }),
        image: new CircleStyle({
          radius: 7,
          stroke: new Stroke({
            color: color,
            width: 1,
          }),
          fill: new Fill({
            color: color,
          }),
        }),
      });
    };
  };

  const createUniqueClassificationStyle = (source, column, legend) => {
    const features = source.getFeatures();
    const uniqueValues = [
      ...new Set(features.map((feature) => feature.get(column))),
    ];

    const valueColorMap = uniqueValues.reduce((map, value, index) => {
      const color = getRandomColor();
      legend.push({ label: value, color, visible: true });
      map[value] = color;
      return map;
    }, {});

    return (feature) => {
      const value = feature.get(column);
      const color =
        valueColorMap[value] && legend.find((l) => l.label === value).visible
          ? valueColorMap[value]
          : "rgba(255, 255, 255, 0.5)";

      return new Style({
        fill: new Fill({
          color: color,
        }),
        stroke: new Stroke({
          color: color,
          width: 1,
        }),
        image: new CircleStyle({
          radius: 7,
          stroke: new Stroke({
            color: color,
            width: 1,
          }),
          fill: new Fill({
            color: color,
          }),
        }),
      });
    };
  };

  const handleToggleLegendItem = (index) => {
    setGeneratedLegend((prevLegend) =>
      prevLegend.map((item, i) =>
        i === index ? { ...item, visible: !item.visible } : item
      )
    );
    updateLayerStyle();
  };

  const updateLayerStyle = () => {
    const layer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get("title") === selectedLayer);

    if (layer) {
      const styleFunction = createEqualIntervalStyle(
        layer.getSource(),
        selectedColumn,
        generatedLegend
      );
      layer.setStyle(styleFunction);
    }
  };

  const resetLayerStyle = () => {
    const layer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.get("title") === selectedLayer);
    if (layer && originalStyle) {
      layer.setStyle(originalStyle); // Reset to the original style
      setGeneratedLegend([]); // Clear the generated legend
    }
  };

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: "10px",
          left: "3.5rem",
          zIndex: 12,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: "10px",
          borderRadius: "8px",
          display: "grid",
          gridTemplateColumns: "auto auto auto auto auto",
          gap: "10px",
        }}
      >
        <FormControl
          size="small"
          sx={{
            fontSize: "small",
            padding: 0,
            minWidth: "150px",
            marginBottom: "8px",
          }}
          fullWidth
        >
          <InputLabel
            sx={{
              fontSize: "small",
            }}
          >
            Layer
          </InputLabel>
          <Select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
            sx={{
              fontSize: "small",
              padding: 0,
            }}
          >
            {legendItems.map((item, index) => (
              <MenuItem
                sx={{
                  fontSize: "small",
                  padding: "4px 8px",
                }}
                key={index}
                value={item.label}
              >
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {columns.length > 0 && (
          <FormControl
            size="small"
            sx={{
              fontSize: "small",
              padding: 0,
              minWidth: "150px",
              marginBottom: "8px",
            }}
            fullWidth
          >
            <InputLabel
              sx={{
                fontSize: "small",
              }}
            >
              Column
            </InputLabel>
            <Select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              sx={{
                fontSize: "small",
                padding: 0,
              }}
            >
              {columns.map((column, index) => (
                <MenuItem
                  sx={{
                    fontSize: "small",
                  }}
                  key={index}
                  value={column}
                >
                  {column}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedColumn && (
          <FormControl
            size="small"
            sx={{
              fontSize: "small",
              padding: 0,
              minWidth: "150px",
              marginBottom: "8px",
            }}
            fullWidth
          >
            <InputLabel
              sx={{
                fontSize: "small",
              }}
            >
              Classification
            </InputLabel>
            <Select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              sx={{
                fontSize: "small",
                padding: 0,
              }}
            >
              <MenuItem
                sx={{
                  fontSize: "small",
                  padding: "4px 8px",
                }}
                value="Equal Interval"
              >
                Equal Interval
              </MenuItem>
              <MenuItem
                sx={{
                  fontSize: "small",
                  padding: "4px 8px",
                }}
                value="Unique Classification"
              >
                Unique Classification
              </MenuItem>
            </Select>
          </FormControl>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={applyStyle}
          size="small"
          sx={{
            fontSize: "small",
            padding: 0,
            marginBottom: "8px",
          }}
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetLayerStyle}
          size="small"
          sx={{
            fontSize: "small",
            padding: 0,
            marginBottom: "8px",
          }}
        >
          Reset
        </Button>
      </Box>

      {generatedLegend.length > 0 && (
        <TemporaryLegend
          legendItems={generatedLegend}
          onToggle={handleToggleLegendItem}
        />
      )}
    </>
  );
};

export default FilterAndStyleBar;
