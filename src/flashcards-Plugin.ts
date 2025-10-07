import { type Editor, Notice, Plugin, TFile, TFolder } from "obsidian";
import type {
    Card,
    SimpleFlashcardsData,
    SimpleFlashcardsSettings,
} from "./@types/settings";
import { SimpleFlashcardsApi } from "./flashcards-Api";
import { CardParser } from "./flashcards-CardParser";
import { DEFAULT_SETTINGS } from "./flashcards-Constants";
import { FlashcardModal } from "./flashcards-Modal";
import { SimpleFlashcardsSettingsTab } from "./flashcards-SettingsTab";

export default class SimpleFlashcardsPlugin extends Plugin {
    settings!: SimpleFlashcardsSettings;
    data!: SimpleFlashcardsData;
    cachedCards: Card[] = [];
    cardParser!: CardParser;
    api!: SimpleFlashcardsApi;

    async onload() {
        console.log("Loading Simple Flashcards plugin");

        await this.loadSettings();
        this.cardParser = new CardParser(this.app);

        this.addSettingTab(new SimpleFlashcardsSettingsTab(this.app, this));

        // Defer initial card scan, API, and command registration to avoid blocking startup
        this.app.workspace.onLayoutReady(async () => {
            await this.scanCards();

            // Initialize API
            this.api = new SimpleFlashcardsApi(this);
            if (!window.simpleFlashcards) {
                window.simpleFlashcards = {};
            }
            window.simpleFlashcards.api = this.api;

            // Command: Show Random Activity Card
            this.addCommand({
                id: "show-random-card",
                name: "Show Activity Card",
                callback: () => {
                    this.showRandomCard();
                },
            });

            // Command: Embed Random Card
            this.addCommand({
                id: "embed-card",
                name: "Embed Activity Card",
                editorCallback: (editor) => {
                    this.insertCardEmbed(editor);
                },
            });

            // Command: Refresh Activity Cards
            this.addCommand({
                id: "refresh-cards",
                name: "Refresh Activity Cards",
                callback: async () => {
                    await this.scanCards();
                    new Notice("Activity cards refreshed");
                },
            });
        });
    }

    onunload() {
        console.log("Unloading Simple Flashcards plugin");

        // Clear API reference
        if (window.simpleFlashcards) {
            window.simpleFlashcards.api = undefined;
        }
    }

    async loadSettings() {
        const data = await this.loadData();
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

        console.log(`Scanned ${this.cachedCards.length} cards`);
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

    selectCard(deckPath?: string): Card | null {
        let pool = this.cachedCards;

        if (deckPath) {
            pool = pool.filter((c) => c.filePath.startsWith(deckPath));
        }

        if (pool.length === 0) {
            return null;
        }

        if (this.settings.selectionMode === "random") {
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // least-recent: sort by lastSeen timestamp
        const sorted = pool.slice().sort((a, b) => {
            const aTime = this.data.cardViews[a.key] || 0;
            const bTime = this.data.cardViews[b.key] || 0;
            return aTime - bTime;
        });

        return sorted[0];
    }

    recordView(cardKey: string) {
        this.data.cardViews[cardKey] = Date.now();
        this.saveData({
            ...this.settings,
            cardViews: this.data.cardViews,
        });
    }

    showRandomCard() {
        const deckPath = this.settings.defaultDeckPath || undefined;
        const card = this.selectCard(deckPath);

        if (!card) {
            new Notice("No cards available. Check your settings.");
            return;
        }

        new FlashcardModal(this.app, this, card, deckPath).open();
    }

    getCardEmbedText(): string | null {
        const deckPath = this.settings.defaultDeckPath || undefined;
        const card = this.selectCard(deckPath);

        if (!card) {
            return null;
        }

        // Create collapsible callout with card content
        const contentLines = card.content
            .split("\n")
            .map((line) => `> ${line}`);

        const embedText = [
            `> [!${this.settings.calloutType}]+ ${card.heading}`,
            ...contentLines,
        ].join("\n");

        // Record as viewed
        if (this.settings.trackViews) {
            this.recordView(card.key);
        }

        return embedText;
    }

    insertCardEmbed(editor: Editor) {
        const embedText = this.getCardEmbedText();

        if (!embedText) {
            new Notice("No cards available. Check your settings.");
            return;
        }

        editor.replaceSelection(embedText);
    }
}
