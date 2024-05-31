import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import LessonList from "../minicomponents/LessonList.jsx";
import Assignments from "../minicomponents/Assignments.jsx";
import VideoCall from "../minicomponents/VideoCall.jsx";
import ChatForGroup from "../minicomponents/ChatForGroup.jsx";
import AssignmentDetail from "../minicomponents/AssignmentDetail.jsx";

const GroupOverview = () => {
    const { groupId } = useParams();
    const [activeTab, setActiveTab] = useState("chat");
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);

    const renderTabContent = () => {
        switch (activeTab) {
            case "chat":
                return <ChatForGroup chatId={groupId} isGroupChat={true} />;
            case "lessons":
                return <LessonList groupId={groupId} />;
            case "assignments":
                return selectedAssignment ? (
                    <AssignmentDetail assignment={selectedAssignment} userId={myUser.id} userType={myUser.accountType} />
                ) : (
                    <Assignments groupId={groupId} onSelectAssignment={setSelectedAssignment} />
                );
            case "videoCall":
                return <VideoCall groupId={groupId} />;
            default:
                return <Chat chatId={groupId} isGroupChat={true} />;
        }
    };

    return (
        <div>
            <h1>Pregled Grupe</h1>
            <div className="tabs">
                <button onClick={() => { setActiveTab("chat"); setSelectedAssignment(null); }}>Chat</button>
                <button onClick={() => { setActiveTab("lessons"); setSelectedAssignment(null); }}>Lekcije</button>
                <button onClick={() => { setActiveTab("assignments"); setSelectedAssignment(null); }}>Zadaci</button>
                <button onClick={() => { setActiveTab("videoCall"); setSelectedAssignment(null); }}>Video poziv</button>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default GroupOverview;
