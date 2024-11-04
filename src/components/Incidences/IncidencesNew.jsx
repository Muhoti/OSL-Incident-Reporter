import { useEffect, useState } from "react";
import "../../Styles/stats.scss";
import { useLayoutEffect } from "react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { BsImages, BsFiletypeCsv } from "react-icons/bs";
import Input from "../Util/FilterInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Pie from "../home/Pie";
import moment from "moment/moment";
import { TopItem } from "../home/TopItem";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

export default function IncidencesNew(props) {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState(null);
  const chrt = useRef(null);
  const [showing, setShowing] = useState(true);
  const [aspect, setAspect] = useState(1.5);
  const [aspect1, setAspect1] = useState(1.5);
  const [start, setStart] = useState("2023-01-01");
  const [end, setEnd] = useState("");
  const tb = useRef();

  const today = moment().format("YYYY-MM-DD");

  useEffect(() => {
    setEnd(today);
  }, []);

  const p1ref = useRef();
  const p2ref = useRef();
  const p3ref = useRef();

  const b1ref = useRef();
  const b2ref = useRef();

  const h1ref = useRef();
  const h2ref = useRef();

  useLayoutEffect(() => {
    const { width, height } = p1ref.current.getBoundingClientRect();

    setAspect(width / height);
    setAspect1(width / (height * 0.8));
  }, []);

  const handleDownloadImage = async (printRef) => {
    const element = printRef.current;
    const canvas = await html2canvas(element);

    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = "image.jpg";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  const saveData = (data) => {
    if (data.length > 0) {
      let rows = [];
      rows.push(Object.keys(data[0]));
      data.map((item) => {
        rows.push(Object.values(item));
      });
      let csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "data.csv");
      document.body.appendChild(link);
      link.click();
    }
  };

  useEffect(() => {
    setShowing(false);
    setTimeout(() => {
      setShowing(true);
    }, 1);
  }, [props.showing]);

  useEffect(() => {
    if (start !== "" && end !== "") {
      fetch(`/api/reports/all/stats/${start}/${end}`)
        .then((res) => {
          if (res.ok) return res.json();
          else throw Error("");
        })
        .then((data) => {
          setData(data);
        })
        .catch((e) => {});
    }
  }, [start, end]);

  useEffect(() => {
    if (start !== "" && end !== "") {
      fetch(`/api/reports/all/charts/${start}/${end}`)
        .then((res) => {
          if (!res.ok) {
            throw Error("Could not fetch data!!!");
          } else {
            return res.json();
          }
        })
        .then((data) => {
          setProjects(data);
        })
        .catch((e) => {});
    }
  }, [start, end]);

  const exportToPDF = (title, ref) => {
    html2canvas(ref).then((canvas) => {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${title}.png`;
      downloadLink.click();
    });
  };

  const exportToExcel = (filename, data) => {};

  return (
    <>
      {showing && (
        <div className="stats">
          <div className="filter">
            <Input
              handleChange={(e) => {
                setStart(e);
              }}
              type="date"
              value={start}
              label="Start Date"
            />
            <Input
              handleChange={(e) => {
                setEnd(e);
              }}
              type="date"
              value={end}
              label="End Date"
            />
            <FontAwesomeIcon
              onClick={() => {
                exportToPDF(props.title, tb.current);
                exportToExcel(props.title, data);
              }}
              className="download"
              icon={faDownload}
            />
          </div>
          <Grid2 container spacing={3}>
            <Grid2 item md={3}>
              <TopItem
                title="Total Incidences"
                value={data ? data?.Total[0].total : 0}
                color="#C9EEFF"
              />
            </Grid2>
            <Grid2 item md={3}>
              <TopItem
                item
                md={3}
                title="Pipe Leaks"
                value={data ? data?.Leakage[0].total : 0}
                color="#F1DEC9"
              />
            </Grid2>
            <Grid2 item md={3}>
              <TopItem
                item
                md={3}
                title="Sewer Burst"
                value={data ? data?.SewerBurst[0].total : 0}
                color="#FBFFB1"
              />
            </Grid2>
            <Grid2 item md={3}>
              <TopItem
                item
                md={3}
                title="Illegal Connections"
                value={data ? data?.IllegalConnection[0].total : 0}
                color="#FFA3FD"
              />
            </Grid2>
            <Grid2 item md={4}>
              <TopItem
                item
                md={4}
                title="Supply Fail"
                value={data ? data?.SupplyFail[0].total : 0}
                color="#C9F4AA"
              />
            </Grid2>
            <Grid2 item md={4}>
              <TopItem
                title="Vandalism Cases"
                value={data ? data?.Vandalism[0].total : 0}
                color="#FFFBEB"
              />
            </Grid2>
            <Grid2 item md={4}>
              <TopItem
                item
                md={3}
                title="Other Incidences"
                value={data ? data?.Other[0].total : 0}
                color="#FBFFB2"
              />
            </Grid2>
          </Grid2>

          <div className="pies">
            <div ref={p1ref} className="chart">
              <h3>Pipe Leaks</h3>
              {projects && <Pie data={projects?.Leakage} aspect={aspect} />}
              <div className="save">
                <BsImages
                  color="blue"
                  onClick={() => {
                    handleDownloadImage(p1ref);
                  }}
                />
                <BsFiletypeCsv
                  color="blue"
                  onClick={() => {
                    saveData(projects?.Leakage);
                  }}
                />
              </div>
            </div>
            <div ref={p2ref} className="chart">
              <h3>Sewer Burst</h3>
              {projects && <Pie data={projects?.SewerBurst} aspect={aspect} />}
              <div className="save">
                <BsImages
                  color="blue"
                  onClick={() => {
                    handleDownloadImage(p2ref);
                  }}
                />
                <BsFiletypeCsv
                  color="blue"
                  onClick={() => {
                    saveData(projects?.SewerBurst);
                  }}
                />
              </div>
            </div>
            <div ref={p3ref} className="chart">
              <h3>Illegal Connections</h3>
              {projects && (
                <Pie data={projects?.IllegalConnection} aspect={aspect} />
              )}
              <div className="save">
                <BsImages
                  color="blue"
                  onClick={() => {
                    handleDownloadImage(p3ref);
                  }}
                />
                <BsFiletypeCsv
                  color="blue"
                  onClick={() => {
                    saveData(projects?.IllegalConnection);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="pies">
            <div ref={p3ref} className="chart">
              <h3>Supply Fail</h3>
              {projects && <Pie data={projects?.SupplyFail} aspect={aspect} />}
              <div className="save">
                <BsImages
                  color="blue"
                  onClick={() => {
                    handleDownloadImage(p3ref);
                  }}
                />
                <BsFiletypeCsv
                  color="blue"
                  onClick={() => {
                    saveData(projects?.SupplyFail);
                  }}
                />
              </div>
            </div>

            <div ref={p3ref} className="chart">
              <h3>Vandalism</h3>
              {projects && <Pie data={projects?.Vandalism} aspect={aspect} />}
              <div className="save">
                <BsImages
                  color="blue"
                  onClick={() => {
                    handleDownloadImage(p3ref);
                  }}
                />
                <BsFiletypeCsv
                  color="blue"
                  onClick={() => {
                    saveData(projects?.Vandalism);
                  }}
                />
              </div>
            </div>
            <div ref={p3ref} className="chart">
              <h3>Other</h3>
              {projects && <Pie data={projects?.Other} aspect={aspect} />}
              <div className="save">
                <BsImages
                  color="blue"
                  onClick={() => {
                    handleDownloadImage(p3ref);
                  }}
                />
                <BsFiletypeCsv
                  color="blue"
                  onClick={() => {
                    saveData(projects?.Other);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
