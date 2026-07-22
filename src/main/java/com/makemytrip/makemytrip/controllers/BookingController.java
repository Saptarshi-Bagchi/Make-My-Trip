package com.makemytrip.makemytrip.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.services.BookingService;

@RestController
@RequestMapping("/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping("/flight")
    public Users.Booking bookFlight(@RequestParam String userId,@RequestParam String flightId,@RequestParam int seats,@RequestParam double price,@RequestParam(required = false) String seatNumbers){
        return bookingService.bookFlight(userId,flightId,seats,price,seatNumbers);
    }
    @PostMapping("/hotel")
    public Users.Booking bookhotel (@RequestParam String userId,@RequestParam String hotelId,@RequestParam int rooms,@RequestParam double price,@RequestParam(required = false) String roomType){
        return bookingService.bookhotel(userId,hotelId,rooms,price,roomType);
    }
    @PostMapping("/cancel")
    public Users.Booking cancelBooking(@RequestParam String userId, @RequestParam int index){
        return bookingService.cancelBooking(userId, index);
    }
}