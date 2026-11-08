# Going further (outside the 3-hour session)

Material that is useful but does not fit in the 3-hour session. Students can read it on their own after the matching chapter.

| File | After chapter | Content |
|------|---------------|---------|
| [`internal-state-coupling.test.ts`](./internal-state-coupling.test.ts) | B | State coupling, temporal coupling and method coupling in classes, with pure functions and immutability as the fix |
| [`internal-state-coupling.vitest.spec.ts`](./internal-state-coupling.vitest.spec.ts) | B | The same file written for Vitest |
| [`JEST_VS_VITEST.md`](./JEST_VS_VITEST.md) | — | Comparison of the two test runners |
| [`../chapter-ITER/`](../chapter-ITER/README.md) | E | Advanced types: generics, conditional, mapped and template-literal types, intersection types |

```bash
pnpm test test-types/going-further
pnpm run test:vitest
```
