import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

export default function ChatEditForm({
  messageId,
  value,
  onChange,
  onSave,
  onCancel,
  onDelete,
}) {
  return (
    <div className="mt-3 space-y-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[80px] rounded-2xl border border-white/10 bg-white/5 text-white"
        data-testid={`chat-edit-input-${messageId}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={onSave}
          className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
          data-testid={`chat-edit-save-${messageId}`}
        >
          Speichern
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="rounded-full border-white/10 text-white"
          data-testid={`chat-edit-cancel-${messageId}`}
        >
          Abbrechen
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="ml-auto rounded-full text-red-200 hover:text-red-100 hover:bg-red-500/10"
          data-testid={`chat-edit-delete-${messageId}`}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Löschen
        </Button>
      </div>
    </div>
  );
}