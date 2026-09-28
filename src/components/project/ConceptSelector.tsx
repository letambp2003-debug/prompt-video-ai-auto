"use client";

import React, { useState } from "react";
import { Concept, Project, PedagogicalMode } from "@/types";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Brain,
  RotateCcw,
  Zap,
} from "lucide-react";

interface ConceptSelectorProps {
  project: Project;
  concepts: Concept[];
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => Promise<void>;
  onGenerateScript: () => Promise<void>;
  onReGenerateConcepts: () => Promise<void>;
  isGeneratingScript: boolean;
}

export const ConceptSelector: React.FC<ConceptSelectorProps> = ({
  project,
  concepts,
  selectedConceptId,
  onSelectConcept,
  onGenerateScript,
  onReGenerateConcepts,
  isGeneratingScript,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async (id: string) => {
    setIsSelecting(true);
    try {
      await onSelectConcept(id);
    } finally {
      setIsSelecting(false);
    }
  };

  const currentSelected = concepts.find((c) => c.id === selectedConceptId) || concepts.find((c) => c.isSelected) || concepts[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              BƯỚC 3: 10 MODE SƯ PHẠM GDPT 2018
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Gợi ý 3 Hướng Tiếp Cận Video Sư Phạm
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn 1 hướng tiếp cận kích thích tò mò nhất để AI tiến hành phân đoạn kịch bản và sinh Prompt Veo/Flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReGenerateConcepts}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Tạo lại 3 ý tưởng khác</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingScript || !currentSelected}
            onClick={onGenerateScript}
            className="px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ring-4 ring-edu-100"
          >
            {isGeneratingScript ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang phân đoạn kịch bản...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>CHỌN CONCEPT NÀY & TẠO KỊCH BẢN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Concept Cards Grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {concepts.map((concept, idx) => {
          const isSelected = concept.id === (selectedConceptId || currentSelected?.id);

          return (
            <div
              key={concept.id}
              onClick={() => handleSelect(concept.id)}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer group bg-white ${
                isSelected
                  ? "border-edu-600 shadow-md ring-4 ring-edu-50"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="space-y-3">
                {/* Header card */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isSelected
                        ? "bg-edu-600 text-white"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                    }`}
                  >
                    MODE {concept.mode}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? "bg-edu-600 text-white" : "border-2 border-slate-300"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Tiêu đề & Hook */}
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-edu-700 transition-colors">
                    {concept.title}
                  </h3>
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
                    "{concept.hook}"
                  </div>
                </div>

                {/* Lý do sư phạm */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hiệu quả sư phạm:</span>
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed pl-4">{concept.reason}</p>
                </div>

                {/* Câu hỏi kích hoạt */}
                <div className="space-y-1 text-xs pt-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-edu-600" />
                    <span>Câu hỏi chốt mở đầu:</span>
                  </span>
                  <p className="text-edu-900 font-semibold text-[11px] bg-edu-50/60 p-2 rounded-lg border border-edu-100">
                    {concept.finalQuestion}
                  </p>
                </div>
              </div>

              {/* Footer nút chọn */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(concept.id);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-edu-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isSelected ? "Đang chọn Concept này" : "Chọn Concept này"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
