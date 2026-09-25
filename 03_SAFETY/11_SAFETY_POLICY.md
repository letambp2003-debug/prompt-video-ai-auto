# SAFETY POLICY — PROJECT LEVEL

## 1. Mục tiêu
Giảm rủi ro nội dung không phù hợp và tăng khả năng tạo media an toàn.
Không cam kết provider sẽ luôn chấp nhận.

## 2. Mặc định nhân vật
Ưu tiên:
- nhân vật hư cấu;
- người lớn hư cấu;
- mascot/robot;
- học sinh hư cấu khi cần.

## 3. Không thiết kế tính năng
- bypass safety;
- jailbreak;
- né filter;
- impersonation;
- celebrity clone;
- unsafe instruction.

## 4. Safety Gate fields
```json
{
  "realPersonOrPublicFigure":"PASS",
  "minorSensitiveContext":"PASS",
  "sexualContent":"PASS",
  "graphicViolence":"PASS",
  "selfHarm":"PASS",
  "dangerousInstruction":"PASS",
  "illegalInstruction":"PASS",
  "hateOrHarassment":"PASS",
  "privacyOrBiometrics":"PASS",
  "impersonationOrDeception":"PASS",
  "copyrightedCharacter":"PASS",
  "politicalPersuasion":"PASS",
  "action":"PASS"
}
```

Allowed action:
- PASS
- REWRITE
- NEUTRALIZE
- BLOCK_PROJECT_STEP

## 5. Political content
App không được tối ưu nội dung thuyết phục cử tri hoặc vận động chính trị.
Nếu user đưa chủ đề chính trị:
- chuyển sang thông tin trung tính;
- hoặc yêu cầu user điều chỉnh mục tiêu.

## 6. Minor
- không sexualize;
- không tình huống nhạy cảm;
- không hành vi nguy hiểm;
- không dùng ảnh thật mặc định.

## 7. Provider rejection
Nếu provider reject:
- giữ prompt/version;
- lưu status BLOCKED;
- đề xuất safe rewrite;
- không tự biến đổi để né filter.
