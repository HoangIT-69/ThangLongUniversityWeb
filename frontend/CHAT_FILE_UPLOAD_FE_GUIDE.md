# CHAT_FILE_UPLOAD_FE_GUIDE.md

## Kết luận nhanh

Backend hiện **có hỗ trợ gửi file trong chat**, nhưng **không có tích hợp cloud storage** như S3, Cloudinary, GCS hoặc Azure Blob.

Triển khai hiện tại lưu file trực tiếp trên filesystem của backend:

- Thư mục lưu: `uploads/chat/{roomId}/`
- URL tải file trả về FE: `/api/chat/files/{roomId}/{encodedStoredFileName}`
- Message được lưu DB với `type = FILE`, `mediaUrl`, `fileName`, `fileSize`

Trong `backend/docs/CHAT_SYSTEM_README.md` có dòng “File upload: S3 integration for media files” ở phần **Future Enhancements**, nghĩa là S3/cloud mới là hướng phát triển sau, **chưa triển khai trong code hiện tại**.

## Nguồn đã kiểm tra

- Swagger/OpenAPI config: `backend/src/main/java/com/example/ThangLongUniversityWeb/config/OpenApiConfig.java`
- Security config: `backend/src/main/java/com/example/ThangLongUniversityWeb/config/SecurityConfig.java`
- Chat REST controller: `backend/src/main/java/com/example/ThangLongUniversityWeb/controller/ChatController.java`
- Chat WebSocket controller: `backend/src/main/java/com/example/ThangLongUniversityWeb/controller/ChatWebSocketController.java`
- Chat message service: `backend/src/main/java/com/example/ThangLongUniversityWeb/service/impl/ChatMessageServiceImpl.java`
- Message entity: `backend/src/main/java/com/example/ThangLongUniversityWeb/entity/Message.java`
- Message repository: `backend/src/main/java/com/example/ThangLongUniversityWeb/repository/MessageRepository.java`
- Chat DTOs:
  - `backend/src/main/java/com/example/ThangLongUniversityWeb/dto/request/ChatMessageRequest.java`
  - `backend/src/main/java/com/example/ThangLongUniversityWeb/dto/response/ChatMessageResponse.java`
  - `backend/src/main/java/com/example/ThangLongUniversityWeb/dto/request/ChatRoomRequest.java`
  - `backend/src/main/java/com/example/ThangLongUniversityWeb/dto/response/ChatRoomResponse.java`

## Swagger/OpenAPI

- Config file: `backend/src/main/java/com/example/ThangLongUniversityWeb/config/OpenApiConfig.java`
- Dependency: `org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.3`
- Swagger UI:
  - `/swagger-ui/index.html`
  - `/swagger-ui.html`
- OpenAPI JSON:
  - `/v3/api-docs`
  - `/v3/api-docs/chat-system`
- Auth: `bearerAuth`, header `Authorization: Bearer <accessToken>`
- Chat API group:
  - `GroupedOpenApi.chatApi()`
  - group: `chat-system`
  - display name: `Chat System`
  - paths: `/api/chat/**`

## Backend có cloud không?

Không.

Không tìm thấy dependency/config/code cho:

- AWS S3
- Cloudinary
- Google Cloud Storage
- Azure Blob Storage
- bucket name / access key / secret key / CDN config

Code upload thật nằm trong `ChatController.uploadRoomFile()`:

- Nhận `MultipartFile`
- Tạo file name: `{UUID}-{originalNameSanitized}`
- Tạo thư mục local: `uploads/chat/{roomId}`
- Gọi `file.transferTo(target)`
- Tạo message với:
  - `type = MessageType.FILE`
  - `content = originalName`
  - `mediaUrl = "/api/chat/files/{roomId}/{encodedName}"`
  - `fileName = originalName`
  - `fileSize = file.getSize()`

## API liên quan đến chat file

### POST /api/chat/rooms/{roomId}/files

Mục đích: Upload file vào phòng chat và tạo một message type `FILE`.

Auth/Role: `STUDENT | TEACHER | ADMIN`, Bearer JWT. User phải là thành viên phòng chat.

Params:

- `roomId: number`

Query: Không có.

Body:

- `multipart/form-data`
- field bắt buộc: `file`

Response: `ChatMessageResponse`

Response fields cần FE dùng:

