

export default function UserAccount(props) {

    return (
        <div className="contain">
            <div className="card">
                <div className="title">
                    <h3>My Account Details</h3>
                </div>
                <div className="body">
                    <p>Name: {props.currentUser.Name}</p>
                    <p>Department: {props.currentUser.Department}</p>
                    <p>Role: {props.currentUser.Role}</p>
                    <p>Email: {props.currentUser.Email}</p>
                    <p>Phone: {props.currentUser.Phone}</p>
                </div>
                <h4 onClick={()=>{
                    props.setToggleAccount(false);
                }}>Close</h4>
            </div>
        </div>
    )
}