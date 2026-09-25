# 10 PEDAGOGICAL VIDEO MODES

## EDU-01 — Tình huống có vấn đề
Best for: vấn đề thực tế.
Required: KT/TT.
End: câu hỏi cần kiến thức mới.

## EDU-02 — AI đố học sinh
Best for: câu đố/thử thách.
Không tiết lộ đáp án.
AI character phải hư cấu.

## EDU-03 — Đúng hay sai
Best for: nhận định gây phân vân.
Học sinh phải giải thích.

## EDU-04 — Tranh luận
Hai quan điểm khác nhau, đều có lý.
Không biến một bên thành “sai ngớ ngẩn”.

## EDU-05 — Chuyện đời thường
Best for: liên hệ thực tế.
Ưu tiên 3 cảnh.

## EDU-06 — Chuyện gì sẽ xảy ra?
Best for: dự đoán hiện tượng.
Video dừng trước kết quả.

## EDU-07 — Phát hiện lỗi sai
Best for: SAI-xx.
1–2 lỗi vừa sức.
Không đưa lời giải.

## EDU-08 — Nhân vật cần giúp
Best for: tình huống nhập vai.
Không đặt nhân vật vào nguy hiểm nghiêm trọng.

## EDU-09 — Bí ẩn
2–3 manh mối từ DATA PACK.
Không tiết lộ đáp án.

## EDU-10 — Auto Director
Tự chọn cấu trúc.

---

# MODE SELECTOR INPUT
- DATA PACK
- target grade
- duration
- platform

# MODE SELECTOR OUTPUT
```json
{
  "suggestions": [
    {
      "mode":"EDU-07",
      "title":"...",
      "hook":"...",
      "reason":"...",
      "finalQuestion":"...",
      "uses":["SAI-01","KT-02"]
    }
  ],
  "recommendedMode":"EDU-07"
}
```

# Quy tắc
- Trả 3 suggestion.
- Không xếp hạng “tốt/xấu”.
- Chỉ nêu độ phù hợp với bài.
