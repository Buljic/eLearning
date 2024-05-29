import React, { useState } from "react";
import Chat from "../minicomponents/Chat.jsx";
import Lessons from "../minicomponents/Lessons.jsx";
import Assignments from "../minicomponents/Assignments.jsx";
import VideoCall from "../minicomponents/VideoCall.jsx";


const GroupOverview = ({ groupId, isGroupChat }) => {
    const [activeTab, setActiveTab] = useState("chat");

    const renderTabContent = () => {
        switch (activeTab) {
            case "chat":
                return <Chat chatId={groupId} isGroupChat={isGroupChat} />;
            case "lessons":
                return <Lessons groupId={groupId} />;
            case "assignments":
                return <Assignments groupId={groupId} />;
            case "videoCall":
                return <VideoCall groupId={groupId} />;
            default:
                return <Chat chatId={groupId} isGroupChat={isGroupChat} />;
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
