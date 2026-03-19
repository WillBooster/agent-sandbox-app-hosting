import type { APIRequestContext } from "@playwright/test";

export async function uploadApp(
  request: APIRequestContext,
  options: {
    title: string;
    description?: string;
    files: { name: string; content: string | Buffer; mimeType: string }[];
  },
): Promise<{ id: string; url: string }> {
  // Build multipart fields for Playwright's request API
  const multipart: Record<string, unknown> = {
    title: options.title,
  };
  if (options.description) {
    multipart.description = options.description;
  }

  // For single file, use object; for multiple files, we need separate requests
  // Playwright multipart doesn't support multiple values for the same key directly,
  // so we use a workaround with fetch API for multiple files
  if (options.files.length === 1) {
    const file = options.files[0];
    const buffer = typeof file.content === "string" ? Buffer.from(file.content) : file.content;
    multipart.files = {
      name: file.name,
      mimeType: file.mimeType,
      buffer,
    };
  } else {
    // Use fetch-based approach for multiple files
    const formData = new FormData();
    formData.append("title", options.title);
    if (options.description) {
      formData.append("description", options.description);
    }
    for (const file of options.files) {
      const buffer = typeof file.content === "string" ? Buffer.from(file.content) : file.content;
      const blob = new Blob([buffer], { type: file.mimeType });
      formData.append("files", blob, file.name);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const fetchResponse = await fetch(`${baseUrl}/api/apps`, {
      method: "POST",
      body: formData,
    });

    if (!fetchResponse.ok) {
      throw new Error(`Upload failed: ${fetchResponse.status} ${await fetchResponse.text()}`);
    }

    return (await fetchResponse.json()) as { id: string; url: string };
  }

  const response = await request.post("/api/apps", {
    multipart,
  });

  if (!response.ok()) {
    throw new Error(`Upload failed: ${response.status()} ${await response.text()}`);
  }

  return (await response.json()) as { id: string; url: string };
}
