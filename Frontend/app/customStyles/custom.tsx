// ShadowStyles.tsx
import { StyleSheet } from 'react-native';

export const shadowStyles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export const domain = "192.168.7.4";

export default { shadowStyles, domain };
