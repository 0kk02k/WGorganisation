import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

export const StayEditDialog = ({ stay, onSave }) => {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(stay);

  useEffect(() => {
    if (open) {
      setForm(stay);
    }
  }, [open, stay]);

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-white hover:bg-gray-100 text-gray-800 font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
          data-testid="stay-edit-button"
        >
          Details bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-lg max-h-[95vh] overflow-hidden flex flex-col bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-gray-800 p-0"
        data-testid="stay-edit-dialog"
      >
        <DialogHeader className="bg-gradient-to-r from-teal-400 to-emerald-400 border-b-4 border-black p-4">
          <DialogTitle 
            className="text-white text-2xl"
            style={{ fontFamily: "'Bangers', cursive" }}
            data-testid="stay-edit-title"
          >
            Aufenthalt bearbeiten
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2 pt-2">
            <label
              className="text-sm font-bold text-gray-800"
              data-testid="stay-edit-name-label"
            >
              Name
            </label>
            <Input
              value={form.occupant_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, occupant_name: event.target.value }))
              }
              className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
              data-testid="stay-edit-name"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-gray-800"
                data-testid="stay-edit-room-label"
              >
                Zimmer
              </label>
              <Select
                value={form.room}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, room: value }))
                }
              >
                <SelectTrigger 
                  data-testid="stay-edit-room"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(settings?.rooms || DEFAULT_ROOMS).map((room) => (
                    <SelectItem
                      key={room.id}
                      value={room.id}
                      data-testid={`stay-edit-room-${room.id}`}
                    >
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-gray-800"
                data-testid="stay-edit-start-label"
              >
                Check-in
              </label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, start_date: event.target.value }))
                }
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                data-testid="stay-edit-start"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-gray-800"
                data-testid="stay-edit-end-label"
              >
                Check-out
              </label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, end_date: event.target.value }))
                }
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                data-testid="stay-edit-end"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-bold text-gray-800"
                data-testid="stay-edit-notes-label"
              >
                Notiz
              </label>
              <Textarea
                value={form.notes || ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
                data-testid="stay-edit-notes"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 border-t-4 border-black bg-gray-50">
          <Button
            onClick={() => {
              onSave(form);
              setOpen(false);
            }}
            className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            data-testid="stay-edit-save"
          >
            Änderungen speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
