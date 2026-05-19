# Real-time Chat System Documentation

## Tổng quan

Hệ thống chat real-time được xây dựng với kiến trúc Clean Architecture, hỗ trợ chat giữa sinh viên và giảng viên với các tính năng:

- **Chat 1-1**: Chat riêng tư giữa 2 người
- **Chat nhóm**: Nhiều người tham gia
- **Chat lớp học**: Tự động tạo cho từng lớp
- **Real-time messaging**: Sử dụng WebSocket STOMP
- **Message status**: SENT, DELIVERED, READ
- **Typing indicators**: Hiển thị khi ai đó đang gõ
- **File sharing**: Hỗ trợ gửi ảnh, tài liệu
- **Message history**: Lưu trữ và phân trang
- **Online status**: Theo dõi trạng thái online/offline

## Kiến trúc hệ thống

### 1. Domain Layer
- **Entities**: `ChatRoom`, `ChatRoomMember`, `Message` (mở rộng)
- **Enums**: `MessageStatus`, `ConversationType`, `MessageType`
- **Value Objects**: Composite keys cho relationships

### 2. Application Layer
- **Services**: `ChatRoomService`, `ChatMessageService`
- **DTOs**: Request/Response objects cho API
- **Use Cases**: Business logic cho từng tính năng

### 3. Infrastructure Layer
- **WebSocket**: STOMP configuration và message handling
- **Redis**: Caching và Pub/Sub cho scaling
- **Kafka**: Async message processing
- **JPA**: Database persistence

### 4. Interface Layer
- **REST APIs**: CRUD operations cho chat rooms và messages
- **WebSocket endpoints**: Real-time messaging
- **Security**: JWT authentication cho WebSocket

## API Endpoints

### REST APIs

#### Chat Rooms
```
GET    /api/chat/rooms              - Lấy danh sách phòng chat của tôi
GET    /api/chat/rooms/{id}         - Lấy chi tiết phòng chat
POST   /api/chat/rooms              - Tạo phòng chat mới
PUT    /api/chat/rooms/{id}         - Cập nhật phòng chat
DELETE /api/chat/rooms/{id}         - Xóa phòng chat
POST   /api/chat/rooms/{id}/members/{userId} - Thêm thành viên
DELETE /api/chat/rooms/{id}/members/{userId} - Xóa thành viên
POST   /api/chat/rooms/{id}/leave   - Rời khỏi phòng
POST   /api/chat/rooms/private/{userId} - Tạo/lấy chat 1-1
```

#### Messages
```
GET    /api/chat/rooms/{id}/messages     - Lấy lịch sử tin nhắn
POST   /api/chat/messages                - Gửi tin nhắn
GET    /api/chat/messages/{id}           - Lấy chi tiết tin nhắn
PUT    /api/chat/messages/read           - Đánh dấu đã đọc
DELETE /api/chat/messages/{id}           - Xóa tin nhắn
PUT    /api/chat/messages/{id}           - Chỉnh sửa tin nhắn
GET    /api/chat/rooms/{id}/messages/last - Tin nhắn cuối cùng
```

### WebSocket Endpoints

#### Connection
```
WebSocket URL: ws://localhost:8080/ws/chat?token={JWT_TOKEN}
SockJS fallback: ws://localhost:8080/ws/chat
```

#### Message Mapping
```
/app/chat/send                    - Gửi tin nhắn
/app/chat/{roomId}/typing         - Typing indicator
/app/chat/{roomId}/read           - Đánh dấu đã đọc
/app/chat/user/online             - User online status
```

#### Subscriptions
```
/topic/chatroom/{roomId}          - Nhận tin nhắn từ phòng
/topic/chatroom/{roomId}/typing   - Nhận typing indicators
/topic/users/online               - Nhận trạng thái online
```

## Database Schema

### chat_rooms
```sql
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    type VARCHAR(20), -- PRIVATE, GROUP, CLASS_GROUP
    avatar_url VARCHAR(500),
    creator_id BIGINT REFERENCES users(id),
    last_message_id BIGINT,
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### chat_room_members
```sql
CREATE TABLE chat_room_members (
    id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT REFERENCES chat_rooms(id),
    user_id BIGINT REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(chat_room_id, user_id)
);
```

### messages (extended)
```sql
ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT 'SENT';
ALTER TABLE messages ADD COLUMN media_url VARCHAR(500);
ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP;
```

## Frontend Integration

### JavaScript Client Example

```javascript
// 1. Kết nối WebSocket
const socket = new SockJS('/ws/chat');
const stompClient = Stomp.over(socket);

// 2. Kết nối với JWT token
stompClient.connect({
    'Authorization': 'Bearer ' + jwtToken
}, function(frame) {
    console.log('Connected: ' + frame);
    
    // 3. Subscribe để nhận tin nhắn
    stompClient.subscribe('/topic/chatroom/' + chatRoomId, function(message) {
        const messageData = JSON.parse(message.body);
        displayMessage(messageData);
    });
    
    // 4. Subscribe typing indicators
    stompClient.subscribe('/topic/chatroom/' + chatRoomId + '/typing', function(typing) {
        const typingData = JSON.parse(typing.body);
        showTypingIndicator(typingData);
    });
});

