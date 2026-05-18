import { 
  Robot, MonitorPlay, Lightning, Globe, Shield, 
  DeviceMobile, ChartBar, PaintBrush, BookOpen
} from "@phosphor-icons/react";

export function CourseIcon({ iconName, className = "w-6 h-6", size = 24 }: { iconName?: string, className?: string, size?: number }) {
  const name = iconName?.toLowerCase() || "";
  
  if (name.includes("robot") || name.includes("🤖")) {
    return <Robot size={size} className={className} weight="bold" />;
  }
  if (name.includes("code") || name.includes("💻") || name.includes("intro") || name.includes("game")) {
    return <MonitorPlay size={size} className={className} weight="bold" />;
  }
  if (name.includes("lightning") || name.includes("sfml") || name.includes("⚡") || name.includes("advanced")) {
    return <Lightning size={size} className={className} weight="bold" />;
  }
  if (name.includes("web") || name.includes("globe") || name.includes("🌐")) {
    return <Globe size={size} className={className} weight="bold" />;
  }
  if (name.includes("shield") || name.includes("cyber") || name.includes("🛡️")) {
    return <Shield size={size} className={className} weight="bold" />;
  }
  if (name.includes("mobile") || name.includes("phone") || name.includes("📱")) {
    return <DeviceMobile size={size} className={className} weight="bold" />;
  }
  if (name.includes("chart") || name.includes("data") || name.includes("📊")) {
    return <ChartBar size={size} className={className} weight="bold" />;
  }
  if (name.includes("scratch") || name.includes("paint") || name.includes("🎨")) {
    return <PaintBrush size={size} className={className} weight="bold" />;
  }
  return <BookOpen size={size} className={className} weight="bold" />;
}
