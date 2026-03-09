package com.kpopcollection.api.controller;

import com.kpopcollection.api.dto.SaveMovieRequest;
import com.kpopcollection.api.dto.SearchMovieRequest;
import com.kpopcollection.api.entity.SavedMovie;
import com.kpopcollection.api.entity.TrendingMovie;
import com.kpopcollection.api.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // ── Trending ──────────────────────────────────────────────────────────────

    @PostMapping("/search")
    public ResponseEntity<TrendingMovie> recordSearch(@RequestBody SearchMovieRequest request) {
        return ResponseEntity.ok(movieService.recordSearch(request));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<TrendingMovie>> getTrending() {
        return ResponseEntity.ok(movieService.getTrending());
    }

    // ── Saved movies ──────────────────────────────────────────────────────────

    @PostMapping("/save")
    public ResponseEntity<SavedMovie> saveMovie(@RequestBody SaveMovieRequest request) {
        return ResponseEntity.ok(movieService.saveMovie(request));
    }

    @DeleteMapping("/save/{id}")
    public ResponseEntity<Void> removeSavedMovie(@PathVariable Long id) {
        movieService.removeSavedMovie(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedMovie>> getSavedMovies() {
        return ResponseEntity.ok(movieService.getSavedMovies());
    }
}
