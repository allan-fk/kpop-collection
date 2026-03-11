package com.kpopcollection.api.controller;

import com.google.zxing.NotFoundException;
import com.kpopcollection.api.service.BarcodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/barcode")
@RequiredArgsConstructor
public class BarcodeController {

    private final BarcodeService barcodeService;

    @PostMapping("/scan")
    public ResponseEntity<?> scanBarcode(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file provided");
        }

        try {
            String barcode = barcodeService.decodeBarcode(file);
            return ResponseEntity.ok(barcode);
        } catch (NotFoundException e) {
            return ResponseEntity.badRequest().body("No barcode detected in the image");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to read image: " + e.getMessage());
        }
    }
}
