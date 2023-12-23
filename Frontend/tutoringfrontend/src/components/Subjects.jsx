import React, {useEffect, useState} from "react";

//Moze se koristiti i tj
/*
    const ImeKomponente = () => {return };
    a takodjer i
    function ImeKomponente () {return ();};

    i za oba ... export default ImeKomponente

 */
const Subjects = () => {
    //koristi se [] u usestate za nizove
    const[subjects,setSubjects]=useState([]);
    const[searchTerm,setSearchTerm]=useState('');
    const[showSuggestions,setShowSuggestions]=useState(false);

    useEffect( () =>{
        const getAllSubjects= async()=>{
            const response=await fetch('http://localhost:8080/api/allSubjects',{
                method:'GET',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                }
            });
            if(!response.ok)
            {
                console.log("Problem s fetchom");
                throw new Error('Problem with fetch on subjects');
            }else{
                const data=await response.json();
                setSubjects(data);
            }
        }
        getAllSubjects();
    },[]);

    const handleSearchChange=(event )=>{
        setSearchTerm(event.target.value);
        setShowSuggestions(true);
    };
    //ternarni operator ide sintaksa condition ? expressionIfTrue : ...ifFalse
    //filter kreira novi niz iz originalnog koji zadovoljavaju neki uvjet
    //array.filter(element=>{});
    //filter prolazi kroz svaki element u ovom nad kojim se poziva isto foreach
    const filteredSubjects=searchTerm
        //subject je trenutni element niza subjects  koji se obradjuje
    ? subjects.filter(subject=> subject.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    //koristi se da obradjuje se kada se pritisne neki suggested test ovdje
    const handleSuggestionClick = (subject)=>{
        setSearchTerm(subject);
        setShowSuggestions(false);
    }//moze bilo koje ime u argument ali bitno je da se ne proslijedjuje event neki

    return(
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={()=>setShowSuggestions(false)}
                onFocus={()=>searchTerm && setShowSuggestions(true)}
                placeholder="Pretrazi predmete"
                />
            {showSuggestions && searchTerm && (
                <ul>
                    {filteredSubjects.map(subject=>(
                        <li key={subject} onClick={()=>handleSuggestionClick(subject)}>{subject}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Subjects