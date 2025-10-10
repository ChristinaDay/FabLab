// Temporarily disabled middleware; admin auth is enforced client-side.
export function middleware() { return Response.next() as any }

export const config = { matcher: [] }


