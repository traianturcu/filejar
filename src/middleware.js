import { NextResponse } from "next/server";
import { getAuthenticatedShop } from "@/lib/auth";

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        {
          type: "header",
          key: "next-router-prefetch",
        },
        {
          type: "header",
          key: "purpose",
          value: "prefetch",
        },
      ],
    },
  ],
};

export const middleware = async (request) => {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);

  if (pathname.startsWith("/api")) {
    // API requests
    const shop = await getAuthenticatedShop(request);
    if (!shop) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized session token",
        },
        {
          status: 401,
        }
      );
    }

    requestHeaders.set("X-Shop", shop);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } else {
    // Non-API requests
    const shop = request?.nextUrl?.searchParams?.get("shop") ?? "*.myshopify.com";

    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", `frame-ancestors https://${shop} https://admin.shopify.com`);
    return res;
  }
};
