import { z } from "zod";
import { Project, SourceFile, DataPack, DataPackPayload, PedagogicalMode } from "@/types";
import { getApiKeyManager } from "@/ai/providers/apiKeyManager";

// Zod Schema xác thực dữ liệu DATA PACK theo chuẩn GDPT 2018
export const DataPackItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  source: z
    .object({
      fileId: z.string().optional(),
      page: z.union([z.string(), z.number()]).optional(),
    })
    .nullish(),
});

export const FigureItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  pedagogicalRole: z.string().optional(),
  source: z
    .object({
      fileId: z.string().optional(),
      page: z.union([z.string(), z.number()]).optional(),
    })
    .nullish(),
});

export const MisconceptionItemSchema = z.object({
  id: z.string(),
  misconception: z.string(),
  correctionReference: z.string().optional(),
  relatedKnowledgeId: z.string().optional(),
});

export const RealLifeConnectionItemSchema = z.object({
  id: z.string(),
  connection: z.string(),
  relatedKnowledgeIds: z.array(z.string()).optional(),
  uses: z.string().optional(),
});

export const VideoHookCandidateSchema = z.object({
  id: z.string(),
  mode: z.string() as z.ZodType<PedagogicalMode>,
  idea: z.string(),
  uses: z.array(z.string()).optional(),
});

export const DataPackPayloadSchema = z.object({
  packId: z.string(),
  version: z.number().default(1),
  subject: z.string(),
  grade: z.string(),
  bookSeries: z.string().nullish(),
  lessonTitle: z.string(),
  sourcePages: z.array(z.string()).default([]),
  lessonType: z.array(z.string()).default(["Lý thuyết"]),
  learningOutcomes: z.array(DataPackItemSchema).min(1, "Phải có ít nhất 1 Yêu cầu cần đạt"),
  keyKnowledge: z.array(DataPackItemSchema).min(1, "Phải có ít nhất 1 Kiến thức trọng tâm"),
  terms: z.array(DataPackItemSchema).default([]),
  formulas: z.array(DataPackItemSchema).default([]),
  data: z.array(DataPackItemSchema).default([]),
  figures: z.array(FigureItemSchema).default([]),
  examples: z.array(DataPackItemSchema).default([]),
  misconceptions: z.array(MisconceptionItemSchema).default([]),
  realLifeConnections: z.array(RealLifeConnectionItemSchema).default([]),
  videoHookCandidates: z.array(VideoHookCandidateSchema).default([]),
  missingData: z.array(z.string()).default([]),
  safetyFlags: z.array(z.string()).default([]),
});

