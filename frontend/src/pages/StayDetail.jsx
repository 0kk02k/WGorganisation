import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { staysApi } from "@/lib/api";
import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loadError, setLoadError] = useState(null);
  const [newCheckin, setNewCheckin] = useState("");
  const [newCheckout, setNewCheckout] = useState("");

  const loadStay = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await staysApi.get(id);
      setStay(data);
    } catch (error) {
      console.error("Failed to load stay:", error);
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStay();
  }, [loadStay]);

  const updateStay = async (payload) => {
    const data = await staysApi.update(id, payload);
    setStay(data);
  };

  const handleToggle = async (listKey, itemId, checked) => {
    if (!stay) return;
    const nextValue = checked === true;
    const previousList = stay[listKey];
    const updatedList = previousList.map((item) =>
      item.id === itemId ? { ...item, done: nextValue } : item,
    );
    // Optimistisch setzen, bei Fehler zurückrollen
    setStay({ ...stay, [listKey]: updatedList });
    try {
      await updateStay({ [listKey]: updatedList });
    } catch (error) {
      console.error("Failed to update stay:", error);
      setStay((prev) => (prev ? { ...prev, [listKey]: previousList } : prev));
      toast.error("Änderung konnte nicht gespeichert werden. Bitte erneut versuchen.");
    }
  };

  const handleAddItem = async (listKey, text) => {
    if (!stay || !text.trim()) return false;
    const updatedList = [
      ...stay[listKey],
      { id: createId(), text: text.trim(), done: false },
    ];
    try {
      await updateStay({ [listKey]: updatedList });
      return true;
    } catch (error) {
      console.error("Failed to add checklist item:", error);
      toast.error("Punkt konnte nicht hinzugefügt werden. Bitte erneut versuchen.");
      return false;
    }
  };

  const handleDeleteItem = async (listKey, itemId) => {
    if (!stay) return;
    const previousList = stay[listKey];
    const updatedList = previousList.filter((item) => item.id !== itemId);
    setStay({ ...stay, [listKey]: updatedList });
    try {
      await updateStay({ [listKey]: updatedList });
    } catch (error) {
      console.error("Failed to delete checklist item:", error);
      setStay((prev) => (prev ? { ...prev, [listKey]: previousList } : prev));
      toast.error("Punkt konnte nicht gelöscht werden. Bitte erneut versuchen.");
    }
  };

  const handleRenameItem = async (listKey, itemId, text) => {
    if (!stay) return;
    const updatedList = stay[listKey].map((item) =>
      item.id === itemId ? { ...item, text } : item,
    );
    try {
      await updateStay({ [listKey]: updatedList });
    } catch (error) {
      console.error("Failed to rename checklist item:", error);
      toast.error("Punkt konnte nicht geändert werden. Bitte erneut versuchen.");
    }
  };

  const handleDelete = async () => {
    try {
      await staysApi.delete(id);
      toast.success("Aufenthalt gelöscht.");
      navigate("/kalender");
    } catch (error) {
      console.error("Failed to delete stay:", error);
      toast.error("Löschen fehlgeschlagen. Prüfe die Verbindung und versuche es erneut.");
    }
  };

  if (loading) {
    return (
      <Card
        className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-xl"
        data-testid="stay-loading"
      >
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-8 w-2/3 rounded-none bg-gray-200" />
          <Skeleton className="h-24 w-full rounded-none bg-gray-200" />
        </div>
        <p
          className="sr-only"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Aufenthalt wird geladen...
        </p>
      </Card>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl" data-testid="stay-load-error">
        <ErrorCard
          title="Aufenthalt konnte nicht geladen werden."
          message="Prüfe die Verbindung und versuche es erneut."
          onRetry={() => {
            setLoading(true);
            loadStay();
          }}
        />
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="min-h-screen bg-white relative p-8 space-y-4" data-testid="stay-not-found">
        <div className="absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <p 
          className="text-gray-500 relative z-10"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Aufenthalt nicht gefunden.
        </p>
        <Button 
          asChild 
          className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
        >
          <Link to="/kalender" data-testid="stay-back-link">
            Zurück zum Kalender
          </Link>
        </Button>
      </div>
    );
  }

  const rooms = settings?.rooms || DEFAULT_ROOMS;
  const roomColor = rooms.find((room) => room.id === stay.room)?.color;
  const roomLabel =
    rooms.find((room) => room.id === stay.room)?.name || `Zimmer ${stay.room}`;

  return (
    <div className="min-h-screen relative" data-testid="stay-detail-page">
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/kalender"
              className="text-sm text-gray-500 hover:text-gray-800 font-semibold"
              data-testid="stay-back"
            >
              Zurück
            </Link>
            <h1 
              className="text-4xl tracking-wide text-gray-800"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="stay-detail-title"
            >
              {stay.occupant_name}
            </h1>
            <div className="h-2 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 w-32" />
            <p 
              className="text-gray-500"
              style={{ fontFamily: "'Nunito', sans-serif" }}
              data-testid="stay-detail-date"
            >
              {format(parseISO(stay.start_date), "dd.MM.")} -{" "}
              {format(parseISO(stay.end_date), "dd.MM.yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className="text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-4 py-2"
              style={{ backgroundColor: roomColor || '#facc15' }}
              data-testid="stay-detail-room"
            >
              {roomLabel}
            </Badge>
            <StayEditDialog stay={stay} onSave={updateStay} />
          </div>
        </div>

        {/* Notes Card */}
        <Card className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <CardHeader className="bg-white border-b-4 border-black p-4">
            <CardTitle 
              className="text-gray-800 text-2xl"
              style={{ fontFamily: "'Bangers', cursive" }}
              data-testid="stay-notes-title"
            >
              Notiz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-amber-400/10">
            <p 
              className="text-gray-600"
              style={{ fontFamily: "'Nunito', sans-serif" }}
              data-testid="stay-notes-text"
            >
              {stay.notes || "Noch keine Notiz hinterlegt."}
            </p>
          </CardContent>
        </Card>

        {/* Checklists */}
        <div className="grid gap-6 lg:grid-cols-2">
          <StayChecklistSection
            title="Check-in Liste"
            items={stay.checklist_in}
            onToggle={(itemId, checked) =>
              handleToggle("checklist_in", itemId, checked)
            }
            onAdd={async () => {
              // Input erst bei Erfolg leeren, damit der getippte Text bei einem
              // API-Fehler nicht verloren geht
              const success = await handleAddItem("checklist_in", newCheckin);
              if (success) setNewCheckin("");
            }}
            onDeleteItem={(itemId) => handleDeleteItem("checklist_in", itemId)}
            onEditItem={(itemId, text) => handleRenameItem("checklist_in", itemId, text)}
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
            onAdd={async () => {
              const success = await handleAddItem("checklist_out", newCheckout);
              if (success) setNewCheckout("");
            }}
            onDeleteItem={(itemId) => handleDeleteItem("checklist_out", itemId)}
            onEditItem={(itemId, text) => handleRenameItem("checklist_out", itemId, text)}
            inputValue={newCheckout}
            setInputValue={setNewCheckout}
            testPrefix="stay-checkout"
          />
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
              data-testid="stay-delete-trigger"
            >
              Aufenthalt löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent 
            className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            data-testid="stay-delete-dialog"
          >
            <AlertDialogHeader className="bg-gradient-to-r from-red-500 to-rose-500 border-b-4 border-black p-4 -m-6 mb-0">
              <AlertDialogTitle 
                className="text-white text-2xl"
                style={{ fontFamily: "'Bangers', cursive" }}
                data-testid="stay-delete-title"
              >
                Aufenthalt wirklich löschen?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription 
              className="text-gray-600 pt-8"
              style={{ fontFamily: "'Nunito', sans-serif" }}
              data-testid="stay-delete-description"
            >
              Die Checklisten und Details werden dauerhaft entfernt.
            </AlertDialogDescription>
            <AlertDialogFooter className="flex gap-2 mt-4">
              <AlertDialogCancel 
                className="bg-white hover:bg-gray-100 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
                data-testid="stay-delete-cancel"
              >
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
                data-testid="stay-delete-confirm"
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
 