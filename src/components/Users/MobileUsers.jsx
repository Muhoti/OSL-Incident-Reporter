import { useEffect, useState } from "react";
import Loading from "../Util/Loading";
import Pagination from "../Util/Pagination";
import User from "./User";
import "../../Styles/users.scss";
import WaveLoading from "../Util/WaveLoading";

export default function MobileUsers(props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let url = `/api/mobile/paginated/${(currentPage - 1) * 12}`;
    setLoading(true);
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else throw Error("");
      })
      .then((data) => {
        setLoading(false);
        setData(data);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, [currentPage, props.filter, refresh]);

  return (
    <div className="users">
      <div className="list">
        <h3>Mobile App Users</h3>
        <div className="head">
          <h4>No</h4>
          <h4>Name</h4>
          <h4>Email</h4>
          <h4>Phone</h4>
          <h4>Role</h4>
        </div>
        <div className="content">
          {!loading &&
            data &&
            data?.result?.map((item, index) => {
 
              return (
                <User
                  refresh={refresh}
                  setRefresh={setRefresh}
                  key={index}
                  page={(currentPage - 1) * 12}
                  index={index}
                  item={item}
                  url="mobile"
                />
              );
            })}
        </div>
        {data?.total > 0 && (
          <Pagination
            totalPages={data?.total}
            handlePageChange={(v) => {
              setCurrentPage(v);
            }}
            currentPage={currentPage}
          />
        )}
        {loading && <WaveLoading />}
      </div>
    </div>
  );
}
