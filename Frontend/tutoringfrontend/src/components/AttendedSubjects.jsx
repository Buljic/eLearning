import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const AttendedSubjects=()=>{

    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);

    const [attendedGroups,setAttendedGroups]=useState([]);

    useEffect(()=>{
        const getAttendedSubjects=async()=>{
            const response=await fetch(`http://localhost:8080/api/getAttendedGroups?userId=${myUser.id}`,{
                method:'GET',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                }
            });
            if (!response.ok)
            {
                throw new Error('Problem s fetchanjem attended groups');
            }
            else{
                const data= await response.json();
                setAttendedGroups(data);
                attendedGroups.forEach(subject=>{
                    console.log('ovo je grupa'+ subject.group_id);
                });
            }
        }
        getAttendedSubjects();
    },[]);
    if(!attendedGroups)
    {
        return <h1>Ucitavanje ...</h1>
    }
    return(
      <div>
          <h1>Pohađani kursevi</h1>

          <br/>
          {attendedGroups && (
              <ul id="attendedGroups">
                  {attendedGroups.map((group, index)=>(
                      <li key={index} id={group}>
                           <Link to={`/chatGroup/${group.group_id}`}>  {group.group_name}</Link>
                      </li>
                  ))}
              </ul>
          )}
      </div>

    );

}
export default AttendedSubjects;
