import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import { staysApi } from "@/lib/appwrite";
import {
  DEFAULT_CHECKIN_TEMPLATE,
  DEFAULT_CHECKOUT_TEMPLATE,
  DEFAULT_ROOMS,
} from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const buildChecklist = (items) =>
  items.map((text) => ({ id: createId(), text, done: false }));

export const StayDialog = ({ onCreated, triggerLabel, triggerTestId }) => {
  const { settings } = useSettings();
  const rooms = settings?.rooms || DEFAULT_ROOMS;
  const checkinTemplate =
    settings?.checkin_template || DEFAULT_CHECKIN_TEMPLATE;
  const checkoutTemplate =
    settings?.checkout_template || DEFAULT_CHECKOUT_TEMPLATE;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    occupant_name: "",
    room: "A",
    start_date: "",
    end_date: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      occupant_name: "",
      room: rooms[0]?.id || "A",
      start_date: "",
      end_date: "",
      notes: "",
    });
  }, [open, rooms]);

  const handleSubmit = async () => {
    if (!form.occupant_name || !form.start_date || !form.end_date) {
      toast.error("Bitte Name und Datum ausfüllen.");
      return;
    }

    try {
      const payload = {
        ...form,
        checklist_in: buildChecklist(checkinTemplate),
        checklist_out: buildChecklist(checkoutTemplate),
      };
      const data = await staysApi.create(payload);
      toast.success("Aufenthalt angelegt.");
      onCreated?.(data);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create stay:", error);
      toast.error(`Anlegen fehlgeschlagen: ${error.message || "Unbekannter Fehler"}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
          data-testid={triggerTestId}
        >
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl" data-testid="stay-dialog">
        <DialogHeader>
          <DialogTitle data-testid="stay-dialog-title">
            Neue Belegung anlegen
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-700"
              data-testid="stay-form-occupant-label"
            >
              Name der Person
            </label>
            <Input
              value={form.occupant_name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  occupant_name: event.target.value,
                }))
              }
              placeholder="z.B. Lea oder Ben"
              data-testid="stay-form-occupant-input"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                data-testid="stay-form-room-label"
              >
                Zimmer
              </label>
              <Select
                value={form.room}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, room: value }))
                }
              >
                <SelectTrigger data-testid="stay-form-room-select">
                  <SelectValue placeholder="Zimmer auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem
                      key={room.id}
                      value={room.id}
                      data-testid={`stay-form-room-option-${room.id}`}
                    >
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                data-testid="stay-form-start-label"
              >
                Check-in
              </label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    start_date: event.target.value,
                  }))
                }
                data-testid="stay-form-start-date"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                data-testid="stay-form-end-label"
              >
                Check-out
              </label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    end_date: event.target.value,
                  }))
                }
                data-testid="stay-form-end-date"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                data-testid="stay-form-notes-label"
              >
                Hinweise
              </label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Ankunftszeit, Schlüsselort ..."
                data-testid="stay-form-notes-input"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <CalendarDays className="h-4 w-4" />
              <span data-testid="stay-checklist-preview-title">
                Checklisten werden automatisch angelegt
              </span>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-stone-600 md:grid-cols-2">
              <div>
                <p
                  className="font-medium text-stone-700"
                  data-testid="stay-checkin-preview"
                >
                  Check-in:
                </p>
                <ul className="list-disc pl-5">
                  {checkinTemplate.map((item, index) => (
                    <li
                      key={`ci-${index}`}
                      data-testid={`stay-checkin-preview-${index}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p
                  className="font-medium text-stone-700"
                  data-testid="stay-checkout-preview"
                >
                  Check-out:
                </p>
                <ul className="list-disc pl-5">
                  {checkoutTemplate.map((item, index) => (
                    <li
                      key={`co-${index}`}
                      data-testid={`stay-checkout-preview-${index}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="stay-dialog-cancel"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-full bg-[#B026FF] text-white hover:bg-[#B026FF]/80"
            data-testid="stay-dialog-submit"
          >
            Belegung speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
