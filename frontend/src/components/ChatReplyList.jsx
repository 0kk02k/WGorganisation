export default function ChatReplyList({ messageId, replies }) {
  return (
    <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className="rounded-xl border border-white/5 bg-white/5 px-3 py-2"
          data-testid={`chat-reply-${messageId}-${reply.id}`}
        >
          <p className="text-xs font-semibold text-white">{reply.name}</p>
          <p className="text-xs text-white/70">{reply.content}</p>
        </div>
      ))}
    </div>
  );
}