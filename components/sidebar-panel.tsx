"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarPanelProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function SidebarPanel({ 
  title, 
  icon, 
  onClose, 
  children, 
  className,
  footer 
}: SidebarPanelProps) {
  return (
    <div className={cn("flex h-full flex-col bg-[#1c1f2e] text-white", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <button 
          onClick={onClose} 
          className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="mt-4 shrink-0 border-t border-white/10 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}
