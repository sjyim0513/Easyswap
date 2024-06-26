import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // If the request is for the root path, redirect to /swap
  return NextResponse.redirect(new URL("/home", request.url));
}

export const config = {
  matcher: ["/"],
};
