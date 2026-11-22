/** Shared API client. Cookies carry the session; no secret/token is saved in localStorage. */
export class ApiError extends Error {
  constructor(message, status) { super(message); this.name = 'ApiError'; this.status = status; }
}
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: 'same-origin', // Browser automatically sends the HttpOnly session cookie.
      headers: { 'Content-Type': 'application/json', 'X-Hub-Request': '1', ...options.headers },
    });
  } catch { throw new ApiError('Cannot reach the API. Start the backend and try again.', 0); }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error || 'Request failed. Please try again.', response.status);
  if (data === null) throw new ApiError('The API returned an invalid response.', response.status);
  return data;
}
export const statuses = ['Not Started', 'In Progress', 'Completed'];
// Local calendar dates avoid UTC shifting a deadline to the previous day.
export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
