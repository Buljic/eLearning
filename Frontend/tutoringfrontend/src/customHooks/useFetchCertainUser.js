import {useEffect, useState} from "react";


const useFetchCertainUser=(username)=>
{
    const [userInfo,setUserInfo]=useState(null);
    const [loading,setLoading]=useState(true);
    const [certainUserError,setCertainUserError]=useState(null);

    useEffect(()=>{

        const getCertainUser=async()=>{
            try{
                console.log("USERNAME JE:"+username)
                const response=await fetch(`http://localhost:8080/api/getUser/${username}`,{
                    method:'GET',
                    credentials:'include',
                    headers:{
                        'Content-Type':'application/json',
                    }
                });
                if(response.ok)
                {
                    const data=await response.json();
                    setUserInfo(data);
                    console.log("Informacije o korisniku"+data);
                }
                else{
                    console.log("Problem s fetchanjem certain usera");
                    throw new Error("Problem s fetchanjem certain usera");
                }

            }
            catch(error)
            {
                setCertainUserError(error);
                console.error("Problem CERTAIN USER",error);
            }
            finally{
                setLoading(false);
            }

        }
        getCertainUser();
    },[]);
    return {userInfo,certainUserError,loading};
}

export default useFetchCertainUser;