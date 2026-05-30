# EduForge — Intelligent Module Builder

<div align="center">

![EduForge](https://img.shields.io/badge/EduForge-Module%20Builder-d4af37?style=for-the-badge&labelColor=020805)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=020805)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=020805)
![Vite](https://img.shields.io/badge/Vite-8.0-646cff?style=for-the-badge&logo=vite&logoColor=white&labelColor=020805)
![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-10b981?style=for-the-badge&labelColor=020805)
![Deploy](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=020805)

### 🌐 [Live Demo](https://eduforge-module-builder.vercel.app) &nbsp;|&nbsp; 📁 [GitHub Repository](https://github.com/tannu005/eduforge) &nbsp;|&nbsp; 🔍 [Vercel Dashboard](https://vercel.com/tannus-projects-c139bb6d/eduforge-module-builder)

*A premium, drag-and-drop educational module builder purpose-built for financial literacy training — featuring live calculators, quiz engines, achievement systems, and a real-time student preview panel.*

</div>

---

## 📸 Preview

> **Theme:** Midnight Emerald (`#020805`) × Champagne Gold (`#d4af37`) — elite fintech glassmorphism aesthetic

The interface is split into three zones:
- **Left** — Block Palette (12 content block types, drag to canvas)
- **Centre** — Editor Canvas (drag-to-reorder, undo/redo, lock blocks)
- **Right** — Live Preview Panel (real-time student-side rendering inside a simulated device bezel)

---

## 🎯 Problem Statement

Financial literacy training at scale faces a critical content-creation bottleneck. Subject-matter experts (SMEs) who understand finance deeply cannot code, while developers who can build interactive tools lack domain knowledge. The result: static PDFs, flat slides, and inaccessible jargon.

**EduForge** eliminates this gap with a no-code, block-based module editor that lets financial educators compose rich, interactive learning experiences — live EMI calculators, SIP simulators, quizzes, code snippets — without writing a single line of code.

---

## ✨ Core Features

### 🧱 12 Block Types
| Block | Description |
|---|---|
| **Rich Text** | Full WYSIWYG editor (TipTap) — headings, bold, italic, links, lists |
| **EMI Calculator** | Live loan EMI with animated donut chart (Principal vs Interest) |
| **SIP Calculator** | Systematic Investment Plan projector with dual-line SVG chart |
| **Compound Interest** | Lump-sum CI simulator with interactive area chart |
| **Quiz MCQ** | Multi-choice quiz with instant feedback, scoring, and explanation reveal |
| **Quiz True/False** | Binary-choice quiz with streak tracking and confetti on perfect score |
| **Concept Explainer** | Step-by-step animated concept walkthroughs |
| **Achievement Badge** | Unlockable badge system with canvas-confetti celebration |
| **Progress Tracker** | Milestone-based lesson progress indicator |
| **Accordion** | Collapsible FAQ / concept reveal sections |
| **Code Snippet** | Syntax-highlighted code blocks with one-click copy |
| **Callout** | Contextual alerts (Info, Tip, Warning, Success, Danger) |
| **Image** | Responsive image embed with alignment controls and alt-text enforcement |
| **Video** | YouTube & Vimeo embed with thumbnail preview and lazy iframe loading |
| **Divider** | Visual section separator (solid, dashed, dotted, decorative gold gradient) |

### ✏️ Editor Capabilities
- **Drag & Drop Reordering** — powered by `@dnd-kit/sortable`
- **Undo / Redo** — 50-step circular buffer history with Immer immutability
- **Block Locking** — lock individual blocks to prevent accidental edits
- **Block Duplication** — clone any block with one click
- **Slash Commands** — type `/` to quickly insert any block type
- **Floating Toolbar** — context-sensitive block actions
- **JSON Serialization** — export full module state to JSON; re-import to restore
- **Toast Notifications** — non-blocking feedback system (Framer Motion animated)
- **Help System** — onboarding tour for first-time users

### 📱 Live Preview Panel
- Real-time, side-by-side student-side rendering
- Simulated smartphone device bezel (metallic Midnight Emerald frame, Champagne Gold camera notch)
- All interactive elements (calculators, quizzes) fully functional in preview mode
- Toggle between editor and preview contexts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Styling** | TailwindCSS v4 + Vanilla CSS (glassmorphism primitives) |
| **State Management** | Zustand 5 + Immer 11 |
| **Rich Text Editor** | TipTap 3 (ProseMirror-based) |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Charts** | Hand-crafted SVG (no chart library dependency) |
| **Confetti** | canvas-confetti |
| **Testing** | Vitest 4 |
| **Deployment** | Vercel (auto-deploys on push to `main`) |

---

## 🧮 Financial Calculation Accuracy

All calculators use industry-standard formulae:

```
EMI  = P × r × (1+r)^n / ((1+r)^n − 1)
       where r = monthly rate, n = tenure in months

SIP  = PMT × [((1+r)^n − 1) / r] × (1+r)          ← Annuity-Due
       where r = monthly return, n = months

CI   = P × (1 + r/f)^(f×t)
       where f = compounding frequency per year
```

All three verified against known financial benchmarks in the Vitest unit test suite.

---

## 🧪 Testing

```bash
npm run test
```

**19/19 tests passing** across two test suites:

| Suite | Tests |
|---|---|
| `financial.test.ts` | `formatIndianNumber`, `calculateEMI`, `calculateSIP`, `calculateCompoundInterest` |
| `useModuleStore.test.ts` | Block CRUD, reordering, locking, duplication, undo/redo buffer, branch pruning |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# Clone the repository
git clone https://github.com/tannu005/eduforge.git
cd eduforge

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
eduforge-module-builder/
├── src/
│   ├── App.tsx                          # Root layout, navigation shell
│   ├── index.css                        # Design system — Midnight Emerald tokens, glow animations
│   ├── components/
│   │   ├── blocks/                      # All 15 block components
│   │   │   ├── EmiCalculator.tsx
│   │   │   ├── SipCalculator.tsx
│   │   │   ├── CompoundInterest.tsx
│   │   │   ├── QuizMcqBlock.tsx
│   │   │   ├── QuizTfBlock.tsx
│   │   │   ├── RichTextBlock.tsx
│   │   │   ├── AchievementBadge.tsx
│   │   │   ├── ConceptExplainer.tsx
│   │   │   ├── AccordionBlock.tsx
│   │   │   ├── CalloutBlock.tsx
│   │   │   ├── CodeSnippetBlock.tsx
│   │   │   ├── ProgressTracker.tsx
│   │   │   ├── ImageBlock.tsx
│   │   │   ├── VideoBlock.tsx
│   │   │   └── DividerBlock.tsx
│   │   ├── editor/                      # Canvas, palette, wrapper, toolbar
│   │   │   ├── BlockPalette.tsx
│   │   │   ├── BlockWrapper.tsx
│   │   │   ├── EditorCanvas.tsx
│   │   │   ├── FloatingToolbar.tsx
│   │   │   └── SlashCommandMenu.tsx
│   │   ├── preview/
│   │   │   └── LivePreviewPanel.tsx     # Simulated device bezel + student view
│   │   └── shared/
│   │       ├── Toast.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── HelpSystem.tsx
│   ├── store/
│   │   ├── useModuleStore.ts            # Main Zustand store (blocks, history, selection)
│   │   ├── useQuizStore.ts              # Quiz state (answers, feedback, scoring)
│   │   └── useToastStore.ts             # Toast notification queue
│   ├── utils/
│   │   ├── financial.ts                 # EMI / SIP / CI calculation functions
│   │   ├── serialization.ts             # JSON export/import helpers
│   │   └── validation.ts                # Block schema validation
│   └── types/
│       └── index.ts                     # All TypeScript interfaces and union types
├── vercel.json                          # SPA routing config
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 Design System

| Token | Value | Purpose |
|---|---|---|
| `--color-obsidian` | `#020805` | Page background — Deep Forest Black |
| `--color-panel` | `rgba(3,10,6,0.85)` | Glass card surfaces |
| `--color-border` | `#082212` | All structural borders |
| `--color-gold` | `#d4af37` | Champagne Gold — CTAs, active states, glow |
| `--color-emerald` | `#10b981` | Mint Emerald — secondary accents, charts |
| `--color-amber` | `#f59e0b` | Amber — warnings, SIP chart highlight |

The selection glow (`glow-border-selected`) uses a CSS `linear-gradient` background with `background-clip: padding-box` and a custom `glow-pulse` keyframe animation to simulate premium fintech selection states.

---

## 🔗 Links

| Resource | URL |
|---|---|
| 🌐 **Live Application** | https://eduforge-module-builder.vercel.app |
| 📁 **GitHub Repository** | https://github.com/tannu005/eduforge |
| 🔍 **Vercel Dashboard** | https://vercel.com/tannus-projects-c139bb6d/eduforge-module-builder |

---

## 📄 License

MIT © 2026 tannu005
