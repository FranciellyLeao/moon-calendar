import React, { useRef, useState } from 'react';
import type { AstronomyData, UserSettings } from '../types';
import {
  X,
  Download,
  Copy,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  astroData: AstronomyData;
  settings: UserSettings;
  dailyAffirmation?: { text: string; theme: string };
}

const PHASE_NAMES_PT: Record<string, string> = {
  'New Moon': 'Lua Nova',
  'Waxing Crescent': 'Lua Crescente',
  'First Quarter': 'Quarto Crescente',
  'Waxing Gibbous': 'Gibosa Crescente',
  'Full Moon': 'Lua Cheia',
  'Waning Gibbous': 'Gibosa Minguante',
  'Last Quarter': 'Quarto Minguante',
  'Waning Crescent': 'Lua Minguante',
};

const MOON_EMOJIS: Record<string, string> = {
  new: '🌑',
  waxing_crescent: '🌒',
  first_quarter: '🌓',
  waxing_gibbous: '🌔',
  full: '🌕',
  waning_gibbous: '🌖',
  last_quarter: '🌗',
  waning_crescent: '🌘',
};

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  astroData,
  settings,
  dailyAffirmation,
}) => {
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const affirmationText = dailyAffirmation?.text || 'Confio nos ritmos naturais do universo e na sabedoria da minha própria intuição.';
  const affirmationTheme = dailyAffirmation?.theme || 'Intuição & Alinhamento';

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const phasePt = PHASE_NAMES_PT[astroData.phaseName] || astroData.phaseName;
  const moonEmoji = MOON_EMOJIS[astroData.phaseCode] || '🌙';

  // Draw 1080x1920 high-res image on HTML5 canvas
  const renderCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    // 1. Background: Deep obsidian gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#09090d');
    bgGrad.addColorStop(0.5, '#0e0e14');
    bgGrad.addColorStop(1, '#060608');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Subtle ambient celestial glows
    const radialGold = ctx.createRadialGradient(540, 500, 50, 540, 500, 600);
    radialGold.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
    radialGold.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGold;
    ctx.fillRect(0, 0, 1080, 1920);

    // 3. Hairline Frame Border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, 960, 1800);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(76, 76, 928, 1768);

    // 4. Header Brand
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillText('MOON CALENDAR • DIÁRIO LUNAR', 540, 150);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '26px -apple-system, sans-serif';
    ctx.fillText(dateFormatted.toUpperCase(), 540, 200);

    // 5. Moon Phase Centerpiece Disc
    const moonCenterX = 540;
    const moonCenterY = 540;
    const moonRadius = 200;

    // Outer glow
    ctx.beginPath();
    ctx.arc(moonCenterX, moonCenterY, moonRadius + 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Disc fill
    const moonGrad = ctx.createRadialGradient(
      moonCenterX - 50,
      moonCenterY - 50,
      20,
      moonCenterX,
      moonCenterY,
      moonRadius
    );
    moonGrad.addColorStop(0, '#fffcf0');
    moonGrad.addColorStop(0.4, '#d8bc6f');
    moonGrad.addColorStop(0.85, '#282317');
    moonGrad.addColorStop(1, '#0a0a0d');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonCenterX, moonCenterY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Emoji icon in center
    ctx.font = '140px -apple-system, sans-serif';
    ctx.fillText(moonEmoji, moonCenterX, moonCenterY + 45);

    // Illumination pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(moonCenterX - 140, moonCenterY + 160, 280, 56);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.strokeRect(moonCenterX - 140, moonCenterY + 160, 280, 56);

    ctx.fillStyle = '#fbe396';
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.fillText(`${astroData.illumination}% ILUMINADA`, moonCenterX, moonCenterY + 196);

    // 6. Phase Title & Zodiac
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px -apple-system, sans-serif';
    ctx.fillText(phasePt, 540, 840);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 36px -apple-system, sans-serif';
    ctx.fillText(
      `${astroData.zodiacSymbol} Lua em ${astroData.zodiacSign}`,
      540,
      900
    );

    // 7. Divider
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.beginPath();
    ctx.moveTo(200, 960);
    ctx.lineTo(880, 960);
    ctx.stroke();

    // 8. Key Cosmic Metrics
    const metricsY = 1040;
    const col1 = 300;
    const col2 = 780;

    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('NASCER DA LUA', col1, metricsY);
    ctx.fillText('DISTÂNCIA LUNAR', col2, metricsY);

    ctx.font = 'bold 38px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(astroData.moonrise || '--:--', col1, metricsY + 50);
    ctx.fillText(`${astroData.distanceKm.toLocaleString()} km`, col2, metricsY + 50);

    // Helper to wrap text into lines on canvas
    const wrapCanvasText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = ctx.measureText(testLine).width;
        if (width < maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    // 9. Daily Affirmation Box
    const boxY = 1180;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(140, boxY, 800, 280);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(140, boxY, 800, 280);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 26px -apple-system, sans-serif';
    ctx.fillText(`✦ INTENÇÃO: ${affirmationTheme.toUpperCase()}`, 540, boxY + 60);

    ctx.fillStyle = '#f4f1ea';
    ctx.font = 'italic 28px -apple-system, sans-serif';
    const wrappedLines = wrapCanvasText(`"${affirmationText}"`, 720);
    const startTextY = boxY + (wrappedLines.length === 1 ? 140 : 120);
    wrappedLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, 540, startTextY + i * 42);
    });

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '22px -apple-system, sans-serif';
    ctx.fillText(
      `Local: ${settings.location.name} • Idade Lunar: ${astroData.lunarAge} dias`,
      540,
      boxY + 245
    );

    // 10. Footer Watermark
    ctx.fillStyle = '#71717a';
    ctx.font = '24px -apple-system, sans-serif';
    ctx.fillText('Sincronize-se com as estrelas • @mooncalendar', 540, 1780);

    return canvas;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = await renderCanvas();
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `diario-lunar-story-${now.toISOString().split('T')[0]}.png`;
      a.click();
      setCopiedStatus('✅ Imagem salva em PNG!');
      setTimeout(() => setCopiedStatus(null), 3000);
    } catch {
      setCopiedStatus('❌ Erro ao baixar imagem.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = await renderCanvas();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Não foi possível gerar a imagem binária.');

      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.write === 'function') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedStatus('✅ Imagem copiada para a Área de Transferência!');
          setTimeout(() => setCopiedStatus(null), 3000);
          return;
        } catch {
          // Clipboard write failed (e.g. permission or format issue), fallback to download
          await handleDownload();
          return;
        }
      } else {
        // Fallback for browsers without ClipboardItem image support
        await handleDownload();
      }
    } catch {
      await handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🌙 *Alinhamento Lunar do Dia — ${dateFormatted}*\n\n` +
      `✨ Fase: ${phasePt} (${astroData.illumination}% Iluminada)\n` +
      `🪐 Lua em: ${astroData.zodiacSymbol} ${astroData.zodiacSign}\n` +
      `🔮 Nascer da Lua: ${astroData.moonrise} | Idade: ${astroData.lunarAge} dias\n\n` +
      `"${affirmationText}"\n\n` +
      `Sincronize sua energia com o Moon Calendar 🌌`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Hidden canvas for high-resolution render */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-[#121217] rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 border border-white/10 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Share2 className="w-4 h-4 text-amber-300" />
            <h2>Compartilhar Alinhamento Diário</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Story Visual Preview */}
        <div className="flex justify-center">
          <div className="w-64 aspect-[9/16] rounded-2xl bg-gradient-to-b from-[#101017] via-[#09090d] to-[#040406] border border-amber-400/30 p-4 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden select-none">
            {/* Ambient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

            {/* Top Info */}
            <div className="space-y-0.5 relative z-10">
              <span className="text-[8px] font-mono tracking-widest text-amber-300 uppercase block">
                MOON CALENDAR
              </span>
              <span className="text-[10px] text-neutral-300 capitalize font-medium block">
                {dateFormatted}
              </span>
            </div>

            {/* Moon Center */}
            <div className="flex flex-col items-center justify-center relative z-10 my-2">
              <div className="w-24 h-24 rounded-full border border-amber-400/30 flex items-center justify-center bg-black/60 shadow-lg text-4xl">
                {moonEmoji}
              </div>
              <span className="mt-2 text-xs font-bold text-white block">
                {phasePt}
              </span>
              <span className="text-[10px] text-amber-200/90 font-medium">
                {astroData.zodiacSymbol} Lua em {astroData.zodiacSign}
              </span>
              <span className="text-[9px] text-neutral-400 font-mono mt-0.5">
                {astroData.illumination}% Iluminada
              </span>
            </div>

            {/* Affirmation snippet */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 relative z-10 text-[9px] italic text-neutral-200 leading-tight">
              "{affirmationText}"
            </div>

            {/* Footer */}
            <div className="text-[8px] text-neutral-400 font-mono relative z-10">
              {settings.location.name} • 9:16 Story
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Story (.PNG)</span>
            </button>

            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Imagem</span>
            </button>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold text-xs border border-emerald-500/40 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compartilhar Texto no WhatsApp</span>
          </button>

          {copiedStatus && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-center font-medium text-amber-200 bg-amber-400/10 p-2 rounded-xl border border-amber-400/20"
            >
              {copiedStatus}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
