# Changelog

All notable changes to this project are documented in this file.

## [0.5.2] - 2026-09-29

### Added
- CHANGELOG.md documenting the project's version history.

### Changed
- Custom scrollbar styling (Webkit + Firefox) matching the site's dark theme.

## [0.5.1] - 2026-09-15

### Fixed
- iOS Safari auto-zooming in on the username input, which pushed the Analyze button off-screen.

### Changed
- Narrower Analyze button and a shorter, lowercase-only username input.

## [0.5.0] - 2026-09-02

### Added
- Rewards breakdown section on account analysis: Author/Curation/Witness rewards for All Time, 30 Days, 7 Days, Today, and Yesterday, plus a trailing 7-day Curation APR.
- Favicon based on the app's logo mark.

### Changed
- Rewards breakdown now filters reward operations server-side, loading roughly 6x faster.

### Docs
- Documented the rewards breakdown feature in the README.

## [0.4.0] - 2026-08-27

### Added
- Filterable activity history (transfers, posts, votes, rewards, other) and a higher account-history fetch limit.

### Changed
- English is now the default language on load; fixed duplicate translation keys and activity filter category mismatches.
- Translated all code comments to English.

### Docs
- Rewrote the README in English and added a homepage screenshot.

## [0.3.0] - 2026-08-26

### Added
- Account age, witnesses voted, pending rewards, last comment, power down status, follower/following count, portfolio value, last vote, HBD interest estimate, reward pool, HBD print rate, and virtual supply stats.
- Redesigned logo combining the Hive mark, a magnifying glass, and the wordmark into a single SVG.

### Changed
- Stat cards grouped into thematic sections for readability.
- Vote value now shown in HIVE as the primary unit (USD secondary), using actual current voting mana to match PeakD/Hive Block Explorer.
- Numbers now force en-US formatting (comma thousands, dot decimals).

### Fixed
- Portfolio value calculation to exclude delegated-in HP.

## [0.2.0] - 2026-08-25

### Added
- LICENSE and README.
- Security changes and additional stats.

### Changed
- Improved the language button, header, and footer, plus overall translations.
- Improvements to recent activity and claimed rewards display.

## [0.1.0] - 2026-08-23

### Added
- Initial release of hive-scope: a vanilla HTML/JS Hive blockchain explorer showing real-time network stats and per-account analysis.
- Vercel Analytics integration.

### Fixed
- Translation errors in charts and recent activity, loading timeout, and initial state rendering.
