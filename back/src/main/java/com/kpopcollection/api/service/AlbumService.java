package com.kpopcollection.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kpopcollection.api.dto.SaveAlbumRequest;
import com.kpopcollection.api.entity.SavedAlbum;
import com.kpopcollection.api.repository.SavedAlbumRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class AlbumService {

    private final SavedAlbumRepository savedAlbumRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Transactional
    public SavedAlbum saveAlbum(SaveAlbumRequest request) {
        return savedAlbumRepository.findByReleaseGroupId(request.getReleaseGroupId())
                .orElseGet(() -> savedAlbumRepository.save(
                        SavedAlbum.builder()
                                .releaseGroupId(request.getReleaseGroupId())
                                .title(request.getTitle())
                                .artist(request.getArtist())
                                .coverUrl(request.getCoverUrl())
                                .build()
                ));
    }

    @Transactional
    public void removeSavedAlbum(Long id) {
        savedAlbumRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<SavedAlbum> getSavedAlbums() {
        return savedAlbumRepository.findAll();
    }

    public List<SaveAlbumRequest> getLatestReleases() {
        try {
            var resource = resourceLoader.getResource("classpath:new_albums.json");
            return objectMapper.readValue(
                    resource.getInputStream(),
                    new TypeReference<List<SaveAlbumRequest>>() {}
            );
        } catch (IOException e) {
            log.error("Failed to read new_albums.json", e);
            return Collections.emptyList();
        }
    }
}
