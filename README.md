# is-this-site-ai-made

Terminal tool that scans a live site or a local project folder for leftover
signals that it was built with an AI site/app builder (Lovable, v0, Bolt.new,
Framer AI, Durable, Dora, Wix ADI, 10Web, Softr, Base44, Replit) or heavily
AI-assisted copy and code.

It does not detect "AI-made" in some deep forensic sense. It looks for things
people forget to clean up before shipping: generator meta tags, injected
builder badges, default scaffold titles/favicons, boilerplate class names,
AI-copywriting clichés, placeholder images and text, and (for a local folder)
AI-builder packages left in `package.json` plus filler-style code comments.

**Anyone can remove every one of these signals before pushing live.** A clean
scan means "no traces found," not "definitely human-made." Treat the score as
a lead, not a verdict — the tool says this at the end of every run too.

## Run it

```bash
npm install
node bin/cli.js                      # interactive mode
node bin/cli.js https://example.com  # scan a live URL directly
node bin/cli.js ./my-project         # scan a local project folder
node bin/cli.js https://example.com --no-deep   # skip fetching linked JS/CSS
```

No args drops you into an interactive prompt: enter a URL or a local folder
path, confirm whether to deep-scan (fetches same-origin JS/CSS too, default
yes — just press enter), and it runs.

## What it checks

**Live site scan**
- `<meta name="generator">` against known AI builders
- Raw AI-builder fingerprints (Lovable's `cdn.gpteng.co`/`data-lov-id`, v0's
  `data-component-path`, Framer, Dora, Durable, Base44, Replit, Wix ADI,
  10Web, Softr)
- Visible "Built with/by/on <tool>" badges
- Default shadcn/ui + lucide-react scaffold classes left verbatim
- Stock placeholder image hosts (unsplash random, picsum, placehold.co, ...)
- Unfinished scaffolding: default page title ("Vite + React", "Create Next
  App"), missing or default favicon
- AI-copywriting clichés ("unlock the power of", "whether you're a ... or a
  ...", "elevate your", ...)
- Em dash overuse (a known LLM writing tic)
- Emoji-prefixed section headings
- Uncustomized placeholder text ("Your Company Name", "Lorem ipsum", ...)
- robots.txt rules for AI crawlers (GPTBot, CCBot, ClaudeBot, ...) — shown
  as informational only, not scored, since it's about crawling, not authorship

**Local project scan** runs all of the above against any built
`dist/index.html`/`build/index.html`/etc. it finds, plus:
- Known AI-builder packages left in `package.json`
- Filler-style code comments ("this ensures...", "make sure to...", "in
  order to...") at a density that reads as AI-generated

## Score

Each hit adds weight, capped at 100:

- 0–14: no strong signals
- 15–34: a few AI-builder traces
- 35–59: likely AI-assisted or AI-built
- 60–100: strong signals of an AI-generated site
