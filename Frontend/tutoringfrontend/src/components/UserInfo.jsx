import React from "react";
import {useParams} from "react-router-dom";
import useFetchCertainUser from "../customHooks/useFetchCertainUser.js";
const UserInfo=()=>{
    const {username}=useParams();
    console.log("PARAMETAR JE :"+username)
    const{userInfo,error,loading}=useFetchCertainUser(username);
    if(!userInfo)
    {
        return <h3>LOADING</h3>
    }
    // if(loading){
    //     return (<div>
    //         <h2>Loading...</h2>
    //     </div>)
    // }

    // if(!loading){
    //     console.log(userInfo);
    // }

    return (<div>
        <p>Ime tutora je {userInfo.username}</p>
        {/*<p>Ocjena tutora je {userInfo.teaching_grade}</p>*/}
    </div>)

    //TODO PROMISE ERROR RIJESI
}

export default UserInfo;