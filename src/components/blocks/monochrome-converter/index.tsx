"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Section } from "@/types/blocks/section";
import "./styles.css";

interface MonochromeSettings {
  threshold: number;
  algorithm: 'threshold' | 'average' | 'luminance' | 'ultrathink';
  invert: boolean;
  contrast: number;
  brightness: number;
}

export default function MonochromeConverter({ section }: { section: Section }) {
  if (section.disabled) return null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<MonochromeSettings>({
    threshold: 128,
    algorithm: 'threshold',
    invert: false,
    contrast: 1,
    brightness: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert image to monochrome
  const convertToMonochrome = useCallback(() => {
    if (!originalImage || !canvasRef.current || !previewCanvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas.getContext('2d');
    
    if (!ctx || !previewCtx) return;

    // Set canvas size to match image
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    previewCanvas.width = Math.min(originalImage.width, 512);
    previewCanvas.height = Math.min(originalImage.height, 512);

    // Draw original image
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(originalImage, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply brightness and contrast adjustments first
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] = Math.max(0, Math.min(255, data[i] + settings.brightness));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + settings.brightness));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + settings.brightness));

      // Apply contrast
      data[i] = Math.max(0, Math.min(255, ((data[i] - 128) * settings.contrast) + 128));
      data[i + 1] = Math.max(0, Math.min(255, ((data[i + 1] - 128) * settings.contrast) + 128));
      data[i + 2] = Math.max(0, Math.min(255, ((data[i + 2] - 128) * settings.contrast) + 128));
    }

    // Convert to monochrome based on algorithm
    for (let i = 0; i < data.length; i += 4) {
      let value = 0;
      
      switch (settings.algorithm) {
        case 'threshold':
          // Simple threshold
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          value = avg > settings.threshold ? 255 : 0;
          break;
          
        case 'average':
          // Average of RGB
          value = (data[i] + data[i + 1] + data[i + 2]) / 3;
          value = value > settings.threshold ? 255 : 0;
          break;
          
        case 'luminance':
          // Weighted luminance
          const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          value = luminance > settings.threshold ? 255 : 0;
          break;
          
        case 'ultrathink':
          // Special "ultrathink" algorithm with edge detection
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          
          // Get surrounding pixels for edge detection
          let edgeValue = 0;
          const getPixel = (px: number, py: number) => {
            if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) return 0;
            const idx = (py * canvas.width + px) * 4;
            return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          };
          
          const current = getPixel(x, y);
          const neighbors = [
            getPixel(x - 1, y),
            getPixel(x + 1, y),
            getPixel(x, y - 1),
            getPixel(x, y + 1)
          ];
          
          // Calculate edge strength
          let maxDiff = 0;
          for (const neighbor of neighbors) {
            maxDiff = Math.max(maxDiff, Math.abs(current - neighbor));
          }
          
          // Combine threshold with edge detection
          if (maxDiff > 30) {
            // Strong edge - preserve
            value = current > settings.threshold ? 255 : 0;
          } else {
            // Weak edge - apply stronger threshold
            value = current > (settings.threshold + 20) ? 255 : 0;
          }
          break;
      }
      
      // Invert if needed
      if (settings.invert) {
        value = 255 - value;
      }
      
      // Set RGB to same value for grayscale
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      // Keep alpha unchanged
    }

    // Put modified data back
    ctx.putImageData(imageData, 0, 0);

    // Draw preview
    previewCtx.imageSmoothingEnabled = false;
    const scale = Math.min(512 / canvas.width, 512 / canvas.height, 1);
    const width = canvas.width * scale;
    const height = canvas.height * scale;
    const x = (previewCanvas.width - width) / 2;
    const y = (previewCanvas.height - height) / 2;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.drawImage(canvas, x, y, width, height);

    setIsProcessing(false);
  }, [originalImage, settings]);

  // Auto-convert when settings change
  useEffect(() => {
    if (originalImage) {
      convertToMonochrome();
    }
  }, [originalImage, settings, convertToMonochrome]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
    };
    img.src = URL.createObjectURL(file);
  };

  // Download converted image
  const handleDownload = () => {
    if (!canvasRef.current || !originalImage) return;

    const link = document.createElement('a');
    link.download = `monochrome-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!canvasRef.current || !originalImage) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => {
          resolve(blob!);
        });
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      // Show success feedback
      const button = document.getElementById('copyButton');
      if (button) {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy to Clipboard';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  return (
    <section id={section.name} className="py-16 bg-black">
      <div className="monochrome-converter-container">
        <h1 className="text-4xl font-bold text-white mb-4">
          {section.title || "Monochrome Image Converter"}
        </h1>
        
        <p className="text-lg text-gray-300 text-center mb-8 max-w-3xl mx-auto leading-relaxed">
          {section.description || "Transform your images into stunning black and white art with our advanced UltraThink edge detection algorithm. Perfect for creating high-contrast prophecy panel masks with superior detail preservation."}
        </p>
        
        <div className="converter-layout">
          {/* Controls Panel */}
          <div className="controls-panel">
            <input 
              type="file" 
              id="monoImageInput" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <label htmlFor="monoImageInput" className="custom-file-upload">
              Upload Image
            </label>

            {originalImage && (
              <>
                <div className="control-group">
                  <label>Algorithm:</label>
                  <select 
                    value={settings.algorithm} 
                    onChange={(e) => setSettings({...settings, algorithm: e.target.value as any})}
                  >
                    <option value="threshold">Simple Threshold</option>
                    <option value="average">Average RGB</option>
                    <option value="luminance">Weighted Luminance</option>
                    <option value="ultrathink">UltraThink (Edge Aware)</option>
                  </select>
                </div>

                <div className="control-group">
                  <label>Threshold: {settings.threshold}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="255" 
                    value={settings.threshold}
                    onChange={(e) => setSettings({...settings, threshold: parseInt(e.target.value)})}
                  />
                </div>

                <div className="control-group">
                  <label>Brightness: {settings.brightness}</label>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    value={settings.brightness}
                    onChange={(e) => setSettings({...settings, brightness: parseInt(e.target.value)})}
                  />
                </div>

                <div className="control-group">
                  <label>Contrast: {settings.contrast.toFixed(2)}</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3" 
                    step="0.1"
                    value={settings.contrast}
                    onChange={(e) => setSettings({...settings, contrast: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="control-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.invert}
                      onChange={(e) => setSettings({...settings, invert: e.target.checked})}
                    />
                    Invert Colors
                  </label>
                </div>

                <div className="button-group">
                  <button className="custom-file-upload" onClick={handleDownload}>
                    Download Image
                  </button>
                  <button id="copyButton" className="custom-file-upload" onClick={handleCopyToClipboard}>
                    Copy to Clipboard
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Preview Area */}
          <div className="preview-area">
            <canvas 
              ref={previewCanvasRef}
              className="preview-canvas"
              width={512}
              height={512}
            />
            {!originalImage && (
              <div className="placeholder">
                <p>Upload an image to begin</p>
                <p className="hint">The converter will transform your image into pure black and white</p>
              </div>
            )}
            {isProcessing && (
              <div className="processing-overlay">
                <p>Processing...</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden full-size canvas for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

      </div>
    </section>
  );
}