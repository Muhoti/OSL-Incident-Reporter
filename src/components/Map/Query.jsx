import { useEffect, useState } from "react";
import $ from "jquery";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Circle from "ol/style/Circle";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { asArray } from "ol/color";

export default function Query(props) {
  const operators = ["=", ">", "<", ">=", "<=", "<>", "ILIKE"];
  const [layrs, setLayrs] = useState([]);
  const [title, setTitle] = useState("");
  const [layerIndex, setlayerIndex] = useState(-1);
  const [columns, setColumns] = useState([]);
  const [lcolumn, setLColumn] = useState("");
  const [operator, setOperator] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (props?.map?.getAllLayers().length - 1 !== layrs.length) {
      let d = [];
      props.map?.getAllLayers().map((item, i) => {
        if (item instanceof VectorLayer) {
          if (i != 0) {
            d.push(item.get("title"));
          }
        }
      });
      setLayrs(d);
    }
  }, [props.map, props?.map?.getAllLayers()]);

  function populateColumns(title) {
    if (props?.map?.getAllLayers()?.length !== layrs.length) {
      let d = props?.body?.Data?.map((e) => {
        return e.url.split(":")[1];
      }).indexOf(title);
      if (d !== -1) {
        setlayerIndex(d);
      }
      props.map?.getAllLayers().map((item, i) => {
        if (item.get("title") === title) {
          if (item instanceof VectorLayer) {
            const features = item.getSource().getFeatures();
            if (features.length > 0) {
              setColumns(Object.keys(features[0].values_.features[0].values_));
            }
          }
        }
      });
    }
  }

  function addToMap() {
    setError("");
    if (layerIndex !== -1 && value !== "" && operator !== "") {
      props.setIsLoading(true);
      var response = $.ajax({
        url: encodeURI(
          getUrl(
            props.body.Data[layerIndex].url.split(":")[0],
            props.body.Data[layerIndex].url.split(":")[1]
          )
        ),
        dataType: "json",
        success: {},
        error: function (xhr) {
          props.setIsLoading(false);
          setError("Oops! Something went wrong");
        },
      });
      $.when(response).done(function (data) {
        props.setIsLoading(false);
        setError("Items returned: " + data.features.length);
        if (data.features.length !== 0) {
          const i = props.map
            .getAllLayers()
            .map((e) => {
              return e.get("title");
            })
            .indexOf(title);

          if (i !== -1) {
            props.map.getAllLayers()[i].setSource(
              new VectorSource({
                features: new GeoJSON({}).readFeatures(response.responseJSON, {
                  featureProjection: props.map.getView().getProjection(),
                }),
              })
            );
            props.setExtent(
              props.map.getAllLayers()[i].getSource().getExtent()
            );
            props.map
              .getView()
              .fit(props.map.getAllLayers()[i].getSource().getExtent(), {
                padding: [50, 50, 50, 50],
              });
            let d = props?.body?.Data?.map((e) => {
              return e.url.split(":")[1];
            }).indexOf(title);
            if (d !== -1) {
              if (props.body.Data[d].style.type === "Basic") {
                props.map
                  .getAllLayers()
                  [i].setStyle(
                    fillStyle(
                      props.map.getAllLayers()[i],
                      props.body.Data[d].style
                    )
                  );
              } else if (props.body.Data[d].style.type === "Unique") {
                props.map
                  .getAllLayers()
                  [i].setStyle(
                    uniqueStyle(
                      props.map.getAllLayers()[i],
                      props.body.Data[d].style
                    )
                  );
              } else if (props.body.Data[d].style.type === "Range") {
                props.map
                  .getAllLayers()
                  [i].setStyle(
                    rangeStyle(
                      props.map.getAllLayers()[i],
                      props.body.Data[d].style
                    )
                  );
              }
            }
          }
        }
      });
    }
  }

  function resetMap() {
    setError("");
    if (layerIndex !== -1 && value !== "" && operator !== "") {
      props.setIsLoading(true);
      var response = $.ajax({
        url: encodeURI(
          getResetUrl(
            props.body.Data[layerIndex].url.split(":")[0],
            props.body.Data[layerIndex].url.split(":")[1]
          )
        ),
        dataType: "json",
        success: {},
        error: function (xhr) {
          props.setIsLoading(false);
          setError("Oops! Something went wrong");
        },
      });
      $.when(response).done(function (data) {
        props.setIsLoading(false);
        setError("Items returned: " + data.features.length);
        if (data.features.length !== 0) {
          const i = props.map
            .getAllLayers()
            .map((e) => {
              return e.get("title");
            })
            .indexOf(title);

          if (i !== -1) {
            props.map.getAllLayers()[i].setSource(
              new VectorSource({
                features: new GeoJSON({}).readFeatures(response.responseJSON, {
                  featureProjection: props.map.getView().getProjection(),
                }),
              })
            );
            props.setExtent(
              props.map.getAllLayers()[i].getSource().getExtent()
            );
            props.map
              .getView()
              .fit(props.map.getAllLayers()[i].getSource().getExtent(), {
                padding: [50, 50, 50, 50],
              });
            let d = props?.body?.Data?.map((e) => {
              return e.url.split(":")[1];
            }).indexOf(title);
            if (d !== -1) {
              if (props.body.Data[d].style.type === "Basic") {
                props.map
                  .getAllLayers()
                  [i].setStyle(
                    fillStyle(
                      props.map.getAllLayers()[i],
                      props.body.Data[d].style
                    )
                  );
              } else if (props.body.Data[d].style.type === "Unique") {
                props.map
                  .getAllLayers()
                  [i].setStyle(
                    uniqueStyle(
                      props.map.getAllLayers()[i],
                      props.body.Data[d].style
                    )
                  );
              } else if (props.body.Data[d].style.type === "Range") {
                props.map
                  .getAllLayers()
                  [i].setStyle(
                    rangeStyle(
                      props.map.getAllLayers()[i],
                      props.body.Data[d].style
                    )
                  );
              }
            }
          }
        }
      });
    }
  }

  function getUrl(workspace, layer) {
    if (operator === "ILIKE") {
      return `/api/geoserver/${workspace}/wfs?request=GetFeature&version=1.0.0&typeName=${workspace}:${layer}&CQL_FILTER=${lcolumn} ${operator} '%${value}%'&outputFormat=json`;
    } else
      return `/api/geoserver/${workspace}/wfs?request=GetFeature&version=1.0.0&typeName=${workspace}:${layer}&CQL_FILTER=${lcolumn}${operator}'${value}'&outputFormat=json`;
  }

  function getResetUrl(workspace, layer) {
    return `/api/geoserver/${workspace}/wfs?request=GetFeature&version=1.0.0&typeName=${workspace}:${layer}&outputFormat=json`;
  }

  function fillStyle(layer, style) {
    var colorArray = asArray(style.fill).slice();
    colorArray[3] = style.opacity;
    if (style.label) {
      layer
        .getSource()
        .getFeatures()
        .map((item) => {
          item.setStyle((feature, resolution) => {
            let txt =
              feature.values_[style.lcolumn] == undefined
                ? ""
                : feature.values_[style.lcolumn];

            return new Style({
              image: new Circle({
                radius: 6,
                fill: new Fill({
                  color: colorArray,
                }),
                stroke: new Stroke({
                  color: style.stroke,
                  width: style.width,
                }),
              }),
              fill: new Fill({
                color: colorArray,
              }),
              stroke: new Stroke({
                color: style.stroke,
                width: style.width,
              }),
              text: new Text({
                text: txt.toString(),
                font: `${style.lfont}px sans-serif`,
                fill: new Fill({
                  color: style.lcolor,
                }),
                offsetX: style.offsetX,
                offsetY: style.offsetY,
                overflow: false,
              }),
            });
          });
        });
    } else {
      return new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: colorArray,
          }),
          stroke: new Stroke({
            color: style.stroke,
            width: style.width,
          }),
        }),
        fill: new Fill({
          color: colorArray,
        }),
        stroke: new Stroke({
          color: style.stroke,
          width: style.width,
        }),
      });
    }
  }

  function uniqueStyle(layer, style) {
    layer
      .getSource()
      .getFeatures()
      .map((item) => {
        const i = style.classes
          .map((e) => {
            return e.name;
          })
          .indexOf(item.values_[style.column]);

        if (i !== -1) {
          item.setStyle(
            new Style({
              image: new Circle({
                radius: 6,
                fill: new Fill({
                  color: style.classes[i].color,
                }),
                stroke: new Stroke({
                  color: style.classes[i].color,
                  width: 1,
                }),
              }),
              fill: new Fill({
                color: style.classes[i].color,
              }),
              stroke: new Stroke({
                color: style.classes[i].color,
                width: 1,
              }),
            })
          );
        }
      });
  }

  function rangeStyle(layer, style) {
    style.classes.map((e) => {
      layer
        .getSource()
        .getFeatures()
        .map((item) => {
          if (
            Number(item.values_[style.column]) >= e.min &&
            Number(item.values_[style.column]) < e.max
          ) {
            item.setStyle(
              new Style({
                image: new Circle({
                  radius: 6,
                  fill: new Fill({
                    color: e.color,
                  }),
                  stroke: new Stroke({
                    color: e.color,
                    width: 1,
                  }),
                }),
                fill: new Fill({
                  color: e.color,
                }),
                stroke: new Stroke({
                  color: e.color,
                  width: 1,
                }),
              })
            );
          }
        });
    });
  }

  return (
    <div className="data_popup">
      <div className="basic_styler">
        <h3>Query data</h3>
        <hr />
        <p>Select Layer</p>
        <div className="row">
          <i className="fa fa-map"></i>
          <select
            onChange={(e) => {
              setError("");
              populateColumns(e.target.value);
              setTitle(e.target.value);
            }}
            name=""
            id=""
          >
            <option value="Select Layer">Select Layer</option>
            {layrs.length > 0 &&
              layrs.map((item, i) => {
                return (
                  <option key={i} value={item}>
                    {item}
                  </option>
                );
              })}
          </select>
        </div>

        <p>Select Column</p>
        <div className="row">
          <i className="fa fa-bars"></i>
          <select
            value={lcolumn}
            onChange={(e) => {
              setError("");
              setLColumn(e.target.value);
            }}
            name=""
            id=""
          >
            <option value="Select Column">Select Column</option>
            {columns.length > 0 &&
              columns.map((item, i) => {
                if (item !== "geometry") {
                  return (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  );
                }
              })}
          </select>
        </div>
        <p>Select Operator</p>
        <div className="row">
          <i className="fa fa-percent"></i>
          <select
            value={operator}
            onChange={(e) => {
              setError("");
              setOperator(e.target.value);
            }}
            name=""
            id=""
          >
            <option value="Select Column">Select Operator</option>
            {operators.length > 0 &&
              operators.map((item, i) => {
                if (item !== "geometry") {
                  return (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  );
                }
              })}
          </select>
        </div>
        <p>Your Input</p>
        <div className="row">
          <i className="fa fa-search"></i>
          <input
            className="query"
            onChange={(e) => {
              setError("");
              setValue(e.target.value);
            }}
            type="text"
          />
        </div>
        <p>{error}</p>
        <div className="div2equal">
          <button
            style={{ backgroundColor: "orange" }}
            onClick={() => {
              setOperator("Select Operator");
              setValue("");
              setLColumn("Select Column");
              resetMap();
            }}
          >
            <i className="fa fa-times "></i>
          </button>
          <button
            onClick={() => {
              addToMap();
            }}
          >
            <i className="fa fa-check "></i>
          </button>
        </div>

        <i
          onClick={() => {
            props.setQuerySelector(null);
          }}
          className="fa fa-close"
        >
          &#xf00d;
        </i>
      </div>
    </div>
  );
}
