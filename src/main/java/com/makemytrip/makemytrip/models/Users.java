package com.makemytrip.makemytrip.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "users")

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
    public void setPassword(String password) {this.password=password;}
    public String getEmail() {return email;}
    public String getRole() {return role;}
    public void setRole(String role) {this.role=role;}
}
