package com.kpopcollection.api.controller;

import com.kpopcollection.api.dto.SearchMovieRequest;
import com.kpopcollection.api.entity.TrendingMovie;
import com.kpopcollection.api.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PostMapping("/search")
    public ResponseEntity<TrendingMovie> recordSearch(@RequestBody SearchMovieRequest request) {
        TrendingMovie result = movieService.recordSearch(request);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<TrendingMovie>> getTrending() {
        List<TrendingMovie> trending = movieService.getTrending();
        return ResponseEntity.ok(trending);
    }
}
