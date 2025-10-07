import { type App, PluginSettingTab, Setting } from "obsidian";
import type { SimpleFlashcardsSettings } from "./@types/settings";
import type SimpleFlashcardsPlugin from "./flashcards-Plugin";

export class SimpleFlashcardsSettingsTab extends PluginSettingTab {
    plugin: SimpleFlashcardsPlugin;
    newSettings!: SimpleFlashcardsSettings;

    constructor(app: App, plugin: SimpleFlashcardsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async save() {
        this.plugin.settings = this.newSettings;
        await this.plugin.saveSettings();
    }

    private cloneSettings(): SimpleFlashcardsSettings {
        return JSON.parse(JSON.stringify(this.plugin.settings));
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

        containerEl.createEl("h2", { text: "Simple Flashcards Settings" });

        new Setting(containerEl)
            .setName("Save Settings")
            .setClass("flashcards-save-reset")
            .addButton((button) =>
                button
                    .setButtonText("Reset")
                    .setTooltip("Reset to current saved settings")
                    .onClick(() => {
                        this.reset();
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
            .setName("Card Paths")
            .setDesc(
                "Paths to folders containing card files (one per line, relative to vault root)",
            )
            .addTextArea((text) =>
                text
                    .setPlaceholder("Journal/Coping\nActivities/Morning")
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
            .setName("Default Deck Path")
            .setDesc(
                "Default path for 'Show Random Activity Card' command (leave empty for all cards)",
            )
            .addText((text) =>
                text
                    .setPlaceholder("Journal/Coping")
                    .setValue(this.newSettings.defaultDeckPath)
                    .onChange((value) => {
                        this.newSettings.defaultDeckPath = value.trim();
                    }),
            );

        new Setting(containerEl)
            .setName("Track Views")
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
            .setName("Selection Mode")
            .setDesc("How to select cards to display")
            .addDropdown((dropdown) =>
                dropdown
                    .addOption("random", "Random")
                    .addOption("least-recent", "Least Recently Viewed")
                    .setValue(this.newSettings.selectionMode)
                    .onChange((value) => {
                        this.newSettings.selectionMode = value as
                            | "random"
                            | "least-recent";
                    }),
            );

        containerEl.createEl("h3", { text: "Usage" });
        const usage = containerEl.createEl("div");
        usage.createEl("p", {
            text: "Cards are created from markdown files with H2 headings (##). Each heading becomes one card.",
        });
        usage.createEl("p", {
            text: "Use --- (horizontal rule) to mark the end of card content. Anything after --- will be ignored.",
        });
        usage.createEl("p", {
            text: "Lines starting with #flashcards will be stripped from card display.",
        });
    }

    /** Save on exit */
    hide(): void {
        this.save();
    }
}
