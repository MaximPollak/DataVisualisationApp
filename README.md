# You Might Be Addicted Without Even Knowing It

Single-page data visualization website about phone usage addiction.

This repository is currently only a project setup scaffold. It does not include the full narrative, chart implementation, phone animation, or finished design yet.

## Tech Stack

- Vite for local development and builds
- Vanilla JavaScript
- D3.js for future data visualizations
- GSAP ScrollTrigger for future scroll-driven animation
- One global CSS file for now: `src/styles.css`

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

If dependencies still need to be added manually:

```bash
npm install d3 gsap
npm install -D vite
```

`ScrollTrigger` comes from the `gsap` package. There is no separate ScrollTrigger package to install.

## Current Folder Structure

```text
DataVisualisationApp/
├─ index.html
├─ package.json
├─ vite.config.js
├─ public/
│  └─ data/
│     └─ smartphone_usage_addiction.csv
└─ src/
   ├─ main.js
   ├─ styles.css
   ├─ data/
   │  └─ .gitkeep
   ├─ components/
   │  └─ .gitkeep
   └─ assets/
      └─ .gitkeep
```

## Architecture Intention

The current structure keeps the project ready for the next implementation phase:

- `src/main.js` is the Vite JavaScript entrypoint.
- `src/styles.css` is the only CSS file for now.
- `public/data/smartphone_usage_addiction.csv` contains the dataset and can be loaded later with D3.
- `src/data/` is reserved for future data loading and transformation helpers.
- `src/components/` is reserved for future narrative sections, phone UI, chat UI, and chart modules.
- `src/assets/` is reserved for images, icons, or other static visual assets.

Future D3 loading example:

```js
import * as d3 from 'd3';

const data = await d3.csv('/data/smartphone_usage_addiction.csv');
```

Future ScrollTrigger import example:

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

## Dataset

The dataset file is copied from:

```text
/Users/maximpollak/Desktop/4.Semester/NarrativeVisualizationDataViz/dataset/Smartphone_Usage_And_Addiction_Analysis_7500_Rows.csv
```

into:

```text
public/data/smartphone_usage_addiction.csv
```

Important columns include:

- `daily_screen_time_hours`
- `notifications_per_day`
- `app_opens_per_day`
- `sleep_hours`
- `stress_level`
- `academic_work_impact`
- `addiction_level`
- `addicted_label`
