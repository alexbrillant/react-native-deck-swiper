import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    position: "absolute"
  },
  container: {
    alignItems: "stretch",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  childrenViewStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  overlayLabelWrapper: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 2,
    flex: 1,
    width: '100%',
    height: '100%'
  },
  hideOverlayLabel: {
    opacity: 0
  },
  overlayLabel: {
    fontSize: 45,
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden'
  }
});

export default styles;
