# Review academic profile updates

Review `content/academic-profile.yaml` for evidence-backed updates since its
`meta.last_reviewed` date.

1. Read the full YAML and preserve its schema, record IDs, ordering conventions,
   and writing style.
2. Check the official URLs under `meta.update_sources`, then search official
   publisher, arXiv, ORCID, university, funding-agency, and conference pages for
   George Stepaniants. Treat Google Scholar as a cross-check, not the sole source.
3. Look for new publications or preprints, publication-status changes, talks,
   awards, positions, courses, mentoring, and other homepage-news candidates.
   Website work and GitHub or other repository contributions are not talks or
   seminars. Never classify them as speaking events. They may be proposed for
   News, but ask me for explicit approval of the specific entry before adding
   it; a general request to review or update the website is not approval.
   Talk and seminar candidates need evidence identifying me as a speaker at
   a named event on a stated date, not just website or repository activity.
4. Report candidate changes first. For each candidate, give the proposed YAML
   section, supporting URL, event/publication date, and any uncertainty.
5. Do not edit files until I approve the candidates. Never infer an acceptance,
   appointment, award, authorship, date, or venue from an ambiguous mention.
6. After approval, edit only `content/academic-profile.yaml`, update
   `meta.last_reviewed`, run `npm run update`, and report the generated website
   and résumé changes. Do not edit generated regions in HTML or LaTeX directly.

Do not delete existing records or publish/commit/push changes without explicit
instruction.
