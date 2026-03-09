package com.kpopcollection.api.service;

import com.kpopcollection.api.dto.SearchMovieRequest;
import com.kpopcollection.api.entity.TrendingMovie;
import com.kpopcollection.api.repository.TrendingMovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final TrendingMovieRepository trendingMovieRepository;

    @Transactional
    public TrendingMovie recordSearch(SearchMovieRequest request) {
        Optional<TrendingMovie> existing = trendingMovieRepository.findBySearchTerm(request.getSearchTerm());

        if (existing.isPresent()) {
            TrendingMovie movie = existing.get();
            movie.setCount(movie.getCount() + 1);
            return trendingMovieRepository.save(movie);
        }

        TrendingMovie newMovie = TrendingMovie.builder()
                .searchTerm(request.getSearchTerm())
                .movieId(request.getMovieId())
                .title(request.getTitle())
                .posterUrl(request.getPosterUrl())
                .count(1)
                .build();

        return trendingMovieRepository.save(newMovie);
    }

    @Transactional(readOnly = true)
    public List<TrendingMovie> getTrending() {
        return trendingMovieRepository.findTop5ByOrderByCountDesc();
    }
}
