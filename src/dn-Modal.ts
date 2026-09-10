import {
    type App,
    ButtonComponent,
    FuzzySuggestModal,
    MarkdownRenderChild,
    MarkdownRenderer,
    Modal,
} from "obsidian";
import type { Card } from "./@types/settings";
import type DeckNotesPlugin from "./dn-Plugin";

class DeckSuggestModal extends FuzzySuggestModal<string> {
    tags: string[];
    onChoose: (tag: string) => void;

    constructor(app: App, tags: string[], onChoose: (tag: string) => void) {
        super(app);
        this.tags = tags;
        this.onChoose = onChoose;
        this.setPlaceholder("Switch to deck…");
    }

    getItems(): string[] {
        return this.tags;
    }

    getItemText(tag: string): string {
        return tag;
    }

    onChooseItem(tag: string): void {
        this.onChoose(tag);
    }
}

export class CardModal extends Modal {
    plugin: DeckNotesPlugin;
    card: Card | null;
    deckTag: string | undefined;
    renderer: MarkdownRenderChild;

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
        this.renderer = new MarkdownRenderChild(this.containerEl);
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
        const contentDiv = contentEl.createDiv({
            cls: "card-content",
        });

        // Modal lifecycle is tied to plugin, safe to use as component
        void MarkdownRenderer.render(
            this.app,
            this.card.content,
            contentDiv,
            this.card.filePath,
            this.renderer,
        );

        // Add button controls
        this.addControls();
    }

    private addControls() {
        const { contentEl } = this;
        const buttonContainer = contentEl.createDiv({
            cls: "modal-button-container",
        });

        // Switch Deck button (only if multiple tags available)
        const availableTags = this.plugin.api.getTags();
        if (availableTags.length > 1) {
            new ButtonComponent(buttonContainer)
                .setButtonText("Switch deck")
                .onClick(() => {
                    this.showDeckSwitcher();
                });
        }

        // Next Card button
        new ButtonComponent(buttonContainer)
            .setButtonText("Next card")
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
        const buttonContainer = contentEl.createDiv({
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

        new DeckSuggestModal(this.app, availableTags, (tag) => {
            this.deckTag = tag;
            this.showNextCard();
        }).open();
    }

    private showNextCard() {
        // Record view for current card
        if (this.card) {
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
