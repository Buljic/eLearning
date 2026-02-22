import { useState } from 'react';
import config from '../config.js';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import { notify } from '../utils/notifications.js';

const CreateLessonModal = ({ show, handleClose, groupId }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleCreateLesson = async () => {
        const formData = new FormData();
        const lessonData = JSON.stringify({
            group: { group_id: groupId },  // Promijenjeno iz groupId u group_id
            title,
            content
        });
        formData.append("lesson", new Blob([lessonData], { type: "application/json" }));
        files.forEach(file => {
            formData.append("files", file);
        });

        try {
            const response = await fetch(`${config.BASE_URL}/api/lessons`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (response.ok) {
                notify('Lesson created successfully with files.', 'success');
                handleClose();
            } else {
                const errorData = await response.text();
                console.error("Failed to create lesson:", errorData);
                notify(`Failed to create lesson: ${errorData}`, 'error');
            }
        } catch (error) {
            console.error("Network error:", error);
            notify(`Network error: ${error.message}`, 'error');
        }
    };

    return (
        <Modal open={show} onClose={handleClose}>
            <Box sx={{ p: 4, bgcolor: 'background.paper', boxShadow: 24, borderRadius: 2, width: 400, mx: 'auto', mt: '10%' }}>
                <Typography variant="h6" gutterBottom>Create Lesson</Typography>
                <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" component="label" fullWidth>
                    Upload Files
                    <input type="file" multiple hidden onChange={handleFileChange} />
                </Button>
                <Button variant="contained" color="primary" onClick={handleCreateLesson} sx={{ mt: 2 }}>
                    Create Lesson
                </Button>
            </Box>
        </Modal>
    );
};

export default CreateLessonModal;
