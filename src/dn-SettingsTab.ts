import { type App, PluginSettingTab, Setting } from "obsidian";
import type { DeckNotesSettings } from "./@types/settings";
import type DeckNotesPlugin from "./dn-Plugin";

export class DeckNotesSettingsTab extends PluginSettingTab {
    plugin: DeckNotesPlugin;
    newSettings!: DeckNotesSettings;

    constructor(app: App, plugin: DeckNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async save() {
        this.plugin.settings = this.newSettings;
        await this.plugin.saveSettings();
    }

    private cloneSettings(): DeckNotesSettings {
        return JSON.parse(
            JSON.stringify(this.plugin.settings),
        ) as DeckNotesSettings;
    }

    async reset() {
        this.newSettings = this.cloneSettings();
        this.display();
    }

    display(): void {
        if (!this.newSettings) {
            this.newSettings = this.cloneSettings();
        }

        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl).setHeading().setName("Deck Notes");

        new Setting(containerEl)
            .setName("Save settings")
            .setClass("decknotes-save-reset")
            .addButton((button) =>
                button
                    .setButtonText("Reset")
                    .setTooltip("Reset to current saved settings")
                    .onClick(async () => {
                        await this.reset();
                    }),
            )
            .addButton((button) =>
                button
                    .setButtonText("Save")
                    .setCta()
                    .setTooltip("Save all changes")
                    .onClick(async () => {
                        await this.save();
                    }),
            );

        containerEl.createEl("p", {
            text: "Configure activity card decks for random selection.",
        });

        new Setting(containerEl)
            .setName("Card paths")
            .setDesc(
                "Paths to folders containing card files (one per line, relative to vault root)",
            )
            .addTextArea((text) =>
                text
                    .setPlaceholder("journal/coping\nactivities/morning")
                    .setValue(this.newSettings.cardPaths.join("\n"))
                    .onChange((value) => {
                        this.newSettings.cardPaths = value
                            .split("\n")
                            .map((p) => p.trim())
                            .filter((p) => p.length > 0);
                    }),
            )
            .then((setting) => {
                setting.controlEl
                    .querySelector("textarea")
                    ?.setAttribute("rows", "4");
            });

        new Setting(containerEl)
            .setName("Default deck tag")
            .setDesc(
                "Default tag for 'Show Random Activity Card' command (e.g., 'activities' or 'activities/morning'). Leave empty for all cards.",
            )
            .addText((text) =>
                text
                    .setPlaceholder("Activities")
                    .setValue(this.newSettings.defaultDeckTag)
                    .onChange((value) => {
                        this.newSettings.defaultDeckTag = value.trim();
                    }),
            );

        new Setting(containerEl)
            .setName("Track views")
            .setDesc(
                "Track when cards were last viewed (enables least-recent selection)",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.newSettings.trackViews)
                    .onChange((value) => {
                        this.newSettings.trackViews = value;
                    }),
            );

        new Setting(containerEl)
            .setName("Selection mode")
            .setDesc("How to select cards to display")
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("random", "Random")
                    .addOption("least-recent", "Least recently viewed")
                    .setValue(this.newSettings.selectionMode)
                    .onChange((value) => {
                        this.newSettings.selectionMode = value as
                            | "random"
                            | "least-recent";
                    }),
            );

        new Setting(containerEl)
            .setName("Callout type")
            .setDesc(
                "Callout type for embedded cards (e.g., note, tip, warning)",
            )
            .addText((text) =>
                text
                    .setPlaceholder("example")
                    .setValue(this.newSettings.calloutType)
                    .onChange((value) => {
                        this.newSettings.calloutType = value.trim();
                    }),
            );

        new Setting(containerEl).setHeading().setName("Usage");

        containerEl.createEl("p", {
            text: "Cards are created from markdown files with H2 headings (##). Each heading becomes one card.",
        });
        containerEl.createEl("p", {
            text: "Use --- (horizontal rule) to mark the end of card content. Anything after --- will be ignored.",
        });
        containerEl.createEl("p", {
            text: "Tag cards with #flashcards/deck-name (e.g., #flashcards/activities/morning). Tags can be in frontmatter or inline before each H2. Lines starting with #flashcards are stripped from display.",
        });
    }

    /** Save on exit */
    hide(): void {
        void this.save();
    }
}
