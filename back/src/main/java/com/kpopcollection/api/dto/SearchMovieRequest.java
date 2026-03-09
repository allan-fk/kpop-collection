package com.kpopcollection.api.dto;

import lombok.Data;

@Data
public class SearchMovieRequest {

    private String searchTerm;
    private Long movieId;
    private String title;
    private String posterUrl;
}
