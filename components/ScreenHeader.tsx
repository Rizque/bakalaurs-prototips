import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

type RightIconAction = {
  icon: FeatherIconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: "default" | "destructive";
  disabled?: boolean;
};

type Props = {
  title?: string;
  showBack?: boolean;
  rightAction?: { label: string; onPress: () => void };
  rightIcons?: RightIconAction[];
};

export function ScreenHeader({
  title,
  showBack = false,
  rightAction,
  rightIcons,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityLabel="Atpakaļ"
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.pressed,
              ]}
            >
              <Feather name="arrow-left" size={24} color="#000" />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.right}>
          {rightIcons?.length ? (
            <View style={styles.iconRow}>
              {rightIcons.map((action) => (
                <Pressable
                  key={action.icon}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  hitSlop={12}
                  accessibilityLabel={action.accessibilityLabel}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && styles.pressed,
                    action.disabled && styles.disabled,
                  ]}
                >
                  <Feather
                    name={action.icon}
                    size={22}
                    color={
                      action.variant === "destructive" ? "#eb2d2d" : "#000"
                    }
                  />
                </Pressable>
              ))}
            </View>
          ) : rightAction ? (
            <Pressable
              onPress={rightAction.onPress}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.action}>{rightAction.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
  },
  left: {
    flex: 1,
    alignItems: "flex-start",
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
  },
  iconBtn: {
    padding: 4,
    marginHorizontal: -4,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  action: {
    color: "#2392ec",
    fontSize: 16,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    letterSpacing: -0.3,
  },
});
