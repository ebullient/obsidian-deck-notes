import { type Editor, Notice, Plugin, TFile, TFolder } from "obsidian";
import type { Card, DeckNotesData, DeckNotesSettings } from "./@types/settings";
import { DeckNotesApi } from "./dn-Api";
import { CardParser } from "./dn-CardParser";
import { DEFAULT_SETTINGS } from "./dn-Constants";
import { CardModal } from "./dn-Modal";
import { DeckNotesSettingsTab } from "./dn-SettingsTab";

export default class DeckNotesPlugin extends Plugin {
    settings!: DeckNotesSettings;
    data!: DeckNotesData;
    cachedCards: Card[] = [];
    cardParser!: CardParser;
    api!: DeckNotesApi;

    async onload() {
        console.debug("Loading Deck Notes plugin", `v${this.manifest.version}`);

        await this.loadSettings();
        this.cardParser = new CardParser(this.app);

        this.addSettingTab(new DeckNotesSettingsTab(this.app, this));

        // Defer initial card scan, API, and command registration to avoid blocking startup
        this.app.workspace.onLayoutReady(async () => {
            await this.scanCards();

            // Initialize API
            this.api = new DeckNotesApi(this);
            if (!window.deckNotes) {
                window.deckNotes = {};
            }
            window.deckNotes.api = this.api;

            // Command: Show card
            this.addCommand({
                id: "show-card",
                name: "Show card",
                callback: () => {
                    this.showCard();
                },
            });

            // Command: Embed Card
            this.addCommand({
                id: "embed-card",
                name: "Embed card",
                editorCallback: (editor) => {
                    this.embedCard(editor);
                },
            });

            // Command: Refresh cards
            this.addCommand({
                id: "refresh-cards",
                name: "Refresh cards",
                callback: async () => {
                    await this.scanCards();
                    new Notice("Cards refreshed");
                },
            });
        });
    }

    onunload() {
        console.debug("Unloading Deck Notes plugin");

        // Clear API reference
        if (window.deckNotes) {
            window.deckNotes.api = undefined;
        }
    }

    async loadSettings() {
        const data = (await this.loadData()) as DeckNotesData;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
        this.data = data || { cardViews: {} };
    }

    async saveSettings() {
        await this.saveData({
            ...this.settings,
            cardViews: this.data.cardViews,
        });
        await this.scanCards();
    }

    async scanCards() {
        this.cachedCards = [];

        for (const cardPath of this.settings.cardPaths) {
            const abstractFile = this.app.vault.getAbstractFileByPath(cardPath);

            if (abstractFile instanceof TFolder) {
                await this.scanFolder(abstractFile);
            } else if (abstractFile instanceof TFile) {
                const cards = await this.cardParser.parseFile(abstractFile);
                this.cachedCards.push(...cards);
            } else {
                console.warn(`Card path not found: ${cardPath}`);
            }
        }

        console.debug(`Scanned ${this.cachedCards.length} cards`);
    }

    private async scanFolder(folder: TFolder) {
        for (const child of folder.children) {
            if (child instanceof TFile && child.extension === "md") {
                const cards = await this.cardParser.parseFile(child);
                this.cachedCards.push(...cards);
            } else if (child instanceof TFolder) {
                await this.scanFolder(child);
            }
        }
    }

    selectCard(deckTag?: string): Card | null {
        let pool = this.cachedCards;

        if (deckTag) {
            // Hierarchical matching: "activities" matches "activities/morning"
            pool = pool.filter((c) =>
                c.tags.some(
                    (tag) => tag === deckTag || tag.startsWith(`${deckTag}/`),
                ),
            );
        }

        if (pool.length === 0) {
            return null;
        }

        if (this.settings.selectionMode === "random") {
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Least-recent: sort by lastSeen timestamp
        const sorted = pool.slice().sort((a, b) => {
            const aTime = this.data.cardViews[a.key] || 0;
            const bTime = this.data.cardViews[b.key] || 0;
            if (aTime === bTime) {
                // Consistent, pseudo-randomizing sort
                return a.hash.localeCompare(b.hash);
            }
            return aTime - bTime;
        });

        return sorted[0];
    }

    recordView(cardKey: string) {
        this.data.cardViews[cardKey] = Date.now();
        void this.saveData({
            ...this.settings,
            cardViews: this.data.cardViews,
        });
    }

    showCard() {
        const deckTag = this.settings.defaultDeckTag || undefined;
        const card = this.selectCard(deckTag);

        if (!card) {
            new Notice("No cards available. Check your settings.");
            return;
        }

        new CardModal(this.app, this, card, deckTag).open();
    }

    createEmbedText(deck?: string): string | null {
        const deckTag = deck || this.settings.defaultDeckTag;
        const card = this.selectCard(deckTag);

        if (!card) {
            return null;
        }

        // Create collapsible callout with card content
        const contentLines = card.content
            .split("\n")
            .map((line) => `> ${line}`);

        const embedText = [
            `> [!${this.settings.calloutType}]- ${card.heading}`,
            ...contentLines,
        ].join("\n");

        // Record as viewed
        if (this.settings.trackViews) {
            this.recordView(card.key);
        }

        return embedText;
    }

    embedCard(editor: Editor, deck?: string) {
        const embedText = this.createEmbedText(deck);

        if (!embedText) {
            new Notice("No cards available. Check your settings.");
            return;
        }

        editor.replaceSelection(embedText);
    }
}
