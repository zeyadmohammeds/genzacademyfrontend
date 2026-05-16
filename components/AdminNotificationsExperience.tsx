"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { PaperPlaneTilt } from "@phosphor-icons/react";

export function AdminNotificationsExperience() {
  const [userId, setUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  async function send() {
    if (!userId || !subject || !body) {
      toast("Please fill all fields", "info");
      return;
    }
    setSending(true);
    try {
      await apiPost("/api/notifications/send", {
        recipientUserId: userId,
        subject,
        body,
        channels: ["InApp"]
      });
      toast("Notification sent successfully", "success");
      setSubject("");
      setBody("");
    } catch (e) {
      toast("Failed to send notification. Are you an admin?", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="ops-card" style={{ padding: 40, maxWidth: 700, animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div className="icon-badge" style={{ background: "var(--ink)", color: "white" }}>
          <PaperPlaneTilt size={24} weight="bold" />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>System Dispatch</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>Send global or targeted alerts across all channels</p>
        </div>
      </div>

      <div className="form-grid" style={{ display: "grid", gap: 24 }}>
        <div className="form-group">
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recipient User ID</label>
          <input 
            className="form-input" 
            value={userId} 
            onChange={e => setUserId(e.target.value)} 
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" 
            style={{ width: "100%", padding: "14px" }}
          />
          <small style={{ color: "var(--muted)", marginTop: 6, display: "block" }}>Enter the Guid of the student or staff member</small>
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Alert Subject</label>
          <input 
            className="form-input" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            placeholder="e.g. Important Course Update" 
            style={{ width: "100%", padding: "14px" }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Message Content</label>
          <textarea 
            className="form-input" 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            placeholder="Type your announcement here..." 
            rows={5} 
            style={{ width: "100%", padding: "14px", resize: "none" }}
          />
        </div>

        <div style={{ padding: "16px", background: "rgba(0,0,0,0.03)", borderRadius: "12px", fontSize: "0.85rem", color: "var(--muted)" }}>
          <strong>Note:</strong> This message will be delivered via the user's preferred channels (In-App, Email, WhatsApp) as configured in their settings.
        </div>

        <button 
          className="button button-dark" 
          onClick={send} 
          disabled={sending}
          style={{ padding: "18px", justifyContent: "center", fontSize: "1rem" }}
        >
          {sending ? (
            "Broadcasting..."
          ) : (
            <>
              <PaperPlaneTilt size={20} weight="bold" />
              Dispatch Notification
            </>
          )}
        </button>
      </div>
    </div>
  );
}
