package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.ArrayList;

@Document(collection = "users")
public class Users {
    @Id
    private String _id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;
    private String phoneNumber;
    private List<Booking> bookings = new ArrayList<>();;
    private List<Refund> refunds = new ArrayList<>();

    public String getId() {return _id;}

    public String getFirstName() {return firstName;}
    public void setFirstName(String firstName) {this.firstName = firstName;}

    public String getLastName() {return lastName;}
    public void setLastName(String lastName) {this.lastName = lastName;}

    public String getPhoneNumber() {return phoneNumber;}
    public void setPhoneNumber(String phoneNumber) {this.phoneNumber = phoneNumber;}

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email=email;}

    public String getPassword() {return password;}
    public void setPassword(String password) {this.password = password;}

    public String getRole() {return role;}
    public void setRole(String role) {this.role = role;}

    public List<Booking> getBookings() {return bookings;}
    public void setBookings(List<Booking> bookings) {this.bookings = bookings;}

    public List<Refund> getRefunds() {
        if (refunds == null) refunds = new ArrayList<>();
        return refunds;
    }
    public void setRefunds(List<Refund> refunds) {this.refunds = refunds;}

    public static class Booking {
        private String type;
        private String bookingId;
        private String date;
        private int quantity;
        private double totalPrice;
        private String seatNumbers;
        private String roomType;

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

        public String getSeatNumbers() {return seatNumbers;}
        public void setSeatNumbers(String seatNumbers) {this.seatNumbers = seatNumbers;}

        public String getRoomType() {return roomType;}
        public void setRoomType(String roomType) {this.roomType = roomType;}
    }

    public static class Refund {
        private String id;
        private String entityType;
        private String label;
        private String reason;
        private double originalAmount;
        private double refundAmount;
        private double refundPercentage;
        private String canceledAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public double getOriginalAmount() { return originalAmount; }
        public void setOriginalAmount(double originalAmount) { this.originalAmount = originalAmount; }
        public double getRefundAmount() { return refundAmount; }
        public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }
        public double getRefundPercentage() { return refundPercentage; }
        public void setRefundPercentage(double refundPercentage) { this.refundPercentage = refundPercentage; }
        public String getCanceledAt() { return canceledAt; }
        public void setCanceledAt(String canceledAt) { this.canceledAt = canceledAt; }
    }
}
