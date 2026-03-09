package com.kpopcollection.api.repository;

import com.kpopcollection.api.entity.TrendingMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrendingMovieRepository extends JpaRepository<TrendingMovie, Long> {

    Optional<TrendingMovie> findBySearchTerm(String searchTerm);

    List<TrendingMovie> findTop5ByOrderByCountDesc();
}
