import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { compressImageToTargetKB, CompressionResult } from '../../utils/imageCompressor';

interface ImageUploadCompressorProps {
  label: string;
  initialImageUrl?: string;
  onImageReady: (dataUrl: string, result: CompressionResult) => void;
  targetMaxKB?: number;
  required?: boolean;
  aspectDesc?: string;
}

export const ImageUploadCompressor: React.FC<ImageUploadCompressorProps> = ({
  label,
  initialImageUrl,
  onImageReady,
  targetMaxKB = 50,
  required = false,
  aspectDesc = 'Passport or square photo recommended',
}) => {
  const [preview, setPreview] = useState<string>(initialImageUrl || '');
  const [compressing, setCompressing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    setError(null);
    setCompressing(true);
    try {
      const result = await compressImageToTargetKB(file, targetMaxKB);
      setPreview(result.dataUrl);
      setCompressionResult(result);
      onImageReady(result.dataUrl, result);
    } catch (err: unknown) {
      console.error('Image compression failed:', err);
      setError('Failed to compress image. Please try another image.');
    } finally {
      setCompressing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-[11px] font-medium text-[#E86A17] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
          Auto-compressed ≤ {targetMaxKB}KB
        </span>
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[110px] ${
          preview
            ? 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40'
            : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-[#E86A17]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileInputChange}
        />
        {compressing ? (
          <div className="flex flex-col items-center gap-2 py-3 text-slate-600">
            <RefreshCw className="w-6 h-6 animate-spin text-[#E86A17]" />
            <span className="text-xs font-medium">Optimizing & compressing image (target ≤ 50KB)...</span>
          </div>
        ) : preview ? (
          <div className="flex items-center gap-3 w-full">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-white flex-shrink-0">
              <img src={preview} alt="Thumbnail preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Ready & Validated (≤ {targetMaxKB}KB)</span>
              </div>
              {compressionResult ? (
                <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                  <div className="font-mono">
                    <span className="text-slate-400 line-through mr-1">
                      {compressionResult.originalSizeKB} KB
                    </span>
                    <strong className="text-emerald-700 font-bold">
                      {compressionResult.compressedSizeKB} KB
                    </strong>{' '}
                    <span className="text-[#E86A17] font-semibold">
                      ({compressionResult.reductionPercent}% smaller)
                    </span>
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Dimensions: {compressionResult.width} × {compressionResult.height}px (JPG)
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 mt-0.5">Image loaded. Click to replace.</p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="text-xs font-medium text-[#12294A] bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg shadow-xs"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-500 py-1">
            <div className="w-10 h-10 rounded-full bg-orange-100/60 text-[#E86A17] flex items-center justify-center mb-1">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Click or drag image to upload
            </p>
            <p className="text-[11px] text-slate-400">{aspectDesc}</p>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
