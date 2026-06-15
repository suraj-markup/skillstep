import { Text, View } from "react-native";

import { styles } from "../styles";

interface StatusNoticeProps {
  message: string;
}

export function StatusNotice({ message }: StatusNoticeProps) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>Could not finish that request</Text>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}
