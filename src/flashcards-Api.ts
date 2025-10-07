import type SimpleFlashcardsPlugin from "./flashcards-Plugin";

export class SimpleFlashcardsApi {
    plugin: SimpleFlashcardsPlugin;

    constructor(plugin: SimpleFlashcardsPlugin) {
        this.plugin = plugin;
    }

    /**
     * Get a random card embed as formatted text
     * @returns The card embed text, or null if no cards available
     */
    embedCard(): string | null {
        return this.plugin.getCardEmbedText();
    }
}
