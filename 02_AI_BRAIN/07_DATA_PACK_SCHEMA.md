# DATA PACK SCHEMA

## 1. Mục đích
DATA PACK là nguồn dữ liệu chuẩn cho TASK A.
Script Agent không được sử dụng kiến thức ngoài DATA PACK đã duyệt, trừ nội dung hình thức/kể chuyện không thay đổi kiến thức.

## 2. JSON schema logic

```json
{
  "packId": "string",
  "version": 1,
  "subject": "string",
  "grade": "string",
  "bookSeries": "string|null",
  "lessonTitle": "string",
  "sourcePages": ["string"],
  "lessonType": ["theory"],
  "learningOutcomes": [
    {
      "id": "YCCD-01",
      "content": "string",
      "source": {"fileId":"...", "page":"..."}
    }
  ],
  "keyKnowledge": [
    {
      "id": "KT-01",
      "content": "string",
      "source": {"fileId":"...", "page":"..."}
    }
  ],
  "terms": [],
  "formulas": [],
  "data": [],
  "figures": [],
  "examples": [],
  "misconceptions": [],
  "realLifeConnections": [],
  "videoHookCandidates": [],
  "missingData": [],
  "safetyFlags": []
}
```

## 3. Quy tắc ID
- YCCD-xx
- KT-xx
- TN-xx
- CT-xx
- DL-xx
- HINH-xx
- VD-xx
- SAI-xx
- TT-xx
- HK-xx

## 4. Required
Bắt buộc có:
- packId
- subject
- grade
- lessonTitle
- sourcePages
- keyKnowledge
- missingData

## 5. Source
Mỗi item kiến thức phải có source.
Nếu source không xác định:
- `source = null`
- thêm item vào `missingData`.

## 6. Data Pack lifecycle
DRAFT → REVIEWED → APPROVED → SUPERSEDED

Khi user sửa:
- tăng version;
- lưu previous version.

## 7. UI
Backend lưu JSON.
Frontend hiển thị form/card.
User không phải sửa JSON trực tiếp.
