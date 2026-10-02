import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { Project, SourceFile, DataPack, DataPackPayload, PedagogicalMode, AnalysisMetadata } from "@/types";
import { getApiKeyManager } from "@/ai/providers/apiKeyManager";

// Zod Schema xác thực dữ liệu DATA PACK theo chuẩn GDPT 2018
export const DataPackItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  source: z
    .object({
      fileId: z.string().optional(),
      page: z.union([z.string(), z.number()]).optional(),
      quote: z.string().optional(),
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

export const AnalysisMetadataSchema = z.object({
  engine: z.enum(["GEMINI_MULTIMODAL", "FALLBACK_SIMULATION"]),
  model: z.string().optional(),
  analyzedAt: z.string(),
  filesReadCount: z.number(),
  filesDetail: z
    .array(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
        sizeBytes: z.number(),
      })
    )
    .optional(),
  notes: z.string().optional(),
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
  analysisMetadata: AnalysisMetadataSchema.optional(),
});

const CANDIDATE_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
];

const MAX_TOTAL_BASE64_BYTES = 16 * 1024 * 1024; // 16MB an toàn cho REST request

export class SourceAnalyzerAgent {
  /**
   * Tạo DATA PACK sư phạm mô phỏng chất lượng cao khi chưa có API Key
   */
  static generateFallbackDataPack(
    project: Project,
    sources: SourceFile[],
    reasonNote?: string
  ): DataPackPayload {
    const subject = project.subject || "Khoa học tự nhiên";
    const grade = project.targetGrade || "Lớp 7";
    const title = project.title.replace(/^Bài \d+:?\s*/i, "").trim() || "Khám phá bài học";

    const isLichSuDiaLi = subject.toLowerCase().includes("lịch sử") || subject.toLowerCase().includes("địa");
    const isToan = subject.toLowerCase().includes("toán");
    const isSinhHoc = subject.toLowerCase().includes("sinh") || title.toLowerCase().includes("quang hợp") || title.toLowerCase().includes("tế bào");
    const isVatLy = subject.toLowerCase().includes("vật lý") || subject.toLowerCase().includes("vật lí");

    let payload: DataPackPayload;

    if (isSinhHoc || title.toLowerCase().includes("quang hợp")) {
      payload = {
        packId: `dp_${project.id}`,
        version: 1,
        subject: "Khoa học tự nhiên (Sinh học)",
        grade,
        bookSeries: "Kết nối tri thức với cuộc sống",
        lessonTitle: project.title,
        sourcePages: sources.map((s) => s.filename).slice(0, 5),
        lessonType: ["Khám phá kiến thức mới", "Lý thuyết & Thí nghiệm"],
        learningOutcomes: [
          {
            id: "YCCD-01",
            content: `Nêu được vai trò trọng yếu của lá cây và bào quan lục lạp trong quá trình tổng hợp chất hữu cơ của "${title}".`,
            source: { page: 42, quote: "Lá cây là cơ quan quang hợp chủ yếu của thực vật." },
          },
          {
            id: "YCCD-02",
            content: `Mô tả và viết được phương trình tổng quát của quá trình: Nước + Carbon dioxide ➔ Glucose + Oxygen (trong điều kiện có ánh sáng và diệp lục).`,
            source: { page: 43, quote: "Nước và khí carbon dioxide được chuyển hóa thành chất hữu cơ và khí oxygen." },
          },
          {
            id: "YCCD-03",
            content: `Phân tích được các nhân tố môi trường (ánh sáng, nồng độ CO2, nước, nhiệt độ) ảnh hưởng trực tiếp đến hiệu suất quang hợp.`,
            source: { page: 45 },
          },
        ],
        keyKnowledge: [
          {
            id: "KT-01",
            content: `Bản chất của quang hợp: Quá trình lá cây thu nhận và chuyển hóa năng lượng ánh sáng mặt trời thành năng lượng hóa học tích lũy trong các hợp chất hữu cơ (glucose/tinh bột).`,
            source: { page: 42 },
          },
          {
            id: "KT-02",
            content: `Cơ chế trao đổi khí và nước: Khí CO2 đi vào qua khí khổng ở bề mặt lá, nước được rễ hút vận chuyển qua mạch gỗ lên lá, khí O2 được giải phóng ra môi trường.`,
            source: { page: 43 },
          },
          {
            id: "KT-03",
            content: `Ý nghĩa sinh thái toàn cầu: Quang hợp tạo ra chuỗi thức ăn nuôi sống hầu hết sinh vật trên Trái Đất và điều hòa hàm lượng khí oxy trong khí quyển.`,
            source: { page: 44 },
          },
        ],
        terms: [
          { id: "TN-01", content: "Lục lạp (Chloroplast): Bào quan quang hợp của tế bào thực vật chứa chất diệp lục hấp thụ ánh sáng." },
          { id: "TN-02", content: "Khí khổng (Stomata): Các lỗ nhỏ li ti trên biểu bì lá chịu trách nhiệm đóng mở trao đổi khí và thoát hơi nước." },
        ],
        formulas: [
          { id: "CT-01", content: "Phương trình quang hợp: 6CO₂ + 6H₂O ➔ C₆H₁₂O₆ + 6O₂ (Ánh sáng mặt trời & Diệp lục)" },
        ],
        data: [
          { id: "DL-01", content: "Thực vật cung cấp hơn 90% lượng oxy và sinh khối dinh dưỡng trên toàn hành tinh." },
        ],
        figures: [
          {
            id: "HINH-01",
            description: "Sơ đồ giải phẫu cắt ngang phiến lá cây hiển thị lớp biểu bì, tế bào mô giậu dày đặc lục lạp và gân lá.",
            pedagogicalRole: "Giúp học sinh quan sát trực quan cấu tạo bên trong của lá cây mà mắt thường không thể nhìn thấy.",
            source: { page: 42 },
          },
          {
            id: "HINH-02",
            description: "Sơ đồ dòng năng lượng và trao đổi khí qua bề mặt lá (mũi tên CO2 đi vào, O2 đi ra, ánh sáng chiếu vào).",
            pedagogicalRole: "Mô hình hóa nguyên lý đầu vào (Input) và đầu ra (Output) của quá trình quang hợp.",
            source: { page: 43 },
          },
        ],
        examples: [
          {
            id: "VD-01",
            content: "Thí nghiệm trồng hai cây con: Một cây để ngoài ánh sáng mặt trời phát triển xanh tốt, một cây úp trong hộp kín màu đen bị úa vàng và còi cọc.",
          },
        ],
        misconceptions: [
          {
            id: "SAI-01",
            misconception: "Học sinh thường lầm tưởng cây xanh chỉ quang hợp vào ban đêm hoặc quang hợp và hô hấp là một.",
            correctionReference: "Quang hợp BẮT BUỘC cần ánh sáng mặt trời nên chỉ diễn ra vào ban ngày; ban đêm cây chỉ diễn ra quá trình hô hấp tế bào.",
          },
        ],
        realLifeConnections: [
          {
            id: "TT-01",
            connection: "Ứng dụng trong nông nghiệp thông minh: Bật đèn LED quang phổ chuyên dụng vào ban đêm trong nhà kính để thúc đẩy thanh long, dâu tây ra hoa quả trái vụ.",
          },
          {
            id: "TT-02",
            connection: "Ý thức bảo vệ môi trường: Trồng cây xanh trong trường học và đô thị để hấp thụ khí nhà kính và thanh lọc bụi mịn không khí.",
          },
        ],
        videoHookCandidates: [
          {
            id: "HK-01",
            mode: "EDU-01" as PedagogicalMode,
            idea: "Đặt câu hỏi nghịch lý: 'Cây cối không có miệng, không ăn thức ăn như động vật, vậy điều kỳ diệu nào đã giúp một hạt sồi bé nhỏ lớn thành cây cổ thụ hàng chục tấn gỗ?'",
          },
          {
            id: "HK-02",
            mode: "EDU-02" as PedagogicalMode,
            idea: "Thử thách 10 giây: 'Nếu Mặt Trời đột ngột ngừng chiếu sáng trong 30 ngày, điều gì sẽ xảy ra đầu tiên với lượng oxy của Trái Đất?'",
          },
        ],
        missingData: [],
        safetyFlags: [],
        analysisMetadata: {
          engine: "FALLBACK_SIMULATION",
          analyzedAt: new Date().toISOString(),
          filesReadCount: sources.length,
          filesDetail: sources.map((s) => ({ filename: s.filename, mimeType: s.mimeType, sizeBytes: s.sizeBytes })),
          notes: reasonNote || "Chưa phát hiện Gemini API Key hợp lệ. Hệ thống kích hoạt bộ dữ liệu mô phỏng sư phạm chuẩn hóa GDPT 2018.",
        },
      };
    } else if (isLichSuDiaLi) {
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
        ],
        missingData: [],
        safetyFlags: [],
        analysisMetadata: {
          engine: "FALLBACK_SIMULATION",
          analyzedAt: new Date().toISOString(),
          filesReadCount: sources.length,
          filesDetail: sources.map((s) => ({ filename: s.filename, mimeType: s.mimeType, sizeBytes: s.sizeBytes })),
          notes: reasonNote || "Chưa phát hiện Gemini API Key hợp lệ. Hệ thống kích hoạt bộ dữ liệu mô phỏng sư phạm chuẩn hóa GDPT 2018.",
        },
      };
    } else {
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
        analysisMetadata: {
          engine: "FALLBACK_SIMULATION",
          analyzedAt: new Date().toISOString(),
          filesReadCount: sources.length,
          filesDetail: sources.map((s) => ({ filename: s.filename, mimeType: s.mimeType, sizeBytes: s.sizeBytes })),
          notes: reasonNote || "Chưa phát hiện Gemini API Key hợp lệ. Hệ thống kích hoạt bộ dữ liệu mô phỏng sư phạm chuẩn hóa GDPT 2018.",
        },
      };
    }

    return payload;
  }

  /**
   * Đọc các tệp tài liệu thực tế từ đĩa và nạp vào mảng Gemini Parts (Hỗ trợ PDF & Hình ảnh đa phương thức)
   */
  private static async loadMultimodalParts(sources: SourceFile[]): Promise<{
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
    loadedCount: number;
  }> {
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    let currentTotalBytes = 0;
    let loadedCount = 0;

    for (const source of sources) {
      if (!source.storageKey) continue;

      try {
        const fileBuffer = await fs.readFile(source.storageKey);
        if (!fileBuffer || fileBuffer.length === 0) continue;

        // Kiểm tra tổng dung lượng để không vượt quá giới hạn REST payload của Gemini (16MB)
        if (currentTotalBytes + fileBuffer.length > MAX_TOTAL_BASE64_BYTES) {
          // Nếu đã nạp đủ các tệp quan trọng, tệp sau ghi nhận dạng văn bản
          parts.push({
            text: `[Tệp bổ sung không đính kèm ảnh do vượt giới hạn dung lượng: ${source.filename} (${Math.round(source.sizeBytes / 1024)} KB)]`,
          });
          continue;
        }

        const ext = path.extname(source.filename).toLowerCase();
        let mimeType = source.mimeType;

        if (ext === ".pdf" || mimeType.includes("pdf")) {
          mimeType = "application/pdf";
        } else if (ext === ".png") {
          mimeType = "image/png";
        } else if (ext === ".webp") {
          mimeType = "image/webp";
        } else if (ext === ".jpg" || ext === ".jpeg") {
          mimeType = "image/jpeg";
        }

        const base64Data = fileBuffer.toString("base64");
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });

        currentTotalBytes += fileBuffer.length;
        loadedCount += 1;
      } catch (err: unknown) {
        // File không tìm thấy trên đĩa (ví dụ môi trường serverless không persistent), bổ sung mô tả
        console.warn(`[SourceAnalyzer] Không đọc được tệp từ đĩa ${source.storageKey}:`, err);
        parts.push({
          text: `[Tệp tài liệu: ${source.filename} - Dung lượng: ${Math.round(source.sizeBytes / 1024)} KB]`,
        });
      }
    }

    return { parts, loadedCount };
  }

  /**
   * Gọi Gemini API phân tích chuyên sâu đa phương thức (Multimodal) với vai trò Chuyên gia Sư phạm & Đọc sách Giáo khoa
   */
  static async analyzeProjectSources(project: Project, sources: SourceFile[]): Promise<DataPack> {
    const keyManager = getApiKeyManager();
    const activeKeys = await keyManager.getActiveKeys();

    let payload: DataPackPayload | null = null;
    let fallbackReason = "";

    // 1. Chuẩn bị tài liệu đa phương thức (Multimodal Parts)
    const { parts: fileParts, loadedCount } = await this.loadMultimodalParts(sources);

    // 2. Hệ thống Prompt của Chuyên gia Đọc sách Sư phạm
    const systemPrompt = `BẠN LÀ MỘT CHUYÊN GIA THƯỢNG CẤP VỀ ĐỌC SÁCH GIÁO KHOA & THẨM ĐỊNH HỌC LIỆU SƯ PHẠM (CHƯƠNG TRÌNH GDPT 2018).

NHIỆM VỤ CỦA CHUYÊN GIA:
1. ĐỌC KỸ LƯỠNG TỪNG TRANG TÀI LIỆU/SÁCH ĐÍNH KÈM:
   - Quét và đọc sâu toàn bộ nội dung trong tệp hình ảnh / tài liệu PDF được đính kèm.
   - Đọc từng tiêu đề bài, mục I, II, III, các đoạn văn bản giải thích, các bảng số liệu, các hình vẽ/sơ đồ và các hộp chú thích ("Em có biết", "Góc mở rộng").
   - Xác định chính xác: Tên bài học, Khối lớp, Môn học, Bộ sách giáo khoa (Kết nối tri thức / Cánh Diều / Chân trời sáng tạo / GDPT 2018).

2. TRÍCH XUẤT ĐÚNG TRỌNG TÂM - TUYỆT ĐỐI CHÍNH XÁC VÀ TẬP TRUNG (FIDELITY & FOCUS):
   - Mọi kiến thức trích xuất PHẢI bám sát 100% ngữ liệu thực tế từ tài liệu được tải lên. Tuyệt đối không bịa đặt, không sáng tác ngoài phạm vi sách.
   - Ghi rõ nguồn trích dẫn: Số trang (page) và đoạn trích dẫn (quote).
   - Tập trung vào các tri thức quan trọng nhất cần ghi nhớ để chuẩn bị cho việc sản xuất Video Bài học Sư phạm ngắn (60 - 90 giây).

3. ĐẦU RA BẮT BUỘC: PHẢI là một chuỗi JSON hợp lệ không bọc trong markdown code fence, tuân thủ đúng định dạng:
{
  "packId": "dp_${project.id}",
  "version": 1,
  "subject": "${project.subject || "Xác định từ sách"}",
  "grade": "${project.targetGrade || "Xác định từ sách"}",
  "bookSeries": "Xác định từ sách (Kết nối tri thức / Cánh Diều / Chân trời sáng tạo)",
  "lessonTitle": "${project.title}",
  "sourcePages": ["Trang 1", "Trang 2"],
  "lessonType": ["Khám phá kiến thức mới", "Lý thuyết trọng tâm"],
  "learningOutcomes": [
    {
      "id": "YCCD-01",
      "content": "Yêu cầu cần đạt dùng đúng động từ hành vi sư phạm GDPT 2018: Nhận biết / Trình bày / Phân tích / Giải thích / Vận dụng...",
      "source": { "page": 1, "quote": "Đoạn trích từ sách" }
    }
  ],
  "keyKnowledge": [
    {
      "id": "KT-01",
      "content": "Kiến thức trọng tâm cô đọng, nêu rõ bản chất, quy luật, cơ chế khoa học hoặc sự kiện lịch sử/địa lí",
      "source": { "page": 1 }
    }
  ],
  "terms": [
    { "id": "TN-01", "content": "Thuật ngữ hoặc khái niệm mới được giải nghĩa chính xác theo sách giáo khoa" }
  ],
  "formulas": [
    { "id": "CT-01", "content": "Công thức toán/lý/hóa hoặc sơ đồ phản ứng/mô hình nếu có trong bài" }
  ],
  "data": [
    { "id": "DL-01", "content": "Số liệu chính xác, mốc thời gian, dữ kiện định lượng xuất hiện trong bài" }
  ],
  "figures": [
    {
      "id": "HINH-01",
      "description": "Mô tả chi tiết nội dung của bức hình/sơ đồ/biểu đồ có trong trang sách",
      "pedagogicalRole": "Phân tích vai trò sư phạm: Hình ảnh này giúp học sinh giải quyết khó khăn nhận thức gì?",
      "source": { "page": 1 }
    }
  ],
  "examples": [
    { "id": "VD-01", "content": "Ví dụ thực tiễn hoặc bài tập điển hình được đưa ra trong sách" }
  ],
  "misconceptions": [
    {
      "id": "SAI-01",
      "misconception": "Lỗ hổng nhận thức hoặc hiểu lầm mà học sinh thường gặp phải ở bài này",
      "correctionReference": "Căn cứ khoa học chuẩn mực từ bài học để đính chính hiểu lầm đó"
    }
  ],
  "realLifeConnections": [
    { "id": "TT-01", "connection": "Liên hệ thực tiễn sinh động, ứng dụng kiến thức vào cuộc sống đời thường" }
  ],
  "videoHookCandidates": [
    { "id": "HK-01", "mode": "EDU-01", "idea": "Ý tưởng câu hỏi nghịch lý nhận thức hoặc tình huống có vấn đề để mở đầu video 5-10 giây đầu" },
    { "id": "HK-02", "mode": "EDU-02", "idea": "Ý tưởng câu đố tương tác 10 giây thử thách người xem suy đoán" },
    { "id": "HK-03", "mode": "EDU-05", "idea": "Ý tưởng mở đầu bằng một câu chuyện gần gũi trong đời sống thực tế" }
  ],
  "missingData": [],
  "safetyFlags": []
}`;

    const userPrompt = `Dưới đây là nội dung toàn văn và hình ảnh các trang sách giáo khoa / tài liệu được tải lên cho bài học: "${project.title}".
Môn học đăng ký: "${project.subject || "Chưa xác định"}", Khối lớp: "${project.targetGrade || "Chưa xác định"}".
Tổng số tài liệu đính kèm: ${sources.length} tệp (${loadedCount} tệp đã nạp dữ liệu nhị phân trực tiếp).
Danh sách tệp: ${sources.map((s) => s.filename).join(", ")}.

Với vai trò là Chuyên gia Đọc sách và Thẩm định Sư phạm GDPT 2018, hãy đọc kỹ lưỡng toàn bộ văn bản và kênh hình trong các trang sách được đính kèm này, trích xuất dữ liệu chi tiết, chuẩn xác và tập trung cao độ để hoàn thiện đối tượng JSON DATA PACK.`;

    // 3. Thử nghiệm gọi Gemini API với danh sách Keys và Candidate Models
    if (activeKeys.length > 0) {
      keyLoop: for (const apiKey of activeKeys) {
        // Bỏ qua các placeholder key giả lập
        if (apiKey.includes("NumberOne") || apiKey.includes("11111111111111") || apiKey.length < 20) {
          continue;
        }

        for (const model of CANDIDATE_MODELS) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            // Ghép prompt và file parts
            const requestContents = [
              {
                parts: [
                  { text: `${systemPrompt}\n\n${userPrompt}` },
                  ...fileParts,
                ],
              },
            ];

            const response = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: requestContents,
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
                // Làm sạch markdown nếu có
                const cleanedText = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
                const parsed = JSON.parse(cleanedText);
                const validated = DataPackPayloadSchema.safeParse(parsed);

                if (validated.success) {
                  await keyManager.markKeySuccess(apiKey);

                  const metadata: AnalysisMetadata = {
                    engine: "GEMINI_MULTIMODAL",
                    model,
                    analyzedAt: new Date().toISOString(),
                    filesReadCount: loadedCount,
                    filesDetail: sources.map((s) => ({
                      filename: s.filename,
                      mimeType: s.mimeType,
                      sizeBytes: s.sizeBytes,
                    })),
                    notes: `Đã đọc và phân tích chi tiết ${loadedCount} tài liệu trực tiếp bằng mô hình Google Gemini (${model}).`,
                  };

                  payload = {
                    ...validated.data,
                    analysisMetadata: metadata,
                  };
                  break keyLoop;
                }
              }
            } else {
              const errBody = await response.text();

              if (response.status === 429) {
                await keyManager.markKeyRateLimited(apiKey);
                break; // Thử key khác
              } else if (response.status === 400 && (errBody.includes("API key not valid") || errBody.includes("INVALID_ARGUMENT"))) {
                await keyManager.markKeyInvalid(apiKey);
                break; // Thử key khác
              } else if (response.status === 404) {
                // Model không tồn tại hoặc chưa mở ở vùng này -> thử model tiếp theo
                continue;
              } else {
                fallbackReason = `Lỗi phản hồi từ Gemini (${response.status}): ${errBody.slice(0, 100)}`;
              }
            }
          } catch (err: unknown) {
            fallbackReason = err instanceof Error ? err.message : "Lỗi kết nối Gemini API";
          }
        }
      }
    } else {
      fallbackReason = "Chưa có Gemini API Key nào được cài đặt trong hệ thống.";
    }

    // 4. Nếu không có kết quả từ Gemini API -> Fallback mô phỏng sư phạm chuẩn
    if (!payload) {
      payload = this.generateFallbackDataPack(project, sources, fallbackReason);
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
