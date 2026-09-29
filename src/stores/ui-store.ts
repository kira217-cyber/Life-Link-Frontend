import { create } from "zustand";

/**
 * Global UI state that several unrelated parts of the app need to agree on.
 *
 * Right now that is the blocking loading overlay. It lives in a store rather
 * than in the component that triggers it because the thing being waited on —
 * a sign-in, a sign-out — ends with that component unmounting: the page it
 * belonged to is replaced. State owned by the page cannot outlive the page.
 */

export interface BlockingLoad {
  title: string;
  description?: string;
}

interface UiState {
  blocking: BlockingLoad | null;
  /** Show the overlay. Calling again replaces the message. */
  startBlocking: (load: BlockingLoad) => void;
  stopBlocking: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  blocking: null,
  startBlocking: (blocking) => set({ blocking }),
  stopBlocking: () => set({ blocking: null }),
}));

/** Read-only selector, so a component that only displays it does not re-render on every action. */
export const selectBlocking = (state: UiState) => state.blocking;