// 5. Gửi tin nhắn
function sendMessage(content) {
    const message = {
        chatRoomId: chatRoomId,
        content: content,
        type: 'TEXT'
    };
    
    stompClient.send('/app/chat/send', {}, JSON.stringify(message));
}

// 6. Gửi typing indicator
function sendTypingIndicator(isTyping) {
    const typing = {
        chatRoomId: chatRoomId,
        action: isTyping ? 'typing' : 'stop_typing'
    };
    
    stompClient.send('/app/chat/' + chatRoomId + '/typing', {}, JSON.stringify(typing));
}
```

### React Hook Example

```javascript
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const useChatWebSocket = (chatRoomId, jwtToken) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const stompClientRef = useRef(null);

    useEffect(() => {
        const socket = new SockJS('/ws/chat');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                'Authorization': `Bearer ${jwtToken}`
            },
            onConnect: () => {
                // Subscribe messages
                stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, (message) => {
                    const messageData = JSON.parse(message.body);
                    setMessages(prev => [...prev, messageData]);
                });
                
                // Subscribe typing
                stompClient.subscribe(`/topic/chatroom/${chatRoomId}/typing`, (typing) => {
                    const typingData = JSON.parse(typing.body);
                    setIsTyping(typingData.action === 'typing');
                });
            }
        });
        
        stompClient.activate();
        stompClientRef.current = stompClient;
        
        return () => {
            stompClient.deactivate();
        };
    }, [chatRoomId, jwtToken]);
    
    const sendMessage = (content) => {
        if (stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: '/app/chat/send',
                body: JSON.stringify({
                    chatRoomId,
                    content,
                    type: 'TEXT'
                })
            });
        }
    };
    
    return { messages, isTyping, sendMessage };
};
```

## Security Features

### JWT Authentication
- WebSocket handshake validate JWT token
- Token có thể truyền qua query parameter hoặc header
- Automatic disconnect khi token hết hạn

### Authorization
- Chỉ thành viên mới có thể gửi/nhận tin nhắn
- Creator có quyền thêm/xóa thành viên
- Role-based access control (STUDENT, TEACHER, ADMIN)

### Data Validation
- Input sanitization
- SQL injection prevention
- XSS protection

## Scaling & Performance

### Redis Integration
- **Caching**: Online users, unread counts, recent messages
- **Pub/Sub**: Broadcast messages across multiple instances
- **Session management**: Distributed WebSocket sessions

### Kafka Integration
- **Async processing**: Message persistence, notifications
- **Analytics**: Message statistics, user activity
- **Load balancing**: Distribute processing across consumers

### Database Optimization
- **Indexing**: Optimized queries cho chat history
- **Pagination**: Efficient message loading
- **Connection pooling**: PostgreSQL connection management

## Monitoring & Analytics

### Metrics
- Active connections
- Messages per second
- User engagement
- Error rates

### Logging
- Message audit logs
- Performance monitoring
- Error tracking

## Deployment

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  chat-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      - postgres
      - redis
      - kafka
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
      
  kafka:
    image: confluentinc/cp-kafka:7.4.0
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
```

### Environment Variables
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/chatdb
SPRING_DATASOURCE_USERNAME=chat_user
SPRING_DATASOURCE_PASSWORD=chat_password

# Redis
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379

# Kafka
SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# JWT
APPLICATION_SECURITY_JWT_SECRET_KEY=your-secret-key-here
```

## Testing

### Unit Tests
```java
@SpringBootTest
class ChatServiceTest {
    @Autowired
    private ChatMessageService chatMessageService;
    
    @Test
    void testSendMessage() {
        // Test gửi tin nhắn
    }
}
```

### Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ChatWebSocketTest {
    @Test
    void testWebSocketConnection() {
        // Test WebSocket connection với JWT
    }
}
```

## Troubleshooting

### Common Issues

1. **403 Forbidden on WebSocket connection**
   - Check JWT token validity
   - Verify CORS configuration
   - Ensure user has permission to access chat

2. **Messages not received**
   - Check WebSocket subscription topics
   - Verify user is member of chat room
   - Check Redis/Kafka connectivity

3. **High latency**
   - Monitor Redis performance
   - Check database query performance
   - Consider message batching

### Debug Commands
```bash
# Check Redis connections
redis-cli info clients

# Check Kafka topics
kafka-topics --list --bootstrap-server localhost:9092

# Monitor application logs
tail -f logs/spring.log
```

## Future Enhancements

- **File upload**: S3 integration for media files
- **Push notifications**: Firebase/APNs integration
- **Message reactions**: Like, emoji responses
- **Message threads**: Reply to specific messages
- **Voice messages**: Audio recording/playback
- **Video calls**: WebRTC integration
- **Message encryption**: End-to-end encryption
- **Offline support**: Service worker caching