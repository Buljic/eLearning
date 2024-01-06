import React , {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {useParams} from "react-router-dom";

const tutorsForSubject = () =>{
    const { subject }=useParams();
    console.log({subject});

    const[tutors,setTutors]=useState([]);

    useEffect(()=>{
        const getTutorsForSubject=async()=>{
            const response=await fetch(`http://localhost:8080/api/getTutorsFor?subject=${subject}`, {
                method:'GET',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                }
            });
            if(!response.ok)
            {
                console.log("PROBLEM SA GETUTORSFORSUBJECT");
                throw new Error("problem sa GETUTORSFORSUBJECT");
            }
            else
            {
                const data=await response.json();
                console.log(data);//za ispis i provjeru

                setTutors(data);
            }
        }
        getTutorsForSubject();

    },[]);

    return (
        <div>
        <p>TEST- {subject}</p>
            <p>NESTO</p>

            {tutors && (
                <ul>
                    {tutors.map((tutor,index)=>(

                        <li key={index}>Tutor se zove {tutor.name} a ocjena mu je {tutor.teaching_grade}
                        username mu je {tutor.username}</li>

                    ))}
                </ul>
            )}
        </div>
    );

};

export default tutorsForSubject;