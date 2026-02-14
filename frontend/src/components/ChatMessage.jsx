import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { MessageCircle, Pencil } from "lucide-react";
import ChatReplyList from "@/components/ChatReplyList";
import ChatEditForm from "@/components/ChatEditForm";
import ChatReplyForm from "@/components/ChatReplyForm";

export default function ChatMessage({
  message,
  isEditing,
  editingContent,
  setEditingContent,
  isReplying,
  replyForm,
  setReplyForm,
  onUpdate,
  onCancelEdit,
  onReplySubmit,
  onCancelReply,
  onEdit,
  onDelete,
  onReply,
  onEditReply,
  onDeleteReply,
}) {
  return (
    <div
      className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
      data-testid={`chat-message-${message.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-white">{message.name}</p>
        <div className="flex items-center gap-1">
          <p className="text-xs text-white/50 mr-2">
            {format(parseISO(message.created_at), "dd.MM HH:mm")}
          </p>
          {!isEditing && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={onReply}
                className="h-7 w-7 rounded-full text-white/70 hover:text-white"
                data-testid={`chat-reply-button-${message.id}`}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                className="h-7 w-7 rounded-full text-white/70 hover:text-white"
                data-testid={`chat-edit-button-${message.id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {!isEditing && (
        <p className="text-sm text-white/70">{message.content}</p>
      )}
      {isEditing && (
        <ChatEditForm
          messageId={message.id}
          value={editingContent}
          onChange={setEditingContent}
          onSave={onUpdate}
          onCancel={onCancelEdit}
          onDelete={onDelete}
        />
      )}
      {isReplying && (
        <ChatReplyForm
          messageId={message.id}
          replyForm={replyForm}
          onNameChange={(value) =>
            setReplyForm((prev) => ({ ...prev, name: value }))
          }
          onContentChange={(value) =>
            setReplyForm((prev) => ({ ...prev, content: value }))
          }
          onSubmit={onReplySubmit}
          onCancel={onCancelReply}
        />
      )}
      {message.replies?.length > 0 && (
        <ChatReplyList
          messageId={message.id}
          replies={message.replies}
          onEditReply={onEditReply}
          onDeleteReply={onDeleteReply}
        />
      )}
    </div>
  );
}