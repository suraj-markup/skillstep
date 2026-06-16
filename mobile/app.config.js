const readEnv = (name) => process.env[name]?.trim() || null;

module.exports = ({ config }) => {
  const configuredProjectId = config.extra?.eas?.projectId;
  const projectId = readEnv("EXPO_PROJECT_ID") ?? configuredProjectId;
  const updatesUrl = readEnv("EXPO_UPDATES_URL") ?? `https://u.expo.dev/${projectId}`;

  return {
    ...config,
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: updatesUrl,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },
    extra: {
      ...config.extra,
      eas: {
        ...(config.extra?.eas ?? {}),
        projectId,
      },
    },
  };
};
