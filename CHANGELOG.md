# Changelog

All notable changes to the Laxree Learning Center project are documented in this file.

## [Unreleased] — Vercel PR Preview Deployment

### Fixed
- **Roofing Practice Quiz now segment-aware**: The Practice Quiz tab in the roofing Study Materials previously displayed Amenities questions (safe box, RFID, minibar, kettle). It now shows 16 roofing-specific questions covering stone-coated tiles, thatch, shingles, installation, insulation, MOQ, and dealership — with an amber/orange theme matching the roofing segment. Amenities users continue to see the original amenities questions.
- **Watch Video tab added to roofing installation modules**: The "Stone Coated Tile Installation" module (and all other roofing installation modules inside Technical & Installation Learning) previously only had "View PDF" and "Read" tabs. A new "Watch Video 🎬" tab is now the FIRST tab, showing 3 relevant YouTube installation tutorial videos per module. Clicking a video opens a dialog with the YouTube embed, full transcript, and key points checklist. The Watch Video tab is the default tab when opening these modules.

### Added
- Shared data file `src/lib/roofing-videos.ts` to avoid circular imports between `learning-center.tsx` and `lesson-viewer.tsx`. Exports `ROOFING_VIDEO_LESSONS` (9 videos), `getRoofingVideosForModuleTitle()` helper, and `VIDEO_CATEGORY_COLORS`.
- `ROOFING_PRACTICE_QUESTIONS` array (16 roofing questions) with segment-aware selection inside `StudyMaterialsSection`.

### Changed
- Renamed existing `PRACTICE_QUESTIONS` → `AMENITIES_PRACTICE_QUESTIONS` to clarify scope.
- Updated `lesson-viewer.tsx` `isVideo` flag: `module.contentType === 'video' || hasRoofingVideos` so roofing installation modules show the Watch Video tab.
- Updated `getDefaultTab()`: defaults to `'watch'` when `isVideo` is true.

### Verified
- Practice Quiz tab shows "Test your roofing knowledge — stone-coated tiles, thatch, shingles, installation, insulation, MOQ, and dealership." with Q1 about stone-coated lifespan (50+ years) and "Question 1 of 16".
- Stone Coated Tile Installation module opens with "Watch Video 🎬" as the first tab, showing 3 video cards: Valley Detail (8:24), DECRA Villa (12:10), Stone-Coated Sheet (15:32).
- Lint: 0 errors in `src/` TypeScript files.
- Dev server: HTTP 200, compiled successfully.

### Files Modified
- `src/components/employee/learning-center.tsx`
- `src/components/employee/lesson-viewer.tsx`
- `src/lib/roofing-videos.ts` (new)

---

## Previous Releases

### Roofing Content Rewrite — 2025
- Rewrote all 5 roofing chapters with lengthier content (3-4x longer) and detailed real-world examples.
- Added roofing product content to Learning Center: 5 chapters + 9 YouTube installation videos + 11 catalog images.
- Fixed Roofing dashboard: segment-aware academy cards (no more Minibar/Kettle/Safe Locker keywords on roofing dashboard).
- Added welcome training video + fixed academy video sections + embedded installation videos in chapters.
- Added Chapters tab to Roofing Product Academy showing the 3 product chapters (Stone-Coated, Thatch, Shingles).
- Videos inside chapters only (removed from outside chapters).
- Added MOQ tiers (Retail 100-150 tiles, Dealer 1,000+ tiles).
