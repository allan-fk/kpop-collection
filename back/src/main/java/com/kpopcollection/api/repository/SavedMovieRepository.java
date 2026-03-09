package com.kpopcollection.api.repository;

import com.kpopcollection.api.entity.SavedMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedMovieRepository extends JpaRepository<SavedMovie, Long> {

    Optional<SavedMovie> findByMovieId(Long movieId);

    boolean existsByMovieId(Long movieId);
}
