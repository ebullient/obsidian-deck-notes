# Simple Flashcards

A simple activity card plugin for Obsidian. Display random cards from your markdown files for meditations, prompts, exercises, or any repeatable activities.

## Features

- **Random or Least-Recent Selection** - View cards randomly or ensure you see all cards evenly
- **Deck Organization** - Organize cards into different folders/paths
- **View Tracking** - Optional tracking to prioritize cards you haven't seen recently
- **Simple Markdown Format** - Use H2 headings to define cards
- **Switch Decks on the Fly** - Change between different card collections within the modal

## Installation

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/ebullient/obsidian-flashcards/releases)
2. Extract the files into your vault's plugins folder: `<vault>/.obsidian/plugins/simple-flashcards/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Development Installation

1. Clone this repository into your vault's plugins folder:
   ```bash
   cd <vault>/.obsidian/plugins
   git clone https://github.com/ebullient/obsidian-flashcards.git simple-flashcards
   cd simple-flashcards
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Reload Obsidian and enable the plugin

## Card Format

Cards are created from markdown files using H2 headings (`##`). Each heading becomes one card.

### Example

```markdown
---
tags:
- flashcards/activities
---

#flashcards/activities/morning
## CARD 1: Morning Stretching Routine

Start your day with gentle movement:

1. Neck rolls - 5 each direction
2. Shoulder shrugs - 10 reps
3. Side stretches - hold 15 seconds each side
4. Forward fold - hold 30 seconds

Take your time and breathe deeply.

---

#flashcards/activities/creative
## CARD 2: Creative Writing Prompt

**Setting:** A library that only opens at midnight

**Challenge:** Write for 10 minutes about what books are found there and who visits.

---

#flashcards/activities/mindfulness
## CARD 3: Breathing Exercise

**Box Breathing:**

- Inhale for 4 counts
- Hold for 4 counts
- Exhale for 4 counts
- Hold for 4 counts

Repeat 4 times.

---
```

### Format Rules

- **H2 headings** (`##`) mark the start of each card
- **Horizontal rules** (`---`) mark the end of card content (optional)
- **Tag lines** starting with `#flashcards` are automatically stripped from display
- Content after `---` is ignored (use for notes, metadata, etc.)

## Configuration

Open Settings → Simple Flashcards to configure:

### Card Paths
List of folders or files to scan for cards (one per line, relative to vault root).

Example:
```
Activities/Exercises
Daily/Prompts
Resources/Meditations.md
```

### Default Deck Path
The default path used by "Show Random Activity Card" command. Leave empty to select from all configured paths.

### Track Views
Enable tracking of when cards were last viewed. Required for "Least Recently Viewed" selection mode.

### Selection Mode
- **Random** - Pure random selection
- **Least Recently Viewed** - Prioritizes cards you haven't seen recently

## Commands

### Show Random Activity Card
Opens a modal displaying a card from your default deck (or all cards if no default is set).

**Modal Controls:**
- **Switch Deck** - Cycle through configured card paths
- **Next Card** - View another card (records the current card as viewed)
- **Done** - Close the modal

### Refresh Activity Cards
Rescans all configured paths to pick up new or modified cards.

## Usage Tips

### Organizing Cards

**Multiple files in folders:**
```
Activities/
  ├── stretches.md
  ├── writing-prompts.md
  └── meditations.md
```

**Single file per deck:**
```
Daily/
  └── morning-routine.md
```

**Mixed approach:**
Configure both folders and individual files in Card Paths.

### View Tracking

With "Track Views" enabled and "Least Recently Viewed" selection mode, the plugin ensures you see all cards before repeating. Perfect for:
- Daily meditation rotations
- Exercise variety
- Prompt cycling

### Tags and Metadata

While `#flashcards` tag lines are stripped for display, you can still:
- Use frontmatter tags for vault organization
- Add inline tags for sub-categorization
- Include any markdown formatting (bold, lists, links, etc.)

## Development

### Building

```bash
npm run build      # Production build
npm run dev        # Watch mode
npm run lint       # Check for issues
npm run fix        # Auto-fix linting issues
npm run format     # Format code
```

### Project Structure

```
src/
  ├── @types/
  │   └── settings.d.ts          # TypeScript interfaces
  ├── flashcards-Plugin.ts       # Main plugin class
  ├── flashcards-CardParser.ts   # Parse files into cards
  ├── flashcards-Modal.ts        # Card display modal
  ├── flashcards-SettingsTab.ts  # Settings UI
  ├── flashcards-Constants.ts    # Default settings
  └── main.ts                    # Entry point
```

## License

MIT

## Author

[ebullient](https://github.com/ebullient)
