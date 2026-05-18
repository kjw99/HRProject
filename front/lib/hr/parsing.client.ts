import type {
  ParseJobCreateResponse,
  ParseJobResponse,
  ParsingResponse,
} from "@/types/parsing";
import { api } from "../api";

export async function createParseJob(
  files: File[],
): Promise<ParseJobCreateResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const { data } = await api.post<ParseJobCreateResponse>(
    "/api/parse/jobs",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function getParseJob(jobId: string): Promise<ParseJobResponse> {
  const { data } = await api.get<ParseJobResponse>(`/api/parse/jobs/${jobId}`);
  return data;
}

export function emptyParsingResponse(): ParsingResponse {
  return {
    items: [],
    errors: [],
    excelBase64: null,
    excelFileName: null,
  };
}

export function downloadExcelFromBase64(
  base64: string,
  fileName: string,
): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
