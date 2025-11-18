import type { Card } from "./@types/settings";
import type DeckNotesPlugin from "./dn-Plugin";

export class DeckNotesApi {
    plugin: DeckNotesPlugin;

    constructor(plugin: DeckNotesPlugin) {
        this.plugin = plugin;
    }

    /**
     * Get a random card embed as formatted text
     * @param deck Tag for deck selection (e.g., "activities")
     * @returns The card embed text, or null if no cards available
     */
    embedCard(deck: string | undefined = undefined): string | null {
        return this.plugin.createEmbedText(deck);
    }

    /**
     * Get all unique deck tags discovered in cards
     * @returns Array of normalized tag strings (e.g., ["activities", "activities/morning"])
     */
    getTags(): string[] {
        const tagsSet = new Set<string>();

        for (const card of this.plugin.cachedCards) {
            for (const tag of card.tags) {
                tagsSet.add(tag);
            }
        }

        return Array.from(tagsSet).sort();
    }

    /**
     * Select cards by their hash identifiers
     * @param hashes Array of card hashes to select
     * @returns Array of matching cards
     */
    selectCardsByHash(hashes: string[]): Card[] {
        const hashSet = new Set(hashes);
        return this.plugin.cachedCards.filter((card) => hashSet.has(card.hash));
    }

    /**
     * Get a random card from a list of hashes
     * @param hashes Array of card hashes to select from
     * @returns A random card from the list, or null if no matches
     */
    selectCardByHash(hashes: string[]): Card | null {
        const cards = this.selectCardsByHash(hashes);

        if (cards.length === 0) {
            return null;
        }

        return cards[Math.floor(Math.random() * cards.length)];
    }
}
