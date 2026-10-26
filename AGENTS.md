<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The Hero is a split layout (copy left, illustration right); the illustration is layered HTML/SVG (closing-globe asset, glass panels, connection dots) animated with transform/opacity only, paused off-screen via data-active and static under prefers-reduced-motion.
- Keep operational challenges in a dedicated site component with its own translated content; reuse the existing reveal hook to avoid changing other sections or adding dependencies.
- Scope client-logo sizing to stable data-logo identifiers in the reel CSS; preserve official asset files so presentation adjustments never alter brands.
- In the footer compliance badge list, ISO 28000 shows the user-supplied seal image under its own label, with a screen-reader-only clarification that it is a standard reference and not a certification mark.
- Scope plan-card variants through stable data-plan identifiers and local semantic CSS tokens so presentation changes preserve translated content and destinations.
- Use the uploaded transparent official logo in the closing and unframed, wrapping compliance images in the footer; preserve source files so brand artwork remains intact.
