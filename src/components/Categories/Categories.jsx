import {
  faSearch,
  faTimes,
  faUserPlus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import "../../Styles/categories.scss";
import Button from "../Util/Button";
import Input from "../Util/Input";
import Loading from "../Util/Loading";
import Select from "../Util/Select";
import ApplicationBox from "./CategyBox";
import SelectedCategory from "./SelectedCategory";
import Success from "../Util/ConfirmSuccess";
import MyPagination from "../Pagination";

export default function Categories(props) {
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [ID, setID] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);
  const selected = useRef();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/categories/paginated/${offset * 12}`, {
      method: "get",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        setLoading(false);
        setData(data);
        if (data.data.length > 0) {
          setID(data.data[0].ID);
          setBeneficiaryDetails(data.data[0]);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  }, [refresh, offset]);

  function quickSearch(value) {
    setData(null);
    setLoading(true);
    fetch(`/api/categories/quicksearch/${value}`, {
      method: "get",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        setLoading(false);
        setData(data);
        if (data.data.length > 0) {
          setID(data.data[0].ID);
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  }

  const openConfirm = () => {
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    setShowConfirm(false);
    setClicked(false);
  };

  return (
    <div className="beneficiary">
      <div className="list">
        <div className="utp">
          <h3>Current Categories</h3>
          <p
            onClick={() => {
              setClicked(true);
            }}
          >
            <FontAwesomeIcon className="fa-add" icon={faPlus} /> New Category
          </p>

          <div className="search">
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Name..."
              onChange={(e) => {
                const v = e.target.value;
                if (v !== "") {
                  quickSearch(v);
                } else {
                  setRefresh(!refresh);
                }
              }}
            />
            <FontAwesomeIcon className="fa-search" icon={faSearch} />
          </div>
        </div>
        <hr />

        {isMobile ? (
          <div className="div31">
            <div>
              <div className="lcontainer">
                <div className="user-list">
                  {data &&
                    data?.data?.length > 0 &&
                    data?.data?.map((item, index) => {
                      return (
                        <ApplicationBox
                          key={index}
                          item={item}
                          ID={ID}
                          setID={setID}
                          setBeneficiaryDetails={setBeneficiaryDetails}
                          selected={selected}
                        />
                      );
                    })}
                </div>
              </div>
              {data && (
                <MyPagination
                  totalPages={Math.ceil(data?.total / 12)}
                  currentPage={offset + 1}
                  handlePageChange={(v) => {
                    setOffset(v);
                  }}
                />
              )}
            </div>

            <div ref={selected}>
              <div className="selected">
                <div>
                  <h4>Beneficiary Details</h4>
                  <hr />
                </div>

                {beneficiaryDetails ? (
                  beneficiaryDetails && (
                    <SelectedCategory
                      setLoading={setLoading}
                      beneficiaryDetails={beneficiaryDetails}
                      setRefresh={setRefresh}
                      refresh={refresh}
                      url="waterproviders"
                    />
                  )
                ) : (
                  <>
                    <p>Click on a category to see details</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="div31">
            <div>
              <div className="lcontainer">
                <div className="user-list">
                  {data &&
                    data?.data?.length > 0 &&
                    data?.data?.map((item, index) => {
                      return (
                        <ApplicationBox
                          key={index}
                          item={item}
                          ID={ID}
                          setID={setID}
                          setBeneficiaryDetails={setBeneficiaryDetails}
                          selected={null}
                        />
                      );
                    })}
                </div>
              </div>
              {data && (
                <MyPagination
                  totalPages={Math.ceil(data?.total / 12)}
                  currentPage={offset + 1}
                  handlePageChange={(v) => {
                    setOffset(v);
                  }}
                />
              )}
            </div>

            <div ref={selected}>
              <div className="selected">
                <div>
                  <h4>Category Details</h4>
                  <hr />
                </div>

                {beneficiaryDetails ? (
                  beneficiaryDetails && (
                    <SelectedCategory
                      setLoading={setLoading}
                      beneficiaryDetails={beneficiaryDetails}
                      setRefresh={setRefresh}
                      refresh={refresh}
                      url="waterproviders"
                    />
                  )
                ) : (
                  <>
                    <p>Click on a category to see details</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && <Loading />}
      </div>
      {clicked && (
        <Popup
          setClicked={setClicked}
          setRefresh={setRefresh}
          refresh={refresh}
          closeConfirm={closeConfirm}
          openConfirm={openConfirm}
          setShowConfirm={setShowConfirm}
          showConfirm={showConfirm}
        />
      )}
    </div>
  );
}

const Popup = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const name = useRef();
  const status = useRef();
  const fileRef = useRef();

  const [body, updateBody] = useState({
    Name: null,
    File: null,
    Status: null,
  });

  const createBeneficiary = () => {
    let d = body;
    d.Name = name.current.getValue();
    d.Status = status.current.getValue();
    d.File = fileRef.current.files[0];

    updateBody(d);

    const chck = Object.values(d);
    let valid = true;
    chck.map((item) => {
      if (item === "") {
        valid = false;
      }
    });
    if (!valid) return setError("All fields are required!");
    setLoading(true);

    const formData = new FormData();

    for (const i in body) {
      formData.append(i, body[i]);
    }



    setLoading(true);
    fetch(`/api/categories/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "",
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else throw Error("");
      })
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setError(data.success);
          props.setRefresh(!props.refresh);
          props.setShowConfirm(true);
          setTimeout(() => {
            props.setClicked(false);
          }, 1000);
        } else {
       
          setError(data.error);
        }
      
      })
      .catch((err) => {
  
        setLoading(false);
      });
  };

  return (
    <div className="popup">
      <div className="wrap">
        <div className="head">
          <h3>New Category</h3>
          <FontAwesomeIcon
            onClick={() => {
              props.setClicked(false);
            }}
            className="fa-times"
            icon={faTimes}
          />
        </div>

        <hr />
        <div className="new">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="div2equal">
              <Input ref={name} type="text" label="Name *" />
              <Select
                ref={status}
                data={[" ", "Active", "Inactive"]}
                label="Status *"
              />
            </div>
            {/* <div>
              <Input type="file" label="Image Thumbnail *" ref={fileRef} />
            </div> */}

            <div className="usrinput">
              <h4>Upload Thumbnail</h4>
              <input
                ref={fileRef}
                type="file"
                label="Upload File *"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".png, .jpg, .jpeg"
              />
            </div>

            <h6>{error}</h6>
            <Button handleClick={createBeneficiary} value="Submit" />
          </form>
          {loading && <Loading />}
        </div>
      </div>
      {props.showConfirm && (
        <Success closeConfirm={props.closeConfirm} action="created" />
      )}
    </div>
  );
};
