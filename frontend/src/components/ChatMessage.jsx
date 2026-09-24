import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import ChatReplyList from "@/components/ChatReplyList";
import ChatEditForm from "@/components/ChatEditForm";
import ChatReplyForm from "@/components/ChatReplyForm";
import { motion } from "framer-motion";
import { chatMessage } from "@/lib/motion";

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
    <motion.div
      className="border-2 border-black bg-white p-4"
      data-testid={`chat-message-${message.id}`}
      variants={chatMessage}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
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
                aria-label={`Auf die Nachricht von ${message.name} antworten`}
                title="Antworten"
                className="h-11 w-11 bg-teal-100 hover:bg-teal-200 text-teal-700 border-2 border-black rounded-none"
                data-testid={`chat-reply-button-${message.id}`}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                aria-label={`Nachricht von ${message.name} bearbeiten`}
                title="Bearbeiten"
                className="h-11 w-11 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-black rounded-none"
                data-testid={`chat-edit-button-${message.id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Nachricht von ${message.name} löschen`}
                    title="Löschen"
                    className="h-11 w-11 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-black rounded-none"
                    data-testid={`chat-delete-button-${message.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <AlertDialogHeader className="bg-gradient-to-r from-red-500 to-rose-500 border-b-4 border-black p-4 -m-6 mb-0">
                    <AlertDialogTitle
                      className="text-white text-2xl"
                      style={{ fontFamily: "'Bangers', cursive" }}
                    >
                      Nachricht wirklich löschen?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription
                    className="text-gray-600 pt-8"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Die Nachricht von {message.name} und alle Antworten darauf werden dauerhaft entfernt.
                  </AlertDialogDescription>
                  <AlertDialogFooter className="flex gap-2 mt-4">
                    <AlertDialogCancel className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
                      Abbrechen
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
                    >
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
    </motion.div>
  );
}