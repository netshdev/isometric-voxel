/**
 * Represents a single voxel block in the grid
 */
export interface Voxel {
    x: number;
    y: number;
    height: number;
    color: string;
}

/**
 * Grid position coordinates
 */
export interface GridPosition {
    x: number;
    y: number;
}

/**
 * Complete grid state
 */
export interface GridState {
    voxels: Map<string, Voxel>;
    selectedColor: string;
    blockHeight: number;
    lightingAngle: number;
}

/**
 * Color palette item
 */
export interface ColorOption {
    name: string;
    hex: string;
    contrast: string;
}

/**
 * Isometric coordinates for rendering
 */
export interface IsometricCoords {
    x: number;
    y: number;
}

/**
 * SVG path data for a voxel face
 */
export interface VoxelFace {
    path: string;
    fill: string;
}

/**
 * History state for undo/redo
 */
export interface HistoryState {
    voxels: Map<string, Voxel>;
    timestamp: number;
}
