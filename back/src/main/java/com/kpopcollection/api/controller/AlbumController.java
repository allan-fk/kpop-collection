package com.kpopcollection.api.controller;

import com.kpopcollection.api.dto.SaveAlbumRequest;
import com.kpopcollection.api.entity.SavedAlbum;
import com.kpopcollection.api.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/albums")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    @GetMapping("/saved")
    public ResponseEntity<List<SavedAlbum>> getSavedAlbums() {
        return ResponseEntity.ok(albumService.getSavedAlbums());
    }

    @PostMapping("/save")
    public ResponseEntity<SavedAlbum> saveAlbum(@RequestBody SaveAlbumRequest request) {
        return ResponseEntity.ok(albumService.saveAlbum(request));
    }

    @DeleteMapping("/save/{id}")
    public ResponseEntity<Void> removeSavedAlbum(@PathVariable Long id) {
        albumService.removeSavedAlbum(id);
        return ResponseEntity.noContent().build();
    }
}
