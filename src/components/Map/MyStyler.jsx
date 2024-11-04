import { useEffect, useState } from "react";
import Circle from "ol/style/Circle";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Vector from "ol/layer/Vector";
import { asArray } from "ol/color";
import Stroke from "ol/style/Stroke";
import Text from "ol/style/Text";
import { useRef } from "react";
import VectorLayer from "ol/layer/Vector";

export default function MyStyler(props) {
  const [active, setActive] = useState("Basic");

  const Item = (params) => {
    return (
      <p
        onClick={() => {
          params.setActive(params.name);
        }}
        className={params.active === params.name ? "active" : ""}
      >
        {params.name}
      </p>
    );
  };

  return (
    <div className="data_popup">
      <div className="bar">
        <Item name="Basic" active={active} setActive={setActive} />
        <Item name="Unique" active={active} setActive={setActive} />
        <Item name="Range" active={active} setActive={setActive} />
      </div>
      {active === "Basic" && (
        <BasicStyler
          setStyleSelector={props.setStyleSelector}
          map={props.map}
          body={props.body}
          setBody={props.setBody}
        />
      )}
      {active === "Unique" && (
        <UniqueStyler
          setStyleSelector={props.setStyleSelector}
          map={props.map}
          body={props.body}
          setBody={props.setBody}
        />
      )}
      {active === "Range" && (
        <RangeStyler
          setStyleSelector={props.setStyleSelector}
          map={props.map}
          body={props.body}
          setBody={props.setBody}
        />
      )}
    </div>
  );
}

