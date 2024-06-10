import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import Lessons from "../minicomponents/Lessons.jsx";
import AssignmentList from "../minicomponents/AssignmentList.jsx";
import VideoCall from "../minicomponents/VideoCall.jsx";
import ChatForGroup from "../minicomponents/ChatForGroup.jsx";
import LessonList from "../minicomponents/LessonList.jsx";
import { Container, Box, Typography, Button, Tabs, Tab } from '@mui/material';
import config from '../config.js';

const GroupOverview = () => {
    const { groupId } = useParams();
    const [activeTab, setActiveTab] = useState("chat");

    const storedUser = sessionStorage.getItem("myUser");
    const myUser = JSON.parse(storedUser);
    const isProfessor = myUser.accountType === "PROFESOR";

    const renderTabContent = () => {
        switch (activeTab) {
            case "chat":
                return <ChatForGroup chatId={groupId} isGroupChat={true} />;
            case "lessons":
                return <LessonList groupId={groupId} />;
            case "assignments":
                return <AssignmentList isProfessor={isProfessor} />;
            case "videoCall":
                return <VideoCall groupId={groupId} />;
            default:
                return <Chat chatId={groupId} isGroupChat={true} />;
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4">Pregled Grupe</Typography>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Chat" value="chat" />
                    <Tab label="Lekcije" value="lessons" />
                    <Tab label="Zadaci" value="assignments" />
                    <Tab label="Video poziv" value="videoCall" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {renderTabContent()}
                </Box>
            </Box>
        </Container>
    );
};

export default GroupOverview;
