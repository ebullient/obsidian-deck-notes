export interface Card {
    filePath: string;
    heading: string;
    content: string;
    key: string; // "filepath#heading" for tracking
}

export interface SimpleFlashcardsSettings {
    cardPaths: string[]; // ["Journal/Coping", "Activities"]
    defaultDeckPath: string; // Default path for quick command
    trackViews: boolean; // Enable view tracking
    selectionMode: "random" | "least-recent";
}

export interface SimpleFlashcardsData {
    cardViews: Record<string, number>; // "file.md#heading" → timestamp
}
