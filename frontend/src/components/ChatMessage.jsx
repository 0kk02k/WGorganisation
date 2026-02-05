export default function ChatMessage({ message }) {
  return (
    <div
      className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
      data-testid={`chat-message-${message.id}`}
    >
      <p className="text-sm font-semibold text-white">{message.name}</p>
      <p className="text-sm text-white/70">{message.content}</p>
    </div>
  );
}