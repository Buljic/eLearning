package com.example.tutoring.Services;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessageService
{
    private final JdbcTemplate jdbcTemplate;

    public MessageService(JdbcTemplate template)
    {
        this.jdbcTemplate = template;
    }

    public void saveDirectMessage(Long user1,Long user2,String message)
    {
        String sql="INSERT INTO direct_message(user1,user2,time,message_text)" +
                "VALUES (?,?,?,?);";
        jdbcTemplate.update(sql,new Object[]{user1,user2, LocalDateTime.now(),message});
    }
}
