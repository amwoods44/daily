'use client';

import { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { VaultAttachment } from '@/lib/vault';

interface AttachmentViewerProps {
  attachments: VaultAttachment[];
  initialIndex?: number;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf') return FileText;
  return File;
}

export function AttachmentViewer({
  attachments,
  initialIndex = 0,
  onClose,
}: AttachmentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const attachment = attachments[currentIndex];
  const isImage = attachment.type.startsWith('image/');
  const isPdf = attachment.type === 'application/pdf';

  const handlePrev = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : attachments.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i < attachments.length - 1 ? i + 1 : 0));
    setZoom(1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.name;
    link.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">{attachment.name}</span>
          <span className="text-white/60 text-sm">{formatFileSize(attachment.size)}</span>
        </div>
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-sm w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={handleDownload}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
        {isImage ? (
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="max-h-full max-w-full object-contain transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        ) : isPdf ? (
          <iframe
            src={attachment.dataUrl}
            className="w-full h-full bg-white rounded-lg"
            title={attachment.name}
          />
        ) : (
          <div className="text-center">
            <File className="w-24 h-24 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 mb-2">{attachment.name}</p>
            <p className="text-white/60 text-sm mb-4">{formatFileSize(attachment.size)}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-muted)] transition-colors"
            >
              Download File
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {attachments.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Pagination dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {attachments.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setZoom(1);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Thumbnail grid for item detail view
interface AttachmentGridProps {
  attachments: VaultAttachment[];
}

export function AttachmentGrid({ attachments }: AttachmentGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  if (attachments.length === 0) {
    return null;
  }

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {attachments.map((attachment, index) => {
          const isImage = attachment.type.startsWith('image/');
          const Icon = getFileIcon(attachment.type);

          return (
            <button
              key={attachment.id}
              onClick={() => openViewer(index)}
              className="aspect-square rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] overflow-hidden hover:border-[var(--border-default)] transition-colors"
            >
              {isImage ? (
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <Icon className="w-8 h-8 text-[var(--text-tertiary)] mb-1" />
                  <span className="text-xs text-[var(--text-tertiary)] truncate max-w-full">
                    {attachment.name}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {viewerOpen && (
        <AttachmentViewer
          attachments={attachments}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
