# React Performance Lab ⚡

An interactive dashboard that demonstrates core React performance optimization techniques with **real measurable results**.

Live Demo → [react-perf-dashboard.vercel.app](https://react-perf-dashboard.vercel.app/)

---

## Why I built this

This project is my way of visually proving I understand *why* these optimizations exist, not just *how* to use them.

---

## What's inside

### 1. useMemo — Real Computation Test
Find all prime numbers up to 1,000,000 using the Sieve of Eratosthenes.

- Toggle `useMemo` on/off
- Click an **unrelated button** that triggers a re-render
- With memo OFF → browser recalculates all primes from scratch every click (~200ms wasted)
- With memo ON → React reads from cache, 0ms cost

**The proof:** the re-render log shows actual milliseconds, not fake numbers.

### 2. useDebounce — API Call Control
A search input over 200 components.

- Toggle debounce on/off
- Type "Button" slowly (6 keystrokes)
- Debounce OFF → 6 API calls fire, one per keystroke
- Debounce ON → 1 API call fires after you stop typing

**The proof:** API call counter shows exactly how many calls fired.

### 3. Code Splitting — Load Only What You Need
Simulates navigating between routes with and without lazy loading.

- Splitting OFF → entire 2840kb app loads on first visit
- Splitting ON → only 210kb loads on first visit, each route's chunk loads on demand
- Once a chunk is cached, navigating back is instant

**The proof:** per-chunk load status updates live as you navigate.

### 4. Throttling — Scroll Event Control
A scrollable list that fires a handler on every scroll event.

- Throttle OFF → handler fires 50+ times per second while scrolling
- Throttle ON → handler fires at most once every 200ms
- "Calls Skipped" counter shows exactly how many events were suppressed

**The proof:** side-by-side scroll box and execution log show the difference in real time.

## Tech stack

- React 18 (hooks, memo, custom hooks)
- Vite
- Vanilla CSS

---

## Run locally
```bash
git clone https://github.com/konikajain/react-perf-dashboard.git
cd react-perf-dashboard
npm install
npm run dev
```

Open http://localhost:5173

---

## Other projects

- [Accessible UI Kit](https://github.com/konikajain/accessible-ui-kit) 
- [GraphQL Search Bar](https://github.com/konikajain/graphql-search)

---

Built by [Konika Jain](https://www.linkedin.com/in/konika-jain-1a6390187/) — Frontend Engineer
