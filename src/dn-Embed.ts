import {
    ButtonComponent,
    MarkdownRenderChild,
    MarkdownRenderer,
} from "obsidian";
import type { Card } from "./@types/settings";
import type DeckNotesPlugin from "./dn-Plugin";

export class CardEmbed extends MarkdownRenderChild {
    plugin: DeckNotesPlugin;
    deckTags: string[];
    sourcePath: string;
    card: Card | null;

    constructor(
        containerEl: HTMLElement,
        plugin: DeckNotesPlugin,
        deckTags: string[],
        sourcePath: string,
    ) {
        super(containerEl);
        this.plugin = plugin;
        this.deckTags = deckTags;
        this.sourcePath = sourcePath;
        this.card = null;
    }

    onload() {
        this.card = this.plugin.selectCard(this.resolvedDeckTags());
        this.display();
    }

    private resolvedDeckTags(): string[] {
        if (this.deckTags.length > 0) {
            return this.deckTags;
        }

        return this.plugin.settings.defaultDeckTag
            ? [this.plugin.settings.defaultDeckTag]
            : [];
    }

    private display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass("deck-notes-embed");

        if (!this.card) {
            containerEl.createEl("p", {
                text: "No cards available. Check your deck tags.",
            });
            return;
        }

        const callout = containerEl.createDiv({
            cls: "callout",
            attr: { "data-callout": this.plugin.settings.calloutType },
        });
        const titleEl = callout.createDiv({ cls: "callout-title" });
        titleEl.createDiv({
            cls: "callout-title-inner",
            text: this.card.heading,
        });

        const buttonContainer = titleEl.createDiv({
            cls: "deck-notes-embed-controls",
        });
        new ButtonComponent(buttonContainer)
            .setButtonText("Next card")
            .onClick(() => {
                this.showNextCard();
            });

        const contentDiv = callout.createDiv({ cls: "callout-content" });

        void MarkdownRenderer.render(
            this.plugin.app,
            this.card.content,
            contentDiv,
            this.sourcePath,
            this,
        );
    }

    private showNextCard() {
        if (this.card) {
            this.plugin.recordView(this.card.key);
        }

        this.card = this.plugin.selectCard(this.resolvedDeckTags());
        this.display();
    }
}
