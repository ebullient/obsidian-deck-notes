import type { DeckNotesSettings } from "./@types/settings";

export const DEFAULT_SETTINGS: DeckNotesSettings = {
    cardPaths: [],
    defaultDeckTag: "",
    trackViews: true,
    selectionMode: "least-recent",
    calloutType: "tip",
};
