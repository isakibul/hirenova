const Joi = require("joi");

const assistantService = require("../../../../lib/assistant");

const messageSchema = Joi.object({
  role: Joi.string().valid("user", "assistant").required(),
  content: Joi.string().trim().max(900).required(),
});

const chatSchema = Joi.object({
  messages: Joi.array().items(messageSchema).min(1).max(8).required(),
  context: Joi.object({
    path: Joi.string().trim().max(200).allow("").optional(),
    role: Joi.string()
      .valid("jobseeker", "employer", "admin", "superadmin", "")
      .optional(),
    isAuthenticated: Joi.boolean().optional(),
  })
    .unknown(false)
    .optional(),
});

const chat = async (req, res, next) => {
  const { error, value } = chatSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const answer = await assistantService.askAssistantWithOpenRouter(value);

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
