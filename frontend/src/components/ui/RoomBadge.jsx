import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

// relative Luminanz (WCAG), um Schwarz/Weiß je Zimmerfarbe zu wählen
const readableTextColor = (hex) => {
  const normalized = (hex || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return "#1a1a1a";
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.25 ? "#1a1a1a" : "#ffffff";
};

/**
 * RoomBadge - A parallelogram-shaped badge for room identification
 * Used consistently across Dashboard, Calendar, and StaysList
 */
export const RoomBadge = ({
  roomId,
  size = "default",
  className = "",
  testId = null
}) => {
  const { settings } = useSettings();
  const rooms = settings?.rooms || DEFAULT_ROOMS;

  const room = rooms.find((r) => r.id === roomId);
  const roomColor = room?.color || '#facc15';
  const roomName = room?.name || `Zimmer ${roomId}`;
  const textColor = readableTextColor(roomColor);

  // Size variants
  const sizeStyles = {
    small: "px-2 py-0.5 text-xs",
    default: "px-3 py-1 text-sm",
    large: "px-4 py-1.5 text-base"
  };

  return (
    <span
      className={`
        inline-block
        font-bold
        border-2
        border-black
        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        transform
        -skew-x-6
        ${sizeStyles[size]}
        ${className}
      `}
      style={{
        backgroundColor: roomColor,
        color: textColor,
        fontFamily: "'Nunito', sans-serif"
      }}
      data-testid={testId}
    >
      <span className="inline-block transform skew-x-6">
        {roomName}
      </span>
    </span>
  );
};

export default RoomBadge;
