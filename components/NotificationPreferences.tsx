"use client";

import { useEffect, useState } from "react";
import {
  getNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { PremiumSwitch } from "@/components/PremiumControls";
import { Bell, EnvelopeSimple, ChatCircle, DeviceMobile, FloppyDisk } from "@phosphor-icons/react";

export function NotificationPreferences() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getNotificationSettings();
      if (!cancelled) {
        setSettings(s);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    try {
      await updateNotificationSettings(settings);
      toast("Notification preferences saved.", "success");
    } catch {
      toast("Could not save preferences.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2.5rem] border border-ink/10 bg-white p-8 animate-pulse h-48" aria-hidden />
    );
  }

  const toggle =
    (key: keyof NotificationSettings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((prev) => ({ ...prev, [key]: e.target.checked }));
    };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="font-display text-2xl font-bold text-zinc-900">Notifications</h3>
          <p className="text-zinc-500 text-sm font-medium mt-1">
            Control in-app, email, WhatsApp, and SMS — synced with your academy profile.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-ink text-canvas font-bold text-sm hover:bg-ink/90 transition-colors disabled:opacity-60"
        >
          <FloppyDisk size={18} weight="bold" /> {saving ? "Saving…" : "Save preferences"}
        </button>
      </div>

      <ul className="space-y-4">
        <li className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-canvas-soft/80 border border-ink/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
              <Bell size={20} weight="duotone" className="text-ink" />
            </span>
            <div>
              <p className="font-bold text-ink">In-app</p>
              <p className="text-xs text-mute font-medium">Bell tray & session alerts</p>
            </div>
          </div>
          <PremiumSwitch
            checked={settings.inAppEnabled}
            onChange={(val) => setSettings(prev => ({ ...prev, inAppEnabled: val }))}
          />
        </li>

        <li className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-canvas-soft/80 border border-ink/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center shrink-0 border border-ink/10">
              <EnvelopeSimple size={20} weight="duotone" className="text-ink" />
            </span>
            <div>
              <p className="font-bold text-ink">Email</p>
              <p className="text-xs text-mute font-medium">Welcome, receipts, session reminders</p>
            </div>
          </div>
          <PremiumSwitch
            checked={settings.emailEnabled}
            onChange={(val) => setSettings(prev => ({ ...prev, emailEnabled: val }))}
          />
        </li>

        <li className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-canvas-soft/80 border border-ink/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center shrink-0 border border-ink/10">
              <ChatCircle size={20} weight="duotone" className="text-ink" />
            </span>
            <div>
              <p className="font-bold text-ink">WhatsApp</p>
              <p className="text-xs text-mute font-medium">Optional number override below</p>
            </div>
          </div>
          <PremiumSwitch
            checked={settings.whatsAppEnabled}
            onChange={(val) => setSettings(prev => ({ ...prev, whatsAppEnabled: val }))}
          />
        </li>

        <li className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-canvas-soft/80 border border-ink/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center shrink-0 border border-ink/10">
              <DeviceMobile size={20} weight="duotone" className="text-ink" />
            </span>
            <div>
              <p className="font-bold text-ink">SMS</p>
              <p className="text-xs text-mute font-medium">Critical alerts only</p>
            </div>
          </div>
          <PremiumSwitch
            checked={settings.smsEnabled}
            onChange={(val) => setSettings(prev => ({ ...prev, smsEnabled: val }))}
          />
        </li>
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-black/5">
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-900">WhatsApp number (optional)</label>
          <input
            type="tel"
            value={settings.whatsAppNumber ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, whatsAppNumber: e.target.value || null }))}
            placeholder="+20 …"
            className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-900">Email override (optional)</label>
          <input
            type="email"
            value={settings.emailOverride ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, emailOverride: e.target.value || null }))}
            placeholder="Use a different inbox for academy mail"
            className="w-full bg-zinc-50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
