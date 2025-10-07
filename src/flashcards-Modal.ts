import { type App, ButtonComponent, MarkdownRenderer, Modal } from "obsidian";
import type { Card } from "./@types/settings";
import type SimpleFlashcardsPlugin from "./flashcards-Plugin";

export class FlashcardModal extends Modal {
    plugin: SimpleFlashcardsPlugin;
    card: Card | null;
    deckPath: string | undefined;

    constructor(
        app: App,
        plugin: SimpleFlashcardsPlugin,
        card: Card | null,
        deckPath?: string,
    ) {
        super(app);
        this.plugin = plugin;
        this.card = card;
        this.deckPath = deckPath;
    }

    onOpen() {
        this.display();
    }

    display() {
        const { contentEl } = this;
        contentEl.empty();

        if (!this.card) {
            contentEl.createEl("p", {
                text: "No cards available. Check your card paths in settings.",
            });
            this.addCloseButton();
            return;
        }

        // Render card heading
        contentEl.createEl("h2", { text: this.card.heading });

        // Render card content as markdown
        const contentDiv = contentEl.createEl("div", {
            cls: "flashcard-content",
        });

        MarkdownRenderer.render(
            this.app,
            this.card.content,
            contentDiv,
            this.card.filePath,
            this.plugin,
        );

        // Add button controls
        this.addControls();
    }

    private addControls() {
        const { contentEl } = this;
        const buttonContainer = contentEl.createEl("div", {
            cls: "modal-button-container",
        });

        // Switch Deck button (only if multiple decks configured)
        if (this.plugin.settings.cardPaths.length > 1) {
            new ButtonComponent(buttonContainer)
                .setButtonText("Switch Deck")
                .onClick(() => {
                    this.showDeckSwitcher();
                });
        }

        // Next Card button
        new ButtonComponent(buttonContainer)
            .setButtonText("Next Card")
            .setCta()
            .onClick(() => {
                this.showNextCard();
            });

        // Done button
        new ButtonComponent(buttonContainer)
            .setButtonText("Done")
            .onClick(() => {
                this.close();
            });
    }

    private addCloseButton() {
        const { contentEl } = this;
        const buttonContainer = contentEl.createEl("div", {
            cls: "modal-button-container",
        });

        new ButtonComponent(buttonContainer)
            .setButtonText("Close")
            .onClick(() => {
                this.close();
            });
    }

    private showDeckSwitcher() {
        const availableDecks = this.plugin.settings.cardPaths;
        if (availableDecks.length === 0) {
            return;
        }

        // Simple approach: cycle through available decks
        const currentIndex = this.deckPath
            ? availableDecks.indexOf(this.deckPath)
            : -1;
        const nextIndex = (currentIndex + 1) % availableDecks.length;
        this.deckPath = availableDecks[nextIndex];

        this.showNextCard();
    }

    private showNextCard() {
        // Record view for current card
        if (this.card && this.plugin.settings.trackViews) {
            this.plugin.recordView(this.card.key);
        }

        // Select next card
        this.card = this.plugin.selectCard(this.deckPath);
        this.display();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