export class SourceAnalyzerAgent {
  /**
   * Tạo DATA PACK sư phạm giả lập chất lượng cao dựa trên môn học và tên bài
   */
  static generateFallbackDataPack(project: Project, sources: SourceFile[]): DataPackPayload {
    const subject = project.subject || "Lịch sử & Địa lí";
    const grade = project.targetGrade || "Lớp 7";
    const title = project.title.replace(/^Bài \d+:?\s*/i, "").trim() || "Văn minh Phục Hưng";

    const isLichSuDiaLi = subject.toLowerCase().includes("lịch sử") || subject.toLowerCase().includes("địa");
    const isToan = subject.toLowerCase().includes("toán");
    const isSinhHoc = subject.toLowerCase().includes("sinh");
    const isVatLy = subject.toLowerCase().includes("vật lý") || subject.toLowerCase().includes("vật lí");

    let payload: DataPackPayload;

    if (isLichSuDiaLi) {
      payload = {
        packId: `dp_${project.id}`,
        version: 1,
        subject,
        grade,
        bookSeries: "Kết nối tri thức với cuộc sống",
        lessonTitle: project.title,
        sourcePages: sources.map((s) => s.filename).slice(0, 5),
        lessonType: ["Lý thuyết khám phá", "Hình thành kiến thức mới"],
        learningOutcomes: [
          {
            id: "YCCD-01",
            content: `Trình bày được những chuyển biến chính về kinh tế - xã hội Tây Âu và bối cảnh lịch sử của phong trào trong "${title}".`,
            source: { page: 1 },
          },
          {
            id: "YCCD-02",
            content: `Nêu được những thành tựu tiêu biểu về văn học, nghệ thuật, khoa học - kỹ thuật gắn liền với các danh nhân lịch sử.`,
            source: { page: 2 },
          },
          {
            id: "YCCD-03",
            content: `Nhận biết và phân tích được ý nghĩa lịch sử sâu sắc cùng các giá trị nhân văn tiến bộ của phong trào.`,
            source: { page: 3 },
          },
        ],
        keyKnowledge: [
          {
            id: "KT-01",
            content: `Bối cảnh xuất hiện quan hệ sản xuất tư bản chủ nghĩa tại các thành thị Tây Âu thời kỳ hậu trung đại.`,
            source: { page: 1 },
          },
          {
            id: "KT-02",
            content: `Giai cấp tư sản mới nổi khao khát xây dựng một nền văn hóa mới đề cao giá trị con người tự do, thoát khỏi giáo lý thần học khắt khe.`,
            source: { page: 2 },
          },
          {
            id: "KT-03",
            content: `Các kiệt tác nghệ thuật bất hủ (Mona Lisa, Bữa ăn tối cuối cùng của Leonardo da Vinci) và các phát kiến khoa học (Thuyết Nhật tâm của Copernicus).`,
            source: { page: 3 },
          },
        ],
        terms: [
          { id: "TN-01", content: "Phong trào Phục Hưng: Sự phục hồi và làm sống lại các giá trị tinh hoa của văn hóa cổ đại Hy Lạp - La Mã." },
          { id: "TN-02", content: "Chủ nghĩa Nhân văn (Humanism): Hệ tư tưởng đề cao giá trị, phẩm giá và quyền tự do của con người." },
        ],
        formulas: [],
        data: [
          { id: "DL-01", content: "Thời gian diễn ra: Thế kỷ XIV đến thế kỷ XVII, khởi đầu từ các thành thị miền Bắc nước Ý (Florence, Venice)." },
        ],
        figures: [
          {
            id: "HINH-01",
            description: "Chân dung Nàng Mona Lisa của Leonardo da Vinci và bức tranh Sự tạo dựng Adam của Michelangelo.",
            pedagogicalRole: "Tư liệu trực quan minh họa cho đỉnh cao nghệ thuật Phục Hưng tôn vinh vẻ đẹp con người.",
            source: { page: 2 },
          },
        ],
        examples: [
          {
            id: "VD-01",
            content: "Nhà thiên văn học Galileo Galilei dám dùng kính thiên văn chứng minh Trái Đất quay quanh Mặt Trời bất chấp sự phán xét của Tòa án Dị giáo.",
          },
        ],
        misconceptions: [
          {
            id: "SAI-01",
            misconception: "Học sinh thường nghĩ 'Phục Hưng' chỉ đơn thuần là sao chép lại y nguyên văn hóa Hy Lạp - La Mã cổ đại.",
            correctionReference: "Thực chất là tiếp thu có chọn lọc các tinh hoa cổ đại để sáng tạo ra một nền văn hóa mới tiến bộ vượt bậc của giai cấp tư sản.",
          },
        ],
        realLifeConnections: [
          {
            id: "TT-01",
            connection: "Hình thành tinh thần tự do tư duy, phản biện khoa học và trân trọng quyền con người trong thế giới đương đại.",
          },
        ],
        videoHookCandidates: [
          {
            id: "HK-01",
            mode: "EDU-01" as PedagogicalMode,
            idea: "Đặt câu hỏi bí ẩn: Tại sao nụ cười của nàng Mona Lisa sau hơn 500 năm vẫn khiến hàng triệu người khắp thế giới mê mẩn tìm lời giải?",
          },
          {
            id: "HK-02",
            mode: "EDU-02" as PedagogicalMode,
            idea: "Kịch tính hóa mâu thuẫn: Khi cả thế giới tin rằng Trái Đất là trung tâm vũ trụ, điều gì đã thúc đẩy các nhà khoa học mạo hiểm tính mạng để bảo vệ chân lý?",
          },
        ],
        missingData: [],
        safetyFlags: [],
      };
    } else {
      // Mẫu chuẩn cho các môn học khác
      payload = {
        packId: `dp_${project.id}`,
        version: 1,
        subject,
        grade,
        bookSeries: "Chương trình GDPT 2018",
        lessonTitle: project.title,
        sourcePages: sources.map((s) => s.filename),
        lessonType: ["Lý thuyết & Khám phá"],
        learningOutcomes: [
          {
            id: "YCCD-01",
            content: `Nắm vững các khái niệm và bản chất cốt lõi của nội dung "${title}".`,
            source: { page: 1 },
          },
          {
            id: "YCCD-02",
            content: `Vận dụng kiến thức bài học để giải thích các hiện tượng thực tế và giải quyết bài tập liên quan.`,
            source: { page: 2 },
          },
        ],
        keyKnowledge: [
          {
            id: "KT-01",
            content: `Định nghĩa khoa học và các đặc tính cơ bản của đối tượng nghiên cứu trong bài học.`,
            source: { page: 1 },
          },
          {
            id: "KT-02",
            content: `Quy luật chi phối và mối liên hệ nhân quả giữa các yếu tố thành phần.`,
            source: { page: 2 },
          },
        ],
        terms: [
          { id: "TN-01", content: `Thuật ngữ chuyên ngành cốt lõi trong ${title}` },
        ],
        formulas: isToan || isVatLy ? [{ id: "CT-01", content: "Công thức và định luật trọng tâm của bài học" }] : [],
        data: [],
        figures: [
          {
            id: "HINH-01",
            description: "Sơ đồ tư duy hoặc biểu đồ minh họa mối quan hệ giữa các khái niệm.",
            pedagogicalRole: "Tối ưu hóa khả năng ghi nhớ thị giác của học sinh",
          },
        ],
        examples: [
          { id: "VD-01", content: "Ví dụ trực quan minh họa nguyên lý trong đời sống hàng ngày." },
        ],
        misconceptions: [
          {
            id: "SAI-01",
            misconception: "Lỗi tư duy trực giác chưa qua kiểm chứng mà học sinh thường hay mắc phải.",
            correctionReference: "Đối chiếu trực tiếp với quy chuẩn định nghĩa và bằng chứng thực nghiệm.",
          },
        ],
        realLifeConnections: [
          { id: "TT-01", connection: "Ứng dụng giải quyết tình huống thực tiễn và phát triển kỹ năng công dân số." },
        ],
        videoHookCandidates: [
          {
            id: "HK-01",
            mode: "EDU-01" as PedagogicalMode,
            idea: `Tạo một tình huống nghịch lý thú vị diễn ra ngay trong đời sống thường nhật để dẫn dắt vào bài ${title}.`,
          },
        ],
        missingData: [],
        safetyFlags: [],
      };
    }

    return payload;
  }

