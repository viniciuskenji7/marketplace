export function getAllowedFrontendOrigin(
  frontendUrl: string | undefined,
): string {
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL must be configured.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(frontendUrl);
  } catch {
    throw new Error('FRONTEND_URL must be a valid HTTP(S) origin.');
  }

  if (
    !['http:', 'https:'].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.pathname !== '/' ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error('FRONTEND_URL must contain only one HTTP(S) origin.');
  }

  return parsedUrl.origin;
}
