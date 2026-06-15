import { Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

import { colors, styles } from "../styles";

export function LoadingPlansRow() {
  return (
    <View style={styles.loadingRow}>
      <ActivityIndicator color={colors.sage} />
      <Text style={styles.loadingText}>Loading saved plans</Text>
    </View>
  );
}
