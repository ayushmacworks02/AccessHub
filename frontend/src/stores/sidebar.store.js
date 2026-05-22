import { create } from "zustand";

const SIDEBAR_STORAGE_KEY = "nxauth-sidebar-collapsed";

const getInitialCollapsedState = () => {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
};

export const useSidebarStore = create((set, get) => ({
  collapsed: getInitialCollapsedState(),

  setCollapsed: (collapsed) => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));

    set({
      collapsed,
    });
  },

  toggleCollapsed: () => {
    const nextCollapsed = !get().collapsed;

    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextCollapsed));

    set({
      collapsed: nextCollapsed,
    });
  },

  collapseSidebar: () => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "true");

    set({
      collapsed: true,
    });
  },

  expandSidebar: () => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");

    set({
      collapsed: false,
    });
  },
}));