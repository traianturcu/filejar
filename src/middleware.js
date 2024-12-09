import { NextResponse } from "next/server";
import { getAuthenticatedShop } from "@/lib/auth";

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/billing/confirm-charge|api/proxy).*)",
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
  const adminShops = process.env.ADMIN_SHOPS?.split(",") ?? [];

  if (pathname.startsWith("/api/open")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } else if (pathname.startsWith("/api/subscriber")) {
    const body = await request.json();
    if (!body) {
      return Response.json(
        {
          success: false,
          message: "No body",
        },
        { status: 400 }
      );
    }
    const { Message, Type, SubscribeURL } = body;
    if (!Message || !Type) {
      return Response.json(
        {
          success: false,
          message: "Invalid body",
        },
        { status: 400 }
      );
    }
    if (Type === "SubscriptionConfirmation") {
      if (SubscribeURL) {
        await fetch(SubscribeURL, { cache: "no-store" });
      }
      return Response.json(
        {
          success: true,
          message: "Subscription confirmed",
        },
        { status: 200 }
      );
    }
    const payload = JSON.parse(Message);
    if (payload.secret !== process.env.SNS_SECRET) {
      return Response.json(
        {
          success: false,
          message: "Invalid secret",
        },
        { status: 400 }
      );
    }
    return NextResponse.next();
  } else if (pathname.startsWith("/proxy")) {
    const res = NextResponse.next();
    res.headers.set("Content-Type", `application/liquid`);
    return res;
  } else if (pathname.startsWith("/api/cron")) {
    if (request?.headers?.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.next();
  } else if (pathname.startsWith("/api")) {
    // API requests
    const shop = await getAuthenticatedShop(request);
    let xshop = shop;
    if (request?.headers?.get("x-impersonate") && adminShops.includes(shop)) {
      xshop = request.headers.get("x-impersonate");
    }
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
    } else if (pathname.startsWith("/api/admin")) {
      //block admin requests if not authorized
      const adminShops = process.env.ADMIN_SHOPS?.split(",") ?? [];
      if (!adminShops.includes(shop)) {
        return Response.json(
          {
            success: false,
            message: "Unauthorized admin access",
          },
          {
            status: 401,
          }
        );
      }
    } else {
      requestHeaders.set("X-Shop", xshop);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  } else {
    // Non-API requests
    const shop = request?.nextUrl?.searchParams?.get("shop") ?? "*.myshopify.com";

    // block admin requests if not authorized
    if (pathname.startsWith("/admin")) {
      if (!adminShops.includes(shop)) {
        return Response.json(
          {
            success: false,
            message: "Unauthorized admin access",
          },
          {
            status: 401,
          }
        );
      }
    }

    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", `frame-ancestors https://${shop} https://admin.shopify.com`);
    return res;
  }
};