- `id`
- `chatRoomId`
- `senderId`
- `senderUsername`
- `senderCode`
- `senderFullName`
- `senderAvatarUrl`
- `content`
- `type`: hiện upload endpoint trả `FILE`
- `status`: `SENT | DELIVERED | READ`
- `mediaUrl`: URL tải file, thường là relative path `/api/chat/files/...`
- `fileName`: tên gốc
- `fileSize`: bytes
- `createdAt`
- `createdAtEpochMs`
- `updatedAt`
- `updatedAtEpochMs`

FE dùng cho:

- Chat composer: nút kẹp giấy / chọn file
- Message bubble file
- Sidebar/tab “File đã gửi”

Ghi chú:

- Không tự set header `Content-Type`; để browser set boundary cho `FormData`.
- Với `apiRequest`, cần bảo đảm client không ép `Content-Type: application/json` khi body là `FormData`.
- Backend chưa kiểm tra MIME type, extension, virus scan, max file size ở code controller.
- Backend không trả direct cloud URL; FE phải ghép `VITE_API_BASE_URL + mediaUrl` nếu `mediaUrl` là relative path.

### GET /api/chat/files/{roomId}/{fileName}

Mục đích: Download file đã upload.

Auth/Role: route nằm dưới `/api/chat/**`, cần Bearer JWT theo SecurityConfig.

Params:

- `roomId: number`
- `fileName: string`, là stored filename đã encode trong `mediaUrl`

Query: Không có.

Body: Không có.

Response:

- Binary stream
- `Content-Type: application/octet-stream`

FE dùng cho:

- Link tải file trong message bubble
- Link trong tab “File đã gửi”

Ghi chú:

- Backend hiện không set `Content-Disposition`, nên trình duyệt có thể mở/tải theo mặc định.
- Nếu dùng `<a href target="_blank">`, cần URL đầy đủ:
  - nếu `mediaUrl` bắt đầu bằng `http`, dùng nguyên
  - nếu relative, ghép `${VITE_API_BASE_URL}${mediaUrl}`

### GET /api/chat/rooms/{roomId}/files

Mục đích: Lấy lịch sử file trong phòng chat.

Auth/Role: `STUDENT | TEACHER | ADMIN`, user phải là thành viên phòng.

Params:

- `roomId: number`

Query:

- `page`, default `0`
- `size`, default `50`, backend clamp tối đa `200`

Body: Không có.

Response: `Page<ChatMessageResponse>`

FE dùng cho:

- Tab/tấm bên phải “File đã gửi”
- Lazy load danh sách file nếu phòng có nhiều file

Ghi chú:

- Repository chỉ lọc `m.type = 'FILE'`, nên message `IMAGE` sẽ không nằm trong API này nếu sau này có upload ảnh riêng.

### POST /api/chat/rooms/{roomId}/messages

Mục đích: Gửi message text qua REST. Có thể gửi `mediaUrl` thủ công theo DTO, nhưng controller upload file riêng mới là luồng file thật.

Auth/Role: `STUDENT | TEACHER | ADMIN`, user phải là thành viên phòng.

Params:

- `roomId: number`

Body JSON:

```ts
interface ChatMessageRequest {
  chatRoomId?: number;
  content?: string;
  type?: "TEXT" | "IMAGE" | "FILE";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
}
```

Response: `ChatMessageResponse`

FE dùng cho:

- Gửi text message
- Có thể dùng cho link text

Ghi chú:

- Với file, ưu tiên dùng `POST /api/chat/rooms/{roomId}/files`.
- Với ảnh, backend có enum `IMAGE` nhưng chưa có endpoint upload ảnh riêng; upload endpoint hiện luôn tạo `FILE`.

### GET /api/chat/rooms/{roomId}/links

Mục đích: Lấy các text message có chứa `http`.

Query:

- `page`
- `size`

Response: `Page<ChatMessageResponse>`

FE dùng cho:

- Tab “Link đã gửi”

Ghi chú:

- Backend lọc đơn giản: `type = TEXT` và `LOWER(content) LIKE '%http%'`.

## WebSocket chat

Endpoint:

- SockJS/STOMP: `/ws/chat`
- Token:
  - query: `/ws/chat?token={JWT}`
  - hoặc header: `Authorization: Bearer {JWT}`

Client send:

- `/app/chat/send`
- payload: `ChatMessageRequest`

Subscribe:

- `/topic/chatroom/{roomId}` nhận message mới
- `/topic/chatroom/{roomId}/typing` nhận typing indicator
- `/topic/users/online` nhận trạng thái online

