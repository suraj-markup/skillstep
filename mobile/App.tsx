import { PaperProvider } from "react-native-paper";

import { PlansHomeScreen } from "./src/features/plans/screens/PlansHomeScreen";
import { paperTheme } from "./src/theme/paperTheme";

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <PlansHomeScreen />
    </PaperProvider>
  );
}
