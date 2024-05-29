import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import Lessons from "../minicomponents/Lessons.jsx";
import Assignments from "../minicomponents/Assignments.jsx";
import VideoCall from "../minicomponents/VideoCall.jsx";
import ChatForGroup from "../minicomponents/ChatForGroup.jsx";
import LessonList from "../minicomponents/LessonList.jsx";

const GroupOverview = () => {
    const { groupId } = useParams();
    const [activeTab, setActiveTab] = useState("chat");

    const renderTabContent = () => {
        switch (activeTab) {
            case "chat":
                return <ChatForGroup chatId={groupId} isGroupChat={true} />;
            case "lessons":
                return <LessonList groupId={groupId} />;
            case "assignments":
                return <Assignments groupId={groupId} />;
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
                <button onClick={() => setActiveTab("chat")}>Chat</button>
                <button onClick={() => setActiveTab("lessons")}>Lekcije</button>
                <button onClick={() => setActiveTab("assignments")}>Zadaci</button>
                <button onClick={() => setActiveTab("videoCall")}>Video poziv</button>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default GroupOverview;
