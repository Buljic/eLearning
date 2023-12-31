package com.example.tutoring.DTOs;

import java.util.HashMap;
import java.util.Map;

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
}
