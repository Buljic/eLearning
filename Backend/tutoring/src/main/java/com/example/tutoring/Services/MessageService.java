package com.example.tutoring.Services;

import com.example.tutoring.DTOs.GenericDTO;
import com.example.tutoring.DTOs.GenericDTOMapper;
import com.example.tutoring.Entities.DirectMessage;
import com.example.tutoring.Entities.Embeddeds.DirectMessageId;
import com.example.tutoring.Entities.Embeddeds.GroupMessageId;
import com.example.tutoring.Entities.GroupMessage;
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

//    public void saveDirectMessage(Long user1,Long user2,String message)
//    {
//        String sql="INSERT INTO direct_message(user1,user2,time,message_text)" +
//                "VALUES (?,?,?,?);";
//        jdbcTemplate.update(sql,new Object[]{user1,user2, LocalDateTime.now(),message});
//    }
//    public List<GenericDTO> getOldDMs(Long user1, Long user2)
//    {
//        String sql="SELECT * FROM direct_message WHERE (user1=? OR user2=?) AND (user1=? OR user2=?) " +
//                "ORDER BY time DESC LIMIT 5;";
//        return jdbcTemplate.query(sql,new Object[]{user1,user1,user2,user2},new GenericDTOMapper());
//    }
//
//    public void saveGroupMessage(Long group,Long sender,String message)
//    {
//        String sql="INSERT INTO group_message(group_id,sender,time,message_text) VALUES " +
//                "(?,?,?,?);";
//        jdbcTemplate.update(sql,new Object[]{group,sender,LocalDateTime.now(),message});
//    }
//
//    public List<GenericDTO> getOldGroupMessages(Long groupId)
//    {
//        String sql="SELECT * FROM group_message WHERE group_id=? ORDER BY time DESC LIMIT 10;";
//        return jdbcTemplate.query(sql,new Object[]{groupId},new GenericDTOMapper());
//    }
//
//
//    public List<DirectMessage> getOldDirectMessages(Long user1, Long user2, int page, int size) {
//        return jdbcTemplate.query(
//                "SELECT * FROM direct_message WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?) ORDER BY time DESC LIMIT ? OFFSET ?",
//                new Object[]{user1, user2, user2, user1, size, page * size},
//                (rs, rowNum) -> {
//                    DirectMessageId id = new DirectMessageId(rs.getLong("user1"), rs.getLong("user2"), rs.getTimestamp("time").toLocalDateTime());
//                    return new DirectMessage(id, rs.getString("message_text"));
//                }
//        );
//    }
//
//    public List<GroupMessage> getOldGroupMessages(Long groupId, int page, int size) {
//        return jdbcTemplate.query(
//                "SELECT * FROM group_message WHERE group_id = ? ORDER BY time DESC LIMIT ? OFFSET ?",
//                new Object[]{groupId, size, page * size},
//                (rs, rowNum) -> {
//                    GroupMessageId id = new GroupMessageId(rs.getLong("group_id"), rs.getLong("sender"), rs.getTimestamp("time").toLocalDateTime());
//                    return new GroupMessage(id, rs.getString("message_text"));
//                }
//        );
//    }
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
                    DirectMessage message = new DirectMessage(id, rs.getString("message_text"));
                    message.setSenderName(rs.getString("sender_name"));
                    return message;
                }
        );
    }

//    public void saveGroupMessage(Long group, Long sender, String message, String senderName) {
//        String sql = "INSERT INTO group_message(group_id, sender, time, message_text) VALUES (?, ?, ?, ?)";
//        jdbcTemplate.update(sql, group, sender, LocalDateTime.now(), message);
//    }
//
//    public List<GroupMessage> getOldGroupMessages(Long groupId, int page, int size) {
//        return jdbcTemplate.query(
//                "SELECT gm.*, u.username AS sender_name FROM group_message gm " +
//                        "JOIN user u ON gm.sender = u.id " +
//                        "WHERE gm.group_id = ? ORDER BY gm.time DESC LIMIT ? OFFSET ?",
//                new Object[]{groupId, size, page * size},
//                (rs, rowNum) -> {
//                    GroupMessageId id = new GroupMessageId(rs.getLong("group_id"), rs.getLong("sender"), rs.getTimestamp("time").toLocalDateTime());
//                    GroupMessage message = new GroupMessage(id, rs.getString("message_text"));
//                    message.setSenderName(rs.getString("sender_name"));
//                    return message;
//                }
//        );
//    }

