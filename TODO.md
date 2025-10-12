# TODO: Enhance Light Mode for Corporate Professional Look

- [x] Update components/ui/card.tsx: Replace hardcoded glassy/translucent classes with theme-aware bg-card, text-card-foreground, subtle border and shadow for clean white cards in light mode.
- [x] Update app/page.tsx: Remove dark gradients from all Cards; replace neon green (#00FF00) text with professional green (#10b981); ensure data text uses text-foreground for readability; adjust icons to use blue (#4f46e5), green (#10b981), orange (#f59e0b).
- [x] Update app/analytics/page.tsx: Remove dark gradients from Cards; update metric texts and icons to use theme colors like green-500 (#10b981) for positives, orange-500 (#f59e0b) for costs; ensure chart elements use foreground/muted-foreground.
- [x] Check and update app/reports/page.tsx if it has similar dark gradients or unprofessional colors.
- [x] Check and update app/inventory/page.tsx if it has similar dark gradients or unprofessional colors.
- [x] Test light mode across dashboard pages for readability and professional appearance (corporate style with blue, green, orange, dark orange, dark blue, black accents). (Note: Browser testing tool disabled, but changes applied based on code review)
