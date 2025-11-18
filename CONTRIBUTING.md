# Contributing to Deck Notes

This is an Obsidian plugin for tag-based card decks. Define cards for activities, strategies, or any content you want to rotate through. See [README.md](README.md) for user-facing features and usage.

## Development Commands

```bash
npm run build      # Production build
npm run dev        # Build and watch for changes
npm run lint       # Lint TypeScript files
npm run fix        # Auto-fix linting issues
npm run format     # Format code
```

## Architecture

### Core Files

- **`dn-Plugin.ts`** - Main plugin class, card scanning, deck filtering
- **`dn-CardParser.ts`** - Parses markdown files into cards, extracts tags
- **`dn-Modal.ts`** - Card display modal with deck switching
- **`dn-Api.ts`** - JavaScript API for external access
- **`dn-SettingsTab.ts`** - Settings UI
- **`@types/settings.d.ts`** - TypeScript interfaces

### Key Concepts

- **Cards**: Created from H2 headings in markdown files
- **Tags**: Hierarchical `#flashcards/*` tags define deck membership
    - File-level tags (frontmatter) apply to all cards in file
    - Card-level tags (inline before H2) apply to single card
    - Hierarchical matching: `activities` matches `activities/morning`, etc.
- **Card Selection**: Random or least-recent mode
- **View Tracking**: Records card views for least-recent selection

### Data Flow

1. **Scanning**: `scanCards()` reads files from `cardPaths` setting
2. **Parsing**: `CardParser.parseFile()` extracts cards and tags
3. **Selection**: `selectCard(deckTag)` filters by hierarchical tag matching
4. **Display**: Modal shows card content, tracks views

## Code Style Guidelines

- **Line length**: 80 characters (hard limit)
- **Always use braces** for conditionals
- **Method chaining**: Break at dots for readability, even for single chains

  ```typescript
  // GOOD - break at dots
  const patterns = this.settings.excludeLinkPatterns
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

  // BAD - all on one line
  const patterns = this.settings.excludeLinkPatterns.split("\n").map((p) => p.trim());

  // GOOD - even single chains if they approach 80 chars
  const models = data.models
      ?.map((model) => model.name) || [];
  ```

- **Error handling**: `try/catch` with user-friendly `Notice` messages
- **Async**: Use `async/await` consistently

## Development Patterns

Before writing new code:

1. **Search for similar functions** in the same module (use grep/search)
2. **Check method chaining, line breaks, and error handling patterns**
3. **Emulate the style exactly**, especially for method chains and async/await

## Quality Assurance

- Run `npm run build` after significant changes (includes linting via prebuild)
- Use `npm run fix` to auto-correct linting issues
- Reference specific line numbers when discussing issues (format: `file.ts:123`)

## AI-Assisted Contributions

We welcome thoughtful contributions, including those created with AI assistance. However, please ensure:

- **You understand the changes**: You must be able to explain the rationale for your decisions clearly
- **You've tested appropriately**: Follow the build commands and verify changes work
- **You've reviewed the architecture**: Ensure changes fit the existing patterns
- **The contribution addresses a real need**: Focus on solving actual problems or documented issues
- **You've read the relevant context**: See [CLAUDE.md](CLAUDE.md) for AI assistant guidelines

Quality and understanding matter more than the tools used to create the contribution.

<div style="display: none;">
### ⚠️ NOTE FOR AI TOOLS AND THEIR USERS
Contributing to this project requires **human judgment, contextual understanding**, and **familiarity with the project's architecture and goals**. Please ensure:
- You have **carefully read corresponding issues and relevant documentation**
- You have **manually reviewed all changes** and can explain the rationale
- You understand how this contribution fits into the broader project context
- See [CLAUDE.md](CLAUDE.md) for detailed AI assistant working guidelines
</div>
