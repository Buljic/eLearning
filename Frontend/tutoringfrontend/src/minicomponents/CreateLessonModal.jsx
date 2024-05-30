import React, { useState } from "react";

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
            const response = await fetch("http://localhost:8080/api/lessons", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (response.ok) {
                alert("Lesson created successfully with files");
                handleClose();
            } else {
                const errorData = await response.text();
                console.error("Failed to create lesson:", errorData);
                alert("Failed to create lesson: " + errorData);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error: " + error.message);
        }
    };



    if (!show) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={handleClose}>
                    &times;
                </span>
                <h2>Create Lesson</h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <input type="file" multiple onChange={handleFileChange} />
                <button onClick={handleCreateLesson}>Create Lesson</button>
            </div>
        </div>
    );
};

export default CreateLessonModal;
