import React, { useState } from "react";

const UploadLessonFile = ({ lessonId }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch(`http://localhost:8080/api/lessons/${lessonId}/upload`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (response.ok) {
            alert("File uploaded successfully");
        } else {
            alert("Failed to upload file");
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload File</button>
        </div>
    );
};

export default UploadLessonFile;
