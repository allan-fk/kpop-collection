package com.kpopcollection.api.dto;

import lombok.Data;

@Data
public class SaveMovieRequest {

    private Long movieId;
    private String title;
    private String posterUrl;
}
