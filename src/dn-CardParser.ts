import type { App, CachedMetadata, TFile } from "obsidian";
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

        // Extract file-level tags from frontmatter
        const fileLevelTags = this.extractFileLevelTags(fileCache);

        // Extract content for each H2 heading
        for (let i = 0; i < h2Headings.length; i++) {
            const heading = h2Headings[i];
            const startOffset = heading.position.end.offset;
            const nextHeading = h2Headings[i + 1];
            const endOffset = nextHeading
                ? nextHeading.position.start.offset
                : content.length;

            // Extract section before heading for inline tags
            const prevHeading = h2Headings[i - 1];
            const sectionStart = prevHeading
                ? prevHeading.position.end.offset
                : 0;
            const preHeadingContent = content.substring(
                sectionStart,
                heading.position.start.offset,
            );
            const cardLevelTags = this.extractInlineTags(preHeadingContent);

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

            // Combine file-level and card-level tags
            const allTags = [...fileLevelTags, ...cardLevelTags];
            const uniqueTags = [...new Set(allTags)];

            cards.push({
                hash: this.lowerKebab(heading.heading),
                filePath: file.path,
                heading: heading.heading,
                content: cardContent,
                key: `${file.path}#${heading.heading}`,
                tags: uniqueTags,
            });
        }

        return cards;
    }

    /**
     * Extract file-level tags from frontmatter
     */
    extractFileLevelTags(fileCache: CachedMetadata | null): string[] {
        const tags: string[] = [];
        const frontmatterTags = fileCache?.frontmatter?.tags as
            | string[]
            | Record<string, unknown>
            | undefined;

        if (!frontmatterTags) {
            return tags;
        }

        // Handle both array and object formats
        const tagList = Array.isArray(frontmatterTags)
            ? frontmatterTags
            : Object.keys(frontmatterTags);

        for (const tag of tagList) {
            if (typeof tag === "string") {
                const normalized = this.normalizeTag(tag);
                if (normalized) {
                    tags.push(normalized);
                }
            }
        }

        return tags;
    }

    /**
     * Extract inline #flashcards tags from text
     */
    extractInlineTags(text: string): string[] {
        const tags: string[] = [];
        const lines = text.split("\n");

        for (const line of lines) {
            const trimmed = line.trim();
            // Match lines with #flashcards tags
            const tagMatches = trimmed.match(/#flashcards[/\w-]*/g);
            if (tagMatches) {
                for (const tag of tagMatches) {
                    const normalized = this.normalizeTag(tag);
                    if (normalized) {
                        tags.push(normalized);
                    }
                }
            }
        }

        return tags;
    }

    /**
     * Normalize tag by stripping #flashcards/ prefix
     * Returns null if tag is just "#flashcards" with no subdeck
     */
    normalizeTag(tag: string | null | undefined): string | null {
        // Guard against null/undefined
        if (!tag) {
            return null;
        }

        // Remove leading # if present
        const cleaned = tag.startsWith("#") ? tag.substring(1) : tag;

        // Must start with flashcards
        if (!cleaned.startsWith("flashcards")) {
            return null;
        }

        // Strip "flashcards/" prefix
        if (cleaned === "flashcards") {
            return null; // Just #flashcards, no subdeck
        }

        if (cleaned.startsWith("flashcards/")) {
            return cleaned.substring("flashcards/".length);
        }

        return null;
    }

    lowerKebab = (name: string): string => {
        return (name || "")
            .replace(/[\s_]+/g, "-") // replace all spaces and low dash
            .replace(/[^0-9a-zA-Z_-]/g, "") // strip other things
            .replace(/([a-z])([A-Z])/g, "$1-$2") // separate on camelCase
            .toLowerCase(); // convert to lower case
    };
}
