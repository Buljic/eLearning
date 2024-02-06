package com.example.tutoring.Entities;

import jakarta.persistence.*;
import jdk.jfr.Name;

import java.util.Date;
//todo dodaj usergroup tabelu
@Entity
@Table (name = "group_table")
public class Group
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long group_id;

    private Date creation_date;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    @ManyToOne
    @JoinColumn(name = "headtutor_id")
    private Tutor tutor;

    public Long getGroup_id()
    {
        return group_id;
    }

    public void setGroup_id(Long group_id)
    {
        this.group_id = group_id;
    }

    public Date getCreation_date()
    {
        return creation_date;
    }

    public void setCreation_date(Date creation_date)
    {
        this.creation_date = creation_date;
    }

    public Subject getSubject()
    {
        return subject;
    }

    public void setSubject(Subject subject)
    {
        this.subject = subject;
    }

    public Tutor getTutor()
    {
        return tutor;
    }

    public void setTutor(Tutor tutor)
    {
        this.tutor = tutor;
    }
}
