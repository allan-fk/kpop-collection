package com.kpopcollection.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trending_movies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendingMovie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String searchTerm;

    @Column(nullable = false)
    private Long movieId;

    @Column(nullable = false)
    private String title;

    @Builder.Default
    @Column(nullable = false)
    private Integer count = 1;

    private String posterUrl;
}
