const {
  User,
  Job,
  Application,
  SavedJob,
  Conversation,
  Notification,
  NewsletterSubscription,
} = require("../../model");
const dashboardService = require("../dashboard");
const { summarizeAuditActivity } = require("../observability/audit");
const { summarizeEmailEvents } = require("../observability/emailEvents");
const { badRequest } = require("../../utils/error");

const maxChatMessages = 8;
const maxMessageLength = 900;

const pageGuide = [
  {
    match: (path) => path === "/jobs",
    title: "Browse Jobs",
    actions:
      "Search by title, skill, or location; filter by type/salary/experience; sort jobs; open a job detail page.",
  },
  {
    match: (path) => /^\/jobs\/[^/]+$/.test(path),
    title: "Job Details",
    actions:
      "Review the job description, save the job, apply as a job seeker, or sign in/sign up before applying.",
  },
  {
    match: (path) => path === "/profile",
    title: "Profile",
    actions:
      "Edit account details, upload a resume, parse a resume, apply parsed fields, save profile changes, and update password.",
  },
  {
    match: (path) => path === "/applications",
    title: "My Applications",
    actions:
      "Review submitted applications and track their current status.",
  },
  {
    match: (path) => path === "/saved-jobs",
    title: "Saved Jobs",
    actions:
      "Review saved listings, open job details, and remove jobs from saved items.",
  },
  {
    match: (path) => path === "/my-jobs",
    title: "My Jobs",
    actions:
      "Review jobs posted by the signed-in employer and open management tools.",
  },
  {
    match: (path) => path === "/messages",
    title: "Messages",
    actions:
      "Select a conversation, send replies, inspect participants, and delete conversations.",
  },
  {
    match: (path) => path === "/notifications",
    title: "Notifications",
    actions:
      "Read notifications, mark one notification as read, or mark all notifications as read.",
  },
  {
    match: (path) => path === "/settings",
    title: "Settings",
    actions:
      "Change preferences, export account data, and request account deactivation.",
  },
  {
    match: (path) => path === "/dashboard",
    title: "Dashboard",
    actions:
      "Review role-specific metrics and use dashboard links to reach jobs, users, applications, and messages.",
  },
  {
    match: (path) => path === "/manage-jobs",
    title: "Manage Jobs",
    actions:
      "Search/filter listings, create or edit a listing, view public details, review applicants, close/reopen jobs, approve/decline listings as admin, inspect approval history, and delete listings.",
  },
  {
    match: (path) => /^\/manage-jobs\/[^/]+\/applications$/.test(path),
    title: "Job Applicants",
    actions:
      "Review applicants for a listing, inspect applicant details, and update application status.",
  },
  {
    match: (path) => path === "/manage-users",
    title: "Manage Users",
    actions:
      "Search/filter users, create accounts, view details, change roles, activate/suspend accounts, and delete eligible users.",
  },
  {
    match: (path) => path === "/candidates",
    title: "Candidates",
    actions:
      "Browse job seeker profiles, search/filter candidates, open candidate details, and start conversations when available.",
  },
  {
    match: (path) => path === "/manage-newsletter",
    title: "Manage Newsletter",
    actions:
      "Search newsletter subscribers, filter by status, sort subscriptions, and delete subscriber records.",
  },
];

const getPageGuide = (path = "") =>
  pageGuide.find((item) => item.match(path)) || null;

