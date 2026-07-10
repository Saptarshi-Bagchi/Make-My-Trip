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
    private List<Booking> bookings;

    public String getFirstName() {return firstname;}
    public void setFirstName(String firstname) {this.firstname=firstname;}

    public String getLastName() {return lastname;}
    public void setLastName(String lastname) {this.lastname=lastname;}
    
    public String getPassword() {return password;}
    public void setPassword(String password) {this.password=password;}

    public String getEmail() {return email;}

    public String getRole() {return role;}
    public void setRole(String role) {this.role=role;}

    public String getPhoneNumber() {return phoneNumber;}
    public void setPhoneNumber(String phoneNumber) {this.phoneNumber=phoneNumber;}

    public List<Booking> getBookings(){return bookings;}
    public void setBookings(List<Booking> bookings){this.bookings=bookings;}

    public static class Booking{
        private String type;
        private String bookingId;
        private String date;
        private int quantity;
        private double totalPrice;

        // Getters and Setters
        public String getType() {return type;}
        public void setType(String type) {this.type = type;}

        public String getBookingId() {return bookingId;}
        public void setBookingId(String bookingId) {this.bookingId = bookingId;}

        public String getDate() {return date;}
        public void setDate(String date) {this.date = date;}

        public int getQuantity() {return quantity;}
        public void setQuantity(int quantity) {this.quantity = quantity;}

        public double getTotalPrice() {return totalPrice;}
        public void setTotalPrice(double totalPrice) {this.totalPrice = totalPrice;}
    }
}
