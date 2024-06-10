// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
//
// const AttendedSubjects = () => {
//     const storedUser = sessionStorage.getItem('myUser');
//     const myUser = JSON.parse(storedUser);
//
//     const [attendedGroups, setAttendedGroups] = useState([]);
//
//     useEffect(() => {
//         const getAttendedSubjects = async () => {
//             try {
//                 const response = await fetch(`http://localhost:8080/api/getAttendedGroups?userId=${myUser.id}`, {
//                     method: 'GET',
//                     credentials: 'include',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     }
//                 });
//                 if (!response.ok) {
//                     throw new Error('Problem s fetchanjem attended groups');
//                 } else {
//                     const data = await response.json();
//                     setAttendedGroups(data);
//                     data.forEach(subject => {
//                         console.log('Ovo je grupa ' + subject.group_id);
//                     });
//                 }
//             } catch (error) {
//                 console.error(error);
//             }
//         }
//         getAttendedSubjects();
//     }, [myUser.id]);
//
//     if (!attendedGroups.length) {
//         return <h1>Učitavanje ...</h1>
//     }
//
//     return (
//         <div>
//             <h1>Pohađani kursevi</h1>
//             <br />
//             {attendedGroups.length > 0 && (
//                 <ul id="attendedGroups">
//                     {attendedGroups.map((group, index) => (
//                         <li key={index} id={group.group_id}>
//                             {/*<Link to={`/chatGroup/${group.group_id}`}>{group.group_name}</Link>*/}
//                             <Link to={`/group/${group.group_id}`}>{group.group_name}</Link>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// }
//
// export default AttendedSubjects;
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from '../config.js';
const AttendedSubjects = () => {
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);

    const [attendedGroups, setAttendedGroups] = useState([]);

    useEffect(() => {
        const getAttendedSubjects = async () => {
            const response = await fetch(`${config.BASE_URL}/api/getAttendedGroups?userId=${myUser.id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Problem s fetchanjem attended groups');
            } else {
                const data = await response.json();
                setAttendedGroups(data);
            }
        }
        getAttendedSubjects();
    }, []);

    if (!attendedGroups.length) {
        return <h1>Učitavanje...</h1>;
    }

    return (
        <div>
            <h1>Vasi kursevi</h1>
            <br />
            {attendedGroups.length > 0 && (
                <ul id="attendedGroups">
                    {attendedGroups.map((group, index) => (
                        <li key={index} id={group.group_id}>
                            <Link to={`/group/${group.group_id}`}>{group.group_name}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AttendedSubjects;
