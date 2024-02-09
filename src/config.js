module.exports = {
  client: {
    token: process.env.TOKEN,
    id: process.env.ID,
  },
  handler: {
    prefix: "?",
    deploy: true,
    commands: {
      prefix: true,
      slash: true,
      user: true,
      message: true,
    },
    mongodb: {
      enabled: true,
      uri: process.env.MONGODB_URI,
    },
  },
  users: {
    developers: ["300969054649450496"],
  },
  development: {
    enabled: false,
    guild: process.env.GUILD_ID,
  },
  messageSettings: {
    nsfwMessage: "The current channel is not a NSFW channel.",
    developerMessage: "You are not authorized to use this command.",
    cooldownMessage: "Slow down buddy! You're too fast to use this command.",
    globalCooldownMessage:
      "Slow down buddy! This command is on a global cooldown.",
    notHasPermissionMessage:
      "You do not have the permission to use this command.",
    notHasPermissionComponent:
      "You do not have the permission to use this component.",
    missingDevIDsMessage:
      "This is a developer only command, but unable to execute due to missing user IDs in configuration file.",
  },
};
