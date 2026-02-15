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
      className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4"
      data-testid={`chat-message-${message.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p 
          className="text-lg font-bold text-gray-800"
          style={{ fontFamily: "'Bangers', cursive" }}
        >
          {message.name}
        </p>
        <div className="flex items-center gap-1">
          <p 
            className="text-xs text-gray-500 mr-2"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {format(parseISO(message.created_at), "dd.MM HH:mm")}
          </p>
          {!isEditing && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={onReply}
                className="h-8 w-8 bg-teal-100 hover:bg-teal-200 text-teal-700 border-2 border-black rounded-none"
                data-testid={`chat-reply-button-${message.id}`}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                className="h-8 w-8 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-black rounded-none"
                data-testid={`chat-edit-button-${message.id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {!isEditing && (
        <p 
          className="text-gray-600 mt-2"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {message.content}
        </p>
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