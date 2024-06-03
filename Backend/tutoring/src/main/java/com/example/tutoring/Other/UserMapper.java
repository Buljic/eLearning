package com.example.tutoring.Other;

import com.example.tutoring.Entities.User;
import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserMapper implements RowMapper<User> {

    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setAccountType(AccountType.valueOf(rs.getString("account_type")));
        user.setEmail(rs.getString("email"));
        user.setName(rs.getString("name"));
        user.setPassword(rs.getString("password"));
        user.setPhoneNumber(rs.getString("phone_number"));
        user.setSurname(rs.getString("surname"));
        user.setUsername(rs.getString("username"));
        return user;
    }
}
