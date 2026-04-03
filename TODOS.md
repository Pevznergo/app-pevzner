# TODOS

## Restore saved quiz answers on page reload
**What:** Pass `quizAnswers` JSON from DB to `Quiz.tsx` so returning users see their personalized result.

**Why:** Currently `hasCompletedQuiz` is a boolean — the actual Yes/No answers aren't threaded through. Returning users see the all-No fallback (claim all credits), not their personalized view (sell vs. claim split).

**How:** In `src/app/quiz/page.tsx`, change the prisma query to also select `quizAnswers`, parse it, and pass it as a prop to `<Quiz initialAnswers={parsedAnswers} />`. In `Quiz.tsx`, accept `initialAnswers` and use it to seed the `answers` state.

**Depends on:** The `quizAnswers` field already exists in the schema and is already being written. This is purely a prop threading change.

---

## Replace 'Get Cash' mailto with Calendly or form
**What:** Change `href="mailto:justin.reed@pevzner.pro"` to a real conversion mechanism (Calendly, Typeform, or internal form).

**Why:** Email link requires the user's mail app to open — friction on mobile, silent failure on some browsers. Calendly captures intent directly and is trackable.

**How:** Set up the Calendly/Typeform URL, then replace the `href` in the `Get Cash` button in `Quiz.tsx`. The button is currently an `<a>` tag — stays as `<a>` with a new `href`.

---

## Add error handling for saveQuizAnswers failure
**What:** Show user feedback if `saveQuizAnswers` throws. Currently: `saveQuizAnswers(answers).catch(console.error)` — silent failure.

**Why:** If the server action fails, the user completes the quiz but their answers aren't saved. On their next visit they see the all-No fallback and don't know why.

**How:** Add a toast or inline error state: `saveQuizAnswers(answers).catch(() => setSaveError(true))`. Show a small error message: "Your answers couldn't be saved — try refreshing."
