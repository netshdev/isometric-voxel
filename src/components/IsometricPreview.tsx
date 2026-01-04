import React, { useMemo } from 'react';
import type { Voxel } from '../types/voxel';
import { generateSceneSVG } from '../utils/isometric';

interface IsometricPreviewProps {
    voxels: Map<string, Voxel>;
    lightingAngle: number;
}

/**
 * Real-time isometric SVG preview component
 * @param props - Component props
 * @returns IsometricPreview component
 */
const IsometricPreview: React.FC<IsometricPreviewProps> = ({ voxels, lightingAngle }) => {
    // Convert Map to array for proper dependency tracking
    const voxelArray = useMemo(() => Array.from(voxels.values()), [voxels]);

    const svgContent = useMemo(() => {
        return generateSceneSVG(voxels, lightingAngle);
    }, [voxels, lightingAngle, voxelArray.length]);

    const hasVoxels = voxels.size > 0;

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold mb-3 text-text-secondary">
                Isometric Preview
            </label>
            <div
                className="bg-secondary-bg p-2 rounded-lg border-2 border-border-color overflow-hidden"
                style={{
                    aspectRatio: '1 / 1',
                }}
                role="img"
                aria-label={hasVoxels ? `Isometric preview showing ${voxels.size} voxel blocks` : 'Empty isometric preview'}
            >
                {hasVoxels ? (
                    <div
                        className="w-full h-full animate-fade-in"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-center text-text-secondary">
                        <div>
                            <div className="text-6xl sm:text-7xl md:text-8xl mb-4 opacity-30">
                                📦
                            </div>
                            <p className="text-sm">Click on the grid to start building</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IsometricPreview;
