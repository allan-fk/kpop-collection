import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  // Directly redirect to the tabs group
  // This looks for the 'index' route inside the '(tabs)' directory
  return <Redirect href="/(tabs)" />;
}

// import { Text, View } from "react-native";
// import {Link} from "expo-router";


// export default function Index() {
//   return (
//     <View
//       className="flex-1 justify-center items-center"
//     >
//       <Text className="text-5xl text-primary font-bold"> Welcome M! </Text>
//       <Link href="/onboarding">Onboarding</Link>
//       <Link href="/movie/avenger">Avenger Movie</Link>
//     </View>
//   );
// }
