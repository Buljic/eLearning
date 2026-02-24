import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Header from "./minicomponents/Header.jsx";

const LoginForm = lazy(() => import('./components/LoginForm'));
const WelcomePage = lazy(() => import('./components/WelcomePage'));
const Homepage = lazy(() => import("./components/Homepage.jsx"));
const CreateAccount = lazy(() => import("./components/CreateAccount.jsx"));
const Subjects = lazy(() => import("./components/Subjects.jsx"));
const TutorsForSubject = lazy(() => import("./components/TutorsForSubject.jsx"));
const RequestSubjectAsTutor = lazy(() => import("./components/RequestSubjectAsTutor.jsx"));
const UserInfo = lazy(() => import("./components/UserInfo.jsx"));
const ChatTo = lazy(() => import("./components/ChatTo.jsx"));
const ChatGroup = lazy(() => import("./components/ChatGroup.jsx"));
const AttendedSubjects = lazy(() => import("./components/AttendedSubjects.jsx"));
const SearchUsers = lazy(() => import("./components/SearchUsers.jsx"));
const CreateGroup = lazy(() => import("./components/CreateGroup.jsx"));
const GroupSearch = lazy(() => import("./components/GroupSearch.jsx"));
const GroupDetails = lazy(() => import("./components/GroupDetails.jsx"));
const GroupRequests = lazy(() => import("./components/GroupRequests.jsx"));
const GroupOverview = lazy(() => import("./components/GroupOverview.jsx"));
const AssignmentSubmissions = lazy(() => import("./minicomponents/AssignmentSubmissions.jsx"));
const SubmissionDetail = lazy(() => import("./minicomponents/SubmissionDetail.jsx"));
const AssignmentDetail = lazy(() => import("./minicomponents/AssignmentDetail.jsx"));

function App() {
    return (
        <>
            <Header />

            <Router>
                <Suspense fallback={<div style={{ padding: '1rem' }}>Loading...</div>}>
                    <Routes>
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/createAccount" element={<CreateAccount />} />
                        <Route path="/welcome" element={<WelcomePage />} />
                        <Route path="/searchSubjects" element={<Subjects />} />
                        <Route path="/requestSubjectsAsTutor" element={<RequestSubjectAsTutor />} />
                        <Route path="/userInfoFor/:username" element={<UserInfo />} />
                        <Route path="/chatTo/:objectUser" element={<ChatTo />} />
                        <Route path="/userSearch" element={<SearchUsers />} />
                        <Route path="/tutorsFor/:subject" element={<TutorsForSubject />} />

                        <Route path="/attendedCourses" element={<AttendedSubjects />} />
                        <Route path="/groupSearch" element={<GroupSearch />} />

                        <Route path="/createGroup" element={<CreateGroup />} />
                        <Route path="/groupDetails/:groupId" element={<GroupDetails />} />
                        <Route path="/groupRequests" element={<GroupRequests />} />

                        <Route path="/chatGroup/:objectGroup" element={<ChatGroup />} />
                        <Route path="/group/:groupId" element={<GroupOverview />} />

                        <Route path="/assignments/:assignmentId" element={<AssignmentDetail />} />
                        <Route path="/assignments/:assignmentId/submissions" element={<AssignmentSubmissions />} />
                        <Route path="/assignments/:assignmentId/submissions/:submissionId" element={<SubmissionDetail />} />
                        <Route path="/" element={<Homepage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </>
    );
}


export default App;
