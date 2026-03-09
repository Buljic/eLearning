package com.example.tutoring.Services;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.Entities.DirectMessage;
import com.example.tutoring.Entities.Embeddeds.DirectMessageId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService
{
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    private final JdbcTemplate jdbcTemplate;

    public MessageService(JdbcTemplate template)
    {
        this.jdbcTemplate = template;
    }

    public void saveDirectMessage(Long user1, Long user2, String message, String senderName) {
        String sql = "INSERT INTO direct_message(user1, user2, time, message_text) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, user1, user2, LocalDateTime.now(), message);
    }

    public List<DirectMessage> getOldDirectMessages(Long user1, Long user2, int page, int size) {
        return jdbcTemplate.query(
                "SELECT dm.*, u1.username AS sender_name FROM direct_message dm " +
                        "JOIN user u1 ON dm.user1 = u1.id " +
                        "WHERE (dm.user1 = ? AND dm.user2 = ?) OR (dm.user1 = ? AND dm.user2 = ?) " +
                        "ORDER BY dm.time DESC LIMIT ? OFFSET ?",
                new Object[]{user1, user2, user2, user1, size, page * size},
                (rs, rowNum) -> {
                    DirectMessageId id = new DirectMessageId(rs.getLong("user1"), rs.getLong("user2"), rs.getTimestamp("time").toLocalDateTime());
                    DirectMessage dm = new DirectMessage(id, rs.getString("message_text"));
                    dm.setSenderName(rs.getString("sender_name"));
                    return dm;
                }
        );
    }

    public void saveGroupMessage(Long group, Long sender, String message) {
        logger.debug("Saving group message. group={}, sender={}", group, sender);

        LocalDateTime now = LocalDateTime.now();

        String sql = "INSERT INTO group_message(group_id, sender, time, message_text) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, new Object[]{group, sender, now, message});
    }

    public List<GenericDTO> getOldGroupMessages(Long groupId, int page, int size) {
        String sql = "SELECT gm.*, u.username AS sender_name " +
                "FROM group_message gm " +
                "JOIN user u ON gm.sender = u.id " +
                "WHERE gm.group_id = ? " +
                "ORDER BY gm.time DESC LIMIT ? OFFSET ?";
        List<GenericDTO> messages = jdbcTemplate.query(sql, new Object[]{groupId, size, page * size}, (rs, rowNum) -> {
            GenericDTO dto = new GenericDTO();
            dto.addProperty("group_id", rs.getLong("group_id"));
            dto.addProperty("senderId", rs.getLong("sender"));
            dto.addProperty("time", rs.getTimestamp("time").toLocalDateTime());
            dto.addProperty("message_text", rs.getString("message_text"));
            dto.addProperty("sender_name", rs.getString("sender_name"));
            return dto;
        });

        return messages;
    }

}
