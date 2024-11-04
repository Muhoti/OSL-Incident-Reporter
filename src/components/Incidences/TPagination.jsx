export default function TPagination(props) {
  const total = Math.ceil(props?.total / 5);

  const prevPage = () => {
    if (props.offset !== 0) {
      props.setOffset(props.offset - 1);
    }
  };

  const nextPage = () => {
    const limit = (props.offset + 1) * 5;
    if (limit < props.total) {
      props.setOffset(props.offset + 1);
    }
  };

  return (
    <div className="pagination">
      <div className="pg_container">
        <i
          className="fa fa-arrow-left"
          onClick={() => {
            prevPage();
          }}
        ></i>
        <p>
          {props.offset + 1} / {total}
        </p>
        <i
          className="fa fa-arrow-right"
          onClick={() => {
            nextPage();
          }}
        ></i>
      </div>
    </div>
  );
}
