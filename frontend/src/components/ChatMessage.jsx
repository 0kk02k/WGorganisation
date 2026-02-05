import { format, parseISO } from "date-fns";

export default function ChatMessage({ message }) {
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
    </div>
  );
}