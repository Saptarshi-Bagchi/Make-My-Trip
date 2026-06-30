package com.makemytrip.makemytrip.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collation = "users")

public class Users {
    @Id
    private String _id;
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private String role;
    private String phoneNumber;    

    public String getPassword() {return password;}
    public String getEmail() {return email;}
}
