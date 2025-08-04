"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Section } from "@/types/blocks/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { presetPanels } from "./presets";
import { useTranslations } from "next-intl";

interface ProphecyStyle {
  name: string;
  value: string;
  backgroundColor: string;
  textColor: string;
  ghostColor: string;
  effectClass?: string;
}

const styles: ProphecyStyle[] = [
  { name: "Default", value: "default", backgroundColor: "#000000", textColor: "#FFFFFF", ghostColor: "#FFFFFF" },
  { name: "Susie's Dark World", value: "susie", backgroundColor: "#1a0033", textColor: "#FF99FF", ghostColor: "#FF99FF" },
  { name: "Final Prophecy", value: "final", backgroundColor: "#330000", textColor: "#FFCCCC", ghostColor: "#FF6666" }
];

export default function ProphecyGenerator({ section }: { section: Section }) {
  if (section.disabled) return null;

  const t = useTranslations("prophecy_generator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>();

  const [selectedStyle, setSelectedStyle] = useState("default");
  const [imageScale, setImageScale] = useState(1);
  const [imageYOffset, setImageYOffset] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [prophecyText, setProphecyText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [customFont, setCustomFont] = useState<string | null>(null);
  const [textTexture, setTextTexture] = useState<HTMLImageElement | null>(null);
  const [panelTexture, setPanelTexture] = useState<HTMLImageElement | null>(null);
  const [bgTexture, setBgTexture] = useState<HTMLImageElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const prophecyFont = new FontFace('ProphecyType', 'url(/fonts/prophecy-type.woff2)');
        const dtmFont = new FontFace('DTMSans', 'url(/fonts/dtm-sans.woff2)');
        
        await Promise.all([prophecyFont.load(), dtmFont.load()]);
        
        document.fonts.add(prophecyFont);
        document.fonts.add(dtmFont);
        
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to load fonts:', error);
        setFontsLoaded(true); // Continue anyway with fallback fonts
      }
    };
    
    loadFonts();
  }, []);

  // Initialize with random preset
  useEffect(() => {
    if (fontsLoaded && !prophecyText) {
      const randomPreset = presetPanels[Math.floor(Math.random() * presetPanels.length)];
      setProphecyText(randomPreset.text);
      setSelectedStyle(randomPreset.style || "default");
    }
  }, [fontsLoaded, prophecyText]);

  // Animation loop
  useEffect(() => {
    let time = 0;
    
    const animate = () => {
      time += 0.016; // ~60fps
      
      // Animate ghost icon
      if (ghostCanvasRef.current) {
        const ctx = ghostCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 64, 64);
          
          const style = styles.find(s => s.value === selectedStyle) || styles[0];
          ctx.fillStyle = style.ghostColor;
          ctx.globalAlpha = 0.6 + Math.sin(time * 2) * 0.2;
          
          // Draw ghost shape
          const offsetY = Math.sin(time * 3) * 5;
          ctx.beginPath();
          ctx.arc(32, 32 + offsetY, 20, 0, Math.PI * 2);
          ctx.fill();
          
          // Ghost eyes
          ctx.fillStyle = style.backgroundColor;
          ctx.beginPath();
          ctx.arc(26, 30 + offsetY, 3, 0, Math.PI * 2);
          ctx.arc(38, 30 + offsetY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Animate background
      if (bgCanvasRef.current && bgTexture) {
        const ctx = bgCanvasRef.current.getContext('2d');
        if (ctx) {
          const scrollY = (time * 30) % bgTexture.height;
          ctx.clearRect(0, 0, 512, 256);
          ctx.drawImage(bgTexture, 0, -scrollY);
          ctx.drawImage(bgTexture, 0, bgTexture.height - scrollY);
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedStyle, bgTexture]);

  // Render main canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !fontsLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const style = styles.find(s => s.value === selectedStyle) || styles[0];
    
    // Clear canvas
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(0, 0, 512, 256);
    
    // Draw panel texture if available
    if (panelTexture) {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(panelTexture, 0, 0, 512, 256);
      ctx.globalAlpha = 1;
    }
    
    // Draw uploaded image with transformations
    if (uploadedImage) {
      ctx.save();
      ctx.translate(256, 128);
      ctx.scale(imageScale, imageScale);
      ctx.translate(0, imageYOffset);
      
      // Apply mask/blend mode
      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(uploadedImage, -uploadedImage.width / 2, -uploadedImage.height / 2);
      
      ctx.restore();
    }
    
    // Draw text
    if (prophecyText) {
      ctx.save();
      ctx.fillStyle = style.textColor;
      ctx.font = `${24 * fontScale}px ProphecyType, DTMSans, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Handle multiline text
      const lines = prophecyText.split('\\n');
      const lineHeight = 30 * fontScale;
      const totalHeight = lines.length * lineHeight;
      const startY = 128 - totalHeight / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        if (textTexture) {
          // Create text with texture
          ctx.save();
          ctx.globalCompositeOperation = 'source-in';
          ctx.drawImage(textTexture, 0, 0, 512, 256);
          ctx.restore();
        }
        ctx.fillText(line, 256, startY + index * lineHeight);
      });
      
      ctx.restore();
    }
    
    // Apply final effects
    ctx.save();
    const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 256);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    ctx.restore();
  }, [selectedStyle, imageScale, imageYOffset, fontScale, prophecyText, uploadedImage, fontsLoaded, textTexture, panelTexture]);

  // Re-render when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle texture uploads
  const handleTextureUpload = (type: 'font' | 'text' | 'panel' | 'bg') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (type === 'font') {
      // Handle font upload
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fontData = event.target?.result as string;
        const customFontFace = new FontFace('CustomProphecy', `url(${fontData})`);
        await customFontFace.load();
        document.fonts.add(customFontFace);
        setCustomFont('CustomProphecy');
      };
      reader.readAsDataURL(file);
    } else {
      // Handle texture uploads
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          switch(type) {
            case 'text':
              setTextTexture(img);
              break;
            case 'panel':
              setPanelTexture(img);
              break;
            case 'bg':
              setBgTexture(img);
              break;
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Download generated panel
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `prophecy-panel-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <section id={section.name} className="py-16 bg-black text-white">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{section.title || "Deltarune Prophecy Panel Generator"}</h2>
          {section.description && <p className="text-muted-foreground">{section.description}</p>}
        </div>

        <div className="space-y-6">
          {/* Canvas Display */}
          <div className="relative flex justify-center mb-8">
            <div className="relative">
              <canvas 
                ref={bgCanvasRef} 
                width={512} 
                height={256} 
                className="absolute inset-0 opacity-20"
                style={{ imageRendering: 'pixelated' }}
              />
              <canvas 
                ref={canvasRef} 
                width={512} 
                height={256} 
                className="relative border-2 border-gray-800"
                style={{ imageRendering: 'pixelated' }}
              />
              <canvas 
                ref={ghostCanvasRef} 
                width={64} 
                height={64} 
                className="absolute -right-8 -top-8"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="grid gap-4">
            {/* Image Upload */}
            <div>
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input 
                id="image-upload"
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-gray-900 border-gray-700"
              />
            </div>

            {/* Style Selection */}
            <div>
              <Label htmlFor="style-select">Style</Label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sliders */}
            <div>
              <Label>Image Scale: {imageScale.toFixed(2)}×</Label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.05" 
                value={imageScale}
                onChange={(e) => setImageScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label>Image Y Offset: {imageYOffset}px</Label>
              <input 
                type="range" 
                min="-50" 
                max="50" 
                step="1" 
                value={imageYOffset}
                onChange={(e) => setImageYOffset(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label>Font Scale: {fontScale.toFixed(2)}×</Label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.05" 
                value={fontScale}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Text Input */}
            <div>
              <Label htmlFor="prophecy-text">Prophecy Text (use \\n for line breaks)</Label>
              <textarea
                id="prophecy-text"
                value={prophecyText}
                onChange={(e) => setProphecyText(e.target.value)}
                className="w-full h-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                placeholder="Enter your prophecy..."
              />
            </div>

            {/* Advanced Settings */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Advanced Settings
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div>
                  <Label>Custom Font</Label>
                  <Input 
                    type="file" 
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={handleTextureUpload('font')}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Text Texture</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleTextureUpload('text')}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Panel Texture</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleTextureUpload('panel')}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label>Background Texture</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleTextureUpload('bg')}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Download Button */}
            <Button 
              onClick={handleDownload}
              className="w-full"
              size="lg"
            >
              Download Panel
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}