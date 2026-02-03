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
import { ROOMS } from "@/lib/constants";

export const StayEditDialog = ({ stay, onSave }) => {
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
        <Button variant="outline" data-testid="stay-edit-button">
          Details bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" data-testid="stay-edit-dialog">
        <DialogHeader>
          <DialogTitle data-testid="stay-edit-title">Aufenthalt bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-700"
              data-testid="stay-edit-name-label"
            >
              Name
            </label>
            <Input
              value={form.occupant_name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, occupant_name: event.target.value }))
              }
              data-testid="stay-edit-name"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
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
                <SelectTrigger data-testid="stay-edit-room">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOMS.map((room) => (
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
                className="text-sm font-medium text-stone-700"
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
                data-testid="stay-edit-start"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
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
                data-testid="stay-edit-end"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                data-testid="stay-edit-notes-label"
              >
                Hinweise
              </label>
              <Textarea
                value={form.notes || ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                data-testid="stay-edit-notes"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onSave(form);
              setOpen(false);
            }}
            className="rounded-full bg-emerald-900 text-emerald-50 hover:bg-emerald-800"
            data-testid="stay-edit-save"
          >
            Änderungen speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
