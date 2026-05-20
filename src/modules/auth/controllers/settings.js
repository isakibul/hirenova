const Joi = require("joi");
const userService = require("../../users/users.service");

const defaultPreferences = {
  theme: "light",
  defaultLocation: "",
  preferredJobType: "any",
  salaryVisibility: "show",
  profileVisibility: "visible",
  newJobs: true,
  applicationUpdates: true,
  employerMessages: true,
  securityEmails: true,
  weeklyDigest: false,
};

const preferencesSchema = Joi.object({
  theme: Joi.string().valid("light", "dark").optional(),
  defaultLocation: Joi.string().trim().max(100).allow("").optional(),
  preferredJobType: Joi.string()
    .valid("any", "full-time", "part-time", "remote", "contract")
    .optional(),
  salaryVisibility: Joi.string().valid("show", "compact", "hide").optional(),
  profileVisibility: Joi.string().valid("visible", "limited", "hidden").optional(),
  newJobs: Joi.boolean().optional(),
  applicationUpdates: Joi.boolean().optional(),
  employerMessages: Joi.boolean().optional(),
  securityEmails: Joi.boolean().optional(),
  weeklyDigest: Joi.boolean().optional(),
}).min(1);

const serializePreferences = (preferences = {}) => ({
  ...defaultPreferences,
  ...preferences,
});

const getSettings = async (req, res, next) => {
  try {
    const preferences = await userService.getPreferences(req.user.id);

    res.status(200).json({
      data: serializePreferences(preferences),
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { error, value } = preferencesSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        code: 400,
        message: "Validation error",
        error: error.details.map((detail) => detail.message).join(", "),
      });
      return;
    }

    const preferences = await userService.updatePreferences(req.user.id, value);

    res.status(200).json({
      data: serializePreferences(preferences),
      message: "Settings saved.",
    });
  } catch (caughtError) {
    next(caughtError);
  }
};

const resetSettings = async (req, res, next) => {
  try {
    const preferences = await userService.updatePreferences(
      req.user.id,
      defaultPreferences,
    );

    res.status(200).json({
      data: serializePreferences(preferences),
      message: "Settings reset.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  defaultPreferences,
  getSettings,
  preferencesSchema,
  resetSettings,
  updateSettings,
};
