import React from "react";
import {Link, useParams} from "react-router-dom";
import useFetchCertainUser from "../customHooks/useFetchCertainUser.js";
import "../css/subject.css";
import config from '../config.js';
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
        <p>Ime korisnika je {userInfo.username}</p>
        <p>Vrsta korisnika : {userInfo.account_type}</p>
        <p>Broj telefona : {userInfo.phone_number}</p>
        <p>Email : {userInfo.email}</p>

        <Link to={`/chatTo/${userInfo.id}`}><h3>Dopisivanje</h3></Link>
        {/*//TODO username ili id*/}
        {userInfo && userInfo.subjects && userInfo.subjects.map((subject, index) => (
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