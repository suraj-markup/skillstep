import { PaperProvider } from "react-native-paper";

import { DailyHomeScreen } from "./src/features/journeys/screens/DailyHomeScreen";
import { paperTheme } from "./src/theme/paperTheme";

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <DailyHomeScreen />
    </PaperProvider>
  );
}
