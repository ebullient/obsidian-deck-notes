import type { App, TFile } from "obsidian";
import type { Card } from "./@types/settings";

export class CardParser {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    async parseFile(file: TFile): Promise<Card[]> {
        const content = await this.app.vault.read(file);
        const cards: Card[] = [];
        const headingRegex = /^## (.+)$/gm;

        // Find all H2 headings
        const headings: { text: string; index: number }[] = [];
        let match = headingRegex.exec(content);
        while (match !== null) {
            headings.push({ text: match[1], index: match.index });
            match = headingRegex.exec(content);
        }

        if (headings.length === 0) {
            console.warn(`Skipping ${file.path}: No H2 headings found`);
            return [];
        }

        // Extract content for each heading
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const nextIndex =
                i + 1 < headings.length
                    ? headings[i + 1].index
                    : content.length;

            let cardContent = content.substring(heading.index, nextIndex);

            // Remove the H2 heading line itself
            const headingLineEnd = cardContent.indexOf("\n");
            if (headingLineEnd !== -1) {
                cardContent = cardContent.substring(headingLineEnd + 1);
            }

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
                heading: heading.text,
                content: cardContent,
                key: `${file.path}#${heading.text}`,
            });
        }

        return cards;
    }
}
