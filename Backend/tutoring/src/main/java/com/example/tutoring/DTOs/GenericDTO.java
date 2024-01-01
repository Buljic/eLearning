package com.example.tutoring.DTOs;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class GenericDTO
{
    private Map<String,Object> properties=new HashMap<>();

    public void addProperty(String key,Object value)
    {
        this.properties.put(key,value);
    }

    public Object getProperty(String key)
    {
        return this.properties.get(key);
    }

    public String getString(String key) {
        return (String) properties.get(key);
    }

    public Integer getInt(String key) {
        return (Integer) properties.get(key);
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
