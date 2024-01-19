import React from "react";
import {Link, useParams} from "react-router-dom";
import useFetchCertainUser from "../customHooks/useFetchCertainUser.js";
import "../css/subject.css";
const UserInfo=()=>{
    const {username}=useParams();
    console.log("PARAMETAR JE :"+username)
    const{userInfo,error,loading}=useFetchCertainUser(username);
    if(!userInfo)
    {
        return <h3>LOADING</h3>
    }
    if(userInfo)
    {
        console.log("INFORMACIJE"+userInfo);
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
        <Link to={`/chatTo/${userInfo.id}`}><h3>Zakaži termin</h3></Link>
        {/*//TODO username ili id*/}
        {userInfo && userInfo.subjects.map((subject, index) => (
            <div key={index} id="subjectPresent">
                <p>Predmet ID: {subject.subject_name}</p>
                {/*<p>Tutor ID: {subject.tutor_id}</p>*/}
                <p>Ocjena Predavanja: {subject.teaching_grade}</p>

                {/*<p>TODO dodati info tj custom bio za korisnika</p>*/}
            </div>
        ))}
    </div>
    );

}

export default UserInfo;