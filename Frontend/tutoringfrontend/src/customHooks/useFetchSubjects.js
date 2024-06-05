import {useEffect,useState} from "react";
import config from '../config.js';
//Za gettanje svih subjecta u svrhu pravljenja liste
const useFetchSubjects=()=>{
    const [subjects,setSubjects]=useState([]);
    const [error,setError]=useState(null);
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        const getSubjects= async ()=>{
            try
            {
                const response = await fetch('http://localhost:8080/api/allSubjects', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok)
                {
                    throw new Error('Problem with fetch');
                }
                else
                {
                    const data = await response.json();
                    setSubjects(data);
                }
            }
            catch (error) {
                    setError(error);
                    console.log("Error sa fetchom");
                } finally {
                    setLoading(false);  // Postavite loading na false kada se završi dohvat podataka
                }
            }
            getSubjects();
    },[]);

    return {subjects,error,loading};

};
export default useFetchSubjects;