import React, { useCallback, useState } from 'react';
import type { Voxel } from '../types/voxel';
import { generateSceneSVG, optimizeSVG } from '../utils/isometric';
import { downloadSVG, addSVGMetadata } from '../utils/svg';

interface ExportButtonProps {
    voxels: Map<string, Voxel>;
    lightingAngle: number;
}

type ExportFormat = 'svg' | 'png' | 'jpg';

/**
 * Export button component for downloading in multiple formats
 * @param props - Component props
 * @returns ExportButton component
 */
const ExportButton: React.FC<ExportButtonProps> = ({ voxels, lightingAngle }) => {
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [exportSuccess, setExportSuccess] = useState<boolean>(false);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('svg');

    const convertSVGToImage = useCallback((svgString: string, format: 'png' | 'jpg'): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Set high resolution for export (3000x3000 pixels)
            const exportSize = 3000;
            canvas.width = exportSize;
            canvas.height = exportSize;

            img.onload = () => {
                // Fill white background for JPG
                if (format === 'jpg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Draw image scaled to canvas size
                ctx.drawImage(img, 0, 0, exportSize, exportSize);

                // Convert to data URL
                const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                const quality = format === 'jpg' ? 0.95 : undefined;
                const dataUrl = canvas.toDataURL(mimeType, quality);
                resolve(dataUrl);
            };

            img.onerror = () => {
                reject(new Error('Failed to load SVG image'));
            };

            // Create blob URL from SVG string
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            img.src = url;
        });
    }, []);

    const downloadFile = useCallback((dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const handleExport = useCallback(async (format: ExportFormat) => {
        if (voxels.size === 0) {
            return;
        }

        setIsExporting(true);

        try {
            // Generate SVG
            const svg = generateSceneSVG(voxels, lightingAngle);
            const optimizedSVG = optimizeSVG(svg);
            const finalSVG = addSVGMetadata(optimizedSVG);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

            if (format === 'svg') {
                // Download SVG directly
                const filename = `isometric-voxel-${timestamp}.svg`;
                downloadSVG(finalSVG, filename);
            } else {
                // Convert to PNG or JPG
                const dataUrl = await convertSVGToImage(finalSVG, format);
                const filename = `isometric-voxel-${timestamp}.${format}`;
                downloadFile(dataUrl, filename);
            }

            // Show success feedback
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 2000);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    }, [voxels, lightingAngle, convertSVGToImage, downloadFile]);

    const hasVoxels = voxels.size > 0;

    return (
        <div className="relative w-full">
            {/* Format Selection Buttons */}
            <div className="mb-3 flex gap-2">
                <button
                    onClick={() => setSelectedFormat('svg')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedFormat === 'svg'
                        ? 'bg-electric-blue text-white'
                        : 'bg-secondary-bg text-text-secondary hover:bg-slate-700'
                        }`}
                    aria-label="Export as SVG"
                >
                    SVG
                </button>
                <button
                    onClick={() => setSelectedFormat('png')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedFormat === 'png'
                        ? 'bg-electric-blue text-white'
                        : 'bg-secondary-bg text-text-secondary hover:bg-slate-700'
                        }`}
                    aria-label="Export as PNG"
                >
                    PNG
                </button>
                <button
                    onClick={() => setSelectedFormat('jpg')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedFormat === 'jpg'
                        ? 'bg-electric-blue text-white'
                        : 'bg-secondary-bg text-text-secondary hover:bg-slate-700'
                        }`}
                    aria-label="Export as JPG"
                >
                    JPG
                </button>
            </div>

            {/* Download Button */}
            <button
                onClick={() => handleExport(selectedFormat)}
                disabled={!hasVoxels || isExporting}
                className={`
                    btn-primary w-full text-lg font-bold
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${exportSuccess ? 'bg-matrix-green hover:bg-matrix-green' : ''}
                `}
                aria-label={hasVoxels ? `Download ${selectedFormat.toUpperCase()} file` : 'Add voxels to enable download'}
                title={`Download as ${selectedFormat.toUpperCase()}`}
            >
                {isExporting ? (
                    <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Generating...
                    </>
                ) : exportSuccess ? (
                    <>
                        <span className="mr-2">✓</span>
                        Downloaded!
                    </>
                ) : (
                    <>
                        <span className="mr-2">⬇️</span>
                        Download {selectedFormat.toUpperCase()}
                    </>
                )}
            </button>

            {/* Format Info */}
            <p className="mt-2 text-xs text-text-secondary text-center opacity-75">
                {selectedFormat === 'svg' && 'Vector format - scalable, editable'}
                {selectedFormat === 'png' && 'Raster format - transparent background'}
                {selectedFormat === 'jpg' && 'Raster format - smaller file size'}
            </p>
        </div>
    );
};

export default ExportButton;
