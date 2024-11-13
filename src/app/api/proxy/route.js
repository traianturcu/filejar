import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  try {
    const template = readFileSync(join(process.cwd(), "src/app/api/proxy/template.liquid"), "utf-8");

    const compiledTemplate = template.replace("##app_url##", process.env.APP_URL);

    return new Response(compiledTemplate, {
      headers: {
        "Content-Type": "application/liquid",
      },
      status: 200,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
};
