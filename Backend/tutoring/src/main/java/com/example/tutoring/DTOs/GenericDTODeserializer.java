package com.example.tutoring.DTOs;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.node.JsonNodeType;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

//Klasa za definisanje nacina deserializacije za GenericDTO
public class GenericDTODeserializer extends StdDeserializer<GenericDTO> {

    public GenericDTODeserializer() {
        super(GenericDTO.class);
    }

    @Override
    public GenericDTO deserialize(JsonParser jsonParser, DeserializationContext ctxt)
            throws IOException, JsonProcessingException {
        JsonNode rootNode = jsonParser.getCodec().readTree(jsonParser);
        GenericDTO dto = new GenericDTO();
        rootNode.fields().forEachRemaining(field -> {
            if (field.getValue().getNodeType() == JsonNodeType.ARRAY) {
                List<String> list = new ArrayList<>();
                for (JsonNode node : field.getValue()) {
                    list.add(node.asText());
                }
                dto.addProperty(field.getKey(), list);
            } else {
                dto.addProperty(field.getKey(), field.getValue().asText());
            }
        });
        return dto;
    }
}

