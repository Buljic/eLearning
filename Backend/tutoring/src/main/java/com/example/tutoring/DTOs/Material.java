package com.example.tutoring.DTOs;

public class Material {
    private Long id;
    private Lesson lesson;
    private String fileName;
    private String fileType;
    private String fileUrl;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Lesson getLesson()
    {
        return lesson;
    }

    public void setLesson(Lesson lesson)
    {
        this.lesson = lesson;
    }

    public String getFileType()
    {
        return fileType;
    }

    public void setFileType(String fileType)
    {
        this.fileType = fileType;
    }

    public String getFileName()
    {
        return fileName;
    }

    public void setFileName(String fileName)
    {
        this.fileName = fileName;
    }

    public String getFileUrl()
    {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl)
    {
        this.fileUrl = fileUrl;
    }
}
