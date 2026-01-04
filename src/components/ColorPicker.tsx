import React, { useCallback } from 'react';
import type { ColorOption } from '../types/voxel';
import { TECH_COLORS } from '../utils/colors';

interface ColorPickerProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

/**
 * Color palette selector component
 * @param props - Component props
 * @returns ColorPicker component
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
    const handleColorClick = useCallback(
        (color: ColorOption) => {
            onColorSelect(color.hex);
        },
        [onColorSelect]
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, color: ColorOption) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onColorSelect(color.hex);
            }
        },
        [onColorSelect]
    );

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold mb-3 text-text-secondary">
                Color Palette
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                {TECH_COLORS.map((color) => {
                    const isSelected = color.hex === selectedColor;

                    return (
                        <button
                            key={color.hex}
                            onClick={() => handleColorClick(color)}
                            onKeyDown={(e) => handleKeyDown(e, color)}
                            className={`
                relative w-full aspect-square rounded-lg transition-all duration-200
                hover:scale-110 hover:shadow-lg active:scale-95
                ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-primary-bg scale-110' : ''}
              `}
                            style={{ backgroundColor: color.hex }}
                            aria-label={`${color.name} - ${isSelected ? 'selected' : 'select this color'}`}
                            aria-pressed={isSelected}
                            title={`${color.name} (${color.hex})`}
                        >
                            {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white drop-shadow-lg"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}

                {/* Custom color picker */}
                <div className="relative w-full aspect-square">
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => onColorSelect(e.target.value)}
                        className="absolute inset-0 w-full h-full rounded-lg cursor-pointer opacity-0 z-10"
                        aria-label="Custom color picker"
                        title="Choose custom color"
                    />
                    <div
                        className="absolute inset-0 rounded-lg border-2 border-dashed border-slate-500 hover:border-white transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 pointer-events-none"
                        style={{ backgroundColor: selectedColor }}
                    >
                        <svg
                            className="w-6 h-6 text-white drop-shadow-lg"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
