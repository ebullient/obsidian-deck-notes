import type { SimpleFlashcardsSettings } from "./@types/settings";

export const DEFAULT_SETTINGS: SimpleFlashcardsSettings = {
    cardPaths: [],
    defaultDeckTag: "",
    trackViews: true,
    selectionMode: "least-recent",
    calloutType: "tip",
};
