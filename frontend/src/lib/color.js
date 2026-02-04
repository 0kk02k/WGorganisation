const normalizeHex = (hex) => {
  if (!hex) return "#94a3b8";
  if (hex.startsWith("#")) return hex;
  return `#${hex}`;
};

export const hexToRgba = (hex, alpha = 1) => {
  const value = normalizeHex(hex).replace("#", "");
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getRoomBadgeStyle = (hex) => ({
  backgroundColor: hexToRgba(hex, 0.18),
  color: "#1c1917",
});

export const getRoomDotStyle = (hex) => ({
  backgroundColor: hex || "#94a3b8",
});
