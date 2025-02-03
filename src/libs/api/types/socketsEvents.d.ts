interface BaseSocketEvent {}

interface ErrorEvent extends BaseSocketEvent {
  type: 'error';
  error: string;
  details: string | object | number | boolean;
}

interface NotificationEvent extends BaseSocketEvent {
  type: 'notification.user' | 'notification.account';
  title: string;
  body: string;
}

interface ChatMessageEvent extends BaseSocketEvent {
  type: 'chat.message.user';
  message: string;
  sender: string;
}

type SocketEvent = ErrorEvent | NotificationEvent | ChatMessageEvent;
type SocketEventType = SocketEvent['type'];
