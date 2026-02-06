import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ChatReplyForm({
  messageId,
  replyForm,
  onNameChange,
  onContentChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <Input
        value={replyForm.name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Dein Name"
        className="rounded-2xl border-white/10 bg-white/5 text-white"
        data-testid={`chat-reply-name-${messageId}`}
      />
      <Textarea
        value={replyForm.content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Antwort schreiben"
        className="min-h-[70px] rounded-2xl border border-white/10 bg-white/5 text-white"
        data-testid={`chat-reply-content-${messageId}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={onSubmit}
          className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
          data-testid={`chat-reply-submit-${messageId}`}
        >
          Antworten
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="rounded-full border-white/10 text-white"
          data-testid={`chat-reply-cancel-${messageId}`}
        >
          Abbrechen
        </Button>
      </div>
    </div>
  );
}