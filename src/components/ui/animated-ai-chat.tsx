"use client";

import * as React from "react";
import { useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import {
    Paperclip,
    SendIcon,
    XIcon,
    LoaderIcon,
    Command,
    TrendingUp,
    Store,
    Users,
    LineChart,
    CheckCircle2,
    ArrowRight,
    CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LeadsModal } from "@/components/ui/leads-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Qualification {
    r: boolean;
    prog?: string;
    why: string;
    fit?: string;
    urgency?: string;
    ready?: string;
    disqualify_reason?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMessageText(m: any): string {
    return (
        m.text ||
        m.content ||
        m.parts?.map((p: any) => (p.type === "text" ? p.text : "")).join("") ||
        ""
    );
}

/** Strips the qualification JSON block from text for display (handles partial streaming too). */
function cleanForDisplay(content: string): string {
    const idx = content.lastIndexOf('{"r":');
    return idx !== -1 ? content.slice(0, idx).trim() : content;
}

/** Parses the complete qualification JSON from the end of a finished message. */
function parseQualification(content: string): {
    text: string;
    qualification: Qualification | null;
} {
    const idx = content.lastIndexOf('{"r":');
    if (idx === -1) return { text: content, qualification: null };

    const jsonStr = content.slice(idx);
    const closeIdx = jsonStr.indexOf('}');
    if (closeIdx === -1) return { text: content.slice(0, idx).trim(), qualification: null };

    try {
        const qualification = JSON.parse(jsonStr.slice(0, closeIdx + 1)) as Qualification;
        return { text: content.slice(0, idx).trim(), qualification };
    } catch {
        return { text: content.slice(0, idx).trim(), qualification: null };
    }
}

const SCORE_COLOR: Record<string, string> = {
    High: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

// ─── Auto-resize textarea hook ────────────────────────────────────────────────

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }
            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) textarea.style.height = `${minHeight}px`;
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

// ─── Textarea component ───────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    containerClassName?: string;
    showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, containerClassName, showRing = true, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        return (
            <div className={cn("relative", containerClassName)}>
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "transition-all duration-200 ease-in-out",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {showRing && isFocused && (
                    <motion.span
                        className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-[#C8472A]/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

// ─── Command suggestions ──────────────────────────────────────────────────────

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

const commandSuggestions: CommandSuggestion[] = [
    { icon: <TrendingUp className="w-4 h-4" />, label: "Growth Strategy", description: "Find your path to $1M in sales", prefix: "/grow" },
    { icon: <LineChart className="w-4 h-4" />, label: "Inventory Fix", description: "Optimize your stock levels", prefix: "/stock" },
    { icon: <Users className="w-4 h-4" />, label: "Hire Help", description: "Get out of the weeds and lead", prefix: "/hire" },
    { icon: <Store className="w-4 h-4" />, label: "Sell Business", description: "Prepare for your next chapter", prefix: "/exit" },
];

const chipSuggestions = [
    "I want to hit $1M",
    "Doing under $200K",
    "Ready to sell my store",
    "Drowning in inventory",
    "Work way too many hours",
];

// ─── Typing dots ──────────────────────────────────────────────────────────────

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ role, content }: { role: string; content: string }) {
    const isUser = role === "user";
    return (
        <motion.div
            className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#C8472A]/10 border border-[#C8472A]/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <span className="text-[9px] font-bold text-[#C8472A] tracking-tight">MVN</span>
                </div>
            )}
            <div
                className={cn(
                    "max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isUser
                        ? "bg-[#C8472A] text-white rounded-br-sm"
                        : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm shadow-sm"
                )}
            >
                {content}
            </div>
        </motion.div>
    );
}

// ─── Qualification result card ────────────────────────────────────────────────

interface QualificationCardProps {
    qualification: Qualification;
    leadId: string | null;
}

