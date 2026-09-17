import "dotenv/config";

import { GoogleGenAI, Type } from "@google/genai";

import {
    searchAvailableTables,
    bookTable,
    ALLOWED_RESERVATION_TIMES
} from "../services/bookingService.js";

// ============================================================
// Gemini client
// ============================================================

if (!process.env.GEMINI_API_KEY) {
    console.warn(
        "WARNING: GEMINI_API_KEY is not configured."
    );
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ============================================================
// Configuration
// ============================================================

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.6-flash";

const MAX_STORED_MESSAGES = 40;
const MAX_TOOL_ITERATIONS = 5;

// ============================================================
// In-memory conversation store
// ============================================================
//
// Key:
//   sessionId
//
// Value:
//   Gemini-native Content[]:
//
// [
//   {
//     role: "user",
//     parts: [{ text: "Hello" }]
//   },
//   {
//     role: "model",
//     parts: [{ text: "Hi!" }]
//   }
// ]
//
// IMPORTANT:
// We keep Gemini's original model parts untouched.
// This preserves thoughtSignature for Gemini 3 function calls.
// ============================================================

const sessions = new Map();

// ============================================================
// Gemini function declarations
// ============================================================

const tools = [
    {
        functionDeclarations: [
            {
                name: "search_tables",

                description:
                    "Search for available restaurant tables on a given date, time and party size. Always call this before booking so you have a real tableId and can tell the guest what tables are available.",

                parameters: {
                    type: Type.OBJECT,

                    properties: {
                        date: {
                            type: Type.STRING,

                            description:
                                "Reservation date in YYYY-MM-DD format."
                        },

                        time: {
                            type: Type.STRING,

                            enum: ALLOWED_RESERVATION_TIMES,

                            description:
                                "Reservation time. Must be one of the allowed reservation slots."
                        },

                        guests: {
                            type: Type.INTEGER,

                            description:
                                "Number of guests."
                        }
                    },

                    required: [
                        "date",
                        "time",
                        "guests"
                    ]
                }
            },

            {
                name: "book_table",

                description:
                    "Create a confirmed reservation for a specific table. Only call this after searching for tables, the guest has selected a table, all customer details have been collected, and the guest has explicitly confirmed the complete reservation details.",

                parameters: {
                    type: Type.OBJECT,

                    properties: {
                        tableId: {
                            type: Type.STRING,

                            description:
                                "The tableId returned by search_tables."
                        },

                        date: {
                            type: Type.STRING,

                            description:
                                "Reservation date in YYYY-MM-DD format."
                        },

                        time: {
                            type: Type.STRING,

                            enum: ALLOWED_RESERVATION_TIMES,

                            description:
                                "Reservation time."
                        },

                        guests: {
                            type: Type.INTEGER,

                            description:
                                "Number of guests."
                        },

                        customerName: {
                            type: Type.STRING,

                            description:
                                "Full name of the customer."
                        },

                        customerEmail: {
                            type: Type.STRING,

                            description:
                                "Customer email address."
                        },

                        customerPhone: {
                            type: Type.STRING,

                            description:
                                "Customer phone number. Must contain exactly 10 digits."
                        },

                        specialRequest: {
                            type: Type.STRING,

                            description:
                                "Optional special request from the customer."
                        }
                    },

                    required: [
                        "tableId",
                        "date",
                        "time",
                        "guests",
                        "customerName",
                        "customerEmail",
                        "customerPhone"
                    ]
                }
            }
        ]
    }
];

// ============================================================
// System prompt
// ============================================================

const buildSystemPrompt = (user) => {
    const today = new Date()
        .toISOString()
        .split("T")[0];

    const identityNote = user
        ? `
The visitor is logged in as:
Name: ${user.name}
Email: ${user.email}

You may use these as defaults for name and email, but ALWAYS confirm
the details before booking because the visitor may be booking for somebody else.
`
        : `
The visitor is NOT logged in.

You may:
- Answer questions.
- Search table availability.

You MUST NOT call book_table because the visitor is not authenticated.

If the visitor wants to make a booking, briefly tell them that they need
to log in or create an account first.
`;

    return `
You are a friendly restaurant reservation assistant embedded
inside a restaurant reservation website.

Your responsibilities:

1. Help guests understand the reservation process.

2. Help guests find available tables.

3. To search tables, collect:
   - Date
   - Time
   - Number of guests

4. Once the required information is available, call search_tables.

5. NEVER invent table availability.

6. Only tell the guest about tables that are actually returned
   by search_tables.

7. Once tables are available, let the guest choose a table.

8. After the guest chooses a table, collect:
   - Full name
   - Email
   - 10-digit phone number
   - Optional special request

9. Read the complete reservation details back to the guest:
   - Table
   - Date
   - Time
   - Number of guests
   - Name
   - Email
   - Phone
   - Special request, if any

10. Ask the guest to explicitly confirm the complete details.

11. ONLY after explicit confirmation may you call book_table.

12. NEVER claim that a reservation is confirmed unless book_table
    successfully returns a successful result.

13. If book_table fails, tell the guest that the reservation could
    not be completed and do not claim success.

14. Reservation times are limited to:

${ALLOWED_RESERVATION_TIMES.join(", ")}

15. Today's date is:

${today}

16. Reservations cannot be made for dates in the past.

17. If the user gives a past date, ask them for a future date.

18. If the user gives an invalid time, show the allowed reservation times.

19. If the user gives an invalid phone number, ask for exactly
    10 digits.

20. Keep responses short, friendly and conversational.

21. This is a chat widget, not an email.

22. Do not expose internal tool names, API details, database details,
    thought signatures or implementation details to the guest.

23. Do not make up reservation IDs, table IDs, availability,
    prices or confirmation details.

${identityNote}
`;
};

// ============================================================
// Run a Gemini function
// ============================================================

const runToolCall = async (
    functionName,
    input,
    user
) => {
    // --------------------------------------------------------
    // Search tables
    // --------------------------------------------------------

    if (functionName === "search_tables") {
        return searchAvailableTables(input);
    }

    // --------------------------------------------------------
    // Book table
    // --------------------------------------------------------

    if (functionName === "book_table") {
        // Server-side authentication protection.
        // Do NOT rely only on the AI system prompt.
        if (!user?._id) {
            return {
                success: false,
                message:
                    "The guest must be logged in before making a reservation."
            };
        }

        return bookTable({
            userId: user._id,
            ...input
        });
    }

    // --------------------------------------------------------
    // Unknown function
    // --------------------------------------------------------

    return {
        success: false,
        message: `Unknown tool: ${functionName}`
    };
};

// ============================================================
// Trim conversation safely
// ============================================================
//
// We must be careful not to cut the conversation in the middle
// of a Gemini function-call exchange.
//
// Gemini function calling can look like:
//
// user
// model(functionCall + thoughtSignature)
// user(functionResponse)
// model(text)
//
// We try to start history at a normal user text message.
// ============================================================

const trimConversation = (conversation) => {
    if (
        conversation.length <=
        MAX_STORED_MESSAGES
    ) {
        return conversation;
    }

    const startIndex =
        conversation.length -
        MAX_STORED_MESSAGES;

    let safeStartIndex = startIndex;

    // Find a normal user text message at or after
    // the calculated start position.
    for (
        let i = startIndex;
        i < conversation.length;
        i++
    ) {
        const item = conversation[i];

        if (
            item.role === "user" &&
            Array.isArray(item.parts)
        ) {
            const hasText = item.parts.some(
                (part) =>
                    typeof part.text === "string" &&
                    part.text.trim().length > 0
            );

            if (hasText) {
                safeStartIndex = i;
                break;
            }
        }
    }

    return conversation.slice(safeStartIndex);
};

// ============================================================
// Main chatbot controller
// ============================================================

export const chatWithBot = async (req, res) => {
    try {
        // ====================================================
        // Validate Gemini configuration
        // ====================================================

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,

                message:
                    "Chatbot is not configured. Missing GEMINI_API_KEY."
            });
        }

        // ====================================================
        // Read request
        // ====================================================

        const {
            sessionId,
            message
        } = req.body;

        // ====================================================
        // Validate sessionId
        // ====================================================

        if (
            !sessionId ||
            typeof sessionId !== "string"
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "sessionId is required."
            });
        }

        // ====================================================
        // Validate message
        // ====================================================

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "message is required."
            });
        }

        // ====================================================
        // Message length protection
        // ====================================================

        if (message.length > 1000) {
            return res.status(400).json({
                success: false,

                message:
                    "Message is too long."
            });
        }

        // ====================================================
        // Get existing conversation
        // ====================================================

        let conversation =
            sessions.get(sessionId) || [];

        // ====================================================
        // Add user's message
        //
        // IMPORTANT:
        // Gemini uses:
        //
        // role: "user"
        // parts: [{ text: "..." }]
        //
        // NOT:
        //
        // role: "user"
        // content: "..."
        // ====================================================

        conversation = [
            ...conversation,

            {
                role: "user",

                parts: [
                    {
                        text: message.trim()
                    }
                ]
            }
        ];

        // ====================================================
        // Build system prompt
        // ====================================================

        const system =
            buildSystemPrompt(req.user);

        let finalText = "";
        let bookingResult = null;

        // ====================================================
        // Gemini tool/function loop
        // ====================================================

        for (
            let iteration = 0;
            iteration < MAX_TOOL_ITERATIONS;
            iteration++
        ) {
            console.log(
                `Gemini chatbot iteration: ${
                    iteration + 1
                }`
            );

            // ------------------------------------------------
            // Call Gemini
            // ------------------------------------------------

            const response =
                await ai.models.generateContent({
                    model: GEMINI_MODEL,

                    contents: conversation,

                    config: {
                        systemInstruction:
                            system,

                        tools,

                        maxOutputTokens: 1024
                    }
                });

            // ------------------------------------------------
            // Validate response
            // ------------------------------------------------

            const candidate =
                response.candidates?.[0];

            if (!candidate) {
                throw new Error(
                    "Gemini returned no response candidate."
                );
            }

            const modelParts =
                candidate.content?.parts || [];

            // ------------------------------------------------
            // Find function calls
            // ------------------------------------------------

            const functionCallParts =
                modelParts.filter(
                    (part) =>
                        part.functionCall
                );

            // =================================================
            // NO FUNCTION CALL
            // =================================================
            //
            // This is the final normal Gemini response.
            //
            // IMPORTANT:
            // Store Gemini's original parts, rather than
            // converting them into our own structure.
            // =================================================

            if (
                functionCallParts.length === 0
            ) {
                finalText = modelParts
                    .filter(
                        (part) =>
                            typeof part.text ===
                            "string"
                    )
                    .map(
                        (part) =>
                            part.text
                    )
                    .join("\n")
                    .trim();

                // --------------------------------------------
                // Preserve Gemini's native response parts.
                //
                // This is important for future turns.
                // --------------------------------------------

                conversation = [
                    ...conversation,

                    {
                        role: "model",

                        parts: modelParts
                    }
                ];

                break;
            }

            // =================================================
            // FUNCTION CALL FOUND
            // =================================================
            //
            // CRITICAL:
            //
            // DO NOT reconstruct modelParts.
            //
            // Keep them exactly as Gemini returned them.
            //
            // This preserves:
            //
            //   thoughtSignature
            //
            // for Gemini 3 function calling.
            // =================================================

            conversation = [
                ...conversation,

                {
                    role: "model",

                    parts: modelParts
                }
            ];

            // =================================================
            // Execute every function call
            // =================================================

            const toolResponseParts = [];

            for (
                const part of functionCallParts
            ) {
                const functionCall =
                    part.functionCall;

                const functionName =
                    functionCall.name;

                const functionArgs =
                    functionCall.args || {};

                console.log(
                    "Gemini function call:",
                    functionName,
                    functionArgs
                );

                let resultPayload;

                try {
                    // ----------------------------------------
                    // Run actual application function
                    // ----------------------------------------

                    resultPayload =
                        await runToolCall(
                            functionName,
                            functionArgs,
                            req.user
                        );

                    // ----------------------------------------
                    // Save successful reservation
                    // ----------------------------------------

                    if (
                        functionName ===
                            "book_table" &&
                        resultPayload?.success
                    ) {
                        bookingResult =
                            resultPayload.reservation ||
                            null;
                    }
                } catch (toolError) {
                    console.error(
                        "Chatbot tool error:",
                        toolError
                    );

                    resultPayload = {
                        success: false,

                        message:
                            "Something went wrong while processing your request. Please try again."
                    };
                }

                // =================================================
                // Send function result back to Gemini
                // =================================================
                //
                // Gemini format:
                //
                // {
                //   functionResponse: {
                //      name: "...",
                //      response: {...}
                //   }
                // }
                //
                // IMPORTANT:
                // This is a USER message containing the tool
                // response.
                // =================================================

                toolResponseParts.push({
                    functionResponse: {
                        name: functionName,

                        response:
                            resultPayload
                    }
                });
            }

            // =================================================
            // Add function responses to conversation
            // =================================================

            conversation = [
                ...conversation,

                {
                    role: "user",

                    parts: toolResponseParts
                }
            ];
        }

        // ====================================================
        // Fallback if Gemini didn't produce text
        // ====================================================

        if (!finalText) {
            finalText =
                "Sorry, I'm having trouble with that request. Could you try again?";
        }

        // ====================================================
        // Limit conversation size
        // ====================================================

        conversation =
            trimConversation(
                conversation
            );

        // ====================================================
        // Save conversation
        // ====================================================

        sessions.set(
            sessionId,
            conversation
        );

        // ====================================================
        // Send response to frontend
        // ====================================================

        return res.status(200).json({
            success: true,

            reply: finalText,

            reservation:
                bookingResult
        });
    } catch (error) {
        // ====================================================
        // Log full Gemini error
        // ====================================================

        console.error(
            "Gemini chatbot error:",
            error
        );

        // ====================================================
        // Return safe error to frontend
        // ====================================================

        return res.status(
            error?.status === 401
                ? 502
                : 500
        ).json({
            success: false,

            message:
                "The chatbot is temporarily unavailable. Please try again shortly."
        });
    }
};

// ============================================================
// Reset chat session
// ============================================================

export const resetChatSession = (
    req,
    res
) => {
    const {
        sessionId
    } = req.body;

    if (
        sessionId &&
        typeof sessionId === "string"
    ) {
        sessions.delete(sessionId);
    }

    return res.status(200).json({
        success: true
    });
};