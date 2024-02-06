import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

const AttendedSubjects=()=>{

    const storedUser=sessionStorage.getItem('myUser');
    const myUser=JSON.parse(storedUser);

    const [attendedSubjects,setAttendedSubjects]=useState([]);

    useEffect(()=>{
        const getAttendedSubjects=async()=>{
            const response=await fetch(`http://localhost:8080/api/getAttendedSubjects?userid=${myUser.id}`,{
                method:'GET',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                }
            });
            if (!response.ok)
            {
                throw new Error('Problem s fetchanjem attended subjects');
            }
            else{
                const data= await response.json();
                setAttendedSubjects(data);
                attendedSubjects.forEach(subject=>{
                    console.log('ovo je predmet'+ subject);
                })
            }
        }
        getAttendedSubjects();
    },[]);
    if(!attendedSubjects)
    {
        return <h1>Ucitavanje ...</h1>
    }
    return(
      <div>
          <h1>Pohađani kursevi</h1>

          <br/>
          {attendedSubjects && (
              <ul id="attendedSubjects">
                  {attendedSubjects.map((subject,index)=>(
                      <li key={index} id={subject}>
                          <button onClick={/*()=><Link to=''}></Link>*/}>
                              {subject}
                          </button>
                      </li>
                  ))}
              </ul>
          )}
      </div>

    );

}
export default AttendedSubjects;
