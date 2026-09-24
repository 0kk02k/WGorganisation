import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Trash2, X } from "lucide-react";

export const StayChecklistSection = ({
  title,
  items,
  onToggle,
  onAdd,
  onDeleteItem,
  onEditItem,
  inputValue,
  setInputValue,
  testPrefix,
}) => {
  const isCheckin = testPrefix.includes('checkin');
  const headerGradientClass = isCheckin
    ? "from-teal-600 to-emerald-600"
    : "from-rose-600 to-pink-700";
  const barColorClass = isCheckin ? "bg-teal-600" : "bg-rose-600";
  const bgClass = isCheckin
    ? "bg-teal-400/10"
    : "bg-rose-400/10";

  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const saveEdit = (item) => {
    const next = editingText.trim();
    if (onEditItem && next && next !== item.text) {
      onEditItem(item.id, next);
    }
    setEditingItemId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingText("");
  };

  const totalCount = items.length;
  const doneCount = items.filter((item) => item.done).length;
  const allDone = totalCount > 0 && doneCount === totalCount;

  return (
    <Card
      className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      data-testid={`${testPrefix}-card`}
    >
      <CardHeader className={`bg-gradient-to-r ${headerGradientClass} border-b-4 border-black p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle
            className="text-white text-2xl"
            style={{ fontFamily: "'Bangers', cursive", textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            data-testid={`${testPrefix}-title`}
          >
            {title}
          </CardTitle>
          {totalCount > 0 && (
            <span
              className="text-sm font-bold text-black bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
              data-testid={`${testPrefix}-progress`}
            >
              {allDone ? "Alles erledigt!" : `${doneCount}/${totalCount} erledigt`}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className={`p-4 space-y-3 ${bgClass}`}>
        {totalCount > 0 && (
          <div
            className="h-2 border-2 border-black bg-white"
            role="progressbar"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`${title}: ${doneCount} von ${totalCount} erledigt`}
            data-testid={`${testPrefix}-progressbar`}
          >
            <div
              className={`h-full ${barColorClass}`}
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`grid items-start gap-3 border-2 border-black p-3 transition-colors ${
              editingItemId === item.id
                ? "bg-white grid-cols-[1fr_auto]"
                : `grid-cols-[auto_1fr_auto] ${
                    item.done
                      ? "bg-gray-100"
                      : isCheckin
                        ? "bg-gradient-to-r from-teal-50 to-emerald-50"
                        : "bg-gradient-to-r from-rose-50 to-pink-50"
                  }`
            }`}
            data-testid={`${testPrefix}-item-${item.id}`}
          >
            {editingItemId === item.id ? (
              <>
                <Input
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveEdit(item);
                    if (event.key === "Escape") cancelEdit();
                  }}
                  aria-label="Punkt bearbeiten"
                  className="border-2 border-black rounded-none text-gray-800"
                  data-testid={`${testPrefix}-edit-input-${item.id}`}
                />
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => saveEdit(item)}
                    aria-label="Änderung speichern"
                    className="h-11 w-11 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-2 border-black rounded-none"
                    data-testid={`${testPrefix}-edit-save-${item.id}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={cancelEdit}
                    aria-label="Bearbeiten abbrechen"
                    className="h-11 w-11 bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-black rounded-none"
                    data-testid={`${testPrefix}-edit-cancel-${item.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(checked) => onToggle(item.id, checked)}
                  aria-label={`${item.text} — ${item.done ? "wieder öffnen" : "als erledigt markieren"}`}
                  className="h-6 w-6 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white mt-0.5 justify-self-start"
                  data-testid={`${testPrefix}-toggle-${item.id}`}
                />
                <span
                  className={`text-gray-800 ${item.done ? "line-through text-gray-600" : ""}`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  data-testid={`${testPrefix}-text-${item.id}`}
                >
                  {item.text}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(item)}
                    aria-label={`"${item.text}" bearbeiten`}
                    className="h-11 w-11 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-2 border-black rounded-none"
                    data-testid={`${testPrefix}-edit-${item.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteItem?.(item.id)}
                    aria-label={`"${item.text}" löschen`}
                    className="h-11 w-11 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-black rounded-none"
                    data-testid={`${testPrefix}-delete-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onAdd();
              }
            }}
            placeholder="Neuer Punkt"
            aria-label={`Neuer Punkt für ${title}`}
            className="border-2 border-black rounded-none"
            data-testid={`${testPrefix}-input`}
          />
          <Button
            onClick={onAdd}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150"
            data-testid={`${testPrefix}-add`}
          >
            Hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