function QualificationCard({ qualification, leadId }: QualificationCardProps) {
    const [form, setForm] = React.useState({ name: "", email: "", phone: "" });
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || submitting) return;
        setSubmitting(true);
        try {
            if (leadId) {
                await fetch(`/api/leads/${leadId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            }
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (!qualification.r) {
        return (
            <motion.div
                className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm p-5 space-y-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <p className="text-sm font-medium text-zinc-700">Thanks for chatting with Maven</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{qualification.why}</p>
                <a
                    href="https://retailmavens.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#C8472A] font-medium hover:underline"
                >
                    Explore free resources <ArrowRight className="w-3.5 h-3.5" />
                </a>
            </motion.div>
        );
    }

    if (submitted) {
        return (
            <motion.div
                className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium text-sm">You&apos;re all set!</span>
                </div>
                <p className="text-sm text-emerald-600 leading-relaxed">
                    The RETAILMavens team will reach out within 24 hours to schedule your free strategy call.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C8472A]/5 to-transparent px-5 pt-5 pb-4 border-b border-zinc-100">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#C8472A]/10 border border-[#C8472A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-[#C8472A] tracking-tight">MVN</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-900">
                            You&apos;re a great fit for {qualification.prog}
                        </p>
                        <p className="text-sm text-zinc-500 leading-relaxed">{qualification.why}</p>
                    </div>
                </div>

                {/* Score badges */}
                {(qualification.fit || qualification.urgency || qualification.ready) && (
                    <div className="flex gap-2 mt-3 ml-11">
                        {qualification.fit && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", SCORE_COLOR[qualification.fit])}>
                                Fit: {qualification.fit}
                            </span>
                        )}
                        {qualification.urgency && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", SCORE_COLOR[qualification.urgency])}>
                                Urgency: {qualification.urgency}
                            </span>
                        )}
                        {qualification.ready && (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", SCORE_COLOR[qualification.ready])}>
                                Ready: {qualification.ready}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Contact form */}
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                    Book your free strategy call
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        className="col-span-2 sm:col-span-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#C8472A]/20 focus:border-[#C8472A]/40 placeholder:text-zinc-400"
                    />
                    <input
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                        className="col-span-2 sm:col-span-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#C8472A]/20 focus:border-[#C8472A]/40 placeholder:text-zinc-400"
                    />
                    <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="col-span-2 px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#C8472A]/20 focus:border-[#C8472A]/40 placeholder:text-zinc-400"
                    />
                </div>
                <motion.button
                    type="submit"
                    disabled={!form.name.trim() || !form.email.trim() || submitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
                        form.name.trim() && form.email.trim() && !submitting
                            ? "bg-[#C8472A] text-white shadow-md shadow-[#C8472A]/20"
                            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    )}
                >
                    {submitting ? (
                        <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                    ) : (
                        <CalendarDays className="w-4 h-4" />
                    )}
                    {submitting ? "Saving..." : "Book My Free Strategy Call"}
                </motion.button>
            </form>
        </motion.div>
    );
}

// ─── Input card ───────────────────────────────────────────────────────────────

interface InputCardProps {
    elevated?: boolean;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    adjustHeight: (reset?: boolean) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    setInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
    attachments: string[];
    removeAttachment: (i: number) => void;
    showCommandPalette: boolean;
    activeSuggestion: number;
    commandPaletteRef: React.RefObject<HTMLDivElement | null>;
    selectCommandSuggestion: (i: number) => void;
    setShowCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
    handleAttachFile: () => void;
    isLoading: boolean;
    handleSubmit: () => void;
}

function InputCard({
    elevated = true,
    input,
    setInput,
    textareaRef,
    adjustHeight,
    handleKeyDown,
    setInputFocused,
    attachments,
    removeAttachment,
    showCommandPalette,
    activeSuggestion,
    commandPaletteRef,
    selectCommandSuggestion,
    setShowCommandPalette,
    handleAttachFile,
    isLoading,
    handleSubmit,
}: InputCardProps) {
    return (
        <div className={cn(
            "relative bg-white/90 backdrop-blur-2xl rounded-2xl border border-zinc-200",
            elevated && "shadow-xl"
        )}>
            {/* Command palette */}
            <AnimatePresence>
                {showCommandPalette && (
                    <motion.div
                        ref={commandPaletteRef}
                        className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-white rounded-lg z-50 shadow-lg border border-zinc-200 overflow-hidden"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="py-1">
                            {commandSuggestions.map((suggestion, index) => (
                                <motion.div
                                    key={suggestion.prefix}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                                        activeSuggestion === index
                                            ? "bg-zinc-100 text-zinc-900"
                                            : "text-zinc-600 hover:bg-zinc-50"
                                    )}
                                    onClick={() => selectCommandSuggestion(index)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center text-zinc-400">
                                        {suggestion.icon}
                                    </div>
                                    <div className="font-medium text-zinc-900">{suggestion.label}</div>
                                    <div className="text-zinc-400 ml-1">{suggestion.prefix}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Textarea */}
            <div className="p-4 pb-2">
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Tell me about your store..."
                    containerClassName="w-full"
                    className="w-full px-2 py-1 resize-none bg-transparent border-none text-zinc-900 text-sm focus:outline-none placeholder:text-zinc-400 min-h-[40px]"
                    style={{ overflow: "hidden" }}
                    showRing={false}
                />
            </div>

            {/* Attachments */}
            <AnimatePresence>
                {attachments.length > 0 && (
                    <motion.div
                        className="px-4 pb-2 flex gap-2 flex-wrap"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {attachments.map((file, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2 text-xs bg-zinc-100 py-1.5 px-3 rounded-lg text-zinc-600 border border-zinc-200"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <span>{file}</span>
                                <button onClick={() => removeAttachment(index)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <motion.button
                        type="button"
                        onClick={handleAttachFile}
                        whileTap={{ scale: 0.94 }}
                        className="p-2 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors"
                    >
                        <Paperclip className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        type="button"
                        data-command-button
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setShowCommandPalette((prev) => !prev);
                        }}
                        whileTap={{ scale: 0.94 }}
                        className={cn(
                            "p-2 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors",
                            showCommandPalette && "bg-zinc-100 text-zinc-900"
                        )}
                    >
                        <Command className="w-4 h-4" />
                    </motion.button>
                </div>

                <motion.button
                    type="button"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isLoading || !input.trim()}
                    className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                        input.trim() && !isLoading
                            ? "bg-[#C8472A] text-white shadow-md shadow-[#C8472A]/25"
                            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                    ) : (
                        <SendIcon className="w-4 h-4" />
                    )}
                    <span>{isLoading ? "Thinking..." : "Send"}</span>
                </motion.button>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnimatedAIChat() {
    const { messages, sendMessage, status } = useChat<UIMessage>();

    const [input, setInput] = React.useState("");
    const isLoading = status === "submitted" || status === "streaming";
    const hasMessages = messages.some((m) => m.role === "user");

    // Lead qualification state
    const [qualification, setQualification] = React.useState<Qualification | null>(null);
    const [leadId, setLeadId] = React.useState<string | null>(null);
    const savedRef = useRef(false); // sync guard — prevents double-saves

    // Detect qualification JSON once streaming completes
    useEffect(() => {
        if (isLoading || savedRef.current) return;

        const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
        if (!lastAssistant) return;

        const { qualification: q } = parseQualification(getMessageText(lastAssistant));
        if (!q) return;

        savedRef.current = true;
        setQualification(q);

        // Save lead to file store
        fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                qualified: q.r,
                program: q.prog,
                fit: q.fit,
                urgency: q.urgency,
                ready: q.ready,
                why: q.why,
                disqualify_reason: q.disqualify_reason,
                conversation: messages.map((m) => ({
                    role: m.role,
                    content: getMessageText(m),
                })),
            }),
        })
            .then((res) => res.json())
            .then((data) => setLeadId(data.id))
            .catch(console.error);
    }, [isLoading, messages]);

    const handleSubmit = () => {
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput("");
        adjustHeight(true);
    };

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });
    const [attachments, setAttachments] = React.useState<string[]>([]);
    const [showCommandPalette, setShowCommandPalette] = React.useState(false);
    const [activeSuggestion, setActiveSuggestion] = React.useState(-1);
    const [inputFocused, setInputFocused] = React.useState(false);
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, qualification]);

    // Mouse tracking for glow effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Slash command palette trigger
    useEffect(() => {
        if (input.startsWith("/") && !input.includes(" ")) {
            setShowCommandPalette(true);
            const idx = commandSuggestions.findIndex((c) => c.prefix.startsWith(input));
            setActiveSuggestion(idx >= 0 ? idx : -1);
        } else {
            setShowCommandPalette(false);
        }
    }, [input]);

    // Click outside command palette
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const commandBtn = document.querySelector("[data-command-button]");
            if (
                commandPaletteRef.current &&
                !commandPaletteRef.current.contains(target) &&
                !commandBtn?.contains(target)
            ) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectCommandSuggestion = (index: number) => {
        setInput(commandSuggestions[index].prefix + " ");
        setShowCommandPalette(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev < commandSuggestions.length - 1 ? prev + 1 : 0));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : commandSuggestions.length - 1));
            } else if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                if (activeSuggestion >= 0) selectCommandSuggestion(activeSuggestion);
            } else if (e.key === "Escape") {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) handleSubmit();
        }
    };

    const handleAttachFile = () => {
        const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
        setAttachments((prev) => [...prev, mockFileName]);
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const inputCardProps = {
        input, setInput, textareaRef, adjustHeight, handleKeyDown, setInputFocused,
        attachments, removeAttachment, showCommandPalette, activeSuggestion,
        commandPaletteRef, selectCommandSuggestion, setShowCommandPalette,
        handleAttachFile, isLoading, handleSubmit,
    };

    return (
        <div className="h-screen flex flex-col bg-zinc-50/50 text-zinc-900 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8472A]/5 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C8472A]/5 rounded-full blur-[128px] animate-pulse delay-700" />
                <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-zinc-200/50 rounded-full blur-[96px] animate-pulse delay-1000" />
            </div>

            <AnimatePresence mode="wait">
                {!hasMessages ? (
                    /* ── EMPTY STATE: centered ───────────────────────────── */
                    <motion.div
                        key="empty"
                        className="flex-1 flex flex-col items-center justify-center px-6 pb-16 relative z-10"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {/* Header */}
                        <motion.div
                            className="text-center mb-8 space-y-2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                        >
                            <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500">
                                Find your path to $1M+
                            </h1>
                            <p className="text-sm text-zinc-500">
                                Chat with Maven, our AI advisor — takes about 2 minutes
                            </p>
                        </motion.div>

                        {/* Static greeting bubble */}
                        <motion.div
                            className="w-full max-w-2xl mb-4 flex items-start gap-2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.14, duration: 0.4 }}
                        >
                            <div className="w-7 h-7 rounded-full bg-[#C8472A]/10 border border-[#C8472A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[9px] font-bold text-[#C8472A] tracking-tight">MVN</span>
                            </div>
                            <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-zinc-200 text-zinc-800 text-sm leading-relaxed shadow-sm">
                                Hi! I&apos;m Maven, your RETAILMavens AI advisor — here to help you find the best next step for your store. What&apos;s going on in your business right now?
                            </div>
                        </motion.div>

                        {/* Input card */}
                        <motion.div
                            className="w-full max-w-2xl"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18, duration: 0.4 }}
                        >
                            <InputCard elevated {...inputCardProps} />
                        </motion.div>

                        {/* Quick-start chips */}
                        <motion.div
                            className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        >
                            {chipSuggestions.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion}
                                    onClick={() => {
                                        setInput(suggestion);
                                        setTimeout(() => {
                                            textareaRef.current?.focus();
                                            adjustHeight();
                                        }, 0);
                                    }}
                                    className="relative px-3 py-2 bg-white hover:bg-zinc-50 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 transition-colors border border-zinc-200 shadow-sm group"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {suggestion}
                                    <span className="absolute inset-0 rounded-lg border border-[#C8472A]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                ) : (
                    /* ── ACTIVE STATE: full chat layout ──────────────────── */
                    <motion.div
                        key="chat"
                        className="flex-1 flex flex-col overflow-hidden relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* Top bar */}
                        <div className="flex-shrink-0 border-b border-zinc-200 bg-white/80 backdrop-blur-xl px-6 py-3">
                            <div className="max-w-2xl mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#C8472A]/10 border border-[#C8472A]/20 flex items-center justify-center">
                                        <span className="text-[8px] font-bold text-[#C8472A] tracking-tight">MVN</span>
                                    </div>
                                    <span className="text-sm font-medium text-zinc-800">Maven</span>
                                    <span className="text-xs text-zinc-400">· RETAILMavens Advisor</span>
                                </div>
                                <LeadsModal />
                            </div>
                        </div>

                        {/* Message list */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-4">
                                {messages.map((m: any) => {
                                    const raw = getMessageText(m);
                                    const text = m.role === "assistant" ? cleanForDisplay(raw) : raw;
                                    if (!text) return null;
                                    return <MessageBubble key={m.id} role={m.role} content={text} />;
                                })}

                                {/* Streaming indicator */}
                                {isLoading && (
                                    <motion.div
                                        className="flex justify-start"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="w-7 h-7 rounded-full bg-[#C8472A]/10 border border-[#C8472A]/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                            <span className="text-[9px] font-bold text-[#C8472A] tracking-tight">MVN</span>
                                        </div>
                                        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center">
                                            <TypingDots />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Qualification result card */}
                                <AnimatePresence>
                                    {qualification && !isLoading && (
                                        <QualificationCard
                                            qualification={qualification}
                                            leadId={leadId}
                                        />
                                    )}
                                </AnimatePresence>

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input pinned to bottom — hidden once qualified */}
                        {!qualification && (
                            <div className="flex-shrink-0 border-t border-zinc-200 bg-white/80 backdrop-blur-xl px-6 py-4">
                                <div className="max-w-2xl mx-auto">
                                    <InputCard elevated={false} {...inputCardProps} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cursor glow */}
            {inputFocused && (
                <motion.div
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.03] bg-gradient-to-r from-[#C8472A] via-[#E2856E] to-[#C8472A] blur-[96px]"
                    animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
                    transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
                />
            )}
        </div>
    );
}
