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
    defaultDeckTag: string; // Default tag for deck selection
    selectionMode: "random" | "least-recent";
    calloutType: string; // Callout type for embedded cards
}

export interface DeckNotesData {
    cardViews: Record<string, number>; // "file.md#heading" → timestamp
}
