import React, { useCallback, useRef, useState } from 'react';

const GRID_SIZE = 20;

interface GridProps {
    onCellClick: (x: number, y: number) => void;
    onCellRightClick: (x: number, y: number) => void;
    hasVoxel: (x: number, y: number) => boolean;
    getVoxelColor: (x: number, y: number) => string | undefined;
}

/**
 * Interactive 20x20 grid component
 * @param props - Component props
 * @returns Grid component
 */
const Grid: React.FC<GridProps> = ({ onCellClick, onCellRightClick, hasVoxel, getVoxelColor }) => {
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const handleCellClick = useCallback(
        (x: number, y: number, event: React.MouseEvent) => {
            event.preventDefault();

            if (event.shiftKey || event.button === 2) {
                onCellRightClick(x, y);
                setDragMode('remove');
            } else {
                onCellClick(x, y);
                setDragMode('add');
            }
        },
        [onCellClick, onCellRightClick]
    );

    const handleMouseDown = useCallback(
        (x: number, y: number, event: React.MouseEvent) => {
            event.preventDefault();
            setIsDragging(true);

            if (event.shiftKey || event.button === 2) {
                onCellRightClick(x, y);
                setDragMode('remove');
            } else {
                onCellClick(x, y);
                setDragMode('add');
            }
        },
        [onCellClick, onCellRightClick]
    );

    const handleMouseEnter = useCallback(
        (x: number, y: number) => {
            setHoveredCell({ x, y });

            if (isDragging && dragMode) {
                if (dragMode === 'add') {
                    onCellClick(x, y);
                } else {
                    onCellRightClick(x, y);
                }
            }
        },
        [isDragging, dragMode, onCellClick, onCellRightClick]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setDragMode(null);
    }, []);

    // Touch event handlers for mobile support
    const handleTouchStart = useCallback(
        (x: number, y: number, event: React.TouchEvent) => {
            event.preventDefault();
            setIsDragging(true);
            onCellClick(x, y);
            setDragMode('add');
        },
        [onCellClick]
    );

    const handleTouchMove = useCallback(
        (event: React.TouchEvent) => {
            if (!isDragging || !dragMode) return;

            event.preventDefault();
            const touch = event.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if (element && element.hasAttribute('data-cell')) {
                const x = parseInt(element.getAttribute('data-x') || '0', 10);
                const y = parseInt(element.getAttribute('data-y') || '0', 10);

                if (dragMode === 'add') {
                    onCellClick(x, y);
                } else {
                    onCellRightClick(x, y);
                }
            }
        },
        [isDragging, dragMode, onCellClick, onCellRightClick]
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        setDragMode(null);
    }, []);

    // Add global mouse up and touch end listeners
    React.useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleMouseUp, handleTouchEnd]);

    const handleContextMenu = useCallback(
        (x: number, y: number, event: React.MouseEvent) => {
            event.preventDefault();
            onCellRightClick(x, y);
        },
        [onCellRightClick]
    );

    const handleKeyDown = useCallback(
        (x: number, y: number, event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();

                if (event.shiftKey) {
                    onCellRightClick(x, y);
                } else {
                    onCellClick(x, y);
                }
            }
        },
        [onCellClick, onCellRightClick]
    );

    const renderGrid = () => {
        const cells = [];

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const hasBlock = hasVoxel(x, y);
                const color = getVoxelColor(x, y);
                const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

                cells.push(
                    <button
                        key={`${x}-${y}`}
                        data-cell="true"
                        data-x={x}
                        data-y={y}
                        onMouseDown={(e) => handleMouseDown(x, y, e)}
                        onMouseEnter={() => handleMouseEnter(x, y)}
                        onClick={(e) => handleCellClick(x, y, e)}
                        onContextMenu={(e) => handleContextMenu(x, y, e)}
                        onKeyDown={(e) => handleKeyDown(x, y, e)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onTouchStart={(e) => handleTouchStart(x, y, e)}
                        onTouchMove={handleTouchMove}
                        className={`
              aspect-square border border-border-color transition-all duration-150
              ${hasBlock ? 'shadow-inner' : 'hover:bg-slate-700'}
              ${isHovered ? 'ring-2 ring-electric-blue ring-inset' : ''}
              focus:ring-2 focus:ring-electric-blue focus:ring-inset focus:outline-none
              select-none
            `}
                        style={{
                            backgroundColor: hasBlock && color ? color : 'transparent',
                        }}
                        aria-label={`Grid cell ${x}, ${y}${hasBlock ? ' - has block' : ' - empty'}`}
                        aria-pressed={hasBlock}
                        title={`(${x}, ${y})${hasBlock ? ' - Click/drag to modify' : ' - Click/drag to add block'}`}
                    />
                );
            }
        }

        return cells;
    };

    return (
        <div className="w-full">
            <div className="mb-3 flex justify-between items-center">
                <label className="block text-sm font-semibold text-text-secondary">
                    20×20 Grid
                </label>
                <span className="text-xs text-text-secondary">
                    Click/Drag: Add | Shift/Right-click: Remove
                </span>
            </div>
            <div
                ref={gridRef}
                className="bg-primary-bg p-2 rounded-lg border-2 border-border-color"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(20, 1fr)`,
                    gridTemplateRows: `repeat(20, 1fr)`,
                    gap: '0px',
                    aspectRatio: '1 / 1',
                }}
                role="grid"
                aria-label="Voxel grid - 20 by 20 cells"
            >
                {renderGrid()}
            </div>
        </div>
    );
};

export default Grid;
