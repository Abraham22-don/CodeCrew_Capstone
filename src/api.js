/**
 * Shared helpers for the React frontend. Components use request() to talk
 * to Express, statuses to build dropdowns, and the date helpers to compare
 * and display assignment deadlines.
 */

// Keep the status code alongside the error message so a component can decide
// how to respond. For example, a 401 tells the app to ask the user to sign in.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Callers supply the part of the URL after /api. For example,
// request('/auth/session') sends a GET request to /api/auth/session.
// Callers can pass options such as a POST method and a JSON-stringified body.
export async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`/api${path}`, {
      ...options,

      // the browser sends the session cookie with requests to this app's
      // own origin. React can make the request without reading the cookie.
      credentials: 'same-origin',

      // the API checks X-Hub-Request on requests that change data.
      // putting options.headers last lets callers override a default header.
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Request': '1',
        ...options.headers,
      },
    });
  } catch {
    // fetch failed before providing an HTTP response. This app uses 0
    // to distinguish that case from a status code returned by Express.
    throw new ApiError('Cannot reach the API. Start the backend and try again.', 0);
  }

  // successful sign-out returns 204, meaning there is no response body to read.
  if (response.status === 204) return null;

  // Read the response as JSON. An empty body or invalid JSON gives us null.
  const data = await response.json().catch(() => null);

  // fetch still returns a response for HTTP errors such as 401 or 404.
  // Use the server's error message when one is available.
  if (!response.ok) {
    throw new ApiError(data?.error || 'Request failed. Please try again.', response.status);
  }

  // every other successful response should contain usable JSON data.
  if (data === null) {
    throw new ApiError('The API returned an invalid response.', response.status);
  }

  return data;
}

// The assignment form, cards, and filters all use these same status labels.
export const statuses = ['Not Started', 'In Progress', 'Completed'];

// Return today's local date as YYYY-MM-DD so the dashboard can compare it
// directly with a due date. A deadline due today becomes overdue tomorrow.
export function today() {
  const now = new Date();
  const year = now.getFullYear();

  // JavaScript counts months from 0 (January). Add 1 for the calendar month.
  // padStart keeps single-digit months and days two digits wide, as in 2026-03-05.
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// turn a stored date such as "2026-11-27" into a label for an assignment card.
// using local noon keeps the deadline on its intended calendar day.
// passing undefined uses the browser's locale to format the label.
export function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}