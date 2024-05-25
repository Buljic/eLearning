package com.example.tutoring.Entities;

import com.example.tutoring.Entities.Embeddeds.GroupRequestId;
import com.example.tutoring.Other.RequestStatus;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table (name = "group_requests")
public class GroupRequest {
    @EmbeddedId
    private GroupRequestId id;

    @ManyToOne
    @MapsId ("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("groupId")
    @JoinColumn(name = "group_id")
    private Group group;

    private LocalDate requestDate;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    public GroupRequestId getId()
    {
        return id;
    }

    public RequestStatus getStatus()
    {
        return status;
    }

    public void setStatus(RequestStatus status)
    {
        this.status = status;
    }

    public LocalDate getRequestDate()
    {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate)
    {
        this.requestDate = requestDate;
    }
}
