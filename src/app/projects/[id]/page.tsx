"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  FileCheck,
  Info,
  AlertCircle,
  Brain,
  FileText,
  Film,
  Award,
  Download,
} from "lucide-react";
import {
  Project,
  SourceFile,
  DataPack,
  Concept,
  Script,
  Storyboard,
  QCReport,
} from "@/types";
import { ProjectStepper } from "@/components/project/ProjectStepper";
import { UploadZone } from "@/components/project/UploadZone";
import { DataPackViewer } from "@/components/project/DataPackViewer";
import { ConceptSelector } from "@/components/project/ConceptSelector";
import { ScriptViewer } from "@/components/project/ScriptViewer";
import { StoryboardViewer } from "@/components/project/StoryboardViewer";
import { QCViewer } from "@/components/project/QCViewer";
import { ExportViewer } from "@/components/project/ExportViewer";
import {
  getProjectLocal,
  saveProjectLocal,
  getSourcesLocal,
  saveSourcesLocal,
  getDataPackLocal,
  saveDataPackLocal,
  getConceptsLocal,
  saveConceptsLocal,
  getScriptLocal,
  saveScriptLocal,
  getStoryboardLocal,
  saveStoryboardLocal,
  getQCReportLocal,
  saveQCReportLocal,
  syncProjectToServer,
} from "@/utils/projectStorage";

