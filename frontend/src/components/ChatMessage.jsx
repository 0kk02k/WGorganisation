import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ChatMessage({
  message,
  isEditing,
  isReplying,
  editingContent,
  setEditingContent,
  replyForm,
  setReplyForm,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  onReply,
  onCancelReply,
  onReplySubmit,
}) {
  return (
    <div
      className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
      data-testid={`chat-message-${message.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{message.name}</p>
          {!isEditing && (
            <p className="text-sm text-white/70">{message.content}</p>
          )}
        </div>
        <p className="text-xs text-white/50">
          {format(parseISO(message.created_at), "dd.MM HH:mm")}
        </p>
      </div>
      {isEditing && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={editingContent}
            onChange={(event) => setEditingContent(event.target.value)}
            className="min-h-[80px] rounded-2xl border border-white/10 bg-white/5 text-white"
            data-testid={`chat-edit-input-${message.id}`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={onUpdate}
              className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
              data-testid={`chat-edit-save-${message.id}`}
            >
              Speichern
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEdit}
              className="rounded-full border-white/10 text-white"
              data-testid={`chat-edit-cancel-${message.id}`}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      )}
      {!isEditing && (
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
      )}
      {isReplying && (
        <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <Input
            value={replyForm.name}
            onChange={(event) =>
              setReplyForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            placeholder="Dein Name"
            className="rounded-2xl border-white/10 bg-white/5 text-white"
            data-testid={`chat-reply-name-${message.id}`}
          />
          <Textarea
            value={replyForm.content}
            onChange={(event) =>
              setReplyForm((prev) => ({
                ...prev,
                content: event.target.value,
              }))
            }
            placeholder="Antwort schreiben"
            className="min-h-[70px] rounded-2xl border border-white/10 bg-white/5 text-white"
            data-testid={`chat-reply-content-${message.id}`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={onReplySubmit}
              className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
              data-testid={`chat-reply-submit-${message.id}`}
            >
              Antworten
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelReply}
              className="rounded-full border-white/10 text-white"
              data-testid={`chat-reply-cancel-${message.id}`}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      )}
      {message.replies?.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
          {message.replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-xl border border-white/5 bg-white/5 px-3 py-2"
              data-testid={`chat-reply-${message.id}-${reply.id}`}
            >
              <p className="text-xs font-semibold text-white">{reply.name}</p>
              <p className="text-xs text-white/70">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}