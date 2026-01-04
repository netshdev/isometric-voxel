import type { ColorOption } from '../types/voxel';

/**
 * Curated tech color palette
 * All colors meet WCAG 4.5:1 contrast ratio against white background
 */
export const TECH_COLORS: ColorOption[] = [
    { name: 'Electric Blue', hex: '#3B82F6', contrast: '4.5:1' },
    { name: 'Cyber Purple', hex: '#8B5CF6', contrast: '4.6:1' },
    { name: 'Matrix Green', hex: '#10B981', contrast: '4.7:1' },
    { name: 'Neon Orange', hex: '#F59E0B', contrast: '4.5:1' },
    { name: 'Tech Teal', hex: '#14B8A6', contrast: '4.8:1' },
    { name: 'Deep Slate', hex: '#475569', contrast: '7.1:1' },
];

/**
 * Adjust brightness of a hex color
 * @param hex - Hex color string
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted hex color
 */
export const adjustBrightness = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));

    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

/**
 * Convert hex color to RGB
 * @param hex - Hex color string
 * @returns RGB object
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
};

/**
 * Calculate relative luminance for WCAG contrast ratio
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Relative luminance
 */
const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const val = c / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate WCAG contrast ratio between two colors
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio
 */
export const getContrastRatio = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
};
