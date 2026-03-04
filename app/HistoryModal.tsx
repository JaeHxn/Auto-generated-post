"use client";

import { useEffect, useState } from "react";
import { Copy, Star, X, Loader2 } from "lucide-react";
import { getUserHistories, toggleFavoriteHistory } from "./actions";
import { HistoryRow } from "@/lib/supabase";

export default function HistoryModal({ onClose }: { onClose: () => void }) {
    const [histories, setHistories] = useState<HistoryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadHistories();
    }, []);

    const loadHistories = async () => {
        setLoading(true);
        const res = await getUserHistories();
        if (res.success && res.data) {
            setHistories(res.data);
        }
        setLoading(false);
    };

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        // 옵티미스틱 업데이트
        setHistories(prev => prev.map(h => h.id === id ? { ...h, is_favorite: newStatus } : h));
        const res = await toggleFavoriteHistory(id, newStatus);
        if (!res.success) {
            // 롤백
            setHistories(prev => prev.map(h => h.id === id ? { ...h, is_favorite: currentStatus } : h));
            alert("즐겨찾기 상태 변경에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
            <div className="relative z-10 bg-gradient-to-br from-[#1a1030] to-[#0d0720] border border-white/10 rounded-[32px] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_80px_rgba(140,82,255,0.4)]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        내 작성 기록 보관함 📦
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-white/50">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            불러오는 중...
                        </div>
                    ) : histories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-white/50 text-center">
                            <div className="text-4xl mb-4">👻</div>
                            아직 작성한 판매글이 없습니다.<br />
                            매직 셀러로 첫 작품을 만들어보세요!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {histories.map((item) => (
                                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-[#ffde00] font-bold text-lg">{item.item_name}</div>
                                            <div className="text-white/50 text-xs mt-1">
                                                {new Date(item.created_at).toLocaleString("ko-KR")}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleFavorite(item.id, item.is_favorite)}
                                                className={`p-2 rounded-full transition-colors ${item.is_favorite ? "text-[#ffde00] bg-[#ffde00]/10" : "text-white/30 hover:text-white hover:bg-white/10"}`}
                                                title={item.is_favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                                            >
                                                <Star fill={item.is_favorite ? "currentColor" : "none"} size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleCopy(item.id, item.generated_text)}
                                                className={`p-2 rounded-full transition-colors ${copiedId === item.id ? "text-green-400 bg-green-400/10" : "text-[#00c9ff] bg-[#00c9ff]/10 hover:bg-[#00c9ff]/20"}`}
                                                title="내용 복사"
                                            >
                                                {copiedId === item.id ? <span className="text-xs font-bold px-1">복사됨!</span> : <Copy size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-white/70 text-sm mb-4 line-clamp-2 italic border-l-2 border-white/20 pl-3">
                                        &quot;{item.item_details}&quot;
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl text-white/90 text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {item.generated_text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
