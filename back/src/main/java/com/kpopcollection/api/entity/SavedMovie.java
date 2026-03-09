package com.kpopcollection.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "saved_movies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedMovie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long movieId;

    @Column(nullable = false)
    private String title;

    private String posterUrl;
}
