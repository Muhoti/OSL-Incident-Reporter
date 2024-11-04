export default function UserActivity(props) {
  return (
    <div className="activity">
      <h4>{props.Name}</h4>
      <div className="div2equal">
        <p>
          {props.created === props.updated ? "User created" : "User updated"}
        </p>
        <p>
          {props.updated.split("T")[1]} {props.updated.split("T")[0]}
        </p>
      </div>
    </div>
  );
}
