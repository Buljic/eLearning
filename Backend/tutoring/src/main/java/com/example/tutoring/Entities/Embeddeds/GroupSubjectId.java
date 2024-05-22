package com.example.tutoring.Entities.Embeddeds;

import jakarta.persistence.Embeddable;

import java.util.Objects;

@Embeddable
public class GroupSubjectId
{
    private long group;

    private long subject;

    public long getGroup_id()
    {
        return group;
    }

    public long getSubject_id()
    {
        return subject;
    }

    @Override
    public int hashCode() {
        return Objects.hash(group, subject);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GroupSubjectId that = (GroupSubjectId) o;
        return Objects.equals(group, that.group) && Objects.equals(subject, that.subject);
    }
}
