import styled from 'styled-components';

export const CanvasContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  position: relative;
  min-height: 380px;
`;

export const CanvasToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ZoomButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: ${({ theme }) => theme.radii.xs};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SheetScrollArea = styled.div<{ $isPanTool?: boolean; $isPanning?: boolean }>`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  user-select: none;
  cursor: ${({ $isPanTool, $isPanning }) =>
    $isPanning ? 'grabbing' : $isPanTool ? 'grab' : 'default'};

  /* Custom scrollbar for vertical sheet scrolling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const SheetPaper = styled.div`
  background: ${({ theme }) => theme.colors.sheetPaper};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 24px 32px;
  position: relative;
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
`;

export const SvgScrollWrapper = styled.div<{ $isPanning?: boolean; $isPanTool?: boolean }>`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  cursor: ${({ $isPanTool, $isPanning }) =>
    $isPanning ? 'grabbing' : $isPanTool ? 'grab' : 'default'};

  /* Custom scrollbar for horizontal sheet music overflow */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    border: 2px solid ${({ theme }) => theme.colors.surface};
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

export const ScoreHeaderInfo = styled.div`
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
`;

export const ScoreTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.01em;
`;

export const ScoreComposer = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  font-style: italic;
`;

export const SvgCanvas = styled.svg<{ $isPanTool?: boolean }>`
  display: block;
  overflow: visible;
  cursor: ${({ $isPanTool }) => ($isPanTool ? 'inherit' : 'crosshair')};

  foreignObject {
    overflow: visible;
  }
`;

export const LineTimeSelect = styled.select`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 10px;
  font-weight: 700;
  padding: 0 4px;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary};
  }

  option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 11px;
    font-weight: 600;
  }
`;

export const PitchTooltip = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => $x + 15}px;
  top: ${({ $y }) => $y - 30}px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.xs};
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: 700;
  pointer-events: none;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  z-index: 10;
`;

export const TimeSelectMenu = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 100;
  min-width: 90px;
`;

export const TimeSelectOption = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 4px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.surfaceActive : 'transparent'};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const AddLineButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  margin-bottom: 12px;
  padding: 10px 20px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s ease;
  align-self: center;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const NoteInspector = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.surfaceActive};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 12px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const InspectorPill = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
`;

export const SmallActionBtn = styled.button`
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 3px;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const LyricInput = styled.input`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  width: 90px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
