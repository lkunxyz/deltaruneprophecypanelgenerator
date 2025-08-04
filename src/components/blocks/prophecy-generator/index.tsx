"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Section } from "@/types/blocks/section";
import { presetPanels } from "./presets";
import "./styles.css";

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
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [prophecyText, setProphecyText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("default");
  const [imageScale, setImageScale] = useState(1);
  const [imageYOffset, setImageYOffset] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [customFont, setCustomFont] = useState<string | null>(null);
  const [textTexture, setTextTexture] = useState<string>("/assets/depth/depth-text.png");
  const [panelTexture, setPanelTexture] = useState<string>("/assets/depth/depth-blue.png");
  const [bgTexture, setBgTexture] = useState<string>("/assets/depth/depth-darker-new.png");
  
  // Animation state
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  // Initialize with random preset
  useEffect(() => {
    const randomPreset = presetPanels[Math.floor(Math.random() * presetPanels.length)];
    setProphecyText(randomPreset.text.replace(/\\n/g, '\n'));
    setSelectedStyle(randomPreset.style || "default");
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = selectedStyle === "default" ? "" : `${selectedStyle}-theme`;
    return () => {
      document.body.className = "";
    };
  }, [selectedStyle]);

  // Sine wave animation for wrapper
  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.016;
      if (sineWrapperRef.current) {
        const y = Math.sin(timeRef.current * 0.5) * 10;
        sineWrapperRef.current.style.transform = `translateY(${y}px)`;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Draw ghost icons with animation
  useEffect(() => {
    let ghostTime = 0;
    const animateGhosts = () => {
      ghostTime += 0.016;
      
      // Ghost icon 1
      if (ghostIconRef.current) {
        const ctx = ghostIconRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 512, 256);
          ctx.save();
          
          const offsetY = Math.sin(ghostTime * 2) * 5;
          const opacity = selectedStyle === "final" ? 0.4 + Math.sin(ghostTime * 3) * 0.2 : 0.4;
          
          ctx.globalAlpha = opacity;
          ctx.fillStyle = selectedStyle === "susie" ? '#FF99FF' : 
                          selectedStyle === "final" ? '#FF6666' : '#FFFFFF';
          
          // Draw ghost body
          ctx.beginPath();
          ctx.arc(400, 80 + offsetY, 30, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw ghost tail
          ctx.beginPath();
          ctx.moveTo(370, 80 + offsetY);
          ctx.quadraticCurveTo(380, 100 + offsetY, 370, 110 + offsetY);
          ctx.quadraticCurveTo(385, 105 + offsetY, 400, 110 + offsetY);
          ctx.quadraticCurveTo(415, 105 + offsetY, 430, 110 + offsetY);
          ctx.quadraticCurveTo(420, 100 + offsetY, 430, 80 + offsetY);
          ctx.closePath();
          ctx.fill();
          
          // Draw eyes
          ctx.fillStyle = selectedStyle === "final" ? '#330000' : '#000000';
          ctx.beginPath();
          ctx.arc(390, 75 + offsetY, 3, 0, Math.PI * 2);
          ctx.arc(410, 75 + offsetY, 3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      }
      
      // Ghost icon 2
      if (ghostIcon2Ref.current) {
        const ctx = ghostIcon2Ref.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 512, 256);
          ctx.save();
          
          const offsetY = Math.sin(ghostTime * 1.5 + 1) * 7;
          const opacity = selectedStyle === "final" ? 0.2 + Math.sin(ghostTime * 2.5) * 0.1 : 0.2;
          
          ctx.globalAlpha = opacity;
          ctx.fillStyle = selectedStyle === "susie" ? '#FF99FF' : 
                          selectedStyle === "final" ? '#FF6666' : '#FFFFFF';
          
          // Draw smaller ghost
          ctx.beginPath();
          ctx.arc(120, 100 + offsetY, 20, 0, Math.PI * 2);
          ctx.fill();
          
          // Ghost tail
          ctx.beginPath();
          ctx.moveTo(100, 100 + offsetY);
          ctx.quadraticCurveTo(105, 115 + offsetY, 100, 120 + offsetY);
          ctx.quadraticCurveTo(110, 117 + offsetY, 120, 120 + offsetY);
          ctx.quadraticCurveTo(130, 117 + offsetY, 140, 120 + offsetY);
          ctx.quadraticCurveTo(135, 115 + offsetY, 140, 100 + offsetY);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
        }
      }
      
      requestAnimationFrame(animateGhosts);
    };
    
    animateGhosts();
  }, [selectedStyle]);

  // Main rendering function
  const renderPanel = useCallback(() => {
    if (!panelRef.current) return;
    
    const ctx = panelRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, 512, 256);
    
    // Draw background
    ctx.fillStyle = selectedStyle === "susie" ? '#1a0033' : 
                    selectedStyle === "final" ? '#330000' : '#000000';
    ctx.fillRect(0, 0, 512, 256);
    
    // Draw uploaded image if exists
    if (uploadedImage) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.translate(256, 128);
      ctx.scale(imageScale, imageScale);
      ctx.translate(0, imageYOffset);
      ctx.drawImage(uploadedImage, -uploadedImage.width / 2, -uploadedImage.height / 2);
      ctx.restore();
    }
    
    // Draw text
    if (prophecyText) {
      ctx.save();
      ctx.font = `${28 * fontScale}px ${customFont || 'ProphecyType'}, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = selectedStyle === "susie" ? '#FF99FF' : 
                      selectedStyle === "final" ? '#FFCCCC' : '#FFFFFF';
      
      const lines = prophecyText.split('\n');
      const lineHeight = 35 * fontScale;
      const startY = 128 - (lines.length - 1) * lineHeight / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, 256, startY + index * lineHeight);
      });
      
      ctx.restore();
    }
  }, [uploadedImage, prophecyText, selectedStyle, imageScale, imageYOffset, fontScale, customFont]);

  // Re-render when dependencies change
  useEffect(() => {
    renderPanel();
  }, [renderPanel]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create monochrome version
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Convert to monochrome
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = brightness > 128 ? 255 : 0;
            data[i] = value;     // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          const monoImg = new Image();
          monoImg.onload = () => {
            setUploadedImage(monoImg);
          };
          monoImg.src = canvas.toDataURL();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle font upload
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fontData = event.target?.result as string;
        const fontName = `CustomFont_${Date.now()}`;
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

  // Download panel
  const handleDownload = () => {
    if (!panelRef.current) return;
    
    const link = document.createElement('a');
    link.download = `prophecy-panel-${Date.now()}.png`;
    link.href = panelRef.current.toDataURL();
    link.click();
  };

  return (
    <section id={section.name} className="py-16 bg-black">
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
      
      <input 
        type="text" 
        id="textInput" 
        placeholder="Enter prophecy text"
        value={prophecyText}
        onChange={(e) => setProphecyText(e.target.value)}
      />
      
      <div style={{ marginTop: '10px' }}>
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
      
      <div style={{ height: '10px' }}></div>
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
        style={{ display: isAdvancedOpen ? 'block' : 'none', marginTop: '10px' }}
      >
        <div id="advancedGrid">
          <div className="advancedCell">
            <div id="fontPreview" className="previewBox" style={{ fontFamily: customFont || 'ProphecyType' }}>
              <span id="fontPreviewText">Aa</span>
            </div>
            <div id="fontLabel" className="fileLabel" style={{ fontFamily: customFont || 'ProphecyType' }}>
              {customFont || 'ProphecyType'}
            </div>
            <label className="custom-file-upload small">
              Upload Font
              <input type="file" id="fontUpload" accept=".ttf,.otf" style={{ display: 'none' }} onChange={handleFontUpload} />
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
      
      <div style={{ height: '30px' }}></div>
      
      {/* Canvas Container */}
      <div id="sineWrapper" ref={sineWrapperRef}>
        <div id="overlayWrapper">
          <div id="textContainer" style={{ 
            backgroundImage: `url(${textTexture})`,
            display: 'none' // Hidden in our implementation
          }}>
            {prophecyText}
          </div>
          <div id="output">
            <canvas ref={backgroundRef} id="background" width={512} height={256}></canvas>
            <canvas ref={backgroundRedRef} id="backgroundRed" width={512} height={256} style={{ display: 'none' }}></canvas>
            <canvas ref={ghostIcon2Ref} id="ghostIcon2" width={512} height={256}></canvas>
            <canvas ref={ghostIconRef} id="ghostIcon" width={512} height={256}></canvas>
            <canvas ref={panelRef} id="panel" width={512} height={256}></canvas>
            <canvas ref={ghostIcon2RedRef} id="ghostIcon2Red" width={512} height={256} style={{ display: 'none' }}></canvas>
            <canvas ref={ghostIconRedRef} id="ghostIconRed" width={512} height={256} style={{ display: 'none' }}></canvas>
            <canvas ref={panelRedRef} id="panelRed" width={512} height={256} style={{ display: 'none' }}></canvas>
          </div>
        </div>
      </div>
      
      {/* Directions */}
      <div id="directions">
        <p>{section.description || "Upload a white-only or black-and-white image above to begin. Type your prophecy text in the box. You can use \\n to move to a new line."}</p>
      </div>
      
      {/* Download Button */}
      <button className="custom-file-upload" onClick={handleDownload} style={{ marginTop: '20px' }}>
        Download Panel
      </button>
      
      <footer>
        <p>© HippoWaterMelon 2025 - DELTARUNE © 2025 Toby Fox</p>
      </footer>
      </div>
    </section>
  );
}