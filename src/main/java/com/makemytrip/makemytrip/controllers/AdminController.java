package com.makemytrip.makemytrip.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @GetMapping("/users")
    public ResponseEntity<List<Users>> getallusers() {
        List<Users> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/flight")
    public Flight addFlight(@RequestBody Flight flight) {
        return flightRepository.save(flight);
    }

    @PostMapping("/hotel")
    public Hotel addHotel(@RequestBody Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @PutMapping("flight/{id}")
    public ResponseEntity<Flight> editflight(@PathVariable String id, @RequestBody Flight UpdatedFlight) {
        Optional<Flight> flightoptional = flightRepository.findById(id);
        if (flightoptional.isPresent()) {
            Flight flight = flightoptional.get();
            flight.setFlightName(UpdatedFlight.getFlightName());
            flight.setFrom(UpdatedFlight.getFrom());
            flight.setTo(UpdatedFlight.getTo());
            flight.setDepartureTime(UpdatedFlight.getDepartureTime());
            flight.setArrivalTime(UpdatedFlight.getArrivalTime());
            flight.setPrice(UpdatedFlight.getPrice());
            flight.setAvailableSeats(UpdatedFlight.getAvailableSeats());
            flightRepository.save(flight);
            return ResponseEntity.ok(flight);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("hotel/{id}")
    public ResponseEntity<Hotel> editHotel(@PathVariable String id, @RequestBody Hotel updatedHotel) {
        Optional<Hotel> hotelOptional = hotelRepository.findById(id);
        if (hotelOptional.isPresent()) {
            Hotel hotel = hotelOptional.get();
            hotel.setName(updatedHotel.getName());
            hotel.setLocation(updatedHotel.getLocation());
            hotel.setAvailableRooms(updatedHotel.getAvailableRooms());
            hotel.setPricePerNight(updatedHotel.getPricePerNight());
            hotel.setamenities(updatedHotel.getamenities());
            hotelRepository.save(hotel);
            return ResponseEntity.ok(hotel);
        }
        return ResponseEntity.notFound().build();
    }
}
