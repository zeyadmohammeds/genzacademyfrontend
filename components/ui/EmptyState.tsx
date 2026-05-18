"use client";

import { FolderOpen } from "@phosphor-icons/react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  mini?: boolean;
};

export function EmptyState({ icon, title, description, action, mini }: EmptyStateProps) {
  if (mini) {
    return (
      <div className="empty-state-mini">
        <p className="font-bold text-zinc-400">{title}</p>
        {description && <p className="text-xs text-zinc-300 mt-1">{description}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        {icon || <FolderOpen size={32} className="text-zinc-300" />}
      </div>
      <h3 className="font-bold text-lg text-zinc-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-400 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
