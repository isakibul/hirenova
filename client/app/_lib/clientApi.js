import { getApiMessage } from "./ui";

export async function requestJson(path, init, fallback = "Something went wrong.") {
  const response = await fetch(path, init);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiMessage(body, fallback));
  }

  return body;
}
