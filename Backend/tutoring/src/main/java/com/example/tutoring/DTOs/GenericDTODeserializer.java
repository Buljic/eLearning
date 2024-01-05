package com.example.tutoring.DTOs;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;
//Klasa za definisanje nacina deserializacije za GenericDTO
public class GenericDTODeserializer extends StdDeserializer<GenericDTO>
{

    public GenericDTODeserializer() {
        super(GenericDTO.class);
    }

    @Override
    public GenericDTO deserialize(JsonParser jsonParser, DeserializationContext ctxt)
            throws IOException, JsonProcessingException
    {
        JsonNode rootNode = jsonParser.getCodec().readTree(jsonParser);
        GenericDTO dto = new GenericDTO();
        rootNode.fields().forEachRemaining(field -> {
            dto.addProperty(field.getKey(), field.getValue().asText());
        });
        return dto;
    }
}

