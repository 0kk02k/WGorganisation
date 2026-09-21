import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
              data-testid={`chat-edit-delete-${messageId}`}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Löschen
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
              Die Nachricht und alle Antworten darauf werden dauerhaft entfernt.
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
      </div>
    </div>
  );
}