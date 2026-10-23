import type { LucideIcon } from "lucide-react-native";
import { theme } from "@/constants/theme";

type AppIconProps = {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function AppIcon({
  icon: Icon,
  size = 24,
  color = theme.colors.darkBlue,
  strokeWidth = 2,
}: AppIconProps) {
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
