# React Starter: example feature

> This spec describes the small example feature that ships with the starter. Replace it by running
> `/spec <your requirements>` when you start a real project.

## Goal

Show, in one small feature, how routing, validated forms, RTK Query API calls and tests fit together.

## Must-have features

### F1. Routing and layout
- Given any page, the main navigation links to Home and Feedback and marks the current page.
- Given an unknown URL, a "Page not found" page with a link home is shown.
- Keyboard users can skip to main content and reach every link and control.

### F2. Feedback list
- Given the API returns items, each item's name and message are listed.
- While loading, a status message is announced. With no items, an empty-state message is shown.
- On a server or network error, an alert explains the problem and "Try again" refetches.

### F3. Feedback form
- Name (≥ 2 chars), valid email and message (10–500 chars) are required; errors appear next to fields
  and are linked to them for screen readers. Invalid forms do not call the API.
- A valid submission POSTs to the API, shows a thank-you message and clears the form.
- A failed submission shows the server's message and keeps the entered values.

## Nice-to-have (ranked)

1. Optimistic update of the list after submitting.
2. Pagination for long lists.

## Out of scope

Authentication, a real backend, persistence, editing or deleting feedback.

## API endpoints

| Method | Path            | Request                      | Response                  | Errors                         |
| ------ | --------------- | ---------------------------- | ------------------------- | ------------------------------ |
| GET    | `/api/feedback` | –                            | `Feedback[]`              | 5xx, network                   |
| POST   | `/api/feedback` | `{ name, email, message }`   | `Feedback` (201)          | 4xx `{ message }`, 5xx         |

`Feedback = { id, name, email, message, createdAt }`. Mocked with MSW in tests and `page.route` in E2E.

## Pages

| Route       | Component      | Purpose                         |
| ----------- | -------------- | ------------------------------- |
| `/`         | `HomePage`     | Intro and link to the example   |
| `/feedback` | `FeedbackPage` | F2 list + F3 form (lazy-loaded) |
| `*`         | `NotFoundPage` | Unknown URLs                    |

## Demo script

1. Open `/`, press Tab to show the skip link, then follow "Try the feedback example".
2. On `/feedback`, point out the list loaded from the API.
3. Submit the empty form to show inline validation errors.
4. Fill in valid values and submit to show the success message.
5. Visit `/anything` to show the not-found page.
6. Run `npm test` to show loading, empty, error and validation tests passing.
