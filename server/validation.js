
/**status valuues accepted when creating or updating assignments  */
export const statuses = ['Not Started', 'In Progress', 'Completed'];

/** valid ID and checks if it contains a positive integer within postgre integer range */
export function validId(value) {
  return /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 && Number(value) <= 2147483647;
}

/** checks for real calendar dates */
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**validates assignment request body */
export function assignmentError(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'An assignment object is required.';
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 150) return 'Title must contain 1–150 characters.';
  if (!validId(body.course_id)) return 'Select a valid course.';
  if (!validDate(body.due_date)) return 'Enter a valid due date (YYYY-MM-DD).';
  if (!statuses.includes(body.status)) return 'Select a valid status.';
  if (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 2000)) return 'Description must be text of at most 2,000 characters.';
  return null;
}
