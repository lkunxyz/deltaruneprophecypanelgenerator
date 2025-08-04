"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Section } from "@/types/blocks/section";
import { presetPanels } from "./presets";
import "./styles.css";

// Types for preset panels
interface PanelPreset {
  text: string;
  style: string;
  yOffset?: number;
}

const panelPresets: Record<string, PanelPreset> = {
  'roots': {
    text: 'Roots',
    style: 'default',
    yOffset: 38
  },
  'gallery': {
    text: 'Gallery',
    style: 'default',
    yOffset: 20
  },
  'initial-1': {
    text: 'The prophecy, which whispers \\n among the shadows.',
    style: 'default',
    yOffset: 16
  },
  'initial-2': {
    text: 'The legend of this world. \\n < Deltarune. >',
    style: 'default',
    yOffset: 52
  },
  'main-1': {
    text: 'A world basked in purest light. \\n Beneath it grew eternal night.',
    style: 'default'
  },
  'main-2': {
    text: 'If fountains freed, the roaring cries. \\n And titans shape from darkened eyes.',
    style: 'default',
    yOffset: 20
  },
  'main-3': {
    text: 'The light and dark, both burning dire. \\n A countdown to the earth\'s expire.',
    style: 'default',
    yOffset: 32
  },
  'heroes-1': {
    text: 'But lo, on hopes and dreams they send. \\n Three heroes at the world\'s end.',
    style: 'default'
  },
  'heroes-4': {
    text: 'The first hero. \\n The cage, with human soul and parts.',
    style: 'susie',
    yOffset: 36
  },
  'heroes-2': {
    text: 'The second hero. \\n The girl, with hope crossed on her heart.',
    style: 'susie',
    yOffset: 25
  },
  'heroes-3': {
    text: 'The third hero. \\n The prince, alone in deepest dark.',
    style: 'susie',
    yOffset: 54
  },
  'end': {
    text: 'The final tragedy unveils.',
    style: 'final',
    yOffset: 55
  }
};

