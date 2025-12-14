// Middleware disabled - using custom localStorage-based authentication
// If you need middleware in the future, you can re-enable it here

export async function middleware(request) {
  // No middleware needed for custom auth system
  return;
}

export const config = {
  matcher: [
    // Disabled - no routes need middleware protection
    // All auth is handled client-side with localStorage
  ],
};
