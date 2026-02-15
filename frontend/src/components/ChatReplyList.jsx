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
    <div className="mt-4 space-y-2 border-t-4 border-black pt-3">
      {replies.map((reply) => (
        <div
          key={reply.id}
          className="border-4 border-black bg-gradient-to-r from-cyan-50 to-teal-50 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          data-testid={`chat-reply-${messageId}-${reply.id}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p 
              className="text-sm font-bold text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
            >
              {reply.name}
            </p>
            <div className="flex items-center gap-1">
              {editingReplyId !== reply.id && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(reply)}
                    className="h-6 w-6 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-black rounded-none"
                    data-testid={`reply-edit-button-${reply.id}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(reply.id)}
                    className="h-6 w-6 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-black rounded-none"
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
                className="min-h-[60px] text-sm border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-gray-800"
                data-testid={`reply-edit-input-${reply.id}`}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSave(reply.id)}
                  className="h-7 bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  data-testid={`reply-save-button-${reply.id}`}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Speichern
                </Button>
                <Button
                  size="sm"
                  onClick={handleCancel}
                  className="h-7 bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  data-testid={`reply-cancel-button-${reply.id}`}
                >
                  <X className="h-3 w-3 mr-1" />
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <p 
              className="text-sm text-gray-600"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {reply.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}