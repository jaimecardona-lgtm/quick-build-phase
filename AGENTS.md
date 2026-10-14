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

- Keep the Hero photograph static; its ambient motion lives in the lightweight inline SVG overlay so content and imagery remain stable.
- Keep operational challenges in a dedicated site component with its own translated content; reuse the existing reveal hook to avoid changing other sections or adding dependencies.
- Scope client-logo sizing to stable data-logo identifiers in the reel CSS; preserve official asset files so presentation adjustments never alter brands.