const countByField = async ({ model, match = {}, field }) => {
  const rows = await model.aggregate([
    { $match: match },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);

  return rows.reduce((summary, row) => {
    summary[row._id || "unknown"] = row.count;
    return summary;
  }, {});
};

const systemGuide = `You are HireNova Assistant, the in-app support chatbot for HireNova.
Answer questions about how to use this system clearly and briefly.

HireNova capabilities:
- Public visitors can browse jobs, search and filter jobs, view job details, sign up, sign in, reset passwords, read help/about/features/status pages, and subscribe to the newsletter.
- Job seekers can confirm email, manage profile details, upload PDF/DOC/DOCX resumes up to 5 MB, parse resumes with AI, save jobs, apply with a cover letter, track applications, view notifications, manage settings, and message employers/admins when conversations exist.
- Employers can manage jobs, review applicants for their jobs, browse active job seeker profiles, and use messages.
- Admins and superadmins can use dashboard metrics, manage jobs, approve or decline listings, manage users, browse active and pending job seekers, manage newsletter subscribers, and use messages/notifications.
- Admins and superadmins can inspect operational summaries such as audit activity and email delivery health through safe aggregate data.
- Resume parsing uses AI to extract profile fields; users should review parsed fields before saving.
- Newsletter emails are collected from footer subscriptions and auth flows; admins can view and delete them in Manage Newsletter.

Rules:
- You may use the safe live context provided below for aggregate counts and role-appropriate summaries.
- Use the current page guide and available actions to answer page-specific "how do I..." questions with direct UI steps.
- Do not claim to read private records, individual user details, or current page form values unless they are provided in the conversation.
- If the user asks for private data that is not in the safe context, explain where in the app to find it.
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

const getSafeLiveContext = async (user) => {
  const now = new Date();
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const publicOpenJobFilter = {
    approvalStatus: "approved",
    status: "open",
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  };

  const [openJobs, activeJobseekers, jobsByType] = await Promise.all([
    Job.countDocuments(publicOpenJobFilter),
    User.countDocuments({ role: "jobseeker", status: "active" }),
    countByField({
      model: Job,
      match: publicOpenJobFilter,
      field: "jobType",
    }),
  ]);
  const liveContext = {
    public: {
      openJobs,
      activeJobseekers,
      jobsByType,
    },
  };

  if (!user?.id) {
    return liveContext;
  }

  if (user.role === "admin" || user.role === "superadmin") {
    const [
      summary,
      newsletterSubscribers,
      usersByRole,
      usersByStatus,
      jobsByApproval,
      applicationsByStatus,
      emailEvents24h,
      auditActivity24h,
    ] = await Promise.all([
      dashboardService.getAdminSummary(),
      NewsletterSubscription.countDocuments({ status: "subscribed" }),
      countByField({ model: User, field: "role" }),
      countByField({ model: User, field: "status" }),
      countByField({ model: Job, field: "approvalStatus" }),
      countByField({ model: Application, field: "status" }),
      summarizeEmailEvents(last24Hours),
      summarizeAuditActivity(last24Hours),
    ]);

    liveContext.roleSummary = {
      ...summary,
      newsletterSubscribers,
      usersByRole,
      usersByStatus,
      jobsByApproval,
      applicationsByStatus,
      emailEvents24h,
      auditActivity24h,
    };
  } else if (user.role === "employer") {
    const jobs = await Job.find({ author: user.id }).select("_id").lean();
    const jobIds = jobs.map((job) => job._id);
    const [summary, applicationsByStatus, unreadConversations] =
      await Promise.all([
        dashboardService.getEmployerSummary(user.id),
        countByField({
          model: Application,
          match: { job: { $in: jobIds } },
          field: "status",
        }),
        Conversation.countDocuments({
          participants: user.id,
          unreadBy: user.id,
          deletedBy: { $ne: user.id },
        }),
      ]);

    liveContext.roleSummary = {
      ...summary,
      applicationsByStatus,
      unreadConversations,
    };
  } else if (user.role === "jobseeker") {
    const [summary, applicationsByStatus, savedJobs, unreadNotifications] =
      await Promise.all([
        dashboardService.getJobseekerSummary(user.id),
        countByField({
          model: Application,
          match: { applicant: user.id },
          field: "status",
        }),
        SavedJob.countDocuments({ user: user.id }),
        Notification.countDocuments({ recipient: user.id, readAt: null }),
      ]);

    liveContext.roleSummary = {
      ...summary,
      applicationsByStatus,
      savedJobs,
      unreadNotifications,
    };
  }

  return liveContext;
};

const buildMessages = ({ messages, context = {} }) => {
  const guide = getPageGuide(context.path);
  const contextText = [
    context.path ? `Current route: ${context.path}` : "",
    guide ? `Current page: ${guide.title}` : "",
    guide ? `Available page actions: ${guide.actions}` : "",
    context.pageTitle ? `Client page title: ${context.pageTitle}` : "",
    Array.isArray(context.visibleActions) && context.visibleActions.length
      ? `Visible UI actions: ${context.visibleActions.join(", ")}`
      : "",
    context.role ? `User role: ${context.role}` : "",
    context.isAuthenticated ? "User is signed in." : "User is not signed in.",
    context.live ? `Safe live context: ${JSON.stringify(context.live)}` : "",
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

const askAssistantWithOpenRouter = async ({ messages, context, user }) => {
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

  const liveContext = await getSafeLiveContext(user);
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
      messages: buildMessages({
        messages: normalizedMessages,
        context: {
          ...context,
          role: user?.role || context?.role,
          isAuthenticated: Boolean(user?.id) || Boolean(context?.isAuthenticated),
          live: liveContext,
        },
      }),
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
  getSafeLiveContext,
};
