import { useEffect, useRef, useState } from "react";

export default function EditDetails(props){
    const rfName = useRef();
    const rfPhone = useRef();

    const [msg, setMessage] = useState("");
    const [isErr, setIsError] = useState("");
    const [body, updateBody] = useState({
        Name: null,
        Phone: null
    });

    const editDetails = () => {
        if (props.isAuthenticated) {
            let d = body;
            d.Name = rfName.current.value;
            d.Phone = rfPhone.current.value;

            if (d.Phone.length<10) {
                setIsError("Phone Number must be usually 10 digits");
            }
            if (!d.Name.includes(" ")) {  
                setIsError("Enter a valid name including your Surname and Firstname");
            }  
            if (d.Name.length < 3) {
              setIsError("Name too short");
            }
            updateBody(d);

            if (d.Name.includes(" ") && d.Name.length > 3 && d.Phone.length === 10){
                fetch(`/api/auth/${props.currentUser.UserID}`, {
                  method: "PUT",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  body: JSON.stringify(body),
                })
                  .then((res) => {
                    if (res.ok) {
                      return res.json();
                    } else {
                      throw Error("Update Failed!!!");
                    }
                  })
                  .then((data) => {
                    if (data.success) return setMessage(data.success);
                    else return setIsError(data.error);
                  })
                  .catch((error) => {
                    setIsError("Failed!!");
                  });
            }
        }
    };
    
    return (
        <div className="contain">
            <div className="card">
                <div className="title">
                    <h3>Edit Details</h3>
                    <p className="msg">{msg}</p>
                    <p className="err">{isErr}</p>
                </div>
                <div className="body">
                    <form action="" onSubmit={(e)=>{
                        e.preventDefault(e);
                    }}>
                        <label htmlFor="">Name</label>
                        <input ref={rfName} type="text" placeholder={props.currentUser.Name} />
                        <label htmlFor="">Phone Number</label>
                        <input ref={rfPhone} type="text" placeholder={props.currentUser.Phone} />
                        <button className="button" onClick={editDetails}>Submit</button>
                    </form>
                </div>
                <h4 onClick={()=>{
                    props.setToggleDetails(false);
                }}>Close</h4>
            </div>
        </div>
    )
}