import React from "react";
import { ProjectStatus, TaskType } from "@/types";
import { Check } from "lucide-react";

interface ProjectStepperProps {
  taskType: TaskType;
  status: ProjectStatus;
  activeStepId?: string;
  onStepSelect?: (stepId: string) => void;
}

interface StepItem {
  id: string;
  name: string;
  description: string;
  associatedStatuses: ProjectStatus[];
}

export const ProjectStepper: React.FC<ProjectStepperProps> = ({
  taskType,
  status,
  activeStepId,
  onStepSelect,
}) => {
  const lessonSteps: StepItem[] = [
    { id: "source", name: "1. Nguồn bài học", description: "Tải lên PDF/Ảnh", associatedStatuses: ["NEW", "SOURCE_UPLOADED", "ANALYZING_SOURCE"] },
    { id: "datapack", name: "2. DATA PACK", description: "Trích xuất & Duyệt", associatedStatuses: ["DATA_PACK_READY", "DATA_PACK_APPROVED"] },
    { id: "concepts", name: "3. Ý tưởng", description: "10 MODE sư phạm", associatedStatuses: ["CONCEPTS_READY", "MODE_SELECTED"] },
    { id: "script", name: "4. Kịch bản", description: "Phân đoạn & Khóa", associatedStatuses: ["SCRIPT_READY"] },
    { id: "storyboard", name: "5. Storyboard", description: "Từng Scene & Prompt", associatedStatuses: ["STORYBOARD_READY", "PROMPTS_READY"] },
    { id: "assets", name: "6. Tài nguyên", description: "Sinh media/Flow", associatedStatuses: ["ASSETS_IN_PROGRESS", "ASSETS_READY"] },
    { id: "qc", name: "7. Kiểm tra", description: "QC 5 chiều", associatedStatuses: ["QC_READY"] },
    { id: "export", name: "8. Xuất bản", description: "MD / JSON / ZIP", associatedStatuses: ["COMPLETED"] },
  ];

  const campaignSteps: StepItem[] = [
    { id: "topic", name: "1. Chủ đề", description: "Nhập thông điệp", associatedStatuses: ["NEW", "TOPIC_ENTERED"] },
    { id: "policy", name: "2. Chính sách", description: "Policy Gate", associatedStatuses: ["POLICY_CHECKING", "POLICY_APPROVED"] },
    { id: "concepts", name: "3. Ý tưởng", description: "Safe Concepts", associatedStatuses: ["CONCEPTS_READY", "MODE_SELECTED"] },
    { id: "script", name: "4. Kịch bản", description: "Safe Script", associatedStatuses: ["SCRIPT_READY"] },
    { id: "storyboard", name: "5. Storyboard", description: "Phân cảnh an toàn", associatedStatuses: ["STORYBOARD_READY", "PROMPTS_READY"] },
    { id: "assets", name: "6. Tài nguyên", description: "Sinh media/Flow", associatedStatuses: ["ASSETS_IN_PROGRESS", "ASSETS_READY"] },
    { id: "qc", name: "7. Kiểm tra", description: "Safety QC", associatedStatuses: ["QC_READY"] },
    { id: "export", name: "8. Xuất bản", description: "MD / JSON / ZIP", associatedStatuses: ["COMPLETED"] },
  ];

  const steps = taskType === "CAMPAIGN" ? campaignSteps : lessonSteps;

  // Tìm index của bước theo status
  let projectStatusIndex = steps.findIndex((step) => step.associatedStatuses.includes(status));
  if (projectStatusIndex === -1) {
    projectStatusIndex = 0;
  }

  // Index của activeStepId nếu có
  const activeIndex = activeStepId ? steps.findIndex((s) => s.id === activeStepId) : -1;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
        {steps.map((step, index) => {
          const isDone = index < projectStatusIndex;
          const isCurrent = activeIndex !== -1 ? index === activeIndex : index === projectStatusIndex;
          const isClickable = Boolean(onStepSelect) && (index <= Math.max(projectStatusIndex, activeIndex));

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-[110px]">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable && onStepSelect) {
                    onStepSelect(step.id);
                  }
                }}
                className={`flex items-center gap-2 text-left transition-all ${
                  isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-60"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                    isCurrent
                      ? "bg-edu-600 text-white ring-4 ring-edu-100 shadow-sm"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone && !isCurrent ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <div className="text-left">
                  <p
                    className={`text-xs leading-tight ${
                      isCurrent
                        ? "text-edu-700 font-extrabold"
                        : isDone
                        ? "text-slate-800 font-bold"
                        : "text-slate-400 font-medium"
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-[10px] text-slate-400 hidden md:block">{step.description}</p>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < projectStatusIndex ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