//    public void saveGroupMessage(Long groupId, Long senderId, String message) {
//        String sql = "INSERT INTO group_message(group_id, sender, time, message_text) VALUES (?, ?, ?, ?)";
//        jdbcTemplate.update(sql, groupId, senderId, LocalDateTime.now(), message);
//    }
//
//    public List<GroupMessage> getOldGroupMessages(Long groupId, int page, int size) {
//        String sql = "SELECT gm.*, u.username AS sender_name FROM group_message gm " +
//                "JOIN user u ON gm.sender = u.id " +
//                "WHERE gm.group_id = ? ORDER BY gm.time DESC LIMIT ? OFFSET ?";
//        return jdbcTemplate.query(sql, new Object[]{groupId, size, page * size},
//                (rs, rowNum) -> {
//                    GroupMessageId id = new GroupMessageId(rs.getLong("group_id"), rs.getLong("sender"), rs.getTimestamp("time").toLocalDateTime());
//                    GroupMessage message = new GroupMessage(id, rs.getString("message_text"));
//                    message.setSenderName(rs.getString("sender_name"));
//                    return message;
//                }
//        );
//    }
//public void saveGroupMessage(Long group, Long sender, String message) {
//    String sql = "INSERT INTO group_message(group_id, sender, time, message_text) VALUES (?, ?, ?, ?)";
//    jdbcTemplate.update(sql, group, sender, LocalDateTime.now(), message);
//}
//
//    public List<GroupMessage> getOldGroupMessages(Long groupId, int page, int size) {
//        return jdbcTemplate.query(
//                "SELECT gm.*, u.username AS sender_name FROM group_message gm " +
//                        "JOIN user u ON gm.sender = u.id " +
//                        "WHERE gm.group_id = ? ORDER BY gm.time DESC LIMIT ? OFFSET ?",
//                new Object[]{groupId, size, page * size},
//                (rs, rowNum) -> {
//                    GroupMessageId id = new GroupMessageId(rs.getLong("group_id"), rs.getLong("sender"), rs.getTimestamp("time").toLocalDateTime());
//                    GroupMessage message = new GroupMessage(id, rs.getString("message_text"));
//                    message.setSenderName(rs.getString("sender_name"));
//                    return message;
//                }
//        );
//    }
public void saveGroupMessage(Long group, Long sender, String message) {
    System.out.println("Saving group message. Group: " + group + ", Sender: " + sender + ", Message: " + message);

    GroupMessage groupMessage = new GroupMessage();
    GroupMessageId groupMessageId = new GroupMessageId();
    groupMessageId.setGroup(group);
    groupMessageId.setSender(sender);
    groupMessageId.setTime(LocalDateTime.now());

    groupMessage.setId(groupMessageId);
    groupMessage.setMessage_text(message);

    System.out.println("GroupMessage to save: " + groupMessage);

    String sql = "INSERT INTO group_message(group_id, sender, time, message_text) VALUES (?, ?, ?, ?)";
    jdbcTemplate.update(sql, new Object[]{group, sender, LocalDateTime.now(), message});
}

    public List<GenericDTO> getOldGroupMessages(Long groupId, int page, int size) {
        String sql = "SELECT gm.*, u.username AS sender_name " +
                "FROM group_message gm " +
                "JOIN user u ON gm.sender = u.id " +
                "WHERE gm.group_id = ? " +
                "ORDER BY gm.time DESC LIMIT ? OFFSET ?";
        List<GenericDTO> messages = jdbcTemplate.query(sql, new Object[]{groupId, size, page * size}, (rs, rowNum) -> {
            GenericDTO message = new GenericDTO();
            message.addProperty("group_id", rs.getLong("group_id"));
            message.addProperty("senderId", rs.getLong("sender"));
            message.addProperty("time", rs.getTimestamp("time").toLocalDateTime());
            message.addProperty("message_text", rs.getString("message_text"));
            message.addProperty("sender_name", rs.getString("sender_name"));
            System.out.println("Fetched group message: " + message.toString());
            return message;
        });

        return messages;
    }

}
