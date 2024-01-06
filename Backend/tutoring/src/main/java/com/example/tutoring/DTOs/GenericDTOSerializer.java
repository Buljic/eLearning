package com.example.tutoring.DTOs;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.util.Map;
//Za serializaciju u json
public class GenericDTOSerializer extends StdSerializer<GenericDTO>
{
    public GenericDTOSerializer() {
        super(GenericDTO.class);
    }
    @Override
    public void serialize(GenericDTO value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        for (Map.Entry<String, Object> entry : value.getProperties().entrySet()) {
            gen.writeObjectField(entry.getKey(), entry.getValue());
        }
        gen.writeEndObject();
    }
}

