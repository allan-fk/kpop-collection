package com.kpopcollection.api.dto;

import lombok.Data;

@Data
public class SaveAlbumRequest {

    private String releaseGroupId;
    private String title;
    private String artist;
    private String coverUrl;
}
