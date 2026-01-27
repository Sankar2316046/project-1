export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(
    "https://cognify-server-50038255539.development.catalystappsail.in/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "application/x-ndjson",
    },
  });
}