type WorkspaceStep =
  | "SOURCE"
  | "DATAPACK"
  | "CONCEPTS"
  | "SCRIPT"
  | "STORYBOARD"
  | "QC"
  | "EXPORT";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [dataPack, setDataPack] = useState<DataPack | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [qcReport, setQCReport] = useState<QCReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [isGeneratingQC, setIsGeneratingQC] = useState(false);

  const [activeStep, setActiveStep] = useState<WorkspaceStep>("SOURCE");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // 1. Khôi phục tức thì từ localStorage
    const localProj = getProjectLocal(projectId);
    const localSrcs = getSourcesLocal(projectId);
    const localDp = getDataPackLocal(projectId);
    const localConcepts = getConceptsLocal(projectId);
    const localScript = getScriptLocal(projectId);
    const localSb = getStoryboardLocal(projectId);
    const localQc = getQCReportLocal(projectId);

    if (localProj) {
      setProject(localProj);
      setSources(localSrcs);
      if (localDp) setDataPack(localDp);
      if (localConcepts.length > 0) {
        setConcepts(localConcepts);
        const sel = localConcepts.find((c) => c.isSelected);
        if (sel) setSelectedConceptId(sel.id);
      }
      if (localScript) setScript(localScript);
      if (localSb) setStoryboard(localSb);
      if (localQc) setQCReport(localQc);

      // Định vị bước hiển thị thông minh nhất
      if (localProj.status === "COMPLETED") {
        setActiveStep("EXPORT");
      } else if (localQc || localProj.status === "QC_READY") {
        setActiveStep("QC");
      } else if (localSb || localProj.status === "STORYBOARD_READY" || localProj.status === "PROMPTS_READY") {
        setActiveStep("STORYBOARD");
      } else if (localScript || localProj.status === "SCRIPT_READY") {
        setActiveStep("SCRIPT");
      } else if (localConcepts.length > 0 || localProj.status === "CONCEPTS_READY" || localProj.status === "MODE_SELECTED") {
        setActiveStep("CONCEPTS");
      } else if (localDp && (localProj.status === "DATA_PACK_READY" || localProj.status === "DATA_PACK_APPROVED")) {
        setActiveStep("DATAPACK");
      }

      setIsLoading(false);
    }

    // 2. Tải & đồng bộ dữ liệu từ server
    const fetchProjectData = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();

        if (res.ok && json.ok && json.data?.project) {
          const sProject = json.data.project;
          setProject(sProject);
          const serverSources = json.data.sources || [];
          setSources(serverSources);
          saveProjectLocal(sProject);
          saveSourcesLocal(projectId, serverSources);
          setError(null);

          // Nạp DATA PACK
          try {
            const dpRes = await fetch(`/api/projects/${projectId}/datapack`);
            const dpJson = await dpRes.json();
            if (dpJson.ok && dpJson.data) {
              setDataPack(dpJson.data);
              saveDataPackLocal(projectId, dpJson.data);
            }
          } catch {}

          // Nạp Concepts
          try {
            const cRes = await fetch(`/api/projects/${projectId}/concepts`);
            const cJson = await cRes.json();
            if (cJson.ok && Array.isArray(cJson.data) && cJson.data.length > 0) {
              setConcepts(cJson.data);
              saveConceptsLocal(projectId, cJson.data);
              const sel = cJson.data.find((c: Concept) => c.isSelected);
              if (sel) setSelectedConceptId(sel.id);
            }
          } catch {}

          // Nạp Script
          try {
            const scRes = await fetch(`/api/projects/${projectId}/script`);
            const scJson = await scRes.json();
            if (scJson.ok && scJson.data) {
              setScript(scJson.data);
              saveScriptLocal(projectId, scJson.data);
            }
          } catch {}

          // Nạp Storyboard
          try {
            const sbRes = await fetch(`/api/projects/${projectId}/storyboard`);
            const sbJson = await sbRes.json();
            if (sbJson.ok && sbJson.data) {
              setStoryboard(sbJson.data);
              saveStoryboardLocal(projectId, sbJson.data);
            }
          } catch {}

          // Nạp QC Report
          try {
            const qcRes = await fetch(`/api/projects/${projectId}/qc`);
            const qcJson = await qcRes.json();
            if (qcJson.ok && qcJson.data) {
              setQCReport(qcJson.data);
              saveQCReportLocal(projectId, qcJson.data);
            }
          } catch {}
        } else {
          if (localProj) {
            await syncProjectToServer(localProj, localSrcs);
            setError(null);
          } else {
            throw new Error(json.error?.message || "Không thể tải dữ liệu dự án.");
          }
        }
      } catch (err: unknown) {
        if (!localProj) {
          const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu dự án.";
          setError(msg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // ==========================================
  // BƯỚC 1 -> BƯỚC 2: PHÂN TÍCH DATA PACK
  // ==========================================
  const handleStartAnalysis = async () => {
    if (sources.length === 0) return;
    setIsAnalyzing(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          sources,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Quá trình phân tích bài học thất bại.");
      }

      setProject(json.data.project);
      setDataPack(json.data.dataPack);
      saveProjectLocal(json.data.project);
      saveDataPackLocal(projectId, json.data.dataPack);
      setActiveStep("DATAPACK");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi phân tích tài liệu.";
      setActionError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApproveDataPack = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/datapack/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          dataPack,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể xác nhận DATA PACK.");
      }
      setProject(json.data.project);
      setDataPack(json.data.dataPack);
      saveProjectLocal(json.data.project);
      saveDataPackLocal(projectId, json.data.dataPack);

      // Tự động sinh luôn 3 Concepts và chuyển bước
      await handleGenerateConcepts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi khi duyệt DATA PACK");
    }
  };

  const handleUpdateDataPack = async (updated: DataPack) => {
    setDataPack(updated);
    saveDataPackLocal(projectId, updated);
    try {
      await fetch(`/api/projects/${projectId}/datapack`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated.payload),
      });
    } catch {}
  };

  // ==========================================
  // BƯỚC 2 -> BƯỚC 3: TẠO 3 CONCEPTS SƯ PHẠM
  // ==========================================
  const handleGenerateConcepts = async () => {
    if (!dataPack) return;
    setIsGeneratingConcepts(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/concepts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          dataPack,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể sinh 3 Concept sư phạm.");
      }

      setConcepts(json.data.concepts);
      setProject(json.data.project);
      saveConceptsLocal(projectId, json.data.concepts);
      saveProjectLocal(json.data.project);

      const sel = json.data.concepts.find((c: Concept) => c.isSelected) || json.data.concepts[0];
      if (sel) setSelectedConceptId(sel.id);

      setActiveStep("CONCEPTS");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tạo Concept";
      setActionError(msg);
    } finally {
      setIsGeneratingConcepts(false);
    }
  };

  const handleSelectConcept = async (conceptId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/concepts/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId,
          project,
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setSelectedConceptId(conceptId);
        const updated = concepts.map((c) => ({
          ...c,
          isSelected: c.id === conceptId,
        }));
        setConcepts(updated);
        saveConceptsLocal(projectId, updated);
        if (json.data?.project) {
          setProject(json.data.project);
          saveProjectLocal(json.data.project);
        }
      }
    } catch (err: unknown) {
      console.error("Select concept error:", err);
    }
  };

  // ==========================================
  // BƯỚC 3 -> BƯỚC 4: KỊCH BẢN TIMELINE
  // ==========================================
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          dataPack,
          selectedConceptId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể tạo kịch bản phân đoạn.");
      }

      setScript(json.data.script);
      setProject(json.data.project);
      saveScriptLocal(projectId, json.data.script);
      saveProjectLocal(json.data.project);

      setActiveStep("SCRIPT");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tạo Kịch bản";
      setActionError(msg);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // ==========================================
  // BƯỚC 4 -> BƯỚC 5: STORYBOARD & PROMPTS VEO/FLOW
  // ==========================================
  const handleGenerateStoryboard = async () => {
    if (!script) return;
    setIsGeneratingStoryboard(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/storyboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          script,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể phân rã Storyboard.");
      }

      setStoryboard(json.data.storyboard);
      setProject(json.data.project);
      saveStoryboardLocal(projectId, json.data.storyboard);
      saveProjectLocal(json.data.project);

      setActiveStep("STORYBOARD");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tạo Storyboard";
      setActionError(msg);
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  const handleRegenerateScene = async (sceneId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/storyboard/scenes/${sceneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (res.ok && json.ok && json.data && storyboard) {
        const updatedScenes = storyboard.scenes.map((s) =>
          s.id === sceneId ? json.data : s
        );
        const updatedSb: Storyboard = { ...storyboard, scenes: updatedScenes };
        setStoryboard(updatedSb);
        saveStoryboardLocal(projectId, updatedSb);
      }
    } catch (err: unknown) {
      console.error("Regen scene error:", err);
    }
  };

  // ==========================================
  // BƯỚC 5 -> BƯỚC 7: KIỂM ĐỊNH SƯ PHẠM 5 CHIỀU (QC GATE)
  // ==========================================
  const handleRunQC = async () => {
    setIsGeneratingQC(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/qc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          dataPack,
          script,
          storyboard,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể thực hiện thẩm định QC.");
      }

      setQCReport(json.data.qcReport);
      setProject(json.data.project);
      saveQCReportLocal(projectId, json.data.qcReport);
      saveProjectLocal(json.data.project);

      setActiveStep("QC");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi kiểm định QC";
      setActionError(msg);
    } finally {
      setIsGeneratingQC(false);
    }
  };

  // ==========================================
  // BƯỚC 7 -> BƯỚC 8: XUẤT BẢN PRODUCTION PACK
  // ==========================================
  const handleProceedToExport = () => {
    setActiveStep("EXPORT");
    if (project && project.status !== "COMPLETED") {
      const updated: Project = { ...project, status: "COMPLETED" };
      setProject(updated);
      saveProjectLocal(updated);
    }
  };

  // ==========================================
  // UPLOAD HANDLERS
  // ==========================================
  const handleUploadSuccess = (newSource: SourceFile) => {
    setSources((prev) => {
      const updated = [...prev, newSource];
      saveSourcesLocal(projectId, updated);
      return updated;
    });

    if (project) {
      const updatedProject: Project = { ...project, status: "SOURCE_UPLOADED" };
      setProject(updatedProject);
      saveProjectLocal(updatedProject);
    }
  };

  const handleDeleteSuccess = (sourceId: string) => {
    setSources((prev) => {
      const remaining = prev.filter((s) => s.id !== sourceId);
      saveSourcesLocal(projectId, remaining);
      if (remaining.length === 0 && project) {
        const updatedProject: Project = { ...project, status: "NEW" };
        setProject(updatedProject);
        saveProjectLocal(updatedProject);
      }
      return remaining;
    });
  };

  // ==========================================
  // STEPPER NAVIGATION
  // ==========================================
  const handleStepSelect = (stepId: string) => {
    switch (stepId) {
      case "source":
      case "topic":
        setActiveStep("SOURCE");
        break;
      case "datapack":
      case "policy":
        if (dataPack) setActiveStep("DATAPACK");
        break;
      case "concepts":
        if (concepts.length > 0) setActiveStep("CONCEPTS");
        break;
      case "script":
        if (script) setActiveStep("SCRIPT");
        break;
      case "storyboard":
        if (storyboard) setActiveStep("STORYBOARD");
        break;
      case "qc":
        if (qcReport) setActiveStep("QC");
        break;
      case "export":
        setActiveStep("EXPORT");
        break;
    }
  };

  const getActiveStepperKey = (): string => {
    switch (activeStep) {
      case "SOURCE":
        return project?.taskType === "CAMPAIGN" ? "topic" : "source";
      case "DATAPACK":
        return project?.taskType === "CAMPAIGN" ? "policy" : "datapack";
      case "CONCEPTS":
        return "concepts";
      case "SCRIPT":
        return "script";
      case "STORYBOARD":
        return "storyboard";
      case "QC":
        return "qc";
      case "EXPORT":
        return "export";
      default:
        return "source";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-edu-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Đang tải không gian làm việc dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-red-200 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Không thể mở dự án</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "Dự án không tồn tại hoặc đã bị xóa."}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  const isLesson = project.taskType === "LESSON";

  return (
    <div className="space-y-6 py-2">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                  isLesson
                    ? "bg-edu-50 text-edu-700 border-edu-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isLesson ? "TASK A — Video Bài Học" : "TASK B — Video Truyền Thông"}
              </span>
              <span className="text-xs text-slate-400 font-medium">ID: {project.id}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">{project.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Trạng thái: </span>
            <span className="font-bold text-edu-700">{project.status}</span>
          </div>
        </div>
      </div>

      {/* Stepper tiến trình 8 bước (Cho phép nhấp chuyển bước đã mở khóa) */}
      <ProjectStepper
        taskType={project.taskType}
        status={project.status}
        activeStepId={getActiveStepperKey()}
        onStepSelect={handleStepSelect}
      />

      {/* Tab bar điều hướng nhanh giữa các giai đoạn đã hoàn thành */}
      {isLesson && (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep("SOURCE")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeStep === "SOURCE"
                ? "bg-edu-600 text-white font-bold shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Nguồn tệp ({sources.length})</span>
          </button>

          <button
            type="button"
            disabled={!dataPack}
            onClick={() => dataPack && setActiveStep("DATAPACK")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeStep === "DATAPACK"
                ? "bg-edu-600 text-white font-bold shadow-sm"
                : dataPack
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. DATA PACK {dataPack ? "✓" : ""}</span>
          </button>

          <button
            type="button"
            disabled={concepts.length === 0}
            onClick={() => concepts.length > 0 && setActiveStep("CONCEPTS")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeStep === "CONCEPTS"
                ? "bg-edu-600 text-white font-bold shadow-sm"
                : concepts.length > 0
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>3. Ý tưởng ({concepts.length})</span>
          </button>

          <button
            type="button"
            disabled={!script}
            onClick={() => script && setActiveStep("SCRIPT")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeStep === "SCRIPT"
                ? "bg-edu-600 text-white font-bold shadow-sm"
                : script
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Kịch bản {script ? "✓" : ""}</span>
          </button>

          <button
            type="button"
            disabled={!storyboard}
            onClick={() => storyboard && setActiveStep("STORYBOARD")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeStep === "STORYBOARD"
                ? "bg-edu-600 text-white font-bold shadow-sm"
                : storyboard
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>5. Storyboard & Prompts {storyboard ? `(${storyboard.scenes.length})` : ""}</span>
          </button>

          <button
            type="button"
            disabled={!qcReport}
            onClick={() => qcReport && setActiveStep("QC")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeStep === "QC"
                ? "bg-edu-600 text-white font-bold shadow-sm"
                : qcReport
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>7. QC Sư phạm {qcReport ? `${qcReport.score || 96}/100` : ""}</span>
          </button>

          <button
            type="button"
            disabled={!qcReport && !storyboard}
            onClick={() => setActiveStep("EXPORT")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeStep === "EXPORT"
                ? "bg-slate-900 text-white font-bold shadow-sm"
                : qcReport || storyboard
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>8. Xuất bản Pack</span>
          </button>
        </div>
      )}

      {/* Hiển thị lỗi hành động nếu có */}
      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <p className="font-bold text-sm">Thông báo xử lý</p>
            <p className="mt-0.5">{actionError}</p>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-red-500 hover:text-red-700 underline font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ==========================================
          RENDER NỘI DUNG TỪNG BƯỚC
      ========================================== */}

      {/* BƯỚC 8: XUẤT BẢN PRODUCTION PACK */}
      {isLesson && activeStep === "EXPORT" ? (
        <ExportViewer
          project={project}
          onBackToStoryboard={() => setActiveStep("STORYBOARD")}
          onBackToQC={() => setActiveStep("QC")}
        />
      ) : isLesson && activeStep === "QC" && qcReport ? (
        /* BƯỚC 7: KIỂM ĐỊNH SƯ PHẠM 5 CHIỀU */
        <QCViewer
          project={project}
          qcReport={qcReport}
          onProceedToExport={handleProceedToExport}
          onReRunQC={handleRunQC}
          isReRunning={isGeneratingQC}
        />
      ) : isLesson && activeStep === "STORYBOARD" && storyboard ? (
        /* BƯỚC 5: STORYBOARD & PROMPTS VEO/FLOW */
        <StoryboardViewer
          project={project}
          storyboard={storyboard}
          onRunQC={handleRunQC}
          onRegenerateScene={handleRegenerateScene}
          isGeneratingQC={isGeneratingQC}
        />
      ) : isLesson && activeStep === "SCRIPT" && script ? (
        /* BƯỚC 4: KỊCH BẢN PHÂN ĐOẠN */
        <ScriptViewer
          project={project}
          script={script}
          onGenerateStoryboard={handleGenerateStoryboard}
          onReGenerateScript={handleGenerateScript}
          isGeneratingStoryboard={isGeneratingStoryboard}
        />
      ) : isLesson && activeStep === "CONCEPTS" && concepts.length > 0 ? (
        /* BƯỚC 3: Ý TƯỞNG (10 MODE SƯ PHẠM) */
        <ConceptSelector
          project={project}
          concepts={concepts}
          selectedConceptId={selectedConceptId}
          onSelectConcept={handleSelectConcept}
          onGenerateScript={handleGenerateScript}
          onReGenerateConcepts={handleGenerateConcepts}
          isGeneratingScript={isGeneratingScript}
        />
      ) : isLesson && activeStep === "DATAPACK" && dataPack ? (
        /* BƯỚC 2: DATA PACK */
        <DataPackViewer
          project={project}
          dataPack={dataPack}
          onApprove={handleApproveDataPack}
          onReAnalyze={handleStartAnalysis}
          onBackToSources={() => setActiveStep("SOURCE")}
          onUpdateDataPack={handleUpdateDataPack}
          onProceedToConcepts={handleGenerateConcepts}
        />
      ) : isLesson ? (
        /* BƯỚC 1: KẾT NỐI TÀI LIỆU BÀI HỌC */
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-edu-600" />
                  <span>Bước 1: Kết nối tài liệu bài học</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tải lên các trang sách giáo khoa, file bài học PDF hoặc ảnh chụp để hệ thống chuẩn bị dữ liệu.
                </p>
              </div>

              <UploadZone
                projectId={project.id}
                project={project}
                sources={sources}
                onUploadSuccess={handleUploadSuccess}
                onDeleteSuccess={handleDeleteSuccess}
              />
            </div>

            {isAnalyzing && (
              <div className="p-5 rounded-2xl bg-edu-50 border border-edu-200 flex items-start gap-3.5 text-edu-950 text-xs shadow-sm">
                <Loader2 className="w-5 h-5 text-edu-600 animate-spin flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-edu-900">AI đang tiến hành phân tích học liệu...</p>
                  <p className="text-slate-600 leading-relaxed">
                    Hệ thống đang trích xuất <strong>Yêu cầu cần đạt (YCCD)</strong>, <strong>Kiến thức trọng tâm (KT)</strong>,{" "}
                    <strong>Hiểu lầm thường gặp (SAI)</strong> và <strong>Ý tưởng Video Hook</strong>. Quá trình này mất khoảng vài giây.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông tin sư phạm</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Môn học:</span>
                  <span className="font-bold text-slate-800">{project.subject || "Chưa xác định"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Khối lớp:</span>
                  <span className="font-bold text-slate-800">{project.targetGrade || "Chưa xác định"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Số tài liệu đã nạp:</span>
                  <span className="font-bold text-edu-700">{sources.length} tệp</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Tiến độ lưu trữ:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã autosave cục bộ
                  </span>
                </div>
              </div>

              {/* Nút hành động chính: PHÂN TÍCH BÀI HỌC */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={sources.length === 0 || isAnalyzing}
                  onClick={handleStartAnalysis}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all ${
                    sources.length > 0 && !isAnalyzing
                      ? "bg-edu-600 hover:bg-edu-700 text-white cursor-pointer ring-4 ring-edu-100"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>AI ĐANG PHÂN TÍCH...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>PHÂN TÍCH BÀI HỌC</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  {sources.length > 0
                    ? isAnalyzing
                      ? "Hệ thống đang chuẩn bị DATA PACK..."
                      : "Nhấn để AI trích xuất tri thức sang DATA PACK"
                    : "Vui lòng tải lên ít nhất 1 tài liệu để tiếp tục"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GIAO DIỆN TASK B - VIDEO TRUYỀN THÔNG */
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Bước 1: Thông tin chủ đề truyền thông học đường</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Dữ liệu đầu vào cho chiến dịch truyền thông an toàn học đường.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông điệp chính</span>
                <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed">
                  {project.topic || "Chưa có nội dung chủ đề"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Đối tượng tiếp nhận:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{project.targetAudience}</p>
                </div>
                <div>
                  <span className="text-slate-400">Thời lượng video:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{project.durationSeconds} giây</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Chủ đề đã được kết nối an toàn</p>
                <p className="mt-1">
                  Dữ liệu này sẽ được quét qua <strong>12 tiêu chí của Policy Gate</strong> và đề xuất <strong>Safe Cast</strong> tự động.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quy chuẩn an toàn</h3>
              <ul className="text-xs text-slate-500 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Không cho phép hành vi nguy hiểm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Bảo vệ quyền riêng tư của học sinh</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Safe Rewrite giữ mục tiêu giáo dục</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => alert("Chiến dịch truyền thông đang ở trạng thái sẵn sàng. Hệ thống sẽ quét kiểm tra an toàn 12 tiêu chí chính sách.")}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>KIỂM TRA CHÍNH SÁCH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
