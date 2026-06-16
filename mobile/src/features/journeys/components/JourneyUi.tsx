import type { CardDifficulty, DailySession, HobbyProfile } from "@skillstep/shared";
import { ArrowLeft, Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from "react-native";

import { colors } from "../../../theme/colors";
import type { DefaultHobby } from "../defaultHobbies";
import { hobbyIcons } from "../hobbyIcons";
import { styles } from "../screens/styles";

type SessionResource = NonNullable<DailySession["resource"]>;

export function ReviewActionButton({
  disabled,
  label,
  onPress,
  tone,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  tone: "hard" | "okay" | "easy";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.reviewAction,
        getReviewActionToneStyle(tone),
        disabled ? styles.reviewActionDisabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}
    >
      <Text style={styles.reviewActionText}>{label}</Text>
    </Pressable>
  );
}

function getReviewActionToneStyle(tone: "hard" | "okay" | "easy") {
  if (tone === "hard") return styles.reviewActionHard;
  if (tone === "okay") return styles.reviewActionOkay;
  return styles.reviewActionEasy;
}

export function ResourceSection({ resource }: { resource: SessionResource }) {
  const description = resource.description?.trim();

  if (!description && !resource.url) {
    return null;
  }

  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailTitle}>{resource.title}</Text>
      {description ? <Text style={styles.detailBody}>{description}</Text> : null}
      {resource.url ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(resource.url as string)}
          style={({ pressed }) => [styles.resourceLink, pressed ? styles.pressed : undefined]}
        >
          <Text style={styles.resourceLinkText}>
            {resource.type === "video" ? "Open video" : "Open resource"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SessionSection({ body, title }: { body: string; title: string }) {
  return (
    <View style={styles.detailPanel}>
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailBody}>{body}</Text>
    </View>
  );
}

export function Field({
  keyboardType = "default",
  label,
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: "default" | "numeric";
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.placeholder}
        style={[styles.input, multiline ? styles.textArea : undefined]}
        value={value}
      />
    </View>
  );
}

export function HobbyIcon({
  compact = false,
  hobbyProfile,
  icon,
}: {
  compact?: boolean;
  hobbyProfile?: HobbyProfile;
  icon?: DefaultHobby["icon"];
}) {
  const Icon = hobbyIcons[icon ?? hobbyProfile?.icon ?? "sparkles"];

  return (
    <View style={[styles.iconBadge, compact ? styles.iconBadgeCompact : undefined]}>
      <Icon color={colors.action.primary} size={compact ? 18 : 22} strokeWidth={2.5} />
    </View>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" hitSlop={12} onPress={onPress} style={styles.backButton}>
      <ArrowLeft color={colors.text.primary} size={19} strokeWidth={2.6} />
      <Text style={styles.backButtonText}>Back</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  disabled = false,
  label,
  loading = false,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled ? styles.primaryButtonDisabled : undefined,
        pressed && !disabled ? styles.pressed : undefined,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.inverse} size={18} />
      ) : (
        <Check color={colors.text.inverse} size={18} strokeWidth={2.8} />
      )}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({
  disabled = false,
  icon,
  onPress,
}: {
  disabled?: boolean;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.iconButton, disabled ? styles.iconButtonDisabled : undefined]}
    >
      {icon}
    </Pressable>
  );
}

export function InfoPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View style={styles.infoPill}>
      {icon}
      <Text style={styles.infoPillText}>{text}</Text>
    </View>
  );
}

export function Notice({ message }: { message: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

export function RecoveryPanel({
  missedCount,
  onOpenSession,
}: {
  missedCount: number;
  onOpenSession: () => void;
}) {
  return (
    <View style={styles.recoveryPanel}>
      <View style={styles.recoveryCopy}>
        <Text style={styles.recoveryTitle}>
          {missedCount === 1 ? "Pick up your missed session" : "Pick up missed sessions"}
        </Text>
        <Text style={styles.recoveryBody}>
          No guilt here. Start with the oldest missed session and keep the journey moving.
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onOpenSession} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Recover</Text>
      </Pressable>
    </View>
  );
}

export function EmptyPanel({
  actionLabel,
  body,
  onAction,
  title,
}: {
  actionLabel: string;
  body: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <View style={styles.emptyPanel}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <Pressable accessibilityRole="button" onPress={onAction} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

export type ReviewDifficulty = Exclude<CardDifficulty, "new">;
