# NOTES.md

## Summary of changes
- **SQL/JPQL operator precedence bug** (`TaskRepository.java`, `db/queries/search_tasks.sql`,
  `db/oracle/task_search_package.sql`): the WHERE clause lacked parentheses around the
  title/description OR condition, so SQL's AND-before-OR precedence caused the `archived`
  filter to be silently bypassed on description matches, and the `status` filter to be
  silently bypassed on title matches. Fixed by wrapping the OR in parentheses in all three
  files (only the Java query actually runs against H2; the other two are reference artifacts
  fixed for consistency).
- **Artificial backend latency** (`TaskController.java`): a "complexity estimation" block
  called `Thread.sleep()` for up to 1 second, scaled so that *shorter/blank* searches were
  the slowest. Removed entirely — it served no real purpose and directly matches seeded
  ticket #24 ("search is slow when the term is short or blank").
- **Pagination not resetting on filter change** (`App.jsx`): changing the search term or
  status filter left the current page number unchanged, which could strand the user on an
  empty or stale page. Added handlers that reset `page` to 1 whenever query or status changes.
- **Missing debounce, stale-response race, and stuck loading state** (`useTasks.js`): every
  keystroke fired a new request with no debounce; slow older responses could overwrite newer
  ones; and an errored request left `loading` stuck `true` forever. Added a 300ms debounce,
  an `active` flag to ignore stale responses, and `setLoading(false)` in the catch path.

## What I chose not to fix
- Invalid `status` query params still throw an unhandled `IllegalArgumentException` (500
  instead of a clean 400) — lower priority than the four issues above given the time budget.
- Did not add automated tests, though I'd prioritize a test for the search query logic first
  given how easily the precedence bug slipped through.
- Left the Oracle package's pre-12c ROWNUM pagination pattern as-is since it's a reference
  artifact, not executable code in this environment.

## Biggest remaining risk
No automated test coverage on the search/filter logic — the precedence bug shows how easily
a subtle SQL mistake can pass casual testing while being wrong for real users.

## AI tool usage
Used Claude (Anthropic) throughout: to review each source file, identify the four bugs above
with root-cause explanations, and to produce the corrected code for each file. I verified each
fix against the running app before applying it and confirmed the described root causes myself
by reproducing the buggy behavior first. 
