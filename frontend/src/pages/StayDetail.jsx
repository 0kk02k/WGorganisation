import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ROOMS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export default function StayDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState(null);
  const [newCheckin, setNewCheckin] = useState("");
  const [newCheckout, setNewCheckout] = useState("");

  useEffect(() => {
    const loadStay = async () => {
      try {
        const response = await api.get(`/stays/${id}`);
        setStay(response.data);
        setEditForm(response.data);
      } finally {
        setLoading(false);
      }
    };
    loadStay();
  }, [id]);

  const updateStay = async (payload) => {
    const response = await api.put(`/stays/${id}`, payload);
    setStay(response.data);
    setEditForm(response.data);
  };

  const handleToggle = async (listKey, itemId, checked) => {
    if (!stay) return;
    const updatedList = stay[listKey].map((item) =>
      item.id === itemId ? { ...item, done: checked } : item,
    );
    await updateStay({ [listKey]: updatedList });
  };

  const handleAddItem = async (listKey, text) => {
    if (!stay || !text.trim()) return;
    const updatedList = [
      ...stay[listKey],
      { id: createId(), text: text.trim(), done: false },
    ];
    await updateStay({ [listKey]: updatedList });
  };

  const handleDelete = async () => {
    await api.delete(`/stays/${id}`);
    toast.success("Aufenthalt gelöscht.");
    navigate("/aufenthalte");
  };

  if (loading) {
    return (
      <div className="text-sm text-stone-600" data-testid="stay-loading">
        Aufenthalt wird geladen...
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="space-y-4" data-testid="stay-not-found">
        <p className="text-sm text-stone-600">Aufenthalt nicht gefunden.</p>
        <Button asChild variant="outline">
          <Link to="/aufenthalte" data-testid="stay-back-link">
            Zurück zur Übersicht
          </Link>
        </Button>
      </div>
    );
  }

  const roomStyle =
    ROOMS.find((room) => room.id === stay.room)?.badge ||
    "bg-stone-100 text-stone-900";

  return (
    <div className="space-y-6" data-testid="stay-detail-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/aufenthalte"
            className="text-sm text-stone-500"
            data-testid="stay-back"
          >
            ← Zurück
          </Link>
          <h1
            className="font-[Manrope] text-3xl font-bold tracking-tight"
            data-testid="stay-detail-title"
          >
            {stay.occupant_name}
          </h1>
          <p className="text-sm text-stone-600" data-testid="stay-detail-date">
            {format(parseISO(stay.start_date), "dd.MM.")} –
            {" "}
            {format(parseISO(stay.end_date), "dd.MM.yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={roomStyle} data-testid="stay-detail-room">
            Zimmer {stay.room}
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="stay-edit-button">
                Details bearbeiten
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" data-testid="stay-edit-dialog">
              <DialogHeader>
                <DialogTitle data-testid="stay-edit-title">
                  Aufenthalt bearbeiten
                </DialogTitle>
              </DialogHeader>
              {editForm && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-stone-700"
                      data-testid="stay-edit-name-label"
                    >
                      Name
                    </label>
                    <Input
                      value={editForm.occupant_name}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          occupant_name: event.target.value,
                        }))
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
                        value={editForm.room}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, room: value }))
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
                        value={editForm.start_date}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            start_date: event.target.value,
                          }))
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
                        value={editForm.end_date}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            end_date: event.target.value,
                          }))
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
                        value={editForm.notes || ""}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            notes: event.target.value,
                          }))
                        }
                        data-testid="stay-edit-notes"
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={() => updateStay(editForm)}
                  className="rounded-full bg-emerald-900 text-emerald-50 hover:bg-emerald-800"
                  data-testid="stay-edit-save"
                >
                  Änderungen speichern
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-stone-200/80" data-testid="stay-notes-card">
        <CardHeader>
          <CardTitle data-testid="stay-notes-title">Hinweise</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-600" data-testid="stay-notes-text">
            {stay.notes || "Noch keine Hinweise hinterlegt."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-stone-200/80" data-testid="stay-checkin-card">
          <CardHeader>
            <CardTitle data-testid="stay-checkin-title">Check-in Liste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stay.checklist_in.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                data-testid={`stay-checkin-item-${item.id}`}
              >
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(checked) =>
                    handleToggle("checklist_in", item.id, checked)
                  }
                  data-testid={`stay-checkin-toggle-${item.id}`}
                />
                <span
                  className={`text-sm ${item.done ? "line-through text-stone-400" : "text-stone-700"}`}
                  data-testid={`stay-checkin-text-${item.id}`}
                >
                  {item.text}
                </span>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Input
                value={newCheckin}
                onChange={(event) => setNewCheckin(event.target.value)}
                placeholder="Neuer Check-in Punkt"
                data-testid="stay-checkin-input"
              />
              <Button
                onClick={() => {
                  handleAddItem("checklist_in", newCheckin);
                  setNewCheckin("");
                }}
                data-testid="stay-checkin-add"
              >
                Hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80" data-testid="stay-checkout-card">
          <CardHeader>
            <CardTitle data-testid="stay-checkout-title">Check-out Liste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stay.checklist_out.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
                data-testid={`stay-checkout-item-${item.id}`}
              >
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(checked) =>
                    handleToggle("checklist_out", item.id, checked)
                  }
                  data-testid={`stay-checkout-toggle-${item.id}`}
                />
                <span
                  className={`text-sm ${item.done ? "line-through text-stone-400" : "text-stone-700"}`}
                  data-testid={`stay-checkout-text-${item.id}`}
                >
                  {item.text}
                </span>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Input
                value={newCheckout}
                onChange={(event) => setNewCheckout(event.target.value)}
                placeholder="Neuer Check-out Punkt"
                data-testid="stay-checkout-input"
              />
              <Button
                onClick={() => {
                  handleAddItem("checklist_out", newCheckout);
                  setNewCheckout("");
                }}
                data-testid="stay-checkout-add"
              >
                Hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            data-testid="stay-delete-trigger"
          >
            Aufenthalt löschen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent data-testid="stay-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="stay-delete-title">
              Aufenthalt wirklich löschen?
            </AlertDialogTitle>
            <AlertDialogDescription data-testid="stay-delete-description">
              Die Checklisten und Details werden dauerhaft entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="stay-delete-cancel">
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-testid="stay-delete-confirm"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
