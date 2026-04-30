import { GeneratedCopy } from "../types/harness";

const MIN_COPY_LENGTH = {
    danggeun: 360,
    joonggonara: 420,
    bungae: 320,
} as const;
const MIN_CONTENT_BLOCKS = 3;
const TEMPLATE_MARKER_REGEX = /\[(?:사진 관찰|추가 안내|문의 안내|입력된 특징|거래 안내|상품명)\]/;
const META_COPY_REGEX =
    /입력해주신 내용|읽기 쉽게 정리|안내드립니다|핵심 정보를|제공된 정보|상세히 정리|문의 주시면 입력된 정보 범위|본 문구는|기준으로 정리했습니다/;


export class TextProcessingSkill {
    public static normalizeSeoTags(raw: unknown): string[] {
        if (!Array.isArray(raw)) return [];
        const deduped = new Set<string>();
        for (const tag of raw) {
            const normalized = String(tag ?? "").trim().replace(/^#+/, "");
            if (!normalized || normalized.length > 30) continue;
            deduped.add(normalized);
            if (deduped.size >= 8) break;
        }
        return Array.from(deduped);
    }

    public static normalizeGeneratedCopy(raw: unknown): GeneratedCopy | null {
        if (!raw || typeof raw !== "object") return null;
        const candidate = raw as Record<string, unknown>;
        if (typeof candidate.danggeun !== "string" || typeof candidate.joonggonara !== "string" || typeof candidate.bungae !== "string") {
            return null;
        }
        return {
            danggeun: candidate.danggeun.trim(),
            joonggonara: candidate.joonggonara.trim(),
            bungae: candidate.bungae.trim(),
            seo_tags: this.normalizeSeoTags(candidate.seo_tags),
        };
    }

    public static extractTextFromModelContent(content: unknown): string {
        if (typeof content === "string") return content;
        if (!Array.isArray(content)) return "";
        return content.map((part) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object" && "text" in part) {
                const text = (part as { text?: unknown }).text;
                return typeof text === "string" ? text : "";
            }
            return "";
        }).join("\n").trim();
    }

    public static extractJsonPayload(raw: string): unknown | null {
        const normalized = raw.trim().replace(/^\uFEFF/, "");
        if (!normalized) return null;
        const tryParse = (val: string) => { try { return JSON.parse(val); } catch { return null; } };
        let result = tryParse(normalized);
        if (result) return result;
        const fenced = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
        if (fenced) { result = tryParse(fenced); if (result) return result; }
        const firstBrace = normalized.indexOf("{");
        const lastBrace = normalized.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            result = tryParse(normalized.slice(firstBrace, lastBrace + 1));
            if (result) return result;
        }
        return null;
    }

    public static isLowQualityCopy(copy: GeneratedCopy): boolean {
        const blockCount = (text: string) => text.split(/\n{2,}/).filter(Boolean).length;
        const hasTemplatedSections =
            TEMPLATE_MARKER_REGEX.test(copy.danggeun) || META_COPY_REGEX.test(copy.danggeun) ||
            TEMPLATE_MARKER_REGEX.test(copy.joonggonara) || META_COPY_REGEX.test(copy.joonggonara) ||
            TEMPLATE_MARKER_REGEX.test(copy.bungae) || META_COPY_REGEX.test(copy.bungae);
        return (
            copy.danggeun.length < MIN_COPY_LENGTH.danggeun ||
            copy.joonggonara.length < MIN_COPY_LENGTH.joonggonara ||
            copy.bungae.length < MIN_COPY_LENGTH.bungae ||
            blockCount(copy.danggeun) < MIN_CONTENT_BLOCKS ||
            blockCount(copy.joonggonara) < MIN_CONTENT_BLOCKS ||
            blockCount(copy.bungae) < MIN_CONTENT_BLOCKS ||
            copy.seo_tags.length < 5 || hasTemplatedSections
        );
    }
}
