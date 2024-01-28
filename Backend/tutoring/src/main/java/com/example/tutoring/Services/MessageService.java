package com.example.tutoring.Services;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.GenericDTOMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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
    public List<GenericDTO> getOldDMs(Long user1, Long user2)
    {
        String sql="SELECT * FROM direct_message WHERE (user1=? OR user2=?) AND (user1=? OR user2=?) " +
                "ORDER BY time DESC LIMIT 5;";
        return jdbcTemplate.query(sql,new Object[]{user1,user1,user2,user2},new GenericDTOMapper());
    }
}
