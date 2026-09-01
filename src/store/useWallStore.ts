import { create } from "zustand";
import type { Comment } from "@/types/comment";

type PendingDelete = { id: string; text: string };
type PendingView = { id: string; text: string };
type PendingEdit = { id: string; text: string };
type PendingProperties = { id: string; text: string; createdAt: string; updatedAt: string };
type ContextMenuState = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  x: number;
  y: number;
};

type WallState = {
  todayCount: number;
  dateKey: string | null;
  inputFocused: boolean;
  paused: boolean;
  /** Bumped every time a comment is successfully posted; BubbleField subscribes to this. */
  latestComment: Comment | null;
  /** Left-click: view a bubble's message full-size. */
  pendingView: PendingView | null;
  /** Right-click: 수정/삭제/속성 menu, positioned at the click point. */
  contextMenu: ContextMenuState | null;
  /** Set from the context menu's 삭제 — the confirm modal watches this. */
  pendingDelete: PendingDelete | null;
  /** Set from the context menu's 수정 — the edit modal watches this. */
  pendingEdit: PendingEdit | null;
  /** Set from the context menu's 속성. */
  pendingProperties: PendingProperties | null;
  /** True while the "전체 제거" confirm modal is open. */
  clearAllRequested: boolean;

  setTodayCount: (count: number) => void;
  setDateKey: (dateKey: string) => void;
  setInputFocused: (focused: boolean) => void;
  setPaused: (paused: boolean) => void;
  publishNewComment: (comment: Comment) => void;
  incrementTodayCount: () => void;
  decrementTodayCount: () => void;
  requestView: (id: string, text: string) => void;
  clearPendingView: () => void;
  openContextMenu: (state: ContextMenuState) => void;
  closeContextMenu: () => void;
  requestDelete: (id: string, text: string) => void;
  clearPendingDelete: () => void;
  requestEdit: (id: string, text: string) => void;
  clearPendingEdit: () => void;
  requestProperties: (id: string, text: string, createdAt: string, updatedAt: string) => void;
  clearPendingProperties: () => void;
  requestClearAll: () => void;
  cancelClearAll: () => void;
};

export const useWallStore = create<WallState>((set) => ({
  todayCount: 0,
  dateKey: null,
  inputFocused: false,
  paused: false,
  latestComment: null,
  pendingView: null,
  contextMenu: null,
  pendingDelete: null,
  pendingEdit: null,
  pendingProperties: null,
  clearAllRequested: false,

  setTodayCount: (count) => set({ todayCount: count }),
  setDateKey: (dateKey) => set({ dateKey }),
  setInputFocused: (focused) => set({ inputFocused: focused }),
  setPaused: (paused) => set({ paused }),
  publishNewComment: (comment) => set({ latestComment: comment }),
  incrementTodayCount: () => set((state) => ({ todayCount: state.todayCount + 1 })),
  decrementTodayCount: () => set((state) => ({ todayCount: Math.max(0, state.todayCount - 1) })),
  requestView: (id, text) => set({ pendingView: { id, text } }),
  clearPendingView: () => set({ pendingView: null }),
  openContextMenu: (state) => set({ contextMenu: state }),
  closeContextMenu: () => set({ contextMenu: null }),
  requestDelete: (id, text) => set({ pendingDelete: { id, text } }),
  clearPendingDelete: () => set({ pendingDelete: null }),
  requestEdit: (id, text) => set({ pendingEdit: { id, text } }),
  clearPendingEdit: () => set({ pendingEdit: null }),
  requestProperties: (id, text, createdAt, updatedAt) =>
    set({ pendingProperties: { id, text, createdAt, updatedAt } }),
  clearPendingProperties: () => set({ pendingProperties: null }),
  requestClearAll: () => set({ clearAllRequested: true }),
  cancelClearAll: () => set({ clearAllRequested: false }),
}));
