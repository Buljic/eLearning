package com.example.tutoring.DTOs;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@JsonSerialize (using = GenericDTOSerializer.class)
@JsonDeserialize (using = GenericDTODeserializer.class)
public class GenericDTO
{
    private Map<String, Object> properties = new HashMap<>();

    public GenericDTO() {}

    public GenericDTO(Map<String, Object> properties) {
        this.properties = properties;
    }

    public void addProperty(String key, Object value) {
        this.properties.put(key, value);
    }

    public Object getProperty(String key) {
        return this.properties.get(key);
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public String getString(String key) {
        Object value = properties.get(key);
        return value instanceof String ? (String) value : null;
    }

    public Integer getInt(String key) {
        Object value = properties.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String stringValue && !stringValue.isEmpty()) {
            return Integer.parseInt(stringValue);
        }
        return null;
    }

    public Long getLong(String key) {
        Object value = properties.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String stringValue && !stringValue.isEmpty()) {
            return Long.parseLong(stringValue);
        }
        return null;
    }

    //cisto radi cisce sintakse iako isto radi kao i addProperty
    public void setProperty(String key, Object value) {
        this.properties.put(key, value);
    }

    public Double getDouble(String key) {
        Object value = properties.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String stringValue && !stringValue.isEmpty()) {
            return Double.parseDouble(stringValue);
        }
        return null;
    }

    public List<String> getList(String key) {
        Object value = properties.get(key);
        return value instanceof List ? (List<String>) value : Collections.emptyList();
    }

    //KORISTI SE da mozemo ispisivati dto normalno
    @Override
    public String toString() {
        return "GenericDTO{" +
                properties.entrySet().stream()
                        .map(entry -> entry.getKey() + "=" + entry.getValue())
                        .collect(Collectors.joining(", ")) +
                '}';
    }
    //TODO implementuj
//    @Override
//    public String toString() {
//        StringBuilder sb = new StringBuilder("GenericDTO{");
//        for (Map.Entry<String, Object> entry : properties.entrySet()) {
//            sb.append(entry.getKey())
//                    .append('=')
//                    .append(entry.getValue())
//                    .append(',');
//        }
//        if (sb.length() > "GenericDTO{".length()) {
//            sb.delete(sb.length() - 2, sb.length()); // Uklanja poslednji zarez i razmak
//        }
//        sb.append('}');
//        return sb.toString();
//    }
}