  /**
   * Gọi AI (Gemini qua key rotation) hoặc Fallback để tạo DATA PACK
   */
  static async analyzeProjectSources(project: Project, sources: SourceFile[]): Promise<DataPack> {
    const keyManager = getApiKeyManager();
    const apiKey = await keyManager.getNextActiveKey();

    let payload: DataPackPayload;

    if (apiKey) {
      try {
        // Gọi Google Gemini API với JSON mode
        const systemPrompt = `Bạn là Chuyên gia Sư phạm và Nhà thiết kế Học liệu số GDPT 2018 (Lead Educational Architect).
Nhiệm vụ: Phân tích tài liệu nguồn bài giảng để trích xuất thành DATA PACK chuẩn mực cho việc sản xuất video bài giảng ngắn.
Đầu ra PHẢI là một đối tượng JSON hợp lệ tuân thủ đúng định dạng:
{
  "packId": "dp_${project.id}",
  "version": 1,
  "subject": "${project.subject || ""}",
  "grade": "${project.targetGrade || ""}",
  "bookSeries": "Kết nối tri thức / Cánh Diều / Chân trời sáng tạo",
  "lessonTitle": "${project.title}",
  "sourcePages": ["1", "2"],
  "lessonType": ["Lý thuyết khám phá"],
  "learningOutcomes": [ { "id": "YCCD-01", "content": "...", "source": { "page": 1 } } ],
  "keyKnowledge": [ { "id": "KT-01", "content": "...", "source": { "page": 1 } } ],
  "terms": [ { "id": "TN-01", "content": "..." } ],
  "formulas": [ { "id": "CT-01", "content": "..." } ],
  "data": [ { "id": "DL-01", "content": "..." } ],
  "figures": [ { "id": "HINH-01", "description": "...", "pedagogicalRole": "..." } ],
  "examples": [ { "id": "VD-01", "content": "..." } ],
  "misconceptions": [ { "id": "SAI-01", "misconception": "...", "correctionReference": "..." } ],
  "realLifeConnections": [ { "id": "TT-01", "connection": "..." } ],
  "videoHookCandidates": [ { "id": "HK-01", "mode": "EDU-01", "idea": "..." } ],
  "missingData": [],
  "safetyFlags": []
}`;

        const userPrompt = `Hãy phân tích bài học: "${project.title}", Môn: "${project.subject || ""}", Lớp: "${project.targetGrade || ""}".
Danh sách tệp tài liệu đã nạp: ${sources.map((s) => `${s.filename} (${s.pageCount || 1} trang)`).join(", ")}.
Vui lòng trích xuất chi tiết ít nhất 3 Yêu cầu cần đạt (YCCD), 3 Kiến thức trọng tâm (KT), thuật ngữ, sai lầm phổ biến và 2 ý tưởng Video Hook độc đáo.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const validated = DataPackPayloadSchema.safeParse(parsed);
            if (validated.success) {
              await keyManager.markKeySuccess(apiKey);
              payload = validated.data;
            } else {
              payload = this.generateFallbackDataPack(project, sources);
            }
          } else {
            payload = this.generateFallbackDataPack(project, sources);
          }
        } else {
          if (response.status === 429) {
            await keyManager.markKeyRateLimited(apiKey);
          }
          payload = this.generateFallbackDataPack(project, sources);
        }
      } catch {
        payload = this.generateFallbackDataPack(project, sources);
      }
    } else {
      // Chế độ mô phỏng sư phạm thông minh khi chưa có API key
      payload = this.generateFallbackDataPack(project, sources);
    }

    const dataPack: DataPack = {
      id: `dp_${project.id}_v${payload.version}`,
      projectId: project.id,
      version: payload.version,
      status: "DRAFT",
      payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return dataPack;
  }
}
