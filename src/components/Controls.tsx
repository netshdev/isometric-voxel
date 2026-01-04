import React, { useCallback } from 'react';

interface ControlsProps {
    blockHeight: number;
    lightingAngle: number;
    onBlockHeightChange: (height: number) => void;
    onLightingAngleChange: (angle: number) => void;
    onClear: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

/**
 * Control panel with sliders and action buttons
 * @param props - Component props
 * @returns Controls component
 */
const Controls: React.FC<ControlsProps> = ({
    blockHeight,
    lightingAngle,
    onBlockHeightChange,
    onLightingAngleChange,
    onClear,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
}) => {
    const handleHeightChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onBlockHeightChange(Number(event.target.value));
        },
        [onBlockHeightChange]
    );

    const handleAngleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onLightingAngleChange(Number(event.target.value));
        },
        [onLightingAngleChange]
    );

    return (
        <div className="w-full space-y-6">
            {/* Block Height Slider */}
            <div>
                <label
                    htmlFor="block-height"
                    className="block text-sm font-semibold mb-2 text-text-secondary"
                >
                    Block Height: <span className="text-electric-blue">{blockHeight}</span>
                </label>
                <input
                    id="block-height"
                    type="range"
                    min="1"
                    max="10"
                    value={blockHeight}
                    onChange={handleHeightChange}
                    className="w-full h-11 rounded-lg appearance-none cursor-pointer bg-secondary-bg"
                    style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((blockHeight - 1) / 9) * 100}%, #1e293b ${((blockHeight - 1) / 9) * 100}%, #1e293b 100%)`,
                    }}
                    aria-valuemin={1}
                    aria-valuemax={10}
                    aria-valuenow={blockHeight}
                    aria-label={`Block height: ${blockHeight} blocks`}
                />
            </div>

            {/* Lighting Angle Slider */}
            <div>
                <label
                    htmlFor="lighting-angle"
                    className="block text-sm font-semibold mb-2 text-text-secondary"
                >
                    Lighting Angle: <span className="text-tech-teal">{lightingAngle}°</span>
                </label>
                <p className="text-xs text-text-secondary mb-2 opacity-75">
                    Adjusts shadow direction on 3D blocks
                </p>
                <input
                    id="lighting-angle"
                    type="range"
                    min="0"
                    max="360"
                    value={lightingAngle}
                    onChange={handleAngleChange}
                    className="w-full h-11 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #14B8A6 0%, #14B8A6 ${(lightingAngle / 360) * 100}%, #1e293b ${(lightingAngle / 360) * 100}%, #1e293b 100%)`,
                    }}
                    aria-valuemin={0}
                    aria-valuemax={360}
                    aria-valuenow={lightingAngle}
                    aria-label={`Lighting angle: ${lightingAngle} degrees`}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="btn-secondary flex-1 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Undo last action"
                    title="Undo (Ctrl+Z)"
                >
                    ↶ Undo
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="btn-secondary flex-1 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Redo last action"
                    title="Redo (Ctrl+Y)"
                >
                    ↷ Redo
                </button>
                <button
                    onClick={onClear}
                    className="btn-secondary flex-1 min-w-[100px] hover:bg-red-600 hover:border-red-600"
                    aria-label="Clear all voxels"
                    title="Clear grid"
                >
                    🗑️ Clear
                </button>
            </div>
        </div>
    );
};

export default Controls;
