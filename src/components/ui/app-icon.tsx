import {
  Search,
  ArrowRight,
  ChevronLeft,
  House,
  Pill,
  Book,
  ChartNoAxesColumn,
  HeartPulse,
  UserRound,
  BookBookmark,
  Activity,
  Share,
  BriefcaseMedical,
  Check,
  FlaskConical,
  Scan,
  ClipboardList,
  FileText,
} from "lucide-react-native";
import type { ColorValue } from "react-native";
export type AppIconName = keyof typeof icons;

type AppIconProps = {
  icon: AppIconName;
  size: number;
  color: ColorValue;
  strokeWidth: number;
};

const icons = {
  search: Search,
  arrow: ArrowRight,
  back: ChevronLeft,
  home: House,
  LearnTab: Book,
  TrackTab: ChartNoAxesColumn,
  HealthTab: HeartPulse,
  Profile: UserRound,
  HomeLearn: BookBookmark,
  HomeTrack: Activity,
  HomeHealth: BriefcaseMedical,
  HomeShare: Share,
  select: Check,
  Treatment: Pill,
  Labs: FlaskConical,
  Imaging: Scan,
  Medications: Pill,
  Treatments: ClipboardList,
  Records: FileText,
};

const AppIcon = (props: AppIconProps) => {
  const Icon = icons[props.icon];
  return (
    <Icon
      size={props.size}
      color={props.color}
      strokeWidth={props.strokeWidth}
    />
  );
};

export default AppIcon;
