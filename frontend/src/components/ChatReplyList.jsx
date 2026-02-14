import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, X, Check } from "lucide-react";

export default function ChatReplyList({
  messageId,
  replies,
  onEditReply,
  onDeleteReply,
}) {
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const startEdit = (reply) => {
    setEditingReplyId(reply.id);
    setEditingContent(reply.content);
  };

  const handleSave = (replyId) => {
    if (onEditReply) {
      onEditReply(messageId, replyId, editingContent);
    }
    setEditingReplyId(null);
    setEditingContent("");
  };

  const handleCancel = () => {
    setEditingReplyId(null);
    setEditingContent("");
  };

  const handleDelete = (replyId) => {
    if (onDeleteReply) {
      onDeleteReply(messageId, replyId);
    }
  };

  return (
    <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className="rounded-xl border border-white/5 bg-white/5 px-3 py-2"
          data-testid={`chat-reply-${messageId}-${reply.id}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-white">{reply.name}</p>
            <div className="flex items-center gap-1">
              {editingReplyId !== reply.id && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(reply)}
                    className="h-5 w-5 rounded-full text-white/50 hover:text-white"
                    data-testid={`reply-edit-button-${reply.id}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(reply.id)}
                    className="h-5 w-5 rounded-full text-red-200/50 hover:text-red-200"
                    data-testid={`reply-delete-button-${reply.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
          {editingReplyId === reply.id ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="min-h-[60px] text-xs rounded-xl border-white/10 bg-white/5 text-white"
                data-testid={`reply-edit-input-${reply.id}`}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSave(reply.id)}
                  className="h-6 rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
                  data-testid={`reply-save-button-${reply.id}`}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Speichern
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-6 rounded-full text-white/70 hover:text-white"
                  data-testid={`reply-cancel-button-${reply.id}`}
                >
                  <X className="h-3 w-3 mr-1" />
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/70">{reply.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}