const BasicStyler = (props) => {
  const opacity = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0];
  const width = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const font = [10, 12, 14, 16, 18, 20, 26, 30, 40];
  const [layrs, setLayrs] = useState([]);
  const [columns, setColumns] = useState([]);
  const [lcolumn, setLColumn] = useState("");
  const [lfont, setLFont] = useState(10);
  const [lcolor, setLColor] = useState("#000000");
  const [label, setLabel] = useState(false);
  const [title, setTitle] = useState("");
  const [fill, setFill] = useState("#606060");
  const [fopacity, setFOpacity] = useState(1);
  const [sfill, setSFill] = useState("#000000");
  const [swidth, setSWidth] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(12);

  useEffect(() => {
    let d = [];
    props.map?.getAllLayers().map((item, i) => {
      if (item instanceof Vector) {
        d.push(item.get("title"));
      }
    });
    setLayrs(d);
  }, []);

  useEffect(() => {
    if (title != "") {
      const i = props.body.Data.map((e) => {
        return e.url.split(":")[1];
      }).indexOf(title);
      if (i != -1 && props.body.Data[i]?.style?.type === "Basic") {
        const style = props.body.Data[i]?.style;
        if (style.fill !== fill) {
          setFill(style.fill);
        }
        if (style.opacity !== fopacity) {
          setFOpacity(style.opacity);
        }
        if (style.stroke !== sfill) {
          setSFill(style.stroke);
        }
        if (style.width !== swidth) {
          setSWidth(style.width);
        }
        if (style.label !== label) {
          setLabel(style.label);
        }
        if (style.lcolor !== lcolor) {
          setLColor(style.lcolor);
        }
        if (style.lfont !== lfont) {
          setLFont(style.lfont);
        }
        if (style.lcolumn !== lcolumn) {
          setLColumn(style.lcolumn);
        }
        if (style.offsetX !== offsetX) {
          setOffsetX(style.offsetX);
        }
        if (style.offsetY !== offsetY) {
          setOffsetY(style.offsetY);
        }
      }
    }
  }, [title]);

  function fillStyle(title, color, opacity, scolor, width) {
    if (props?.map?.getAllLayers()?.length > 1) {
      props.map?.getAllLayers().map((item, i) => {
        if (item.get("title") === title) {
          var colorArray = asArray(color ? color : fill).slice();
          colorArray[3] = opacity ? opacity : fopacity;

          item.setStyle((feature, resolution) => {
            if (label && lcolumn !== "") {
              let txt =
                feature.values_[lcolumn] == undefined
                  ? ""
                  : feature.values_[lcolumn];
              return new Style({
                image: new Circle({
                  radius: 6,
                  fill: new Fill({
                    color: colorArray,
                  }),
                  stroke: new Stroke({
                    color: scolor ? scolor : sfill,
                    width: width ? width : swidth,
                  }),
                }),
                fill: new Fill({
                  color: colorArray,
                }),
                stroke: new Stroke({
                  color: sfill,
                  width: swidth,
                }),
                text: new Text({
                  text: txt.toString(),
                  font: `${lfont}px sans-serif`,
                  fill: new Fill({
                    color: lcolor,
                  }),
                  offsetX: offsetX ? offsetX : 0,
                  offsetY: offsetY ? offsetY : 0,
                }),
              });
            } else {
              return new Style({
                image: new Circle({
                  radius: 6,
                  fill: new Fill({
                    color: colorArray,
                  }),
                  stroke: new Stroke({
                    color: scolor ? scolor : sfill,
                    width: width ? width : swidth,
                  }),
                }),
                fill: new Fill({
                  color: colorArray,
                }),
                stroke: new Stroke({
                  color: scolor ? scolor : sfill,
                  width: width ? width : swidth,
                }),
              });
            }
          });

          let d = props.body;
          const i = d.Data.map((e) => {
            return e.url.split(":")[1];
          }).indexOf(title);
          if (i != -1) {
            d.Data[i].style = {
              type: "Basic",
              fill: fill,
              opacity: fopacity,
              stroke: sfill,
              width: swidth,
              label: label,
              lcolor: lcolor,
              lfont: lfont,
              lcolumn: lcolumn,
              offsetX: offsetX,
              offsetY: offsetY,
            };
          }
          props.setBody(d);
        }
      });
    }
  }

  function populateColumns(title) {
    if (props?.map?.getAllLayers()?.length !== layrs.length) {
      let d = [];
      props.map?.getAllLayers().map((item, i) => {
        if (item.get("title") === title) {
          const features = item?.getSource()?.getFeatures();
          if (features && features.length > 0) {
            setColumns(Object.keys(features[0].values_));
          }
        }
      });
    }
  }

  useEffect(() => {
    fillStyle(title, null, null, null, null);
  }, [label, lcolumn, lcolor, lfont, offsetX, offsetY]);

  return (
    <div className="basic_styler">
      <h3>Select Layer</h3>
      <hr />
      <div className="row">
        <i className="fa fa-map"></i>
        <select
          onChange={(e) => {
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
      <h3>Style</h3>
      <hr />
      <div className="row">
        <input
          type="color"
          value={fill}
          onChange={(e) => {
            setFill(e.target.value);
            fillStyle(title, e.target.value, null);
          }}
        />
        <p>Fill color</p>
        <p>Opacity</p>
        <select
          onChange={(e) => {
            setFOpacity(e.target.value);
            fillStyle(title, null, e.target.value);
          }}
          name=""
          id=""
        >
          {opacity.map((item, i) => {
            return (
              <option key={i} value={item}>
                {item}
              </option>
            );
          })}
        </select>
      </div>
      <div className="row">
        <input
          type="color"
          value={sfill}
          onChange={(e) => {
            setSFill(e.target.value);
            fillStyle(title, null, null, e.target.value, null);
          }}
        />
        <p>Stroke color</p>
        <p>Width</p>
        <select
          value={swidth}
          onChange={(e) => {
            setSWidth(e.target.value);
            fillStyle(title, null, null, null, e.target.value);
          }}
          name=""
          id=""
        >
          {width.map((item, i) => {
            return (
              <option key={i} value={item}>
                {item}
              </option>
            );
          })}
        </select>
      </div>
      <h3>Label</h3>
      <hr />
      <div className="row">
        <input
          onChange={(e) => {
            setLabel(!label);
          }}
          checked={label}
          type="checkbox"
          name=""
          id=""
        />
        <select
          value={lcolumn}
          onChange={(e) => {
            setLColumn(e.target.value);
          }}
          name=""
          id=""
        >
          <option value="Select Column">Select Column</option>
          {columns.length > 0 &&
            columns.map((item, i) => {
              return (
                <option key={i} value={item}>
                  {item}
                </option>
              );
            })}
        </select>
        <select
          value={lfont}
          onChange={(e) => {
            setLFont(e.target.value);
          }}
          name=""
          id=""
        >
          {font.map((item, i) => {
            return (
              <option key={i} value={item}>
                {item}
              </option>
            );
          })}
        </select>
      </div>
      <div className="row">
        <input
          type="color"
          value={lcolor}
          onChange={(e) => {
            setLColor(e.target.value);
          }}
        />
        <p>Label color</p>
      </div>
      <div className="row">
        <input
          type="number"
          value={offsetX}
          onChange={(e) => {
            setOffsetX(e.target.value);
          }}
        />
        <p>Offset X</p>
      </div>
      <div className="row">
        <input
          type="number"
          value={offsetY}
          onChange={(e) => {
            setOffsetY(e.target.value);
          }}
        />
        <p>Offset Y</p>
      </div>
      <i
        onClick={() => {
          props.setStyleSelector(null);
        }}
        className="fa fa-close"
      >
        &#xf00d;
      </i>
    </div>
  );
};

const UniqueStyler = (props) => {
  const [layrs, setLayrs] = useState([]);
  const [columns, setColumns] = useState([]);
  const [lcolumn, setLColumn] = useState("");
  const [title, setTitle] = useState("");
  const [layerIndex, setlayerIndex] = useState(-1);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    let d = [];
    props.map?.getAllLayers().map((item, i) => {
      if (item instanceof Vector) {
        d.push(item.get("title"));
      }
    });
    setLayrs(d);
  }, []);

  function populateColumns(title) {
    if (props?.map?.getAllLayers()?.length !== layrs.length) {
      let d = [];
      props.map?.getAllLayers().map((item, i) => {
        if (item.get("title") === title) {
          const features = item?.getSource()?.getFeatures();
          if (features && features.length > 0) {
            setColumns(Object.keys(features[0].values_));
          }
        }
      });
    }
  }

  useEffect(() => {
    const ix = props.map
      ?.getAllLayers()
      .map((element) => {
        return element.get("title");
      })
      .indexOf(title);
    setlayerIndex(ix);

    if (ix !== -1) {
      const features = props.map?.getAllLayers()[ix].getSource().getFeatures();
      if (features.length > 0) {
        setColumns(Object.keys(features[0].values_));
      }
    }

    const i = props.body.Data.map((e) => {
      return e?.url.split(":")[1];
    }).indexOf(title);
    if (i != -1 && props.body.Data[i]?.style?.type === "Unique") {
      const style = props.body.Data[i]?.style;
      setLColumn(style.column);
    }
  }, [title]);

  useEffect(() => {
    if (layerIndex !== -1) {
      let d = props.body;
      const i = d.Data.map((e) => {
        return e.url.split(":")[1];
      }).indexOf(title);
      if (i != -1) {
        d.Data[i].style = {
          type: "Unique",
          classes: classes,
          column: lcolumn,
        };
        props.setBody(d);
      }
    }
  }, [classes]);

  useEffect(() => {
    clearStyle(title);
    if (layerIndex != -1 && lcolumn != "geometry" && lcolumn != "too_many") {
      const i = props.body.Data.map((e) => {
        return e.url.split(":")[1];
      }).indexOf(title);

      if (
        i !== -1 &&
        props.body.Data[i]?.style?.type === "Unique" &&
        props.body.Data[i]?.style?.classes?.length > 0
      ) {
        setClasses(props.body.Data[i]?.style?.classes);
        return;
      } else {
        const features = props?.map
          ?.getAllLayers()
          [layerIndex].getSource()
          .getFeatures();
        let values = [];
        features.forEach((element) => {
          values.push(element.values_[lcolumn]);
        });
        let unique = new Set(values);
        const arr = Array.from(unique);

        if (arr.length < 21) {
          let cls = [];
          arr.map((i) => {
            let count = 0;
            features.forEach((element) => {
              if (element.values_[lcolumn] === i) {
                count++;
              }
            });

            cls.push({ name: i, color: getRandomColor(), count: count });
          });
          setClasses(cls);

          if (i != -1) {
            let d = props.body;
            d.Data[i].style.type = "Unique";
            d.Data[i].style.column = lcolumn;
            d.Data[i].style.classes = cls;
            props.setBody(d);
          }
        } else {
          setClasses([]);
          setLColumn("Max classes: 20");
        }
      }
    }
  }, [lcolumn]);

  const getRandomColor = () => {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  function clearStyle(title) {
    if (props?.map?.getAllLayers()?.length > 1) {
      props.map?.getAllLayers().map((item) => {
        if (item.get("title") === title) {
          item
            .getSource()
            .getFeatures()
            .map((fitem) => {
              fitem.setStyle((feature, resolution) => {
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
              });
            });

          const i = props.body.Data.map((e) => {
            return e.url.split(":")[1];
          }).indexOf(title);

          if (i !== -1) {
            let d = props.body;
            d.Data[i].style = {
              type: "Basic",
              fill: "#F0A04B",
              stroke: "#3A98B9",
              width: 1,
            };
            props.setBody(d);
          }
        }
      });
    }
  }

  const Theme = (params) => {
    const [color, setColor] = useState(params.item.color);

    useEffect(() => {
      if (lcolumn != "") {
        const i = params.classes
          .map((e) => {
            return e.name;
          })
          .indexOf(params.item.name);
        if (i !== -1) {
          let d = params.classes;
          d[i].color = color;
          params.setClasses(d);
        }
        props.map?.getAllLayers()[layerIndex] instanceof VectorLayer &&
          props.map
            ?.getAllLayers()
            [layerIndex]?.getSource()
            .getFeatures()
            .map((item) => {
              if (
                lcolumn != "geometry" &&
                item.values_[lcolumn] === params.item.name
              ) {
                item.setStyle(
                  new Style({
                    image: new Circle({
                      radius: 6,
                      fill: new Fill({
                        color: color,
                      }),
                      stroke: new Stroke({
                        color: color,
                        width: 1,
                      }),
                    }),
                    fill: new Fill({
                      color: color,
                    }),
                    stroke: new Stroke({
                      color: color,
                      width: 1,
                    }),
                  })
                );
              }
            });
      }
    }, [color]);

    return (
      <div className="row">
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
          }}
        />
        <p>{params.item.name}</p>
      </div>
    );
  };

  return (
    <div className="basic_styler">
      <h3>Select Layer</h3>
      <hr />
      <div className="row">
        <i className="fa fa-map"></i>
        <select
          onChange={(e) => {
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
      <h3>Select Column</h3>
      <div className="row">
        <i className="fa fa-bars"></i>
        <select
          value={lcolumn}
          onChange={(e) => {
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
      <hr />
      <h3>Classes</h3>
      <div className="classes">
        {classes.length > 0 &&
          classes.map((item, i) => {
            return (
              <Theme
                key={i}
                item={item}
                classes={classes}
                setClasses={setClasses}
              />
            );
          })}
        {lcolumn === "geometry" && <p>This column is not supported</p>}
        {lcolumn === "too_many" && <p>Classes exceed the maximum (100)</p>}
      </div>
      <i
        onClick={() => {
          props.setStyleSelector(null);
        }}
        className="fa fa-close"
      >
        &#xf00d;
      </i>
    </div>
  );
};

const RangeStyler = (props) => {
  const [layrs, setLayrs] = useState([]);
  const [columns, setColumns] = useState([]);
  const [lcolumn, setLColumn] = useState("");
  const [title, setTitle] = useState("");
  const [layerIndex, setlayerIndex] = useState(-1);
  const [classes, setClasses] = useState([]);
  const [extents, setExtents] = useState([]);
  const [isNumeric, setIsNumeric] = useState(false);
  const [classification, setClassification] = useState("Select Classification");
  const [rangeOPopup, setRangePopup] = useState(null);

  useEffect(() => {
    let d = [];
    props.map?.getAllLayers().map((item, i) => {
      if (item instanceof Vector) {
        d.push(item.get("title"));
      }
    });
    setLayrs(d);
  }, []);

  useEffect(() => {
    if (title != "") {
      const ix = props.map
        ?.getAllLayers()
        .map((element) => {
          return element.get("title");
        })
        .indexOf(title);
      setlayerIndex(ix);

      if (ix != -1) {
        const features = props.map
          ?.getAllLayers()
          [ix].getSource()
          .getFeatures();
        if (features?.length > 0) {
          setColumns(Object.keys(features[0].values_));
        }
      }

      const i = props.body.Data.map((e) => {
        return e.url.split(":")[1];
      }).indexOf(title);
      if (i != -1 && props.body.Data[i]?.style?.type === "Range") {
        const style = props.body.Data[i]?.style;
        setLColumn(style.column);
        setClassification(style.classification);
      }
    }
  }, [title]);

  useEffect(() => {
    if (layerIndex !== -1) {
      let d = props.body;
      const i = d.Data.map((e) => {
        return e.url.split(":")[1];
      }).indexOf(title);
      if (i != -1) {
        d.Data[i].style = {
          type: "Range",
          classes: classes,
          column: lcolumn,
          classification: classification,
        };
        props.setBody(d);
      }
    }
  }, [classes]);

  function clearStyle(title) {
    if (props?.map?.getAllLayers()?.length > 1) {
      props.map?.getAllLayers().map((item) => {
        if (item.get("title") === title) {
          item
            .getSource()
            .getFeatures()
            .map((fitem) => {
              fitem.setStyle((feature, resolution) => {
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
              });
            });

          const i = props.body.Data.map((e) => {
            return e.url.split(":")[1];
          }).indexOf(title);

          if (i !== -1) {
            let d = props.body;
            d.Data[i].style = {
              type: "Basic",
              fill: "#F0A04B",
              stroke: "#3A98B9",
              width: 1,
            };
            props.setBody(d);
          }
        }
      });
    }
  }

  function populateColumns(title) {
    if (props?.map?.getAllLayers()?.length !== layrs.length) {
      let d = [];
      props.map?.getAllLayers().map((item, i) => {
        if (item.get("title") === title) {
          const features = item?.getSource()?.getFeatures();
          if (features && features.length > 0) {
            setColumns(Object.keys(features[0].values_));
          }
        }
      });
    }
  }

  useEffect(() => {
    if (layerIndex != -1 && lcolumn != "geometry" && lcolumn != "too_many") {
      const features = props?.map
        ?.getAllLayers()
        [layerIndex].getSource()
        .getFeatures();

      let values = [];
      features.forEach((element) => {
        values.push(element.values_[lcolumn]);
      });

      setIsNumeric(values.some(isNaN));
      setClasses([]);
      if (values.some(isNaN)) return;

      let min = arrayMin(values);
      let max = arrayMax(values);
      setExtents([min, max]);
    }
  }, [lcolumn]);

  useEffect(() => {
    const i = props.body.Data.map((e) => {
      return e?.url.split(":")[1];
    }).indexOf(title);

    if (classification === "Equal Interval") {
      if (
        i !== -1 &&
        props.body.Data[i]?.style?.type === "Range" &&
        props.body.Data[i]?.style?.classes?.length > 0
      ) {
        setClasses(props.body.Data[i]?.style?.classes);
        return;
      } else {
        let range = extents[1] - extents[0];
        let classes = 5;
        let interval = range / classes;
        let cls = [];

        const features = props?.map
          ?.getAllLayers()
          [layerIndex].getSource()
          .getFeatures();

        for (let i = 1; i < classes + 1; i++) {
          let lower = extents[0] + interval * (i - 1);
          let upper = extents[0] + interval * i;
          let count = 0;
          features.forEach((element) => {
           
            if (
              element.values_[lcolumn] >= lower &&
              element.values_[lcolumn] <= upper
            ) {
              count++;
            }
          });

          cls.push({
            name: `${withCommas(Number(lower).toFixed(2))} - ${withCommas(
              Number(upper).toFixed(2)
            )}`,
            color: getRandomColor(),
            min: Number(lower).toFixed(2),
            max: Number(upper).toFixed(2),
            count: count,
          });
        }
        setClasses(cls);

        if (i != -1) {
          let d = props.body;
          d.Data[i].style.type = "Range";
          d.Data[i].style.column = lcolumn;
          d.Data[i].style.classes = cls;
          d.Data[i].style.classification = classification;
          props.setBody(d);
        }
      }
    } else if (classification === "Custom Interval") {
      if (
        i !== -1 &&
        props.body.Data[i]?.style?.type === "Range" &&
        props.body.Data[i]?.style?.classes?.length > 0
      ) {
        setClasses(props.body.Data[i]?.style?.classes);
        return;
      }
    } else {
      setClasses([]);
      clearStyle(title);
    }
  }, [classification]);

  function addRange(name, min, max) {
    let cls = classes;
    cls.push({
      name: name,
      color: getRandomColor(),
      min: min,
      max: max,
    });
    setClasses(cls);
    const i = props.body.Data.map((e) => {
      return e.url.split(":")[1];
    }).indexOf(title);
    if (i != -1) {
      let d = props.body;
      d.Data[i].style.type = "Range";
      d.Data[i].style.column = lcolumn;
      d.Data[i].style.classes = cls;
      d.Data[i].style.classification = classification;
      props.setBody(d);
    }
  }

  function removeClass() {
    setClasses([]);
    clearStyle(title);
  }

  const getRandomColor = () => {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  function withCommas(x) {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function arrayMin(arr) {
    var len = arr.length,
      min = Infinity;
    while (len--) {
      if (Number(arr[len]) < min) {
        min = Number(arr[len]);
      }
    }
    return min;
  }

  function arrayMax(arr) {
    var len = arr.length,
      max = -Infinity;
    while (len--) {
      if (Number(arr[len]) > max) {
        max = Number(arr[len]);
      }
    }
    return max;
  }

  const Theme = (params) => {
    const [color, setColor] = useState(params.item.color);

    useEffect(() => {
      if (lcolumn != "" && layerIndex !== -1) {
        const i = params.classes
          .map((e) => {
            return e.name;
          })
          .indexOf(params.item.name);
        if (i !== -1) {
          let d = params.classes;
          d[i].color = color;
          params.setClasses(d);
        }
        props.map
          ?.getAllLayers()
          [layerIndex].getSource()
          .getFeatures()
          .map((item) => {
            if (
              Number(item.values_[lcolumn]) >= params.item.min &&
              Number(item.values_[lcolumn]) < params.item.max
            ) {
              item.setStyle(
                new Style({
                  image: new Circle({
                    radius: 6,
                    fill: new Fill({
                      color: color,
                    }),
                    stroke: new Stroke({
                      color: color,
                      width: 1,
                    }),
                  }),
                  fill: new Fill({
                    color: color,
                  }),
                  stroke: new Stroke({
                    color: color,
                    width: 1,
                  }),
                })
              );
            }
          });
      }
    }, [color]);

    return (
      <div className="row">
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
          }}
        />
        <p>{params.item.name}</p>
      </div>
    );
  };

  const RangePopup = (params) => {
    const name = useRef();
    const min = useRef();
    const max = useRef();

    return (
      <div className="range_popup">
        <div className="container">
          <h3>Range</h3>
          <hr />
          <div className="div2equal">
            <p>
              Min: <b>{params.extents[0]}</b>
            </p>
            <p>
              Max: <b>{params.extents[1]}</b>
            </p>
          </div>
          <hr />
          <div className="columns">
            <p>Name</p>
            <p>Min</p>
            <p>Max</p>
          </div>
          <div className="columns">
            <input ref={name} type="text" />
            <input ref={min} type="number" />
            <input ref={max} type="number" />
          </div>
          <button
            onClick={() => {
              if (
                name.current.value != "" &&
                min.current.value != "" &&
                max.current.value != ""
              ) {
                params.addRange(
                  name.current.value,
                  min.current.value,
                  max.current.value
                );
                setRangePopup(null);
              }
            }}
          >
            <i className="fa fa-check "></i>
          </button>
          <i
            onClick={() => {
              setRangePopup(null);
            }}
            className="fa fa-close"
          >
            &#xf00d;
          </i>
        </div>
      </div>
    );
  };

  return (
    <div className="basic_styler">
      <h3>Select Layer</h3>
      <hr />
      <div className="row">
        <i className="fa fa-map"></i>
        <select
          onChange={(e) => {
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
      <h3>Select Column</h3>
      <div className="row">
        <i className="fa fa-bars"></i>
        <select
          value={lcolumn}
          onChange={(e) => {
            setLColumn(e.target.value);
            setClasses([]);
            clearStyle(title);
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
      <h3>Select Classification</h3>
      <div className="row">
        <i className="fa fa-pie-chart">&#xf200;</i>
        <select
          value={classification}
          onChange={(e) => {
            setClassification(e.target.value);
          }}
          name=""
          id=""
        >
          <option value="Select Classification<">Select Classification</option>
          <option value="Equal Interval">Equal Interval</option>
          <option value="Custom Interval">Custom Interval</option>
        </select>
      </div>
      <hr />
      <h3>Classes</h3>
      <div className="classes">
        {classification === "Custom Interval" && (
          <>
            <div className="buttons">
              <i
                onClick={() => {
                  if (lcolumn !== "") {
                    setRangePopup(true);
                  }
                }}
                className="fa fa-plus-square"
              ></i>
              <i
                onClick={() => {
                  removeClass();
                }}
                className="fa fa-minus-square"
              ></i>
            </div>
          </>
        )}
        {classes &&
          classes.length > 0 &&
          classes.map((item, i) => {
            return (
              <Theme
                key={i}
                item={item}
                classes={classes}
                setClasses={setClasses}
              />
            );
          })}

        {isNumeric && title != "" && lcolumn != "" && (
          <p>No numeric values detected in this column</p>
        )}
      </div>
      {rangeOPopup && extents.length > 1 && (
        <RangePopup extents={extents} addRange={addRange} />
      )}
      <i
        onClick={() => {
          props.setStyleSelector(null);
        }}
        className="fa fa-close"
      >
        &#xf00d;
      </i>
    </div>
  );
};
