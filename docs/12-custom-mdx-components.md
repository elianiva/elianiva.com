## 12 - Custom MDX Components

### Goal

Convert all custom MDX components from Svelte to React for use in markdown rendering.

### Components to Create

**./src/components/Quiz.tsx**

- React version of Quiz.svelte
- Multiple choice questions
- Correct/incorrect animations with motion (or animejs)
- Shake animation for wrong answers
- Green glow for correct answers
- Explanation display
- Try again button
- Radio group accessibility

**./src/components/RegexHighlighter.tsx**

- React version of RegexHighlighter.svelte
- Props: patterns[], text
- Highlight segments by regex matching
- Color-coded segments
- Monospace output

**./src/components/TermPopover.tsx**

- React version of TermPopover.svelte
- Hover to show definition tooltip
- Dashed underline
- Positioned tooltip with arrow

**./src/components/Update.tsx**

- React version of Update.astro
- Props: date
- Formatted date display
- UPDATE banner styling
- Children content

**./src/components/Greentext.tsx**

- React version of Greentext.astro
- Props: items[]
- > prefixed list
- Pink background

### Integration with react-markdown

Map these in the components prop:

```tsx
<ReactMarkdown
  components={{
    Update: ({ date, children }) => <Update date={date}>{children}</Update>,
    Greentext: ({ items }) => <Greentext items={items} />,
    Quiz: (props) => <Quiz {...props} />,
    RegexHighlighter: (props) => <RegexHighlighter {...props} />,
    TermPopover: (props) => <TermPopover {...props} />,
  }}
>
  {content}
</ReactMarkdown>
```

Note: MDX components in plain markdown files need to be parsed. Since the source uses .mdx files with JSX components embedded, we need to either:

1. Use @mdx-js/mdx to compile MDX to React components at build time
2. Or use a simpler approach: parse markdown, then post-process to replace custom syntax

Given the source uses actual JSX in MDX (<Quiz ... />, etc.), we should compile MDX properly.

### MDX Compilation Strategy

Use @mdx-js/mdx at build time:

1. Build script reads all .mdx files
2. Compiles each to a React component string
3. Generates index file mapping slugs to components
4. Or: compile on-demand in server functions

For simplicity in TanStack Start, use a server function that:

1. Reads the .mdx file
2. Compiles it with @mdx-js/mdx + remark plugins
3. Returns the rendered HTML + frontmatter

### What This Replaces

- ./src/components/Quiz.svelte -> ./src/components/Quiz.tsx
- ./src/components/RegexHighlighter.svelte -> ./src/components/RegexHighlighter.tsx
- ./src/components/TermPopover.svelte -> ./src/components/TermPopover.tsx
- ./src/components/Update.astro -> ./src/components/Update.tsx
- ./src/components/Greentext.astro -> ./src/components/Greentext.tsx

### Verification

- Quiz renders and animates correctly
- Regex highlighter shows colored segments
- Term popover shows on hover
- Update callout renders with date
- Greentext shows > prefixed items
