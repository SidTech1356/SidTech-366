import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  ExternalLink,
  RotateCw,
  ShieldCheck,
  Check,
  Copy,
  X,
  Sparkles,
  Lock,
  Layers,
} from 'lucide-react';

interface SandboxDemoPreviewProps {
  demoUrl: string;
  serviceName: string;
  projectId: string;
  clientName?: string;
  isDelivered?: boolean;
}

export const SandboxDemoPreview: React.FC<SandboxDemoPreviewProps> = ({
  demoUrl,
  serviceName,
  projectId,
  clientName,
  isDelivered = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [touchInteractive, setTouchInteractive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Sync with browser native fullscreen if available
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      setTouchInteractive(true);
      try {
        if (fullscreenContainerRef.current?.requestFullscreen) {
          await fullscreenContainerRef.current.requestFullscreen();
        }
      } catch {
        // Fallback to overlay modal works seamlessly
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // ignore
      }
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard?.writeText?.(demoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const getFrameWidthClass = () => {
    if (deviceView === 'mobile') return 'max-w-[375px] h-[667px] shadow-2xl rounded-3xl border-8 border-slate-800';
    if (deviceView === 'tablet') return 'max-w-[768px] h-[900px] shadow-2xl rounded-2xl border-8 border-slate-800';
    return 'w-full h-full';
  };

  return (
    <>
      {/* Inline Preview Card */}
      <div className="border-2 border-blue-200/80 rounded-2xl overflow-hidden bg-slate-900 shadow-md transition hover:border-blue-400">
        {/* Header Bar */}
        <div className="bg-[#12294A] text-white px-3.5 py-2.5 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Monitor className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide">
                  {isDelivered ? 'Delivered Solution Sandbox' : 'Live Demo Sandbox Preview'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Isolated Sandbox
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono block truncate max-w-xs sm:max-w-md">
                {demoUrl}
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Device Switcher (Desktop / Tablet / Mobile) */}
            <div className="hidden md:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-[11px]">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                title="Desktop View"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  deviceView === 'desktop' ? 'bg-[#E86A17] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('tablet')}
                title="Tablet View (768px)"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  deviceView === 'tablet' ? 'bg-[#E86A17] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                title="Mobile View (375px)"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  deviceView === 'mobile' ? 'bg-[#E86A17] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleReload}
              title="Reload sandbox preview"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy URL"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer noopener"
              title="Open raw demo in new tab"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Prominent Full Screen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="px-2.5 py-1.5 bg-[#E86A17] hover:bg-[#d45e12] text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          </div>
        </div>

        {/* Mobile touch hint & interaction shield */}
        <div className="bg-slate-800/95 text-slate-300 px-3 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300">
              {touchInteractive
                ? 'Interactive Touch Active (Swipe inside iframe to test demo)'
                : 'Page Scroll Protected (Swipe freely to scroll page without freeze)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTouchInteractive(!touchInteractive)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
              touchInteractive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {touchInteractive ? 'Lock Page Scroll' : 'Interact with Demo'}
          </button>
        </div>

        {/* Inline Iframe Container */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-950 flex items-center justify-center overflow-hidden p-0 sm:p-2">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-medium text-slate-300">Loading secure sandbox embed...</span>
            </div>
          )}

          {/* Touch Shield Overlay when inactive to prevent mobile freeze */}
          {!touchInteractive && (
            <div
              onClick={() => setTouchInteractive(true)}
              className="absolute inset-0 z-20 bg-transparent cursor-pointer flex items-end justify-center pb-3"
            >
              <div className="bg-[#12294A]/90 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 hover:bg-[#12294A] transition pointer-events-auto">
                <Maximize2 className="w-3 h-3 text-[#E86A17]" />
                <span>Tap to Interact or Open Full Screen</span>
              </div>
            </div>
          )}

          <div className={`transition-all duration-200 bg-white overflow-hidden ${getFrameWidthClass()}`}>
            <iframe
              key={iframeKey}
              src={demoUrl}
              title={`Live sandbox preview for ${serviceName}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0"
              style={{
                pointerEvents: touchInteractive ? 'auto' : 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Modal Viewport Overlay */}
      {isFullscreen && (
        <div
          ref={fullscreenContainerRef}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150"
        >
          {/* Top Control Bar */}
          <div className="bg-[#12294A] text-white px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800 shadow-xl flex-shrink-0 z-20">
            {/* Title & Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#E86A17] flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white truncate">
                    {serviceName} &bull; Full Screen Sandbox
                  </h3>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Demo
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-orange-400 font-mono text-[11px] font-bold">
                    {projectId}
                  </span>
                  {clientName && (
                    <span className="hidden md:inline text-slate-400">
                      &bull; Client: {clientName}
                    </span>
                  )}
                  <span className="truncate text-slate-400 text-[11px] font-mono hidden sm:inline">
                    {demoUrl}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Device Frame Switcher */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  deviceView === 'desktop' ? 'bg-[#E86A17] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('tablet')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  deviceView === 'tablet' ? 'bg-[#E86A17] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tablet (768px)</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  deviceView === 'mobile' ? 'bg-[#E86A17] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Mobile (375px)</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReload}
                title="Reload"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy URL"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <a
                href={demoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Raw</span>
              </a>

              {/* Exit Full Screen */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Full Screen</span>
              </button>
            </div>
          </div>

          {/* Full Screen Main Iframe Container */}
          <div className="flex-1 bg-slate-900/90 p-2 sm:p-4 overflow-auto flex items-center justify-center relative">
            <div
              className={`bg-white transition-all duration-200 overflow-hidden flex flex-col ${
                deviceView === 'desktop'
                  ? 'w-full h-full rounded-xl shadow-2xl border border-slate-700'
                  : deviceView === 'tablet'
                  ? 'w-[768px] h-[95vh] max-h-[1024px] rounded-2xl shadow-2xl border-8 border-slate-800'
                  : 'w-[375px] h-[85vh] max-h-[812px] rounded-3xl shadow-2xl border-8 border-slate-800'
              }`}
            >
              <iframe
                key={iframeKey}
                src={demoUrl}
                title={`Full screen sandbox demo for ${serviceName}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="w-full h-full border-0 flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
