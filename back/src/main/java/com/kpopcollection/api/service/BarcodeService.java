package com.kpopcollection.api.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.NotFoundException;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;

@Service
public class BarcodeService {

    public String decodeBarcode(MultipartFile file) throws IOException, NotFoundException {
        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) {
            throw new IOException("Unable to read image file");
        }

        BinaryBitmap bitmap = new BinaryBitmap(
                new HybridBinarizer(new BufferedImageLuminanceSource(image)));

        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
        hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE); // <--- Ajoute cette ligne
        hints.put(DecodeHintType.POSSIBLE_FORMATS,
                Arrays.asList(BarcodeFormat.EAN_13, BarcodeFormat.UPC_A, BarcodeFormat.CODE_128));

        Result result = new MultiFormatReader().decode(bitmap, hints);

        // Result result = new MultiFormatReader().decode(bitmap);
        return result.getText();
    }
}
