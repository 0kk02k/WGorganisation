import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const StayChecklistSection = ({
  title,
  items,
  onToggle,
  onAdd,
  inputValue,
  setInputValue,
  testPrefix,
}) => {
  return (
    <Card className="border-stone-200/80" data-testid={`${testPrefix}-card`}>
      <CardHeader>
        <CardTitle data-testid={`${testPrefix}-title`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
            data-testid={`${testPrefix}-item-${item.id}`}
          >
            <Checkbox
              checked={item.done}
              onCheckedChange={(checked) => onToggle(item.id, checked)}
              data-testid={`${testPrefix}-toggle-${item.id}`}
            />
            <span
              className={`text-sm ${item.done ? "line-through text-stone-400" : "text-stone-700"}`}
              data-testid={`${testPrefix}-text-${item.id}`}
            >
              {item.text}
            </span>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Neuer Punkt"
            data-testid={`${testPrefix}-input`}
          />
          <Button onClick={onAdd} data-testid={`${testPrefix}-add`}>
            Hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
