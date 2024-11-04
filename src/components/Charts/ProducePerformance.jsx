import { useEffect, useState } from "react";
import logo from "../../assets/images/VCVector1.png";

const Item = (props) => {
  function withCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const percent = (
    ((parseInt(props.item.Avg) - parseInt(props.item.Produce)) /
      parseInt(props.item.Avg)) *
    100
  ).toFixed(2);

  const st = percent >= 0 ? "fa fa-angle-up" : "fa fa-angle-down";

  return (
    <div className="vc">
      <img src={props.logo} />
      <p>{props.item.ValueChain}</p>
      <h5>{withCommas(props.item.Avg)}</h5>
      <h5>{withCommas(props.item.Produce)}</h5>
      <h6>
        {" "}
        <span>
          <i className={st}></i>
        </span>{" "}
        {percent}%
      </h6>
    </div>
  );
};

export default function ProducePerformance(props) {
  const [avg, setAvg] = useState(null);
  const [produce, setProduce] = useState(null);
  const [merge, setMerge] = useState(null);
  const [livestockAcreage, setLivestockAcreag] = useState(null);
  const [cropAcreage, setCropAcreage] = useState(null);
  const [farmersIncigs, setFarmersInCigs] = useState(null);
  const [farmersInSaccos, setFarmersInSaccos] = useState(null);
  const [farmersInPos, setFarmersInPOs] = useState(null);

  const [totalcigs, setTotalCigs] = useState(null);
  const [totalSaccos, setTotalSaccos] = useState(null);
  const [totalPos, setTotalPOs] = useState(null);

  const [farmerGroups, setFarmerGroups] = useState(null);
  //let merge;

  useEffect(() => {
    fetch("/valuechainproduce/produce/summary")
      .then((res) => {
        if (res.ok) return res.json();
        else throw Error("");
      })
      .then((data) => {
        setAvg(data.average);
        setProduce(data.produce);
        let merge = data.average.map((item, i) =>
          Object.assign({}, item, data.produce[i])
        );
        setMerge(merge);
      })
      .catch((e) => {});
  }, []);

  useEffect(() => {
    fetch("/farmergroups/sumstats")
      .then((res) => {
        if (res.ok) return res.json();
        else throw Error("");
      })
      .then((data) => {
        setLivestockAcreag(data.tlivestockAcreage[0]?.totalLivestockAcreage);
        setCropAcreage(data.tCropAcreage[0]?.totalCropAcreage);
        data.farmersCount?.forEach((item, index) => {
          if (item.Type === "CIG") {
            setFarmersInCigs(item.Count);
          }
          if (item.Type === "P.O") {
            setFarmersInPOs(item.Count);
          }
          if (item.Type === "SACCO") {
            setFarmersInSaccos(item.Count);
          }
        });
        data.farmerGroup?.forEach((item, index) => {
          if (item.Type === "CIG") {
            setTotalCigs(item.Count);
          }
          if (item.Type === "P.O") {
            setTotalPOs(item.Count);
          }
          if (item.Type === "SACCO") {
            setTotalSaccos(item.Count);
          }
        });
      })
      .catch((e) => {});
  }, []);

  function withCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <div className="stats">
      <div className="produceperformance">
        <div>
          <h2>Produce Performance</h2>
        </div>
        <div className="vcs">
          <div className=" vc">
            <p></p>
            <p>Value Chain</p>
            <p>Average</p>
            <p>Produce</p>
            <p>Performance</p>
          </div>
          {merge &&
            merge.map((item, index) => {
              return <Item key={index} item={item} logo={logo} />;
            })}
        </div>
      </div>
      <div className="summaryStats">
        <div>
          <h2>Summary Statistics</h2>
        </div>
        <div className="cigs">
          <div className="cig">
            <>
              <h4>Farmer Associations</h4>
              <div className="total">
                <h5>
                  Common Interest Groups (CIGs){" "}
                  <span>{totalcigs ? withCommas(totalcigs) : 0}</span>
                </h5>
              </div>
              <div className="total">
                <p className="l">
                  Farmers in CIGs{" "}
                  <span>{farmersIncigs ? withCommas(farmersIncigs) : 0}</span>
                </p>
              </div>
              <div className="total">
                <h5>
                  Producer Organisations (POs){" "}
                  <span>{totalPos ? withCommas(totalPos) : 0}</span>
                </h5>
              </div>
              <div className="total">
                <p className="l">
                  Farmers in POs{" "}
                  <span>{farmersInPos ? withCommas(farmersInPos) : 0}</span>
                </p>
              </div>
              <div className="total">
                <h5>
                  SACCOs{" "}
                  <span>{totalSaccos ? withCommas(totalSaccos) : 0}</span>
                </h5>
              </div>
              <div className="total">
                <p className="l">
                  Farmers in SACCOs{" "}
                  <span>
                    {farmersInSaccos ? withCommas(farmersInSaccos) : 0}
                  </span>
                </p>
              </div>
            </>
            <h4>Farmer Resources</h4>
            <div className="total">
              <p className="l">
                Acreage under Livestock Farming{" "}
                <span>
                  {livestockAcreage ? withCommas(livestockAcreage) : 0} Ha
                </span>
              </p>
            </div>
            <div className="total">
              <p className="l">
                Acreage under Crop Farming{" "}
                <span>{cropAcreage ? withCommas(cropAcreage) : 0} Ha</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
