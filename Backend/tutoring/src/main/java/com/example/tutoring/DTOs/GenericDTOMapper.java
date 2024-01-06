package com.example.tutoring.DTOs;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
//TODO provjeri ModelMapper
//Koristi se za mapiranje u GenericDTO kada se fetcha s baze
public class GenericDTOMapper implements RowMapper<GenericDTO>
{
    @Override
    public GenericDTO mapRow(ResultSet rs, int rowNum) throws SQLException, SQLException
    {
//        GenericDTO dto = new GenericDTO();
//        dto.addProperty("name", rs.getString("name"));
//        dto.addProperty("surname", rs.getString("surname"));
//        dto.addProperty("username", rs.getString("username"));
//       // dto.addProperty("accountType", rs.getString("account_type"));     todo fix
//       // dto.addProperty("id",rs.getInt("id"));
//        try {
//            dto.addProperty("accountType", rs.getString("account_type"));
//        } catch (SQLException e) {
//            // Kolona account_type nije prisutna, preskoči dodavanje
//        }
//        dto.addProperty("teaching_grade",rs.getDouble("teaching_grade"));
//        return dto;
        ResultSetMetaData metaData=rs.getMetaData();    //daje podatke o resultsetu tj tom jednom redu/recordu
        int columnCount=metaData.getColumnCount();      //broj kolona da bi mogli iterirati
        GenericDTO dto=new GenericDTO();
        for(int i=1;i<=columnCount;i++)
        {
            dto.addProperty(metaData.getColumnName(i),  //stavljamo kao kljuc da je ime kolone a vrijednost , logicno vrijednost te kolone za taj record
                    rs.getObject(metaData.getColumnName(i)));
        }
        return dto;     //poziva se nad svakim recordom kad se mapira
    }
}