Lưu ý FE:

- WebSocket phù hợp cho text message realtime.
- Upload file hiện là REST multipart, sau đó backend gọi `chatMessageService.sendMessage()` nhưng REST controller **không broadcast WebSocket** trực tiếp trong `uploadRoomFile()`.
- Vì vậy sau upload file, FE nên:
  - append message trả về vào local state ngay cho người gửi
  - refetch room/messages/files
  - nếu cần người nhận thấy realtime ngay, backend cần bổ sung broadcast khi upload file hoặc FE cần polling/refetch theo interval.

## TypeScript đề xuất cho FE

```ts
export type ChatRoomType = "PRIVATE" | "GROUP" | "CLASS_GROUP";
export type ChatMessageType = "TEXT" | "IMAGE" | "FILE";
export type ChatMessageStatus = "SENT" | "DELIVERED" | "READ";

export interface ChatMessageResponse {
  id: number;
  chatRoomId: number;
  senderId: number;
  senderUsername: string;
  senderCode?: string | null;
  senderFullName: string;
  senderAvatarUrl?: string | null;
  content?: string | null;
  type: ChatMessageType;
  status: ChatMessageStatus;
  mediaUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  createdAt?: string | null;
  createdAtEpochMs?: number | null;
  updatedAt?: string | null;
  updatedAtEpochMs?: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages?: number;
  number?: number;
  size?: number;
}
```

## `chatApi` đề xuất

```ts
import { apiRequest } from "@/lib/api/client";

export const chatApi = {
  listRooms: () => apiRequest<PageResponse<ChatRoomResponse>>("/api/chat/rooms?size=100"),

  listMessages: (roomId: number) =>
    apiRequest<PageResponse<ChatMessageResponse>>(`/api/chat/rooms/${roomId}/messages?size=100`),

  sendMessage: (roomId: number, content: string) =>
    apiRequest<ChatMessageResponse>(`/api/chat/rooms/${roomId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, type: "TEXT" }),
    }),

  uploadFile: (roomId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);

    return apiRequest<ChatMessageResponse>(`/api/chat/rooms/${roomId}/files`, {
      method: "POST",
      body: form,
    });
  },

  listFiles: (roomId: number) =>
    apiRequest<PageResponse<ChatMessageResponse>>(`/api/chat/rooms/${roomId}/files?size=100`),

  listLinks: (roomId: number) =>
    apiRequest<PageResponse<ChatMessageResponse>>(`/api/chat/rooms/${roomId}/links?size=100`),
};
```

## Checklist thiết kế FE gửi file

- Có nút attachment rõ ràng trong composer.
- Dùng `<input type="file">`, có thể cho phép chọn một file mỗi lần theo backend hiện tại.
- Trước upload nên validate ở FE:
  - file không rỗng
  - giới hạn dung lượng tạm đề xuất: 10-25 MB nếu backend chưa cấu hình rõ
  - whitelist MIME nếu muốn phân biệt ảnh/tài liệu
- Khi upload:
  - hiển thị uploading state
  - disable nút gửi file trong lúc pending
  - hiển thị toast lỗi nếu upload fail
  - append message trả về vào danh sách message
  - invalidate/refetch messages, files, rooms
- Message bubble:
  - `type === "FILE"`: icon file, `fileName`, `formatSize(fileSize)`, link download
  - `type === "IMAGE"`: hiện chưa có upload endpoint ảnh riêng; chỉ render image nếu backend sau này trả `type=IMAGE` và `mediaUrl`
- File sidebar/tab:
  - dùng `GET /api/chat/rooms/{roomId}/files`
  - click file mở `${VITE_API_BASE_URL}${mediaUrl}` nếu relative
- Không thiết kế cloud progress/CDN/avatar upload dựa trên backend hiện tại vì BE chưa hỗ trợ.

## Gaps backend nếu muốn cloud upload đúng nghĩa

- Chưa có service storage abstraction: `StorageService.upload(...)`.
- Chưa có config provider: bucket, region, access key, secret key, CDN base URL.
- Chưa có presigned upload/download URL.
- Chưa có metadata content type.
- Chưa có file size limit ở endpoint/controller.
- Chưa có virus scan/file validation server-side.
- Upload file REST chưa broadcast WebSocket cho người nhận.
- Endpoint upload hiện luôn tạo `MessageType.FILE`, chưa phân loại `IMAGE`.
