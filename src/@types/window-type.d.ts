import type { SimpleFlashcardsApi } from "../flashcards-Api";

declare global {
    interface Window {
        simpleFlashcards?: {
            api?: SimpleFlashcardsApi;
        };
    }
}
