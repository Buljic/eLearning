package com.example.tutoring.Other;

import com.example.tutoring.Entities.Embeddeds.GroupRequestId;
import com.example.tutoring.Entities.GroupRequest;
import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;

public class GroupRequestMapper implements RowMapper<GroupRequest> {
    @Override
    public GroupRequest mapRow(ResultSet rs, int rowNum) throws SQLException {
        GroupRequest request = new GroupRequest();
        GroupRequestId id = new GroupRequestId();
        id.setUserId(rs.getLong("user_id"));
        id.setGroupId(rs.getLong("group_id"));
        request.setId(id);
        request.setStatus(RequestStatus.valueOf(rs.getString("status")));
        request.setRequestDate(rs.getDate("request_date").toLocalDate());
        request.setGroupName(rs.getString("group_name"));
        request.setUsername(rs.getString("username"));
        return request;
    }
}

