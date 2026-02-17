import { DEFAULT_ROOMS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

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
        text-black
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
