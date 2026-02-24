import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "../minicomponents/Chat.jsx";
import AssignmentList from "../minicomponents/AssignmentList.jsx";
import VideoCall from "../minicomponents/VideoCall.jsx";
import ChatForGroup from "../minicomponents/ChatForGroup.jsx";
import LessonList from "../minicomponents/LessonList.jsx";
import { Container, Box, Typography, Tabs, Tab, Alert } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VideoCallIcon from '@mui/icons-material/VideoCall';

const GroupOverview = () => {
    const { groupId } = useParams();
    const [activeTab, setActiveTab] = useState("chat");

    const myUser = useMemo(() => JSON.parse(sessionStorage.getItem("myUser")), []);
    if (!myUser) {
        return <Alert severity="warning">Morate biti prijavljeni da pristupite grupi.</Alert>;
    }
    const isProfessor = myUser.accountType === "PROFESOR";

    const renderTabContent = () => {
        switch (activeTab) {
            case "chat":
                return <ChatForGroup chatId={groupId} isGroupChat={true} />;
            case "lessons":
                return <LessonList groupId={groupId} />;
            case "assignments":
                return <AssignmentList isProfessor={isProfessor} groupId={groupId} />;
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
            <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Pregled Grupe</Typography>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            minWidth: 120,
                            flexGrow: 1,
                        },
                    }}
                >
                    <Tab icon={<ChatIcon />} label="Chat" value="chat" />
                    <Tab icon={<BookIcon />} label="Lekcije" value="lessons" />
                    <Tab icon={<AssignmentIcon />} label="Zadaci" value="assignments" />
                    <Tab icon={<VideoCallIcon />} label="Video poziv" value="videoCall" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {renderTabContent()}
                </Box>
            </Box>
        </Container>
    );
};

export default GroupOverview;
