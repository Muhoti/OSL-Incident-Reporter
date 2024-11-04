import Input from "../../Util/Input";
import Button from "../../Util/Button";
import { useRef, useState } from "react";

export default function ChangePassword(props){
    const rfCurrentPassword = useRef();
    const rfNewPassword = useRef();
    const rfConfirmPassword = useRef();

    const [body, updateBody] = useState({
        Password: null,
        NewPassword: null,
        ConfirmNewPassword: null,
      });
    const [msg, setMessage] = useState(); 
    const [isErr, setIsError] = useState();


    const changePassword = () => {
        if (props.isAuthenticated){
            let d = body;
            d.Password = rfCurrentPassword.current.getValue();
            d.NewPassword = rfNewPassword.current.getValue();
            d.ConfirmNewPassword = rfConfirmPassword.current.getValue();
            updateBody(d);

            if (!body.Password) return setIsError("Old password is required!");
            if (!body.NewPassword || body.NewPassword?.length < 6)
                return setIsError("New Password must be at least 6 characters!");
            if (!validatePassword(body.NewPassword, body.ConfirmNewPassword))
                return setIsError("Old Password and New Password do not match");

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
                if (res.ok) return res.json();
                else throw Error("Change password Failed!");
              })
                .then((data) => {
                if (data.success) {
                    setTimeout(() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }, 1500);
                    return setMessage(`${data.success} Please login..`);
                } else return setIsError(data.error);
              })
              .catch((e) => {});
        };
    };

    const validatePassword = (newPassword, confirmNewPassword) => {
        return confirmNewPassword === newPassword;
    };

    return (
        <div className="changepasspopup">
            <div className="wrap">
                <i
                onClick={() => {
                    props.setToggleChangePass(false);
                }}
                className="fa fa-times"
                ></i>
                <h3>Change Password</h3>
                <p className="">You are still using a default password!</p>
                <div className="body">
                    <form action="" onSubmit={(e)=>{
                        e.preventDefault(e);
                    }}>
                        <Input ref={rfCurrentPassword} type="password" placeholder="Enter your current password" />
                        <Input ref={rfNewPassword} type="password" placeholder="Create New Password" />
                        <Input ref={rfConfirmPassword} type="password" placeholder="Confirm New Password" />
                        <p className="msg">{msg}</p>
                        <p className="err">{isErr}</p>
                        <Button handleClick={changePassword} value="Change Password"/>
                    </form>
                </div>
            </div>
        </div>
    )
}