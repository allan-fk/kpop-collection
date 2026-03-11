package com.kpopcollection.api.service;

import com.kpopcollection.api.dto.SaveAlbumRequest;
import com.kpopcollection.api.entity.SavedAlbum;
import com.kpopcollection.api.repository.SavedAlbumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class AlbumService {

    private final SavedAlbumRepository savedAlbumRepository;

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
}
