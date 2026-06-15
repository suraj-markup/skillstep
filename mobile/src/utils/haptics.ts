import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

async function safelyRunHaptic(runHaptic: () => Promise<void>) {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await runHaptic();
  } catch {
    // Haptics are enhancement-only; unsupported devices should never block UI.
  }
}

export function tapFeedback() {
  return safelyRunHaptic(() => Haptics.selectionAsync());
}

export function successFeedback() {
  return safelyRunHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warningFeedback() {
  return safelyRunHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
