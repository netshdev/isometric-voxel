import React, { useEffect, useCallback } from 'react';
import { useVoxelGrid } from './hooks/useVoxelGrid';
import Grid from './components/Grid';
import ColorPicker from './components/ColorPicker';
import Controls from './components/Controls';
import IsometricPreview from './components/IsometricPreview';
import ExportButton from './components/ExportButton';

/**
 * Main application component
 * @returns App component
 */
const App: React.FC = () => {
    const {
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
        canUndo,
        canRedo,
    } = useVoxelGrid();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Undo/Redo
            if (event.ctrlKey || event.metaKey) {
                if (event.key === 'z' && !event.shiftKey) {
                    event.preventDefault();
                    undo();
                } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
                    event.preventDefault();
                    redo();
                }
            }

            // Height adjustment
            if (event.key === 'h' || event.key === 'H') {
                event.preventDefault();
                if (event.shiftKey) {
                    setBlockHeight((prev) => Math.max(1, prev - 1));
                } else {
                    setBlockHeight((prev) => Math.min(10, prev + 1));
                }
            }

            // Lighting adjustment
            if (event.key === 'l' || event.key === 'L') {
                event.preventDefault();
                if (event.shiftKey) {
                    setLightingAngle((prev) => (prev - 15 + 360) % 360);
                } else {
                    setLightingAngle((prev) => (prev + 15) % 360);
                }
            }

            // Color selection (1-6)
            const num = parseInt(event.key);
            if (num >= 1 && num <= 6) {
                event.preventDefault();
                const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#14B8A6', '#475569'];
                setSelectedColor(colors[num - 1]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, setBlockHeight, setLightingAngle, setSelectedColor]);

    const getVoxelColor = useCallback(
        (x: number, y: number): string | undefined => {
            return getVoxel(x, y)?.color;
        },
        [getVoxel]
    );

    return (
        <div className="min-h-screen bg-primary-bg text-text-primary">
            {/* Header */}
            <header className="border-b border-border-color bg-secondary-bg">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-text-primary">
                        Isometric Voxel Builder
                    </h1>
                    <p className="text-center text-text-secondary mt-2 text-sm md:text-base">
                        Create 3D isometric illustrations
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 md:py-8">
                {/* Mobile/Tablet Layout (< 1024px) */}
                <div className="lg:hidden space-y-4 md:space-y-6">
                    <Grid
                        onCellClick={addVoxel}
                        onCellRightClick={removeVoxel}
                        hasVoxel={hasVoxel}
                        getVoxelColor={getVoxelColor}
                    />

                    <ColorPicker selectedColor={selectedColor} onColorSelect={setSelectedColor} />

                    <Controls
                        blockHeight={blockHeight}
                        lightingAngle={lightingAngle}
                        onBlockHeightChange={setBlockHeight}
                        onLightingAngleChange={setLightingAngle}
                        onClear={clearGrid}
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />

                    <IsometricPreview voxels={voxels} lightingAngle={lightingAngle} />

                    <ExportButton voxels={voxels} lightingAngle={lightingAngle} />
                </div>

                {/* Desktop Layout (>= 1024px) */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Controls */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-effect rounded-lg p-6 space-y-6">
                            <ColorPicker selectedColor={selectedColor} onColorSelect={setSelectedColor} />

                            <Controls
                                blockHeight={blockHeight}
                                lightingAngle={lightingAngle}
                                onBlockHeightChange={setBlockHeight}
                                onLightingAngleChange={setLightingAngle}
                                onClear={clearGrid}
                                onUndo={undo}
                                onRedo={redo}
                                canUndo={canUndo}
                                canRedo={canRedo}
                            />
                        </div>

                        <ExportButton voxels={voxels} lightingAngle={lightingAngle} />

                        {/* Keyboard Shortcuts */}
                        <div className="glass-effect rounded-lg p-4 text-xs text-text-secondary">
                            <h3 className="font-semibold mb-2 text-text-primary">Keyboard Shortcuts</h3>
                            <ul className="space-y-1">
                                <li><kbd className="px-1 py-0.5 bg-secondary-bg rounded">Ctrl+Z</kbd> Undo</li>
                                <li><kbd className="px-1 py-0.5 bg-secondary-bg rounded">Ctrl+Y</kbd> Redo</li>
                                <li><kbd className="px-1 py-0.5 bg-secondary-bg rounded">H</kbd> Height +</li>
                                <li><kbd className="px-1 py-0.5 bg-secondary-bg rounded">Shift+H</kbd> Height -</li>
                                <li><kbd className="px-1 py-0.5 bg-secondary-bg rounded">L</kbd> Light +</li>
                                <li><kbd className="px-1 py-0.5 bg-secondary-bg rounded">1-6</kbd> Select Color</li>
                            </ul>
                        </div>
                    </div>

                    {/* Center - Grid */}
                    <div className="lg:col-span-5">
                        <Grid
                            onCellClick={addVoxel}
                            onCellRightClick={removeVoxel}
                            hasVoxel={hasVoxel}
                            getVoxelColor={getVoxelColor}
                        />
                    </div>

                    {/* Right Sidebar - Preview */}
                    <div className="lg:col-span-4">
                        <IsometricPreview voxels={voxels} lightingAngle={lightingAngle} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border-color bg-secondary-bg mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-text-secondary text-sm">
                    <p>
                        Built with React, TypeScript & Tailwind CSS
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default App;
