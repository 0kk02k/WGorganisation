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
    <div className="mt-4 space-y-3 border-4 border-black bg-gradient-to-r from-cyan-50 to-teal-50 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <Input
        value={replyForm.name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Dein Name"
        className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150 text-gray-800"
        data-testid={`chat-reply-name-${messageId}`}
      />
      <Textarea
        value={replyForm.content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Antwort schreiben"
        className="min-h-[70px] border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150 text-gray-800"
        data-testid={`chat-reply-content-${messageId}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={onSubmit}
          className="bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
          data-testid={`chat-reply-submit-${messageId}`}
        >
          Antworten
        </Button>
        <Button
          size="sm"
          onClick={onCancel}
          className="bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
          data-testid={`chat-reply-cancel-${messageId}`}
        >
          Abbrechen
        </Button>
      </div>
    </div>
  );
}