type ReturnData = { success: true } | { success: false; error: string };

export async function handleCheckUsername(
  username: string
): Promise<ReturnData> {
  const data = await fetch("http://localhost:8000/check/username", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
    method: "POST",
  });

  return await data.json();
}
