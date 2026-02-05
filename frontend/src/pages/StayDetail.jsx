import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { getRoomBadgeStyle } from "@/lib/color";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StayEditDialog } from "@/components/stays/StayEditDialog";
import { StayChecklistSection } from "@/components/stays/StayChecklistSection";
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
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export default function StayDetail() {
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCheckin, setNewCheckin] = useState("");
  const [newCheckout, setNewCheckout] = useState("");

  useEffect(() => {
    const loadStay = async () => {
      try {
        const response = await api.get(`/stays/${id}`);
        setStay(response.data);
      } finally {
        setLoading(false);
      }
    };
    loadStay();
  }, [id]);

  const updateStay = async (payload) => {
    const response = await api.put(`/stays/${id}`, payload);
    setStay(response.data);
  };

  const handleToggle = async (listKey, itemId, checked) => {
    if (!stay) return;
    const nextValue = checked === true;
    const updatedList = stay[listKey].map((item) =>
      item.id === itemId ? { ...item, done: nextValue } : item,
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

  const rooms = settings?.rooms || DEFAULT_ROOMS;
  const roomColor = rooms.find((room) => room.id === stay.room)?.color;

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
          <h1 className="text-3xl font-bold tracking-tight" data-testid="stay-detail-title">
            {stay.occupant_name}
          </h1>
          <p className="text-sm text-stone-600" data-testid="stay-detail-date">
            {format(parseISO(stay.start_date), "dd.MM.")} –
            {" "}
            {format(parseISO(stay.end_date), "dd.MM.yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            style={getRoomBadgeStyle(roomColor)}
            className="border border-transparent text-stone-900"
            data-testid="stay-detail-room"
          >
            Zimmer {stay.room}
          </Badge>
          <StayEditDialog stay={stay} onSave={updateStay} />
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
        <StayChecklistSection
          title="Check-in Liste"
          items={stay.checklist_in}
          onToggle={(itemId, checked) =>
            handleToggle("checklist_in", itemId, checked)
          }
          onAdd={() => {
            handleAddItem("checklist_in", newCheckin);
            setNewCheckin("");
          }}
          inputValue={newCheckin}
          setInputValue={setNewCheckin}
          testPrefix="stay-checkin"
        />
        <StayChecklistSection
          title="Check-out Liste"
          items={stay.checklist_out}
          onToggle={(itemId, checked) =>
            handleToggle("checklist_out", itemId, checked)
          }
          onAdd={() => {
            handleAddItem("checklist_out", newCheckout);
            setNewCheckout("");
          }}
          inputValue={newCheckout}
          setInputValue={setNewCheckout}
          testPrefix="stay-checkout"
        />
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
