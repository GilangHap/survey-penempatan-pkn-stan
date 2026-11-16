import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Submission } from "./survey";

const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const file = path.join(dir, "submissions.jsonl");

export async function listSubmissions(): Promise<Submission[]> {
  try {
    const raw = await readFile(file, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Submission);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function saveSubmission(submission: Submission) {
  await mkdir(dir, { recursive: true });
  await appendFile(file, JSON.stringify(submission) + "\n", "utf8");
}
