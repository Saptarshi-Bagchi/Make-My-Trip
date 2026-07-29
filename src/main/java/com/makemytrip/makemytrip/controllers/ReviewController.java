package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;

    @PostMapping("/hotel/{hotelId}/review")
    public ResponseEntity<Hotel> addHotelReview(
            @PathVariable String hotelId,
            @RequestBody ReviewRequest reviewRequest
    ) {
        Optional<Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if (hotelOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Hotel hotel = hotelOptional.get();
        if (hotel.getReviews() == null) {
            hotel.setReviews(new ArrayList<>());
        }

        Hotel.Review review = new Hotel.Review();
        review.setId(UUID.randomUUID().toString());
        review.setUserId(reviewRequest.getUserId());
        review.setUsername(reviewRequest.getUsername());
        review.setCreatedAt(reviewRequest.getCreatedAt() != null ? reviewRequest.getCreatedAt() : Instant.now().toString());
        review.setRating(Math.min(Math.max(reviewRequest.getRating(), 1), 5));
        review.setText(reviewRequest.getText());
        review.setImages(reviewRequest.getImages() != null ? reviewRequest.getImages() : new ArrayList<>());
        review.setReplies(new ArrayList<>());
        review.setFlagged(false);
        review.setHelpfulCount(0);

        hotel.getReviews().add(0, review);
        hotelRepository.save(hotel);
        return ResponseEntity.ok(hotel);
    }

    @PostMapping("/hotel/{hotelId}/review/{reviewId}/reply")
    public ResponseEntity<Hotel> replyHotelReview(
            @PathVariable String hotelId,
            @PathVariable String reviewId,
            @RequestBody ReplyRequest replyRequest
    ) {
        Optional<Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if (hotelOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Hotel hotel = hotelOptional.get();
        if (hotel.getReviews() == null) {
            hotel.setReviews(new ArrayList<>());
        }
        Hotel.Review review = hotel.getReviews().stream()
                .filter(r -> r.getId().equals(reviewId))
                .findFirst()
                .orElse(null);

        if (review == null) {
            return ResponseEntity.notFound().build();
        }

        Hotel.Reply reply = new Hotel.Reply();
        reply.setId(UUID.randomUUID().toString());
        reply.setUserId(replyRequest.getUserId());
        reply.setUsername(replyRequest.getUsername());
        reply.setCreatedAt(replyRequest.getCreatedAt() != null ? replyRequest.getCreatedAt() : Instant.now().toString());
        reply.setText(replyRequest.getText());

        if (review.getReplies() == null) {
            review.setReplies(new ArrayList<>());
        }
        review.getReplies().add(reply);
        hotelRepository.save(hotel);
        return ResponseEntity.ok(hotel);
    }

    @PostMapping("/hotel/{hotelId}/review/{reviewId}/flag")
    public ResponseEntity<Hotel> flagHotelReview(
            @PathVariable String hotelId,
            @PathVariable String reviewId
    ) {
        Optional<Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if (hotelOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Hotel hotel = hotelOptional.get();
        if (hotel.getReviews() == null) {
            hotel.setReviews(new ArrayList<>());
        }
        Hotel.Review review = hotel.getReviews().stream()
                .filter(r -> r.getId().equals(reviewId))
                .findFirst()
                .orElse(null);

        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        review.setFlagged(true);
        hotelRepository.save(hotel);
        return ResponseEntity.ok(hotel);
    }

    @PostMapping("/flight/{flightId}/review")
    public ResponseEntity<Flight> addFlightReview(
            @PathVariable String flightId,
            @RequestBody ReviewRequest reviewRequest
    ) {
        Optional<Flight> flightOptional = flightRepository.findById(flightId);
        if (flightOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Flight flight = flightOptional.get();
        if (flight.getReviews() == null) {
            flight.setReviews(new ArrayList<>());
        }

        Flight.Review review = new Flight.Review();
        review.setId(UUID.randomUUID().toString());
        review.setUserId(reviewRequest.getUserId());
        review.setUsername(reviewRequest.getUsername());
        review.setCreatedAt(reviewRequest.getCreatedAt() != null ? reviewRequest.getCreatedAt() : Instant.now().toString());
        review.setRating(Math.min(Math.max(reviewRequest.getRating(), 1), 5));
        review.setText(reviewRequest.getText());
        review.setImages(reviewRequest.getImages() != null ? reviewRequest.getImages() : new ArrayList<>());
        review.setReplies(new ArrayList<>());
        review.setFlagged(false);
        review.setHelpfulCount(0);

        flight.getReviews().add(0, review);
        flightRepository.save(flight);
        return ResponseEntity.ok(flight);
    }

    @PostMapping("/flight/{flightId}/review/{reviewId}/reply")
    public ResponseEntity<Flight> replyFlightReview(
            @PathVariable String flightId,
            @PathVariable String reviewId,
            @RequestBody ReplyRequest replyRequest
    ) {
        Optional<Flight> flightOptional = flightRepository.findById(flightId);
        if (flightOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Flight flight = flightOptional.get();
        if (flight.getReviews() == null) {
            flight.setReviews(new ArrayList<>());
        }
        Flight.Review review = flight.getReviews().stream()
                .filter(r -> r.getId().equals(reviewId))
                .findFirst()
                .orElse(null);

        if (review == null) {
            return ResponseEntity.notFound().build();
        }

        Flight.Reply reply = new Flight.Reply();
        reply.setId(UUID.randomUUID().toString());
        reply.setUserId(replyRequest.getUserId());
        reply.setUsername(replyRequest.getUsername());
        reply.setCreatedAt(replyRequest.getCreatedAt() != null ? replyRequest.getCreatedAt() : Instant.now().toString());
        reply.setText(replyRequest.getText());

        if (review.getReplies() == null) {
            review.setReplies(new ArrayList<>());
        }
        review.getReplies().add(reply);
        flightRepository.save(flight);
        return ResponseEntity.ok(flight);
    }

    @PostMapping("/flight/{flightId}/review/{reviewId}/flag")
    public ResponseEntity<Flight> flagFlightReview(
            @PathVariable String flightId,
            @PathVariable String reviewId
    ) {
        Optional<Flight> flightOptional = flightRepository.findById(flightId);
        if (flightOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Flight flight = flightOptional.get();
        if (flight.getReviews() == null) {
            flight.setReviews(new ArrayList<>());
        }
        Flight.Review review = flight.getReviews().stream()
                .filter(r -> r.getId().equals(reviewId))
                .findFirst()
                .orElse(null);

        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        review.setFlagged(true);
        flightRepository.save(flight);
        return ResponseEntity.ok(flight);
    }

    public static class ReviewRequest {
        private String userId;
        private String username;
        private int rating;
        private String text;
        private List<String> images;
        private String createdAt;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public List<String> getImages() {
            return images;
        }

        public void setImages(List<String> images) {
            this.images = images;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }
    }

    public static class ReplyRequest {
        private String userId;
        private String username;
        private String text;
        private String createdAt;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }
    }
}
