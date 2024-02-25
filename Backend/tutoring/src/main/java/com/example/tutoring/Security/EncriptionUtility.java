package com.example.tutoring.Security;

import org.jasypt.encryption.StringEncryptor;
import org.springframework.stereotype.Component;

@Component
public class EncriptionUtility
{
    private final StringEncryptor stringEncryptor;
    public EncriptionUtility(StringEncryptor stringEncryptor1)
    {
        this.stringEncryptor=stringEncryptor1;
    }

    public String encrypt(String data)
    {
        return stringEncryptor.encrypt(data);
    }
    public String decrypt(String encryptedData)
    {
        return stringEncryptor.decrypt(encryptedData);
    }
}
