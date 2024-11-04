export default function MapSelect(props) {
  return (
    <div className="sel">
      <label htmlFor="">{props?.label}</label>
      <select
        name=""
        id=""
        onChange={(e) => {
          props.onChangeOption(e);
        }}
      >
        <option value={props?.default}>{props?.default}</option>

        {props?.data &&
          props?.data.map((item, index) => {
            return (
              <option key={index} value={item.i}>
                {item.i}
              </option>
            );
          })}
      </select>
    </div>
  );
}
