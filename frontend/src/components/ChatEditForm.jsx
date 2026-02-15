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
        className="min-h-[80px] border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150 text-gray-800"
        data-testid={`chat-edit-input-${messageId}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={onSave}
          className="bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
          data-testid={`chat-edit-save-${messageId}`}
        >
          Speichern
        </Button>
        <Button
          size="sm"
          onClick={onCancel}
          className="bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
          data-testid={`chat-edit-cancel-${messageId}`}
        >
          Abbrechen
        </Button>
        <Button
          size="sm"
          onClick={onDelete}
          className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
          data-testid={`chat-edit-delete-${messageId}`}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Löschen
        </Button>
      </div>
    </div>
  );
}