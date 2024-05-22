package com.example.tutoring.Entities;

import jakarta.persistence.*;
import jdk.jfr.Name;

import java.util.Date;
import java.util.List;

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
    //mi proizvoljno ime dajemo
    @ManyToOne
    @JoinColumn(name = "headtutor_id")
    private Tutor tutor;

    private String group_name;

    private String topic;

    private String description;

    private Date startDate;

    private Date endDate;

    private int hoursPerWeek;

    private double price;

    private int maxStudents;
    //da utjecu promjene groupa na groupsubject
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupSubject> groupSubjects;

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
