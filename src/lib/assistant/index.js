const { badRequest } = require("../../utils/error");

const maxChatMessages = 8;
const maxMessageLength = 900;

const systemGuide = `You are HireNova Assistant, the in-app support chatbot for HireNova.
Answer questions about how to use this system clearly and briefly.

HireNova capabilities:
- Public visitors can browse jobs, search and filter jobs, view job details, sign up, sign in, reset passwords, read help/about/features/status pages, and subscribe to the newsletter.
- Job seekers can confirm email, manage profile details, upload PDF/DOC/DOCX resumes up to 5 MB, parse resumes with AI, save jobs, apply with a cover letter, track applications, view notifications, manage settings, and message employers/admins when conversations exist.
- Employers can manage jobs, review applicants for their jobs, browse active job seeker profiles, and use messages.
- Admins and superadmins can use dashboard metrics, manage jobs, approve or decline listings, manage users, browse active and pending job seekers, manage newsletter subscribers, and use messages/notifications.
- Resume parsing uses OpenRouter to extract profile fields; users should review parsed fields before saving.
- Newsletter emails are collected from footer subscriptions and auth flows; admins can view and delete them in Manage Newsletter.

Rules:
- Do not claim to read live database records, private account data, or current page form values unless they are provided in the conversation.
- If the user asks for live counts, exact statuses, or private data, explain where in the app to find it.
- If the user asks for an action you cannot perform, give the shortest path to do it in the UI.
- Keep answers under 120 words unless the user asks for detail.
- If a question is outside HireNova, briefly say you are focused on HireNova and offer a related app answer.`;

const normalizeMessages = (messages = []) =>
  (Array.isArray(messages) ? messages : [])
    .slice(-maxChatMessages)
    .map((message) => ({
      role: message?.role === "assistant" ? "assistant" : "user",
      content: String(message?.content ?? "").trim().slice(0, maxMessageLength),
    }))
    .filter((message) => message.content);

const buildMessages = ({ messages, context = {} }) => {
  const contextText = [
    context.path ? `Current route: ${context.path}` : "",
    context.role ? `User role: ${context.role}` : "",
    context.isAuthenticated ? "User is signed in." : "User is not signed in.",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    {
      role: "system",
      content: `${systemGuide}${contextText ? `\n\nCurrent context:\n${contextText}` : ""}`,
    },
    ...normalizeMessages(messages),
  ];
};

const askAssistantWithOpenRouter = async ({ messages, context }) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw badRequest("OpenRouter is not configured.");
  }

  const normalizedMessages = normalizeMessages(messages);

  if (!normalizedMessages.length) {
    throw badRequest("Message is required.");
  }

  const openRouterApiUrl =
    process.env.OPENROUTER_API_URL ||
    "https://openrouter.ai/api/v1/chat/completions";

  const response = await fetch(openRouterApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ||
        process.env.CLIENT_URL ||
        "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME || "HireNova",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: buildMessages({ messages: normalizedMessages, context }),
      temperature: 0.2,
      max_tokens: 350,
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw badRequest(body?.error?.message || "Unable to reach HireNova Assistant.");
  }

  const answer = String(body?.choices?.[0]?.message?.content ?? "").trim();

  if (!answer) {
    throw badRequest("HireNova Assistant did not return an answer.");
  }

  return answer;
};

module.exports = {
  askAssistantWithOpenRouter,
};
