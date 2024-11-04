export default function TablePagination(props) {
  const total = Math.ceil(props?.total / 5.0);

  const prevPage = () => {
    if (props.page !== 0) {
      props.setOffset(props.page - 10);
    }
  };

  const nextPage = () => {
    if (props.page + 12 < total * 10) {
      props.setOffset(props.page + 10);
    }
  };

  return (
    <div className="pagination">
      <i
        // className="fa fa-arrow-left"
        onClick={() => {
          prevPage();
        }}
      >Prev</i>
      <p>
        {props.page ? props.page / 10 + 1 : 1} / {total ? total : 1}
      </p>
      <i
        // className="fa fa-arrow-right"
        onClick={() => {
          nextPage();
        }}
      >Next</i>
    </div>
  );
}
