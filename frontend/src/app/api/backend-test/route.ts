export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const res = await fetch(
      "https://marketing-waste-detector.vercel.app/api/v1/analyze",
      {
        method: "POST",
        body: formData,
      }
    );

    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
