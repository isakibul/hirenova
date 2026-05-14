const Joi = require("joi");

const assistantService = require("../../../../lib/assistant");
const tokenService = require("../../../../lib/token");
const userService = require("../../../../lib/user");

const messageSchema = Joi.object({
  role: Joi.string().valid("user", "assistant").required(),
  content: Joi.string().trim().max(900).required(),
});

const chatSchema = Joi.object({
  messages: Joi.array().items(messageSchema).min(1).max(8).required(),
  context: Joi.object({
    path: Joi.string().trim().max(200).allow("").optional(),
    pageTitle: Joi.string().trim().max(120).allow("").optional(),
    visibleActions: Joi.array()
      .items(Joi.string().trim().max(80))
      .max(12)
      .optional(),
    role: Joi.string()
      .valid("jobseeker", "employer", "admin", "superadmin", "")
      .optional(),
    isAuthenticated: Joi.boolean().optional(),
  })
    .unknown(false)
    .optional(),
});

const getOptionalUser = async (req) => {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return null;
  }

  try {
    const decoded = tokenService.verifyToken({ token });
    const user = decoded.id
      ? await userService.findUserById(decoded.id)
      : await userService.findUserByEmail(decoded.email);

    return user ? { ...user._doc, id: user.id } : null;
  } catch {
    return null;
  }
};

const chat = async (req, res, next) => {
  const { error, value } = chatSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const user = await getOptionalUser(req);
    const answer = await assistantService.askAssistantWithOpenRouter({
      ...value,
      user,
    });

    res.status(200).json({
      message: "Assistant response generated.",
      data: {
        answer,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = chat;
