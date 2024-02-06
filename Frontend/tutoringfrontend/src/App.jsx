// App.jsx
import React, {useState} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LoginForm from './components/LoginForm';
import WelcomePage from './components/WelcomePage';
import Homepage from "./components/Homepage.jsx";
import Header from "./minicomponents/Header.jsx";
import CreateAccount from "./components/CreateAccount.jsx";
import Subjects from "./components/Subjects.jsx";
import tutorsForSubject from "./components/TutorsForSubject.jsx";
import TutorsForSubject from "./components/TutorsForSubject.jsx";
import RequestSubjectAsTutor from "./components/RequestSubjectAsTutor.jsx";
import UserInfo from "./components/UserInfo.jsx";
import ChatTo from "./components/ChatTo.jsx";
import "./minicomponents/Context/MyUserContext.js"
import MyUserContext from "./minicomponents/Context/MyUserContext.js";
import Groups from "./components/Groups.jsx";
import AttendedSubjects from "./components/AttendedSubjects.jsx";
function App() {
    const [myUser,setMyUser]=useState(null);
    return (
        <>
            {/*react fragment se zove i koristi za grupitanje*/}
            <Header />
        {/*   sve sto je izvan routes je stalno tu a unutar njega je dinamicko */}
        <MyUserContext.Provider value={{myUser,setMyUser}}>
            <Router>

            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/createAccount" element={<CreateAccount />}></Route>
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/searchSubjects" element={<Subjects/>}/>
                <Route path="/requestSubjectsAsTutor" element={<RequestSubjectAsTutor/>}/>
                <Route path="/userInfoFor/:username" element={<UserInfo/>}/>
                <Route path="/chatTo/:objectUser" element={<ChatTo/>}></Route>

                <Route path="/tutorsFor/:subject" element={<TutorsForSubject/>}/>

                <Route path="/attendedCourses" element={<AttendedSubjects/>}/>

                <Route path="/groups" element={<Groups/>}/>

                {/*<Route path="/tutorsFor/:subject" element={<tutorsForSubject/>}> </Route>*/}
                <Route path="/" element={<Homepage />}></Route>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            {/*    da navigira bilo koji nedefinirani path na login*/}
            </Routes>
        </Router>
        </MyUserContext.Provider>
        </>
    );
}


export default App;
