import {
    type App,
    Modal,
    PluginSettingTab,
    Setting,
    type SettingDefinitionItem,
    type Setting as SettingType,
} from "obsidian";
import type DeckNotesPlugin from "./dn-Plugin";

export class DeckNotesSettingsTab extends PluginSettingTab {
    plugin: DeckNotesPlugin;

    constructor(app: App, plugin: DeckNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.icon = "gallery-thumbnails";
    }

    async setControlValue(key: string, value: unknown): Promise<void> {
        (this.plugin.settings as unknown as Record<string, unknown>)[key] =
            value;
        await this.plugin.saveSettings();
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                name: "Usage",
                render: (setting: SettingType) => {
                    setting.descEl.appendChild(
                        createFragment((f) => {
                            const p = f.createEl("p");
                            p.appendText(
                                "Cards are created from markdown files with ",
                            );
                            p.createEl("code", { text: "##" });
                            p.appendText(" headings.");

                            const ul = f.createEl("ul");

                            const li1 = ul.createEl("li");
                            li1.appendText("Use ");
                            li1.createEl("code", { text: "---" });
                            li1.appendText(
                                " (horizontal rule) to mark the end of card content.",
                            );

                            const li2 = ul.createEl("li");
                            li2.appendText("Use ");
                            li2.createEl("code", {
                                text: "#flashcards",
                            });
                            li2.appendText(
                                " tags to identify decks. For example, ",
                            );
                            li2.createEl("code", {
                                text: "#flashcards/activities",
                            });
                            li2.appendText(" or ");
                            li2.createEl("code", {
                                text: "#flashcards/meditation",
                            });
                            li2.appendText(
                                ". Tags can be added to the whole file (in frontmatter properties), or defined inline before each ",
                            );
                            li2.createEl("code", { text: "##" });
                            li2.appendText(". See the ");
                            li2.createEl("a", {
                                text: "README",
                                href: "https://github.com/ebullient/obsidian-deck-notes#card-format",
                                attr: { target: "_blank" },
                            });
                            li2.appendText(" for examples.");
                        }),
                    );
                },
            },
            {
                name: "Default deck tag",
                desc:
                    "Optional tag to narrow the selection of cards available " +
                    "for 'Show Card' command; for example, 'activities' or " +
                    "'activities/morning'.",
                control: {
                    type: "text",
                    key: "defaultDeckTag",
                    placeholder: "activities",
                },
            },
            {
                name: "Selection mode",
                desc: "Cards can be selected at random or based on when they were last viewed.",
                control: {
                    type: "dropdown",
                    key: "selectionMode",
                    options: {
                        random: "Random",
                        "least-recent": "Least recently viewed",
                    },
                },
            },
            {
                name: "Callout type",
                desc: "Callout type for embedded cards; for example, note, tip, or warning.",
                control: {
                    type: "text",
                    key: "calloutType",
                    placeholder: "example",
                },
            },
            {
                type: "list",
                heading: "Card paths",
                desc: "Paths to folders containing card decks, relative to vault root.",
                emptyState: "No card paths configured.",
                addItem: {
                    name: "Add path",
                    action: () =>
                        new AddCardPathModal(this.app, (path) => {
                            this.plugin.settings.cardPaths.push(path);
                            void this.plugin.saveSettings();
                            this.update();
                        }).open(),
                },
                onDelete: async (idx: number) => {
                    this.plugin.settings.cardPaths.splice(idx, 1);
                    await this.plugin.saveSettings();
                    this.update();
                },
                items: this.plugin.settings.cardPaths.map((path) => ({
                    name: path,
                })),
            },
            {
                name: "",
                render: (setting: SettingType) => {
                    setting.descEl.addClass("deck-cards-coffee");
                    setting.descEl
                        .createEl("a", {
                            href: "https://www.buymeacoffee.com/ebullient",
                        })
                        .createEl("img", {
                            attr: {
                                src: "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=ebullient&button_colour=8e6787&font_colour=ebebeb&font_family=Inter&outline_colour=392a37&coffee_colour=ecc986",
                            },
                        });
                },
            },
        ];
    }
}

class AddCardPathModal extends Modal {
    private onSubmit: (path: string) => void;

    constructor(app: App, onSubmit: (path: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Add card path" });
        let input = "";
        new Setting(contentEl).setName("Path").addText((t) =>
            t.setPlaceholder("journal/coping").onChange((v) => {
                input = v.trim();
            }),
        );
        new Setting(contentEl).addButton((b) =>
            b
                .setButtonText("Add")
                .setCta()
                .onClick(() => {
                    if (input) {
                        this.onSubmit(input);
                        this.close();
                    }
                }),
        );
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
