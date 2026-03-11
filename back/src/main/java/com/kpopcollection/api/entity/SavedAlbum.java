package com.kpopcollection.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "saved_albums")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedAlbum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String releaseGroupId;

    @Column(nullable = false)
    private String title;

    private String artist;

    private String coverUrl;
}