export default function ProphecyGenerator({ section }: { section: Section }) {
  if (section.disabled) return null;

  // Canvas refs
  const panelRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLCanvasElement>(null);
  const backgroundRedRef = useRef<HTMLCanvasElement>(null);
  const ghostIconRef = useRef<HTMLCanvasElement>(null);
  const ghostIcon2Ref = useRef<HTMLCanvasElement>(null);
  const ghostIconRedRef = useRef<HTMLCanvasElement>(null);
  const ghostIcon2RedRef = useRef<HTMLCanvasElement>(null);
  const panelRedRef = useRef<HTMLCanvasElement>(null);
  const sineWrapperRef = useRef<HTMLDivElement>(null);
  const advancedSettingsRef = useRef<HTMLDivElement>(null);

  // State
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [prophecyText, setProphecyText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("default");
  const [imageScale, setImageScale] = useState(1);
  const [imageYOffset, setImageYOffset] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [customFont, setCustomFont] = useState<string | null>(null);
  
  // Texture state
  const [placeholder, setPlaceholder] = useState<HTMLCanvasElement | null>(null);
  const [placeholderRed, setPlaceholderRed] = useState<HTMLCanvasElement | null>(null);
  const [backgroundTile, setBackgroundTile] = useState<HTMLCanvasElement | null>(null);
  const [backgroundTileRed, setBackgroundTileRed] = useState<HTMLCanvasElement | null>(null);
  const [textTexture, setTextTexture] = useState<HTMLCanvasElement | null>(null);
  const [textTextureRed, setTextTextureRed] = useState<HTMLCanvasElement | null>(null);
  
  // Custom textures
  const [customTextTexture, setCustomTextTexture] = useState<HTMLCanvasElement | null>(null);
  const [customBackgroundTile, setCustomBackgroundTile] = useState<HTMLCanvasElement | null>(null);
  const [customPanelTexture, setCustomPanelTexture] = useState<HTMLCanvasElement | null>(null);
  
  // Animation state
  const scrollOffsetRef = useRef(0);
  const backgroundScrollOffsetRef = useRef(0);
  const sineTimeRef = useRef(0);
  const ghostTimeRef = useRef(0);
  const ghostStartedRef = useRef(false);
  const animationFrameRef = useRef<number>();

  // Initialize with random preset
  useEffect(() => {
    const randomPreset = presetPanels[Math.floor(Math.random() * presetPanels.length)];
    setProphecyText(randomPreset.text.replace(/\\n/g, '\n'));
    setSelectedStyle(randomPreset.style || "default");
    
    // Try to use a panel preset instead
    const panelNames = Object.keys(panelPresets);
    const randomPanelName = panelNames[Math.floor(Math.random() * panelNames.length)];
    const randomPanel = panelPresets[randomPanelName];
    
    setProphecyText(randomPanel.text.replace(/\\n/g, '\n'));
    setSelectedStyle(randomPanel.style);
    setImageYOffset(randomPanel.yOffset || 0);
    
    // Load default mask image
    const defaultImg = new Image();
    defaultImg.onload = () => {
      setMaskImage(defaultImg);
    };
    defaultImg.src = '/assets/base-panels/main-2.png';
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = selectedStyle === "default" ? "" : `${selectedStyle}-theme`;
    return () => {
      document.body.className = "";
    };
  }, [selectedStyle]);

  // Load image from path or create procedural texture
  const loadImageFromFile = useCallback((imagePath: string): Promise<HTMLCanvasElement> => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const tileSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = tileSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, tileSize, tileSize);
        }
        resolve(canvas);
      };
      img.onerror = () => {
        // Create procedural texture as fallback
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = ctx.createImageData(256, 256);
          const data = imageData.data;
          
          // Create noise pattern based on path
          const isText = imagePath.includes('text');
          const isDark = imagePath.includes('darker');
          
          for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random();
            let value = 0;
            
            if (isText) {
              value = 180 + noise * 75;
            } else if (isDark) {
              value = noise * 60;
            } else {
              value = 80 + noise * 100;
            }
            
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 255;
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
        resolve(canvas);
      };
      img.src = imagePath;
    });
  }, []);

  // Get asset paths based on style
  const getAssetPath = useCallback((name: string) => {
    const style = selectedStyle;
    let suffix = '';
    if (style === 'susie') suffix = '-susie';
    else if (style === 'final') suffix = '-final';
    return `/assets/depth/${name}${suffix}.png`;
  }, [selectedStyle]);

  const getRedAssetPath = useCallback((name: string) => {
    return `/assets/depth/${name}-final-red.png`;
  }, []);

  // Reload assets when style changes
  const reloadAssetsAndRedraw = useCallback(() => {
    const isFinalStyle = selectedStyle === 'final';
    const isCustom = customTextTexture || customBackgroundTile || customPanelTexture;

    const promises = [
      customPanelTexture ? Promise.resolve(customPanelTexture) : loadImageFromFile(getAssetPath('depth-blue')),
      customTextTexture ? Promise.resolve(customTextTexture) : loadImageFromFile(getAssetPath('depth-text')),
      customBackgroundTile ? Promise.resolve(customBackgroundTile) : loadImageFromFile(getAssetPath('depth-darker-new'))
    ];

    if (isFinalStyle && !isCustom) {
      promises.push(
        loadImageFromFile(getRedAssetPath('depth-blue')),
        loadImageFromFile(getRedAssetPath('depth-text')),
        loadImageFromFile(getRedAssetPath('depth-darker-new'))
      );
    }

    Promise.all(promises).then((results) => {
      const [tile, textBG, bgTile, redTile, redTextBG, redBgTile] = results;

      setPlaceholder(tile);
      setBackgroundTile(bgTile);
      setTextTexture(textBG);

      if (isFinalStyle && !isCustom && redTile && redTextBG && redBgTile) {
        setPlaceholderRed(redTile);
        setBackgroundTileRed(redBgTile);
        setTextTextureRed(redTextBG);
      } else {
        setPlaceholderRed(null);
        setBackgroundTileRed(null);
        setTextTextureRed(null);
      }
    });
  }, [selectedStyle, customTextTexture, customBackgroundTile, customPanelTexture, loadImageFromFile, getAssetPath, getRedAssetPath]);

  useEffect(() => {
    reloadAssetsAndRedraw();
  }, [reloadAssetsAndRedraw]);

  // Create result canvas with mask
  const createResultCanvas = useCallback((placeholderTexture: HTMLCanvasElement, canvasSize: number) => {
    if (!maskImage || !placeholderTexture) return null;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tempCanvas.height = canvasSize;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;
    
    tempCtx.imageSmoothingEnabled = false;

    const offset = scrollOffsetRef.current % placeholderTexture.width;

    // Draw tiled scrolling texture
    for (let y = -offset; y < canvasSize + placeholderTexture.height; y += placeholderTexture.height) {
      for (let x = -offset; x < canvasSize + placeholderTexture.width; x += placeholderTexture.width) {
        tempCtx.drawImage(placeholderTexture, x, y);
      }
    }

    // Create mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = maskCanvas.height = canvasSize;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return null;
    
    maskCtx.clearRect(0, 0, canvasSize, canvasSize);
    maskCtx.imageSmoothingEnabled = false;

    // Scale mask to fit
    const scale = Math.min(canvasSize / maskImage.width, canvasSize / maskImage.height);
    const dw = maskImage.width * scale;
    const dh = maskImage.height * scale;
    const dx = (canvasSize - dw) / 2;
    const dy = (canvasSize - dh) / 2;

    maskCtx.drawImage(maskImage, dx, dy, dw, dh);

    // Apply mask
    const maskData = maskCtx.getImageData(0, 0, canvasSize, canvasSize);
    const texData = tempCtx.getImageData(0, 0, canvasSize, canvasSize);
    const result = tempCtx.createImageData(canvasSize, canvasSize);

    for (let i = 0; i < maskData.data.length; i += 4) {
      const r = maskData.data[i];
      const g = maskData.data[i + 1];
      const b = maskData.data[i + 2];
      const a = maskData.data[i + 3];
      const brightness = (r + g + b) / 3;

      if (brightness > 200 && a > 0) {
        result.data[i] = texData.data[i];
        result.data[i + 1] = texData.data[i + 1];
        result.data[i + 2] = texData.data[i + 2];
        result.data[i + 3] = 255;
      } else {
        result.data[i + 3] = 0;
      }
    }

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = resultCanvas.height = canvasSize;
    const resultCtx = resultCanvas.getContext('2d');
    if (resultCtx) {
      resultCtx.putImageData(result, 0, 0);
    }
    return resultCanvas;
  }, [maskImage]);

  // Draw panel
  const drawPanel = useCallback(() => {
    if (!maskImage || !placeholder || !panelRef.current) return;

    const ctx = panelRef.current.getContext('2d');
    if (!ctx) return;

    const canvasSize = 384;

    ctx.clearRect(0, 0, 768, 384);
    ctx.imageSmoothingEnabled = false;
    
    const resultCanvas = createResultCanvas(placeholder, canvasSize);

    if (resultCanvas) {
      const scale = imageScale;
      const scaledW = resultCanvas.width * scale;
      const scaledH = resultCanvas.height * scale;
      const scaledX = (768 - scaledW) / 2;
      const scaledY = (384 - scaledH) / 2 - imageYOffset;
      ctx.drawImage(resultCanvas, 0, 0, resultCanvas.width, resultCanvas.height, scaledX, scaledY, scaledW, scaledH);
    }

    // Draw red version if needed
    if (placeholderRed && panelRedRef.current) {
      const ctxRed = panelRedRef.current.getContext('2d');
      if (ctxRed) {
        ctxRed.clearRect(0, 0, 768, 384);
        ctxRed.imageSmoothingEnabled = false;
        
        const resultCanvasRed = createResultCanvas(placeholderRed, canvasSize);

        if (resultCanvasRed) {
          const scale = imageScale;
          const scaledW = resultCanvasRed.width * scale;
          const scaledH = resultCanvasRed.height * scale;
          const scaledX = (768 - scaledW) / 2;
          const scaledY = (384 - scaledH) / 2 - imageYOffset;
          ctxRed.drawImage(resultCanvasRed, 0, 0, resultCanvasRed.width, resultCanvasRed.height, scaledX, scaledY, scaledW, scaledH);
        }
      }
    }
  }, [maskImage, placeholder, placeholderRed, imageScale, imageYOffset, createResultCanvas]);

  // Draw ghost icons
  const drawGhostIcon = useCallback(() => {
    if (!maskImage || !placeholder) return;

    const t = ghostTimeRef.current;
    const offset1 = Math.sin(t * 2) * 6;
    const offset2 = offset1 * 2;

    const canvasSize = 384;
    const resultCanvas = createResultCanvas(placeholder, canvasSize);
    
    if (!resultCanvas) return;

    const scale = imageScale;
    const scaledW = resultCanvas.width * scale;
    const scaledH = resultCanvas.height * scale;
    const scaledX = (512 - scaledW) / 2;
    const scaledY = (256 - scaledH) / 2 - imageYOffset;

    // Ghost icon 1
    if (ghostIconRef.current) {
      const gtx = ghostIconRef.current.getContext('2d');
      if (gtx) {
        gtx.clearRect(0, 0, 768, 384);
        gtx.imageSmoothingEnabled = false;
        gtx.save();
        gtx.translate(offset1, offset1);
        gtx.drawImage(resultCanvas, 0, 0, resultCanvas.width, resultCanvas.height, scaledX, scaledY, scaledW, scaledH);
        gtx.restore();
      }
    }

    // Ghost icon 2
    if (ghostIcon2Ref.current) {
      const gtx2 = ghostIcon2Ref.current.getContext('2d');
      if (gtx2) {
        gtx2.clearRect(0, 0, 768, 384);
        gtx2.imageSmoothingEnabled = false;
        gtx2.save();
        gtx2.translate(offset2, offset2);
        gtx2.drawImage(resultCanvas, 0, 0, resultCanvas.width, resultCanvas.height, scaledX, scaledY, scaledW, scaledH);
        gtx2.restore();
      }
    }

    // Red versions
    if (placeholderRed) {
      const resultCanvasRed = createResultCanvas(placeholderRed, canvasSize);
      
      if (resultCanvasRed) {
        if (ghostIconRedRef.current) {
          const gtxRed = ghostIconRedRef.current.getContext('2d');
          if (gtxRed) {
            gtxRed.clearRect(0, 0, 768, 384);
            gtxRed.imageSmoothingEnabled = false;
            gtxRed.save();
            gtxRed.translate(offset1, offset1);
            gtxRed.drawImage(resultCanvasRed, 0, 0, resultCanvasRed.width, resultCanvasRed.height, scaledX, scaledY, scaledW, scaledH);
            gtxRed.restore();
          }
        }

        if (ghostIcon2RedRef.current) {
          const gtx2Red = ghostIcon2RedRef.current.getContext('2d');
          if (gtx2Red) {
            gtx2Red.clearRect(0, 0, 768, 384);
            gtx2Red.imageSmoothingEnabled = false;
            gtx2Red.save();
            gtx2Red.translate(offset2, offset2);
            gtx2Red.drawImage(resultCanvasRed, 0, 0, resultCanvasRed.width, resultCanvasRed.height, scaledX, scaledY, scaledW, scaledH);
            gtx2Red.restore();
          }
        }
      }
    }
  }, [maskImage, placeholder, placeholderRed, imageScale, imageYOffset, createResultCanvas]);

  // Draw background
  const drawBackground = useCallback(() => {
    if (!backgroundTile || !backgroundRef.current) return;

    const bgCtx = backgroundRef.current.getContext('2d');
    if (!bgCtx) return;

    const offset = (backgroundScrollOffsetRef.current * imageScale) % (backgroundTile.width * imageScale);
    
    bgCtx.clearRect(0, 0, 768, 384);
    bgCtx.imageSmoothingEnabled = false;

    const scale = imageScale;
    const yOffset = -imageYOffset;

    const scaledTileWidth = backgroundTile.width * scale;
    const scaledTileHeight = backgroundTile.height * scale;

    // Draw tiled background
    for (let y = -offset + yOffset; y < 384 + scaledTileHeight + yOffset; y += scaledTileHeight) {
      for (let x = -offset; x < 768 + scaledTileWidth; x += scaledTileWidth) {
        bgCtx.drawImage(backgroundTile, x, y, scaledTileWidth, scaledTileHeight);
      }
    }

    // Draw radial gradient mask
    const canvasSize = 384;
    const scaledW = canvasSize * scale;
    const imageX = (768 - scaledW) / 2;
    const imageY = 96 + yOffset;

    const radiusX = 240 * scale;
    const radiusY = 150 * scale;

    bgCtx.save();
    bgCtx.translate(imageX + scaledW/2, imageY);
    bgCtx.scale(radiusX / radiusY, 1);
    bgCtx.translate(-(imageX + scaledW/2), -imageY);

    const gradient = bgCtx.createRadialGradient(imageX + scaledW/2, imageY, 0, imageX + scaledW/2, imageY, radiusY);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.6, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');

    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, 768, 384);
    bgCtx.restore();

    // Red version
    if (backgroundTileRed && backgroundRedRef.current) {
      const bgRedCtx = backgroundRedRef.current.getContext('2d');
      if (bgRedCtx) {
        bgRedCtx.clearRect(0, 0, 768, 384);
        bgRedCtx.imageSmoothingEnabled = false;

        for (let y = -offset + yOffset; y < 384 + scaledTileHeight + yOffset; y += scaledTileHeight) {
          for (let x = -offset; x < 768 + scaledTileWidth; x += scaledTileWidth) {
            bgRedCtx.drawImage(backgroundTileRed, x, y, scaledTileWidth, scaledTileHeight);
          }
        }

        bgRedCtx.save();
        bgRedCtx.translate(imageX + scaledW/2, imageY);
        bgRedCtx.scale(radiusX / radiusY, 1);
        bgRedCtx.translate(-(imageX + scaledW/2), -imageY);

        const redGradient = bgRedCtx.createRadialGradient(imageX + scaledW/2, imageY, 0, imageX + scaledW/2, imageY, radiusY);
        redGradient.addColorStop(0, 'rgba(0,0,0,0)');
        redGradient.addColorStop(0.6, 'rgba(0,0,0,0)');
        redGradient.addColorStop(1, 'rgba(0,0,0,1)');

        bgRedCtx.fillStyle = redGradient;
        bgRedCtx.fillRect(0, 0, 768, 384);
        bgRedCtx.restore();
      }
    }
  }, [backgroundTile, backgroundTileRed, imageScale, imageYOffset]);

  // Animation loop
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      // Update scroll offsets
      scrollOffsetRef.current = (scrollOffsetRef.current + 1) % 256;
      backgroundScrollOffsetRef.current = (backgroundScrollOffsetRef.current + 0.5) % 256;
      sineTimeRef.current += 0.016;
      ghostTimeRef.current += 0.016;

      // Draw everything
      drawPanel();
      drawBackground();
      
      // Start ghost animation if needed
      if (maskImage && placeholder && !ghostStartedRef.current) {
        ghostStartedRef.current = true;
      }
      
      if (ghostStartedRef.current) {
        drawGhostIcon();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [drawPanel, drawBackground, drawGhostIcon, maskImage, placeholder]);

  // Sine wave animation for wrapper
  useEffect(() => {
    const animateSine = () => {
      const offset = Math.sin(sineTimeRef.current * 1.5) * 10;
      if (sineWrapperRef.current) {
        sineWrapperRef.current.style.transform = `translateY(${offset}px)`;
      }
      animationFrameRef.current = requestAnimationFrame(animateSine);
    };
    
    animateSine();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const img = new Image();
    img.onload = () => {
      setMaskImage(img);
    };
    img.src = URL.createObjectURL(file);
  };

  // Handle font upload
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fontData = event.target?.result as string;
        const fontName = file.name.replace(/\.[^/.]+$/, "");
        const customFontFace = new FontFace(fontName, `url(${fontData})`);
        await customFontFace.load();
        document.fonts.add(customFontFace);
        setCustomFont(fontName);
      } catch (error) {
        console.error('Failed to load custom font:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle texture uploads
  const handleTextureUpload = (type: 'text' | 'panel' | 'bg') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 256, 256);
        
        if (type === 'text') {
          setCustomTextTexture(canvas);
        } else if (type === 'panel') {
          setCustomPanelTexture(canvas);
        } else if (type === 'bg') {
          setCustomBackgroundTile(canvas);
        }
        
        reloadAssetsAndRedraw();
      }
    };
    img.src = URL.createObjectURL(file);
  };

  // Download composite image
  const handleDownload = () => {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = 768;
    compositeCanvas.height = 384;
    const ctx = compositeCanvas.getContext('2d');
    
    if (ctx && backgroundRef.current && panelRef.current) {
      // Draw all layers
      ctx.drawImage(backgroundRef.current, 0, 0);
      
      if (ghostIcon2Ref.current) {
        ctx.globalAlpha = 0.2;
        ctx.drawImage(ghostIcon2Ref.current, 0, 0);
      }
      
      if (ghostIconRef.current) {
        ctx.globalAlpha = 0.4;
        ctx.drawImage(ghostIconRef.current, 0, 0);
      }
      
      ctx.globalAlpha = 1;
      ctx.drawImage(panelRef.current, 0, 0);
      
      // Add red overlays if final theme
      if (selectedStyle === 'final') {
        if (backgroundRedRef.current) {
          ctx.globalAlpha = 0.5;
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(backgroundRedRef.current, 0, 0);
        }
        
        if (panelRedRef.current) {
          ctx.globalAlpha = 0.3;
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(panelRedRef.current, 0, 0);
        }
      }
      
      // Download
      const link = document.createElement('a');
      link.download = `prophecy-panel-${Date.now()}.png`;
      link.href = compositeCanvas.toDataURL();
      link.click();
    }
  };

  return (
    <section id={section.name} className="py-6 bg-black">
      <div className="prophecy-generator-container">
        <h1 className="text-3xl font-bold text-white">{section.title || "Deltarune Prophecy Panel Generator"}</h1>
      
        {/* Controls */}
        <input 
          type="file" 
          id="imgInput" 
          accept="image/*" 
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <label htmlFor="imgInput" className="custom-file-upload">Upload Image</label>
        
        <textarea
          id="textInput" 
          placeholder="Enter prophecy text... Use \n for new lines"
          value={prophecyText}
          onChange={(e) => setProphecyText(e.target.value)}
          style={{ 
            width: '85vw',
            maxWidth: '640px',
            height: '80px',
            resize: 'vertical',
            fontFamily: 'DTMSans, sans-serif',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '4px',
            padding: '10px 12px',
            marginTop: '10px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)'
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            e.target.style.boxShadow = '0 2px 8px rgba(255, 255, 255, 0.1)';
          }}
        />
        
        <div style={{ marginTop: '6px' }}>
          <label htmlFor="styleSelect">Style:</label>
          <select 
            id="styleSelect" 
            value={selectedStyle} 
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="susie">Susie's Dark World</option>
            <option value="final">The Final Prophecy</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="checkbox-container">
            <label htmlFor="imgScale">Image Scale:</label>
            <input 
              type="range" 
              id="imgScale" 
              min="0.1" 
              max="3" 
              value={imageScale} 
              step="0.01"
              onChange={(e) => setImageScale(parseFloat(e.target.value))}
            />
            <span id="imgScaleValue">{imageScale.toFixed(2)}×</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="checkbox-container">
            <label htmlFor="imgYOffset">Image Y Offset:</label>
            <input 
              type="range" 
              id="imgYOffset" 
              min="-100" 
              max="100" 
              value={imageYOffset}
              onChange={(e) => setImageYOffset(parseInt(e.target.value))}
            />
            <span id="imgYOffsetValue">{imageYOffset}px</span>
          </div>
        </div>
        
        <div style={{ height: '6px' }}></div>
        <button 
          className="custom-file-upload"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          Advanced Settings
        </button>
        
        {/* Advanced Settings */}
        <div 
          id="advancedSettings" 
          ref={advancedSettingsRef}
          style={{ display: isAdvancedOpen ? 'block' : 'none', marginTop: '6px' }}
        >
          <div id="advancedGrid">
            <div className="advancedCell">
              <div id="fontPreview" className="previewBox" style={{ fontFamily: customFont || 'ProphecyType' }}>
                <span id="fontPreviewText" style={{ fontSize: `${28 * fontScale}px` }}>Aa</span>
              </div>
              <div id="fontLabel" className="fileLabel" style={{ fontFamily: customFont || 'ProphecyType' }}>
                {customFont || 'ProphecyType'}
              </div>
              <label className="custom-file-upload small">
                Upload Font
                <input type="file" id="fontUpload" accept=".ttf,.otf" style={{ display: 'none' }} onChange={handleFontUpload} />
              </label>
            </div>
            
            <div className="advancedCell">
              <div className="previewBox" style={{ 
                backgroundImage: textTexture ? `url(${textTexture.toDataURL()})` : undefined,
                backgroundSize: 'cover'
              }} />
              <div className="fileLabel">Text Texture</div>
              <label className="custom-file-upload small">
                Upload Texture
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleTextureUpload('text')} />
              </label>
            </div>
            
            <div className="advancedCell">
              <div className="previewBox" style={{ 
                backgroundImage: placeholder ? `url(${placeholder.toDataURL()})` : undefined,
                backgroundSize: 'cover'
              }} />
              <div className="fileLabel">Panel Texture</div>
              <label className="custom-file-upload small">
                Upload Texture
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleTextureUpload('panel')} />
              </label>
            </div>
            
            <div className="advancedCell">
              <div className="previewBox" style={{ 
                backgroundImage: backgroundTile ? `url(${backgroundTile.toDataURL()})` : undefined,
                backgroundSize: 'cover'
              }} />
              <div className="fileLabel">Background Texture</div>
              <label className="custom-file-upload small">
                Upload Texture
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleTextureUpload('bg')} />
              </label>
            </div>
            
            <div className="sliderWrapper">
              <label htmlFor="fontScale" className="fileLabel">Font Scale</label>
              <input 
                type="range" 
                id="fontScale" 
                min="0.5" 
                max="2" 
                step="0.05" 
                value={fontScale}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
              />
              <span id="fontScaleValue" className="fileLabel">{fontScale.toFixed(2)}×</span>
            </div>
          </div>
        </div>
        
        <div style={{ height: '16px' }}></div>
        
        {/* Canvas Container */}
        <div id="sineWrapper" ref={sineWrapperRef}>
          <div id="overlayWrapper">
            <div id="textContainer" 
              style={{ 
                backgroundImage: textTexture ? `url(${textTexture.toDataURL()})` : undefined,
                transform: `scale(${fontScale})`,
                fontFamily: `${customFont || 'ProphecyType'}, serif`
              }}
            >
              {prophecyText.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < prophecyText.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            {selectedStyle === 'final' && !customTextTexture && (
              <div id="textContainerRed"
                style={{ 
                  backgroundImage: textTextureRed ? `url(${textTextureRed.toDataURL()})` : undefined,
                  transform: `scale(${fontScale})`,
                  fontFamily: `${customFont || 'ProphecyType'}, serif`
                }}
              >
                {prophecyText.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < prophecyText.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            )}
            <div id="output">
              <canvas ref={backgroundRef} id="background" width={768} height={384}></canvas>
              <canvas ref={backgroundRedRef} id="backgroundRed" width={768} height={384} 
                style={{ display: selectedStyle === 'final' && !customBackgroundTile ? 'block' : 'none' }}
              ></canvas>
              <canvas ref={ghostIcon2Ref} id="ghostIcon2" width={768} height={384}></canvas>
              <canvas ref={ghostIconRef} id="ghostIcon" width={768} height={384}></canvas>
              <canvas ref={panelRef} id="panel" width={768} height={384}></canvas>
              <canvas ref={ghostIcon2RedRef} id="ghostIcon2Red" width={768} height={384} 
                style={{ display: selectedStyle === 'final' && !customPanelTexture ? 'block' : 'none' }}
              ></canvas>
              <canvas ref={ghostIconRedRef} id="ghostIconRed" width={768} height={384} 
                style={{ display: selectedStyle === 'final' && !customPanelTexture ? 'block' : 'none' }}
              ></canvas>
              <canvas ref={panelRedRef} id="panelRed" width={768} height={384} 
                style={{ display: selectedStyle === 'final' && !customPanelTexture ? 'block' : 'none' }}
              ></canvas>
            </div>
          </div>
        </div>
        
        {/* Directions */}
        <div id="directions">
          <p>{section.description || "Upload a white-only or black-and-white image above to begin. Type your prophecy text in the box. You can use \\n to move to a new line."}</p>
        </div>
        
        {/* Download Button */}
        <button className="custom-file-upload" onClick={handleDownload} style={{ marginTop: '12px' }}>
          Download Panel
        </button>
        
        <footer>
          <p>© HippoWaterMelon 2025 - DELTARUNE © 2025 Toby Fox</p>
        </footer>
      </div>
    </section>
  );
}