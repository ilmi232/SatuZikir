'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Campaign } from '@/types';
import QRCode from 'qrcode';

interface SyiarCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  personalCount: number;
}

type ThemeMode = 'emerald' | 'parchment' | 'midnight';

export default function SyiarCardModal({
  isOpen,
  onClose,
  campaign,
  personalCount,
}: SyiarCardModalProps) {
  const [theme, setTheme] = useState<ThemeMode>('emerald');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to draw rounded rectangle with cross-browser compatibility
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  };

  // Helper to draw authentic 8-point Islamic star (Rub el Hizb)
  const drawIslamicStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    strokeColor: string
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;

    const r = radius;
    // Square 1
    ctx.strokeRect(-r / 2, -r / 2, r, r);
    // Square 2 rotated 45 deg
    ctx.rotate((45 * Math.PI) / 180);
    ctx.strokeRect(-r / 2, -r / 2, r, r);

    // Center jewel dot
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Text wrap utility for canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: CanvasTextAlign = 'center'
  ): number => {
    ctx.textAlign = align;
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + (line ? ' ' : '') + words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  };

  // Render the entire 1080x1920 poster onto the canvas
  const renderPoster = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);

    // Ensure custom fonts are loaded in browser
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const pct = Math.min(100, Math.round((campaign.current_count / campaign.target_count) * 100));
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://satuzikir.id';
    const shareUrl = `${currentDomain}/campaign/${campaign.slug}`;

    // 1. Color Palettes based on Theme
    let bgGradientColors = ['#01170f', '#002d20', '#033b2b'];
    let borderColor = 'rgba(254, 147, 44, 0.4)';
    let innerBorderColor = 'rgba(255, 255, 255, 0.12)';
    let primaryText = '#ffffff';
    let goldText = '#fe932c';
    let translitText = '#ffdcc3';
    let subText = '#95d3ba';
    let plaqueBg = 'rgba(255, 255, 255, 0.07)';
    let plaqueBorder = 'rgba(254, 147, 44, 0.45)';
    let plaqueBigCount = '#fe932c';
    let barTrack = 'rgba(255, 255, 255, 0.14)';
    let barFillStart = '#31c98f';
    let barFillEnd = '#fe932c';
    let qrDark = '#002d20';

    if (theme === 'parchment') {
      bgGradientColors = ['#faf6ee', '#f3ece0', '#e8ddc9'];
      borderColor = 'rgba(144, 77, 0, 0.45)';
      innerBorderColor = 'rgba(0, 53, 39, 0.15)';
      primaryText = '#003527';
      goldText = '#904d00';
      translitText = '#663500';
      subText = '#404944';
      plaqueBg = 'rgba(255, 255, 255, 0.85)';
      plaqueBorder = 'rgba(144, 77, 0, 0.35)';
      plaqueBigCount = '#904d00';
      barTrack = '#dae2fd';
      barFillStart = '#003527';
      barFillEnd = '#904d00';
      qrDark = '#003527';
    } else if (theme === 'midnight') {
      bgGradientColors = ['#06080b', '#0a1215', '#051b17'];
      borderColor = 'rgba(49, 201, 143, 0.4)';
      innerBorderColor = 'rgba(255, 255, 255, 0.1)';
      primaryText = '#f0fdf4';
      goldText = '#31c98f';
      translitText = '#ffdcc3';
      subText = '#94a3b8';
      plaqueBg = 'rgba(255, 255, 255, 0.05)';
      plaqueBorder = 'rgba(49, 201, 143, 0.4)';
      plaqueBigCount = '#31c98f';
      barTrack = 'rgba(255, 255, 255, 0.12)';
      barFillStart = '#004f34';
      barFillEnd = '#31c98f';
      qrDark = '#06080b';
    }

    // 2. Background Fill with Elegant Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, bgGradientColors[0]);
    bgGrad.addColorStop(0.5, bgGradientColors[1]);
    bgGrad.addColorStop(1, bgGradientColors[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient glow behind top and center
    const radialGlow = ctx.createRadialGradient(540, 500, 50, 540, 500, 600);
    radialGlow.addColorStop(0, theme === 'parchment' ? 'rgba(254, 147, 44, 0.08)' : 'rgba(49, 201, 143, 0.12)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Double Luxury Framing & Corner Accents
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 45, 45, width - 90, height - 90, 32);
    ctx.stroke();

    ctx.strokeStyle = innerBorderColor;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 58, 58, width - 116, height - 116, 24);
    ctx.stroke();

    // 4 Corner 8-point Islamic Stars
    drawIslamicStar(ctx, 80, 80, 24, goldText);
    drawIslamicStar(ctx, width - 80, 80, 24, goldText);
    drawIslamicStar(ctx, 80, height - 80, 24, goldText);
    drawIslamicStar(ctx, width - 80, height - 80, 24, goldText);

    // 4. Header Badge Pill
    const badgeW = 540;
    const badgeH = 56;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 95;

    ctx.fillStyle = theme === 'parchment' ? 'rgba(0, 53, 39, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 28);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 28);
    ctx.stroke();

    ctx.fillStyle = goldText;
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('SATUZIKIR  •  MAJELIS ZIKIR DIGITAL', 540, badgeY + 36);
    ctx.letterSpacing = '0px';

    // Divider Line with Islamic Star Center
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(180, 185);
    ctx.lineTo(500, 185);
    ctx.moveTo(580, 185);
    ctx.lineTo(900, 185);
    ctx.stroke();
    drawIslamicStar(ctx, 540, 185, 20, goldText);

    // 5. Campaign Title
    ctx.fillStyle = goldText;
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UNTAIAN ZIKIR BERSAMA SE-NUSANTARA', 540, 240);

    ctx.fillStyle = primaryText;
    ctx.font = 'bold 44px "EB Garamond", serif';
    wrapText(ctx, campaign.title, 540, 300, 880, 54);

    // 6. Arabic Calligraphy Text (Centerpiece)
    ctx.fillStyle = primaryText;
    const arabicLen = campaign.arabic_text.length;
    let arabicFontSize = 64;
    let arabicLineHeight = 100;

    if (arabicLen > 90) {
      arabicFontSize = 42;
      arabicLineHeight = 72;
    } else if (arabicLen > 50) {
      arabicFontSize = 52;
      arabicLineHeight = 86;
    }

    ctx.font = `bold ${arabicFontSize}px "Amiri", serif`;
    ctx.textAlign = 'center';

    // Add subtle glow to Arabic text
    ctx.shadowColor = theme === 'parchment' ? 'rgba(0,0,0,0.1)' : goldText;
    ctx.shadowBlur = theme === 'parchment' ? 0 : 12;

    const afterArabicY = wrapText(ctx, campaign.arabic_text, 540, 420, 880, arabicLineHeight);
    ctx.shadowBlur = 0; // reset shadow

    // Transliteration
    let nextY = afterArabicY + 10;
    if (campaign.latin_text) {
      ctx.fillStyle = translitText;
      ctx.font = 'italic 25px "EB Garamond", serif';
      nextY = wrapText(ctx, `"${campaign.latin_text}"`, 540, nextY, 860, 36);
    }

    // Translation Snippet
    if (campaign.translation_text) {
      ctx.fillStyle = subText;
      ctx.font = '20px "Plus Jakarta Sans", sans-serif';
      nextY = wrapText(ctx, `Artinya: "${campaign.translation_text}"`, 540, nextY + 6, 840, 30);
    }

    // 7. Grand Personal Contribution Plaque (Frosted Glass Card)
    const plaqueY = Math.max(nextY + 30, 820);
    const plaqueH = 430;
    const plaqueW = 920;
    const plaqueX = (width - plaqueW) / 2;

    // Plaque background & border
    ctx.fillStyle = plaqueBg;
    drawRoundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 36);
    ctx.fill();

    ctx.strokeStyle = plaqueBorder;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 36);
    ctx.stroke();

    // Plaque Header Ribbon
    ctx.fillStyle = goldText;
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('KONTRIBUSI PRIBADI DALAM MAJELIS', 540, plaqueY + 55);
    ctx.letterSpacing = '0px';

    // Big Personal Number
    ctx.fillStyle = plaqueBigCount;
    ctx.font = 'bold 78px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${personalCount.toLocaleString('id-ID')} BUTIR`, 540, plaqueY + 145);

    // Contribution Affirmation Statement
    ctx.fillStyle = primaryText;
    ctx.font = '500 24px "EB Garamond", serif';
    const impactText = `Alhamdulillah, telah menggenapkan ${personalCount.toLocaleString(
      'id-ID'
    )} butir zikir ${campaign.title} bersama majelis SatuZikir.`;
    wrapText(ctx, impactText, 540, plaqueY + 205, 820, 34);

    // Global Majelis Progress Bar inside plaque
    const barW = 800;
    const barH = 22;
    const barX = (width - barW) / 2;
    const barY = plaqueY + 295;

    // Track
    ctx.fillStyle = barTrack;
    drawRoundedRect(ctx, barX, barY, barW, barH, 11);
    ctx.fill();

    // Fill
    const fillWidth = Math.max(22, (pct / 100) * barW);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + fillWidth, 0);
    barGrad.addColorStop(0, barFillStart);
    barGrad.addColorStop(1, barFillEnd);
    ctx.fillStyle = barGrad;
    drawRoundedRect(ctx, barX, barY, fillWidth, barH, 11);
    ctx.fill();

    // Progress statistics text
    ctx.fillStyle = subText;
    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Target Majelis: ${pct}% Tercapai`, barX, barY + 52);

    ctx.textAlign = 'right';
    ctx.fillText(
      `${campaign.current_count.toLocaleString('id-ID')} / ${campaign.target_count.toLocaleString('id-ID')}`,
      barX + barW,
      barY + 52
    );

    // 8. QR Code Section (for instant joining via WhatsApp/IG Story)
    const qrSectionY = plaqueY + plaqueH + 45;

    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        margin: 1,
        width: 260,
        color: {
          dark: qrDark,
          light: '#ffffff',
        },
      });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
      });

      // QR Code Card Container
      const qrBoxSize = 250;
      const qrBoxX = 110;
      const qrBoxY = qrSectionY;

      ctx.fillStyle = '#ffffff';
      drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
      ctx.stroke();

      // Draw QR Image centered inside white box
      ctx.drawImage(qrImg, qrBoxX + 15, qrBoxY + 15, 220, 220);

      // Text Call-to-Action beside QR Code
      const ctaX = 400;
      ctx.textAlign = 'left';

      ctx.fillStyle = goldText;
      ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Pindai untuk Ikut Berzikir', ctaX, qrBoxY + 65);

      ctx.fillStyle = primaryText;
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      const ctaDesc = 'Buka kamera ponsel Anda atau pindai barcode ini untuk menyumbang untaian butir zikir bersama ribuan jamaah.';
      wrapText(ctx, ctaDesc, ctaX, qrBoxY + 115, 560, 32, 'left');

      ctx.fillStyle = goldText;
      ctx.font = 'bold 22px monospace';
      ctx.fillText(shareUrl.replace('https://', ''), ctaX, qrBoxY + 225);
    } catch (e) {
      console.error('Failed to generate QR Code for canvas:', e);
    }

    // 9. Discreet Watermark & Islamic Signature Footer
    const footerY = height - 100;
    ctx.fillStyle = subText;
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Satu Niat, Beribu Ketukan Tasbih Bersama Jamaah Se-Nusantara', 540, footerY);

    ctx.fillStyle = goldText;
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('SATUZIKIR.ID', 540, footerY + 28);
    ctx.letterSpacing = '0px';

    setIsGenerating(false);
  }, [campaign, personalCount, theme]);

  // Trigger render when modal opens or theme changes
  useEffect(() => {
    if (isOpen) {
      renderPoster();
    }
  }, [isOpen, theme, renderPoster]);

  // Native share to WhatsApp / Instagram Story via Web Share API
  const handleShareStory = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSharing(true);

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }

        const fileName = `satuzikir-syiar-${campaign.slug}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://satuzikir.id';
        const shareUrl = `${currentDomain}/campaign/${campaign.slug}`;
        const title = `Kartu Syiar Zikir: ${campaign.title}`;
        const text = `Alhamdulillah, telah menggenapkan ${personalCount.toLocaleString(
          'id-ID'
        )} butir ${campaign.title} bersama jamaah SatuZikir. Mari ikut menggenapkan di ${shareUrl}`;

        // Try Native Share API with image file
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title,
              text,
            });
            showToast('Kartu syiar berhasil dibagikan! 🤲');
            setIsSharing(false);
            return;
          } catch (err: unknown) {
            if ((err as Error)?.name === 'AbortError') {
              setIsSharing(false);
              return;
            }
          }
        }

        // Fallback: Download file and open WhatsApp with invitation text
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${text}\n\nLink Majelis: ${shareUrl}`
        )}`;
        window.open(waUrl, '_blank');
        showToast('Gambar HD diunduh & WhatsApp terbuka! 🤲');
        setIsSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      setIsSharing(false);
    }
  };

  // Direct HD Download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `satuzikir-story-${campaign.slug}-${personalCount}x.png`;
    a.click();
    showToast('Gambar HD 9:16 berhasil diunduh! 📥');
  };

  // Copy link
  const handleCopyLink = async () => {
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://satuzikir.id';
    const shareUrl = `${currentDomain}/campaign/${campaign.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Tautan majelis berhasil disalin! 📋');
    } catch {
      showToast('Gagal menyalin tautan');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] max-h-[92vh] bg-white dark:bg-[#0f1a10] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-emerald-900/40">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-black/5 dark:border-white/5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-[#904d00] dark:text-[#ffb77d]">
                photo_camera
              </span>
              <h3 className="font-headline text-base font-bold text-[#003527] dark:text-[#e8f5e9]">
                Kartu Syiar Story
              </h3>
            </div>
            <p className="text-[11px] text-[#404944] dark:text-[#a5c7ab]">
              Format 9:16 untuk Status WhatsApp & Instagram
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-[#eaedff] dark:bg-white/10 flex items-center justify-center text-[#404944] dark:text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Theme Selector Pills */}
        <div className="px-5 pt-2.5 pb-1 flex items-center justify-center gap-2">
          <button
            onClick={() => setTheme('emerald')}
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              theme === 'emerald'
                ? 'bg-[#003527] text-white shadow-sm ring-1 ring-[#fe932c]'
                : 'bg-[#eaedff] dark:bg-white/5 text-[#404944] dark:text-[#a5c7ab] hover:bg-[#dae2fd]'
            }`}
          >
            Zamrud Malam
          </button>

          <button
            onClick={() => setTheme('parchment')}
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              theme === 'parchment'
                ? 'bg-[#904d00] text-white shadow-sm ring-1 ring-amber-300'
                : 'bg-[#eaedff] dark:bg-white/5 text-[#404944] dark:text-[#a5c7ab] hover:bg-[#dae2fd]'
            }`}
          >
            Gading Emas
          </button>

          <button
            onClick={() => setTheme('midnight')}
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              theme === 'midnight'
                ? 'bg-[#06080b] text-[#31c98f] shadow-sm ring-1 ring-[#31c98f]'
                : 'bg-[#eaedff] dark:bg-white/5 text-[#404944] dark:text-[#a5c7ab] hover:bg-[#dae2fd]'
            }`}
          >
            Hitam Beludru
          </button>
        </div>

        {/* Poster Canvas Preview Area */}
        <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col items-center justify-center min-h-[340px]">
          <div className="relative w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex items-center justify-center bg-black">
            {isGenerating && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 z-10 text-white text-xs font-medium">
                <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                <span>Menggambar kaligrafi...</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ display: 'block' }}
            />
          </div>
          <span className="text-[10px] text-[#404944] dark:text-[#a5c7ab] mt-2">
            Resolusi Tinggi HD (1080 x 1920)
          </span>
        </div>

        {/* Action Controls */}
        <div className="px-5 pb-5 pt-2 flex flex-col gap-2 bg-gradient-to-t from-white via-white to-transparent dark:from-[#0f1a10] dark:via-[#0f1a10]">
          <button
            onClick={handleShareStory}
            disabled={isSharing || isGenerating}
            type="button"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#003527] to-[#064e3b] dark:from-[#31c98f] dark:to-[#004f34] text-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>{isSharing ? 'Menyiapkan...' : 'Bagikan ke WhatsApp & IG Story'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              type="button"
              className="h-10 rounded-xl bg-[#eaedff] dark:bg-white/10 text-[#003527] dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#dae2fd] transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span>Unduh Gambar HD</span>
            </button>

            <button
              onClick={handleCopyLink}
              type="button"
              className="h-10 rounded-xl bg-white dark:bg-white/5 border border-[#eaedff] dark:border-white/10 text-[#003527] dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#eaedff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">link</span>
              <span>Salin Link</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#131b2e] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in duration-150">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
