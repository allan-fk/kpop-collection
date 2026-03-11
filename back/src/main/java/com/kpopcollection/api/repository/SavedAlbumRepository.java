package com.kpopcollection.api.repository;

import com.kpopcollection.api.entity.SavedAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedAlbumRepository extends JpaRepository<SavedAlbum, Long> {

    Optional<SavedAlbum> findByReleaseGroupId(String releaseGroupId);

    boolean existsByReleaseGroupId(String releaseGroupId);
}
