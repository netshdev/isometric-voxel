import type { Voxel, IsometricCoords, VoxelFace } from '../types/voxel';
import { adjustBrightness } from './colors';

/**
 * Isometric projection constants
 */
const ISO_ANGLE = Math.PI / 6; // 30 degrees
const ISO_SCALE = 20; // Scale factor for isometric projection

/**
 * Convert 2D grid coordinates to isometric coordinates
 * @param x - Grid X coordinate
 * @param y - Grid Y coordinate
 * @param z - Height (Z coordinate)
 * @returns Isometric coordinates
 */
export const gridToIsometric = (x: number, y: number, z: number = 0): IsometricCoords => {
    const isoX = (x - y) * Math.cos(ISO_ANGLE) * ISO_SCALE;
    const isoY = (x + y) * Math.sin(ISO_ANGLE) * ISO_SCALE - z * ISO_SCALE;

    return { x: isoX, y: isoY };
};

/**
 * Calculate lighting intensity based on angle and face orientation
 * @param lightingAngle - Global lighting angle in degrees
 * @param faceType - Type of face ('top', 'left', 'right')
 * @returns Brightness adjustment value
 */
export const calculateLighting = (lightingAngle: number, faceType: 'top' | 'left' | 'right'): number => {
    const angleRad = (lightingAngle * Math.PI) / 180;

    switch (faceType) {
        case 'top':
            return 0; // Top face is brightest
        case 'left':
            return -20 + Math.sin(angleRad) * 10;
        case 'right':
            return -30 + Math.cos(angleRad) * 10;
        default:
            return 0;
    }
};

/**
 * Generate SVG path for a single voxel face
 * @param voxel - Voxel data
 * @param faceType - Type of face to render
 * @param lightingAngle - Global lighting angle
 * @returns SVG path and fill color
 */
export const generateVoxelFace = (
    voxel: Voxel,
    faceType: 'top' | 'left' | 'right',
    lightingAngle: number
): VoxelFace => {
    const { x, y, height, color } = voxel;
    const lighting = calculateLighting(lightingAngle, faceType);
    const fill = adjustBrightness(color, lighting);

    let path = '';

    if (faceType === 'top') {
        const p1 = gridToIsometric(x, y, height);
        const p2 = gridToIsometric(x + 1, y, height);
        const p3 = gridToIsometric(x + 1, y + 1, height);
        const p4 = gridToIsometric(x, y + 1, height);

        path = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
    } else if (faceType === 'left') {
        const p1 = gridToIsometric(x, y, height);
        const p2 = gridToIsometric(x, y + 1, height);
        const p3 = gridToIsometric(x, y + 1, 0);
        const p4 = gridToIsometric(x, y, 0);

        path = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
    } else if (faceType === 'right') {
        const p1 = gridToIsometric(x + 1, y, height);
        const p2 = gridToIsometric(x + 1, y + 1, height);
        const p3 = gridToIsometric(x + 1, y + 1, 0);
        const p4 = gridToIsometric(x + 1, y, 0);

        path = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
    }

    return { path, fill };
};

/**
 * Generate complete SVG for all voxels
 * @param voxels - Map of voxels
 * @param lightingAngle - Global lighting angle
 * @returns Complete SVG string
 */
export const generateSceneSVG = (voxels: Map<string, Voxel>, lightingAngle: number): string => {
    if (voxels.size === 0) {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"></svg>';
    }

    // Sort voxels for proper z-ordering (back to front, bottom to top)
    const sortedVoxels = Array.from(voxels.values()).sort((a, b) => {
        const orderA = a.y + a.x * 100;
        const orderB = b.y + b.x * 100;
        return orderA - orderB;
    });

    const faces: string[] = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Generate all faces and calculate bounds
    sortedVoxels.forEach((voxel) => {
        // Calculate all corner points for this voxel to find bounds
        const corners = [
            gridToIsometric(voxel.x, voxel.y, voxel.height),
            gridToIsometric(voxel.x + 1, voxel.y, voxel.height),
            gridToIsometric(voxel.x + 1, voxel.y + 1, voxel.height),
            gridToIsometric(voxel.x, voxel.y + 1, voxel.height),
            gridToIsometric(voxel.x, voxel.y, 0),
            gridToIsometric(voxel.x + 1, voxel.y, 0),
            gridToIsometric(voxel.x + 1, voxel.y + 1, 0),
            gridToIsometric(voxel.x, voxel.y + 1, 0),
        ];

        corners.forEach(corner => {
            minX = Math.min(minX, corner.x);
            minY = Math.min(minY, corner.y);
            maxX = Math.max(maxX, corner.x);
            maxY = Math.max(maxY, corner.y);
        });

        // Right face
        const rightFace = generateVoxelFace(voxel, 'right', lightingAngle);
        faces.push(`<path d="${rightFace.path}" fill="${rightFace.fill}" stroke="#1e293b" stroke-width="0.5"/>`);

        // Left face
        const leftFace = generateVoxelFace(voxel, 'left', lightingAngle);
        faces.push(`<path d="${leftFace.path}" fill="${leftFace.fill}" stroke="#1e293b" stroke-width="0.5"/>`);

        // Top face
        const topFace = generateVoxelFace(voxel, 'top', lightingAngle);
        faces.push(`<path d="${topFace.path}" fill="${topFace.fill}" stroke="#1e293b" stroke-width="0.5"/>`);
    });

    // Calculate viewBox with padding
    const padding = 40;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const viewBoxX = minX - padding;
    const viewBoxY = minY - padding;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxX} ${viewBoxY} ${width} ${height}" preserveAspectRatio="xMidYMid meet">
  <g>
    ${faces.join('\n    ')}
  </g>
</svg>`;
};

/**
 * Optimize SVG string for smaller file size
 * @param svg - SVG string
 * @returns Optimized SVG string
 */
export const optimizeSVG = (svg: string): string => {
    return svg
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
};
