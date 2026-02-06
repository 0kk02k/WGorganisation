import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import ChatReplyList from "@/components/ChatReplyList";

export default function ChatMessage({
  message,
  onEdit,
  onDelete,
  onReply,
}) {
  return (
    <div
      className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
      data-testid={`chat-message-${message.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-white">{message.name}</p>
        <p className="text-xs text-white/50">
          {format(parseISO(message.created_at), "dd.MM HH:mm")}
        </p>
      </div>
      <p className="text-sm text-white/70">{message.content}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onReply}
          className="rounded-full text-white/70 hover:text-white"
          data-testid={`chat-reply-button-${message.id}`}
        >
          Antworten
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          className="rounded-full text-white/70 hover:text-white"
          data-testid={`chat-edit-button-${message.id}`}
        >
          Bearbeiten
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="rounded-full text-red-200 hover:text-red-100"
          data-testid={`chat-delete-button-${message.id}`}
        >
          Löschen
        </Button>
      </div>
      {message.replies?.length > 0 && (
        <ChatReplyList messageId={message.id} replies={message.replies} />
      )}
    </div>
  );
}