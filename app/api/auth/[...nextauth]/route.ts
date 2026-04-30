import { NextResponse, NextRequest } from "next/server";
import { authRuntimeConfig, handlers } from "@/auth";

export const runtime = "edge";

function configErrorResponse() {
    return NextResponse.json(
        {
            error: "Auth is not configured.",
            missing: authRuntimeConfig.missing,
        },
        { status: 503 }
    );
}

export async function GET(request: NextRequest) {
    if (!authRuntimeConfig.enabled) {
        const pathname = new URL(request.url).pathname;

        // Keep client SDK calls predictable even when auth is disabled.
        if (pathname.endsWith("/providers")) {
            return NextResponse.json({});
        }
        if (pathname.endsWith("/session")) {
            return NextResponse.json({});
        }

        return configErrorResponse();
    }

    return handlers.GET(request);
}

export async function POST(request: NextRequest) {
    if (!authRuntimeConfig.enabled) {
        return configErrorResponse();
    }

    return handlers.POST(request);
}
