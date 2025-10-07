import type { App, TFile } from "obsidian";
import type { Card } from "./@types/settings";

export class CardParser {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async parseFile(file: TFile): Promise<Card[]> {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const h2Headings = fileCache?.headings?.filter((h) => h.level === 2);

        if (!h2Headings || h2Headings.length === 0) {
            console.warn(`Skipping ${file.path}: No H2 headings found`);
            return [];
        }

        const content = await this.app.vault.cachedRead(file);
        const cards: Card[] = [];

        // Extract content for each H2 heading
        for (let i = 0; i < h2Headings.length; i++) {
            const heading = h2Headings[i];
            const startOffset = heading.position.end.offset;
            const nextHeading = h2Headings[i + 1];
            const endOffset = nextHeading
                ? nextHeading.position.start.offset
                : content.length;

            let cardContent = content.substring(startOffset, endOffset);

            // Truncate at first ---
            const dividerIndex = cardContent.indexOf("\n---");
            if (dividerIndex !== -1) {
                cardContent = cardContent.substring(0, dividerIndex);
            }

            // Strip lines that are ONLY #flashcards tags
            cardContent = cardContent
                .split("\n")
                .filter((line) => !line.trim().startsWith("#flashcards"))
                .join("\n")
                .trim();

            cards.push({
                filePath: file.path,
                heading: heading.heading,
                content: cardContent,
                key: `${file.path}#${heading.heading}`,
            });
        }

        return cards;
    }
}
