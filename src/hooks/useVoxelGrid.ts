import { useState, useCallback } from 'react';
import type { Voxel, HistoryState } from '../types/voxel';
import { TECH_COLORS } from '../utils/colors';

const MAX_HISTORY = 50;

/**
 * Custom hook for managing voxel grid state
 * @returns Grid state and manipulation functions
 */
export const useVoxelGrid = () => {
    const [voxels, setVoxels] = useState<Map<string, Voxel>>(new Map());
    const [selectedColor, setSelectedColor] = useState<string>(TECH_COLORS[0].hex);
    const [blockHeight, setBlockHeight] = useState<number>(1);
    const [lightingAngle, setLightingAngle] = useState<number>(45);
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    /**
     * Generate key for voxel position
     */
    const getKey = useCallback((x: number, y: number): string => {
        return `${x},${y}`;
    }, []);

    /**
     * Save current state to history
     */
    const saveToHistory = useCallback((newVoxels: Map<string, Voxel>) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
            voxels: new Map(newVoxels),
            timestamp: Date.now(),
        });

        // Limit history size
        if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
        } else {
            setHistoryIndex((prev) => prev + 1);
        }

        setHistory(newHistory);
    }, [history, historyIndex]);

    /**
     * Add or update voxel at position
     */
    const addVoxel = useCallback(
        (x: number, y: number) => {
            const key = getKey(x, y);
            const newVoxels = new Map(voxels);

            const existingVoxel = newVoxels.get(key);
            if (existingVoxel && existingVoxel.color === selectedColor) {
                // Same color, just update height
                newVoxels.set(key, {
                    ...existingVoxel,
                    height: blockHeight,
                });
            } else {
                // New voxel or different color
                newVoxels.set(key, {
                    x,
                    y,
                    height: blockHeight,
                    color: selectedColor,
                });
            }

            setVoxels(newVoxels);
            saveToHistory(newVoxels);
        },
        [voxels, selectedColor, blockHeight, getKey, saveToHistory]
    );

    /**
     * Remove voxel at position
     */
    const removeVoxel = useCallback(
        (x: number, y: number) => {
            const key = getKey(x, y);
            const newVoxels = new Map(voxels);

            if (newVoxels.has(key)) {
                newVoxels.delete(key);
                setVoxels(newVoxels);
                saveToHistory(newVoxels);
            }
        },
        [voxels, getKey, saveToHistory]
    );

    /**
     * Clear all voxels
     */
    const clearGrid = useCallback(() => {
        const newVoxels = new Map<string, Voxel>();
        setVoxels(newVoxels);
        saveToHistory(newVoxels);
    }, [saveToHistory]);

    /**
     * Undo last action
     */
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setVoxels(new Map(history[newIndex].voxels));
        }
    }, [history, historyIndex]);

    /**
     * Redo last undone action
     */
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setVoxels(new Map(history[newIndex].voxels));
        }
    }, [history, historyIndex]);

    /**
     * Check if voxel exists at position
     */
    const hasVoxel = useCallback(
        (x: number, y: number): boolean => {
            return voxels.has(getKey(x, y));
        },
        [voxels, getKey]
    );

    /**
     * Get voxel at position
     */
    const getVoxel = useCallback(
        (x: number, y: number): Voxel | undefined => {
            return voxels.get(getKey(x, y));
        },
        [voxels, getKey]
    );

    return {
        voxels,
        selectedColor,
        blockHeight,
        lightingAngle,
        setSelectedColor,
        setBlockHeight,
        setLightingAngle,
        addVoxel,
        removeVoxel,
        clearGrid,
        undo,
        redo,
        hasVoxel,
        getVoxel,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
    };
};
