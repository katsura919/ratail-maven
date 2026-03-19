"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Users,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    CheckCircle2,
    XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
}

interface Lead {
    id: string;
    created_at: string;
    name?: string;
    email?: string;
    phone?: string;
    qualified: boolean;
    program?: string;
    fit?: string;
    urgency?: string;
    ready?: string;
    why?: string;
    disqualify_reason?: string;
    conversation: ConversationMessage[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SCORE_COLOR: Record<string, string> = {
    High: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Conversation transcript ──────────────────────────────────────────────────

function Transcript({ messages }: { messages: ConversationMessage[] }) {
    return (
        <div className="flex flex-col gap-2 pt-3 border-t border-zinc-100 mt-3">
            {messages.map((m, i) => {
                const isUser = m.role === "user";
                return (
                    <div key={i} className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
                        {!isUser && (
                            <div className="w-5 h-5 rounded-full bg-[#C8472A]/10 border border-[#C8472A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[7px] font-bold text-[#C8472A]">M</span>
                            </div>
                        )}
                        <div className={cn(
                            "max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed",
                            isUser
                                ? "bg-[#C8472A] text-white rounded-br-sm"
                                : "bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-bl-sm"
                        )}>
                            {m.content}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Lead row ─────────────────────────────────────────────────────────────────

function LeadRow({ lead }: { lead: Lead }) {
    const [expanded, setExpanded] = React.useState(false);
    const displayName = lead.name || "Anonymous";
    const hasContact = !!(lead.name || lead.email);

    return (
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
            {/* Summary row */}
            <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        {/* Qualified indicator */}
                        <div className="mt-0.5 flex-shrink-0">
                            {lead.qualified
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                : <XCircle className="w-4 h-4 text-zinc-400" />
                            }
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-zinc-900">{displayName}</span>
                                {lead.email && (
                                    <span className="text-xs text-zinc-400">{lead.email}</span>
                                )}
                                {!hasContact && (
                                    <span className="text-xs text-zinc-400 italic">No contact info</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {lead.qualified && lead.program && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8472A]/8 text-[#C8472A] border border-[#C8472A]/20 font-medium">
                                        {lead.program}
                                    </span>
                                )}
                                {!lead.qualified && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                                        Not qualified
                                    </span>
                                )}
                                {lead.fit && (
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", SCORE_COLOR[lead.fit])}>
                                        Fit: {lead.fit}
                                    </span>
                                )}
                                {lead.urgency && (
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", SCORE_COLOR[lead.urgency])}>
                                        Urgency: {lead.urgency}
                                    </span>
                                )}
                                {lead.ready && (
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", SCORE_COLOR[lead.ready])}>
                                        Ready: {lead.ready}
                                    </span>
                                )}
                            </div>

                            {lead.why && (
                                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
                                    {lead.why}
                                </p>
                            )}
                            {lead.disqualify_reason && (
                                <p className="text-xs text-zinc-400 mt-1 italic">{lead.disqualify_reason}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs text-zinc-400 whitespace-nowrap">
                            {formatDate(lead.created_at)}
                        </span>
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
                        >
                            {expanded ? (
                                <><ChevronUp className="w-3.5 h-3.5" /> Hide chat</>
                            ) : (
                                <><ChevronDown className="w-3.5 h-3.5" /> View chat</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Conversation transcript */}
            {expanded && lead.conversation?.length > 0 && (
                <div className="px-4 pb-4 bg-zinc-50/50 border-t border-zinc-100">
                    <Transcript messages={lead.conversation} />
                </div>
            )}
        </div>
    );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function LeadsModal() {
    const [open, setOpen] = React.useState(false);
    const [leads, setLeads] = React.useState<Lead[]>([]);
    const [loading, setLoading] = React.useState(false);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/leads");
            const data = await res.json();
            setLeads(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when modal opens
    React.useEffect(() => {
        if (open) fetchLeads();
    }, [open]);

    const qualified = leads.filter((l) => l.qualified);
    const disqualified = leads.filter((l) => !l.qualified);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 border border-transparent hover:border-zinc-200">
                    <Users className="w-3.5 h-3.5" />
                    <span>Leads</span>
                    {leads.length === 0 && !open ? null : (
                        <span className="bg-[#C8472A] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none">
                            {qualified.length}
                        </span>
                    )}
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-full max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-5 py-4 border-b border-zinc-100 flex-shrink-0">
                    <div className="flex items-center justify-between pr-6">
                        <div>
                            <DialogTitle className="text-base font-semibold">Lead Conversations</DialogTitle>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                {qualified.length} qualified · {disqualified.length} not qualified
                            </p>
                        </div>
                        <button
                            onClick={fetchLeads}
                            disabled={loading}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {loading && leads.length === 0 && (
                        <div className="flex items-center justify-center py-12 text-zinc-400 text-sm">
                            Loading leads...
                        </div>
                    )}

                    {!loading && leads.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
                            <Users className="w-8 h-8 opacity-30" />
                            <p className="text-sm">No leads yet</p>
                        </div>
                    )}

                    {qualified.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide px-1">
                                Qualified ({qualified.length})
                            </p>
                            {qualified.map((lead) => (
                                <LeadRow key={lead.id} lead={lead} />
                            ))}
                        </div>
                    )}

                    {disqualified.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide px-1">
                                Not Qualified ({disqualified.length})
                            </p>
                            {disqualified.map((lead) => (
                                <LeadRow key={lead.id} lead={lead} />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
