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
  const isCheckin = testPrefix.includes('checkin');
  const gradientClass = isCheckin 
    ? "from-teal-400 to-emerald-400" 
    : "from-rose-400 to-pink-400";
  const bgClass = isCheckin 
    ? "bg-teal-400/10" 
    : "bg-rose-400/10";

  return (
    <Card 
      className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      data-testid={`${testPrefix}-card`}
    >
      <CardHeader className={`bg-gradient-to-r ${gradientClass} border-b-4 border-black p-4`}>
        <CardTitle 
          className="text-white text-2xl"
          style={{ fontFamily: "'Bangers', cursive" }}
          data-testid={`${testPrefix}-title`}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-4 space-y-3 ${bgClass}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 border-4 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 ${
              item.done 
                ? "bg-gray-100" 
                : isCheckin 
                  ? "bg-gradient-to-r from-teal-50 to-emerald-50" 
                  : "bg-gradient-to-r from-rose-50 to-pink-50"
            }`}
            data-testid={`${testPrefix}-item-${item.id}`}
          >
            <Checkbox
              checked={item.done}
              onCheckedChange={(checked) => onToggle(item.id, checked)}
              className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
              data-testid={`${testPrefix}-toggle-${item.id}`}
            />
            <span
              className={`text-gray-800 ${item.done ? "line-through text-gray-400" : ""}`}
              style={{ fontFamily: "'Nunito', sans-serif" }}
              data-testid={`${testPrefix}-text-${item.id}`}
            >
              {item.text}
            </span>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Neuer Punkt"
            className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all duration-150"
            data-testid={`${testPrefix}-input`}
          />
          <Button 
            onClick={onAdd}
            className={`bg-gradient-to-r ${gradientClass} hover:opacity-90 text-black font-bold border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150`}
            data-testid={`${testPrefix}-add`}
          >
            Hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
