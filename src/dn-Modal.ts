import { type App, ButtonComponent, MarkdownRenderer, Modal } from "obsidian";
import type { Card } from "./@types/settings";
import type DeckNotesPlugin from "./dn-Plugin";

export class FlashcardModal extends Modal {
    plugin: DeckNotesPlugin;
    card: Card | null;
    deckTag: string | undefined;

    constructor(
        app: App,
        plugin: DeckNotesPlugin,
        card: Card | null,
        deckTag?: string,
    ) {
        super(app);
        this.plugin = plugin;
        this.card = card;
        this.deckTag = deckTag;
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

        // Switch Deck button (only if multiple tags available)
        const availableTags = this.plugin.api.getTags();
        if (availableTags.length > 1) {
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
        const availableTags = this.plugin.api.getTags();
        if (availableTags.length === 0) {
            return;
        }

        // Simple approach: cycle through available tags
        const currentIndex = this.deckTag
            ? availableTags.indexOf(this.deckTag)
            : -1;
        const nextIndex = (currentIndex + 1) % availableTags.length;
        this.deckTag = availableTags[nextIndex];

        this.showNextCard();
    }

    private showNextCard() {
        // Record view for current card
        if (this.card && this.plugin.settings.trackViews) {
            this.plugin.recordView(this.card.key);
        }

        // Select next card
        this.card = this.plugin.selectCard(this.deckTag);
        this.display();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
