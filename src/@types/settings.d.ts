export interface Card {
    hash: string;
    filePath: string;
    heading: string;
    content: string;
    key: string; // "filepath#heading" for tracking
    tags: string[]; // Normalized deck tags (without #flashcards/ prefix)
}

export interface DeckNotesSettings {
    cardPaths: string[]; // ["Journal/Coping", "Activities"]
    defaultDeckTag: string; // Default tag for deck selection (e.g., "activities")
    trackViews: boolean; // Enable view tracking
    selectionMode: "random" | "least-recent";
    calloutType: string; // Callout type for embedded cards (e.g., "readaloud")
}

export interface DeckNotesData {
    cardViews: Record<string, number>; // "file.md#heading" → timestamp
}
