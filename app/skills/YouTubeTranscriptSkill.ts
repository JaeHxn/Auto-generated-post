export type YouTubeVideoContext = {
  url: string;
  videoId: string;
  title?: string;
  authorName?: string;
  transcript?: string;
  transcriptLanguage?: string;
  source: "transcript" | "metadata" | "unavailable";
  error?: string;
};

type CaptionTrack = {
  baseUrl?: string;
  languageCode?: string;
  name?: { simpleText?: string; runs?: { text?: string }[] };
  kind?: string;
};

type YouTubePlayerResponse = {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };
};

type TranscriptSegment = {
  utf8?: string;
};

type TranscriptEvent = {
  segs?: TranscriptSegment[];
};

type TranscriptResponse = {
  events?: TranscriptEvent[];
};

const MAX_TRANSCRIPT_CHARS = 9000;

function getTextFromHtmlEntity(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonObjectAfterMarker(source: string, marker: string): unknown | null {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;

  const start = source.indexOf("{", markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(source.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function getCaptionTrackLabel(track: CaptionTrack): string {
  const simpleText = track.name?.simpleText;
  if (simpleText) return simpleText;
  return track.name?.runs?.map((run) => run.text ?? "").join("") ?? "";
}

export class YouTubeTranscriptSkill {
  static extractVideoId(rawUrl: string): string | null {
    if (!rawUrl.trim()) return null;

    try {
      const url = new URL(rawUrl.trim());
      const host = url.hostname.replace(/^www\./, "");

      if (host === "youtu.be") {
        return url.pathname.split("/").filter(Boolean)[0] ?? null;
      }

      if (
        host === "youtube.com" ||
        host === "m.youtube.com" ||
        host === "music.youtube.com" ||
        host === "youtube-nocookie.com"
      ) {
        if (url.pathname === "/watch") return url.searchParams.get("v");
        const segments = url.pathname.split("/").filter(Boolean);
        if (["shorts", "embed", "live"].includes(segments[0])) {
          return segments[1] ?? null;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private static async fetchMetadata(url: string) {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        { headers: { Accept: "application/json" } },
      );
      if (!response.ok) return {};

      const data = await response.json();
      return {
        title: typeof data?.title === "string" ? data.title : undefined,
        authorName: typeof data?.author_name === "string" ? data.author_name : undefined,
      };
    } catch {
      return {};
    }
  }

  private static pickCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
    if (!tracks.length) return null;

    const manualTracks = tracks.filter((track) => track.kind !== "asr");
    const candidates = manualTracks.length ? manualTracks : tracks;

    return (
      candidates.find((track) => track.languageCode?.startsWith("ko")) ??
      candidates.find((track) => /korean|한국어/i.test(getCaptionTrackLabel(track))) ??
      candidates.find((track) => track.languageCode?.startsWith("en")) ??
      candidates[0] ??
      null
    );
  }

  private static async fetchTranscript(videoId: string) {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}&hl=ko&gl=KR`;
    const pageResponse = await fetch(watchUrl, {
      headers: {
        Accept: "text/html",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    if (!pageResponse.ok) return null;

    const html = await pageResponse.text();
    const playerResponse = extractJsonObjectAfterMarker(html, "ytInitialPlayerResponse");
    if (!playerResponse || typeof playerResponse !== "object") return null;

    const captions = (playerResponse as YouTubePlayerResponse).captions
      ?.playerCaptionsTracklistRenderer?.captionTracks;
    const track = this.pickCaptionTrack(Array.isArray(captions) ? captions : []);
    if (!track?.baseUrl) return null;

    const transcriptUrl = track.baseUrl.includes("fmt=")
      ? track.baseUrl
      : `${track.baseUrl}&fmt=json3`;
    const transcriptResponse = await fetch(transcriptUrl);
    if (!transcriptResponse.ok) return null;

    const data = await transcriptResponse.json() as TranscriptResponse;
    const transcript = (Array.isArray(data?.events) ? data.events : [])
      .flatMap((event) => Array.isArray(event?.segs) ? event.segs : [])
      .map((seg) => typeof seg?.utf8 === "string" ? seg.utf8 : "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!transcript) return null;

    return {
      transcript: getTextFromHtmlEntity(transcript).slice(0, MAX_TRANSCRIPT_CHARS),
      language: track.languageCode,
    };
  }

  static async fetchContext(rawUrl: string): Promise<YouTubeVideoContext | null> {
    const videoId = this.extractVideoId(rawUrl);
    if (!videoId) return null;

    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const metadata = await this.fetchMetadata(canonicalUrl);

    try {
      const transcriptResult = await this.fetchTranscript(videoId);
      if (transcriptResult?.transcript) {
        return {
          url: canonicalUrl,
          videoId,
          ...metadata,
          transcript: transcriptResult.transcript,
          transcriptLanguage: transcriptResult.language,
          source: "transcript",
        };
      }

      return {
        url: canonicalUrl,
        videoId,
        ...metadata,
        source: "metadata",
        error: "transcript_unavailable",
      };
    } catch {
      return {
        url: canonicalUrl,
        videoId,
        ...metadata,
        source: metadata.title ? "metadata" : "unavailable",
        error: "youtube_context_failed",
      };
    }
  }
}
