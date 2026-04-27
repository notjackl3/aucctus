import useStore from '@stores/store';

/**
 * Returns the right-side pixel offset to apply when the Overseer dock panel
 * is open and docked. Use this to shift fixed-position overlays (modals,
 * backdrops, expanded cards) so they center in the remaining viewport space
 * instead of rendering behind/under the dock.
 *
 * Offset = current dockedWidth + 12 px viewport padding. Updates live as the
 * user drags the dock's left edge to resize.
 */
const DOCK_VIEWPORT_PADDING_PX = 12;

export function useOverseerDockOffset(): number {
  const isOpen = useStore((state) => state.overseer.isOpen);
  const isDocked = useStore((state) => state.overseer.isDocked);
  const dockedWidth = useStore((state) => state.overseer.dockedWidth);
  return isOpen && isDocked ? dockedWidth + DOCK_VIEWPORT_PADDING_PX : 0;
}
