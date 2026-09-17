import { useEffect, useRef, useState } from "react";
import {
    MessageCircle,
    X,
    Send,
    CalendarCheck,
    Loader2
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatTime } from "../utils/formatters";

const SESSION_KEY = "chatbot_session_id";

const createSessionId = () => {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `session_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
};

const getSessionId = () => {
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = createSessionId();
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
};

const WELCOME_MESSAGE = {
    role: "assistant",
    text:
        "Hi! I'm here to help you book a table. Tell me the date, time and how many guests, and I'll find you a spot."
};

const ChatWidget = () => {
    const { user } = useAuth();

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        WELCOME_MESSAGE
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const scrollRef = useRef(null);
    const sessionIdRef = useRef(null);

    if (!sessionIdRef.current) {
        sessionIdRef.current = getSessionId();
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop =
                scrollRef.current.scrollHeight;
        }
    }, [messages, open, sending]);

    const sendMessage = async (e) => {
        e.preventDefault();

        const trimmed = input.trim();

        if (!trimmed || sending) {
            return;
        }

        setError("");
        setInput("");

        setMessages((prev) => [
            ...prev,
            { role: "user", text: trimmed }
        ]);

        setSending(true);

        try {
            const response = await api.post(
                "/chatbot/message",
                {
                    sessionId: sessionIdRef.current,
                    message: trimmed
                }
            );

            const { reply, reservation } = response.data;

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: reply,
                    reservation: reservation || null
                }
            ]);
        } catch (err) {
            console.error("Chatbot error:", err);

            const message =
                err.response?.data?.message ||
                "Sorry, something went wrong. Please try again.";

            setError(message);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: message
                }
            ]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">

            {open && (
                <div className="mb-4 flex h-130 w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">

                    {/* Header */}
                    <div className="flex items-center justify-between bg-gray-950 px-5 py-4 text-white">
                        <div>
                            <p className="font-semibold">
                                Booking Assistant
                            </p>

                            <p className="text-xs text-gray-300">
                                {user
                                    ? `Chatting as ${user.name}`
                                    : "Ask me anything, or book a table"}
                            </p>
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-full p-1.5 text-gray-300 hover:bg-white/10 hover:text-white"
                            aria-label="Close chat"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-4"
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.role === "user"
                                            ? "bg-gray-950 text-white"
                                            : "border bg-white text-gray-800"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {msg.text}
                                    </p>

                                    {msg.reservation && (
                                        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-gray-900">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                                                <CalendarCheck
                                                    size={16}
                                                />
                                                Reservation confirmed
                                            </div>

                                            <div className="mt-2 space-y-1 text-xs text-gray-700">
                                                <p>
                                                    Table{" "}
                                                    {
                                                        msg
                                                            .reservation
                                                            .tableNumber
                                                    }{" "}
                                                    ·{" "}
                                                    {
                                                        msg
                                                            .reservation
                                                            .location
                                                    }
                                                </p>

                                                <p>
                                                    {formatDate(
                                                        msg
                                                            .reservation
                                                            .date
                                                    )}{" "}
                                                    ·{" "}
                                                    {formatTime(
                                                        msg
                                                            .reservation
                                                            .time
                                                    )}{" "}
                                                    ·{" "}
                                                    {
                                                        msg
                                                            .reservation
                                                            .guests
                                                    }{" "}
                                                    guests
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 text-sm text-gray-500">
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Typing...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={sendMessage}
                        className="flex items-center gap-2 border-t bg-white p-3"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) =>
                                setInput(e.target.value)
                            }
                            placeholder="Type a message..."
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                            maxLength={1000}
                        />

                        <button
                            type="submit"
                            disabled={
                                sending || !input.trim()
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-950 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-950 text-white shadow-lg transition hover:bg-gray-800 "
                aria-label={
                    open ? "Close help chat" : "Open help chat"
                }
            >
                {open ? (
                    <X size={22} />
                ) : (
                    <MessageCircle size={22}/>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
