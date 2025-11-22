# Deck Notes

Define card decks for activities, strategies, or any content you want to rotate through. Embed cards in your notes or browse them in a modal. Filter by tag hierarchies to narrow your selection.

## Features

- **Random or Least-Recent Selection** - View cards randomly or ensure you see all cards evenly
- **Tag-Based Deck Organization** - Organize cards using hierarchical `#flashcards/*` tags
- **View Tracking** - Optional tracking to prioritize cards you haven't seen recently
- **Simple Markdown Format** - Use H2 headings to define cards
- **Switch Decks on the Fly** - Cycle through discovered deck tags within the modal

## Installation

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/ebullient/obsidian-flashcards/releases)
2. Extract the files into your vault's plugins folder: `<vault>/.obsidian/plugins/deck-notes/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Development Installation

1. Clone this repository into your vault's plugins folder:

   ```bash
   cd <vault>/.obsidian/plugins
   git clone https://github.com/ebullient/obsidian-flashcards.git deck-notes
   cd deck-notes
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

Open Settings → Deck Notes to configure:

### Card Paths

List of folders or files to scan for cards (one per line, relative to vault root). This defines which files are scanned, not which cards are displayed.

Example:

```txt
Activities/Exercises
Daily/Prompts
Resources/Meditations.md
```

### Default Deck Tag

The default tag used by "Show Random Activity Card" command (e.g., `activities` or `activities/morning`). Leave empty to select from all cards with any `#flashcards/*` tag.

### Track Views

Enable tracking of when cards were last viewed. Required for "Least Recently Viewed" selection mode.

### Selection Mode

- **Random** - Pure random selection
- **Least Recently Viewed** - Prioritizes cards you haven't seen recently

## Commands

### Show Card

Opens a modal displaying a card from your default deck (or all cards if no default is set).

**Modal Controls:**

- **Switch Deck** - Cycle through discovered deck tags (e.g., `activities`, `activities/morning`)
- **Next Card** - View another card (records the current card as viewed)
- **Done** - Close the modal

### Embed Card

Inserts a card as a collapsible callout at the cursor position.

### Refresh Cards

Rescans all configured paths to pick up new or modified cards.

## Usage Tips

### Organizing Cards with Tags

Cards are organized into decks using hierarchical `#flashcards/*` tags. Tags support hierarchy, so selecting `activities` will show cards tagged with `activities`, `activities/morning`, `activities/creative`, etc.

**Tag inheritance:**

- Tags in frontmatter apply to all cards in the file
- Tags before each H2 heading apply only to that card
- Cards can have multiple tags for multiple deck membership

**Example structure:**

```txt
Activities/stretches.md → All cards get #flashcards/activities from frontmatter
  Card 1: Also tagged #flashcards/activities/morning
  Card 2: Also tagged #flashcards/activities/evening

Journal/prompts.md → All cards get #flashcards/creative from frontmatter
  Card 1: Also tagged #flashcards/creative/writing
  Card 2: Also tagged #flashcards/creative/art
```

### View Tracking

With "Track Views" enabled and "Least Recently Viewed" selection mode, the plugin ensures you see all cards before repeating. Perfect for:

- Daily meditation rotations
- Exercise variety
- Prompt cycling

### Tags for Deck Organization

Use hierarchical `#flashcards/*` tags to organize cards:

- Add tags in frontmatter: `tags: [flashcards/activities]` (applies to all cards in file)
- Add inline tags before H2 headings: `#flashcards/activities/morning` (applies to single card)
- Lines starting with `#flashcards` are automatically stripped from card display
- Cards support any markdown formatting (bold, lists, links, etc.)

### API Access

The plugin exposes a JavaScript API at `window.deckNotes.api`:

```javascript
// Get a random card embed
window.deckNotes.api.embedCard('activities')

// Get all discovered deck tags
window.deckNotes.api.getTags()

// Select cards by hash
window.deckNotes.api.selectCardsByHash(['card-hash-1', 'card-hash-2'])

// Get random card from hash list
window.deckNotes.api.selectCardByHash(['card-hash-1', 'card-hash-2'])
```

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

```txt
src/
  ├── @types/
  │   └── settings.d.ts  # TypeScript interfaces
  ├── dn-Plugin.ts       # Main plugin class
  ├── dn-CardParser.ts   # Parse files into cards
  ├── dn-Modal.ts        # Card display modal
  ├── dn-SettingsTab.ts  # Settings UI
  ├── dn-Constants.ts    # Default settings
  └── main.ts                    # Entry point
```

## License

MIT

## Author

[ebullient](https://github.com/ebullient)
