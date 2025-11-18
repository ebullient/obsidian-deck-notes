import type { DeckNotesApi } from "../dn-Api";

declare global {
    interface Window {
        deckNotes?: {
            api?: DeckNotesApi;
        };
    }
}
