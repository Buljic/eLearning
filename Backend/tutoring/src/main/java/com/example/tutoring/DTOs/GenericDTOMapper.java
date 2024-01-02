package com.example.tutoring.DTOs;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
//TODO provjeri ModelMapper
public class GenericDTOMapper implements RowMapper<GenericDTO>
{
    @Override
    public GenericDTO mapRow(ResultSet rs, int rowNum) throws SQLException, SQLException
    {
        GenericDTO dto = new GenericDTO();
        dto.addProperty("name", rs.getString("name"));
        dto.addProperty("surname", rs.getString("surname"));
        dto.addProperty("username", rs.getString("username"));
        dto.addProperty("accountType", rs.getString("account_type"));

        return dto;
    }
}
