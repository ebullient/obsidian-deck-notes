import { type App, PluginSettingTab, Setting } from "obsidian";
import type { DeckNotesSettings } from "./@types/settings";
import type DeckNotesPlugin from "./dn-Plugin";

export class DeckNotesSettingsTab extends PluginSettingTab {
    plugin: DeckNotesPlugin;
    newSettings!: DeckNotesSettings;

    constructor(app: App, plugin: DeckNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.icon = "gallery-thumbnails";
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

    reset() {
        this.newSettings = this.cloneSettings();
        this.display();
    }

    display(): void {
        if (!this.newSettings) {
            this.newSettings = this.cloneSettings();
        }

        const { containerEl } = this;
        containerEl.empty();

        new Setting(this.containerEl)
            .setName("Save settings")
            .setClass("decknotes-save-reset")
            .addButton((button) =>
                button
                    .setIcon("reset")
                    .setTooltip("Reset to previously saved values.")
                    .onClick(() => {
                        this.reset();
                    }),
            )
            .addButton((button) => {
                button
                    .setIcon("save")
                    .setCta()
                    .setTooltip("Save all changes")
                    .onClick(async () => {
                        await this.save();
                    });
            });

        new Setting(containerEl)
            .setName("Card paths")
            .setDesc(
                "Paths to folders containing card decks; " +
                    "one path relative to vault root per line.",
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
                "Optional tag to narrow the selection of cards " +
                    "available for 'Show Card' command; for example, " +
                    "'activities' or 'activities/morning'.",
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
            .setName("Selection mode")
            .setDesc(
                "Cards can be selected at random or based on " +
                    "when they were last viewed.",
            )
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
                "Callout type for embedded cards; " +
                    "for example, note, tip, or warning.",
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
            text:
                "Cards are created from markdown files with " +
                "H2 headings (##). Each heading becomes one card.",
        });
        containerEl.createEl("p", {
            text:
                "Use --- (horizontal rule) to mark the end of " +
                "card content. Anything after --- will be ignored.",
        });
        containerEl.createEl("p", {
            text:
                "Tag cards with #flashcards/deck-name; for example, " +
                "#flashcards/activities/morning. Tags can be in " +
                "frontmatter or inline before each H2. Lines starting " +
                "with #flashcards are stripped from display.",
        });

        const div = this.containerEl.createDiv("deck-cards-coffee");
        div.createEl("a", {
            href: "https://www.buymeacoffee.com/ebullient",
        }).createEl("img", {
            attr: {
                src: "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=ebullient&button_colour=8e6787&font_colour=ebebeb&font_family=Inter&outline_colour=392a37&coffee_colour=ecc986",
            },
        });
    }

    /** Save on exit */
    hide(): void {
        void this.save();
    }
}
