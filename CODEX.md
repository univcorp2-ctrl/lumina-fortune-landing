# CODEX — contributor guide

## Product principles

1. Give useful free value before asking for payment.
2. Never use fear, deterministic predictions, fabricated urgency or fake social proof.
3. Keep payment terms, renewal, cancellation and data use understandable before purchase.
4. Treat readings as entertainment and reflection, not professional medical, legal or financial advice.
5. Prefer a small, testable implementation over hidden framework complexity.

## Development

```bash
npm install
npm run lint
npm test -- --run
npm run build
npm run dev
```

## Boundaries

- Keep fortune generation in pure functions inside `src/fortune.js`.
- Keep persistence behind `src/storage.js`.
- Do not introduce network calls without updating privacy documentation and tests.
- Do not commit secrets, real user data or copyrighted competitor assets.
- New fortune copy must be supportive, non-deterministic and reviewed for high-risk claims.
- Maintain keyboard support and reduced-motion behavior.

## Pull request checklist

- Tests cover logic changes.
- lint, test and build pass.
- Mobile layout remains usable at 360px width.
- Pricing and privacy wording remain explicit.
- README and architecture docs match the implementation.
