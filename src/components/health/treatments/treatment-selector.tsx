import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TreatmentDefinition } from "@/constants/health/treatments";
import { theme } from "@/constants/theme";

type TreatmentSelectorProps = {
  treatments: TreatmentDefinition[];
  selectedTreatmentId: string | null;
  onSelectTreatmentId: (treatmentId: string | null) => void;
};

export default function TreatmentSelector({
  treatments,
  selectedTreatmentId,
  onSelectTreatmentId,
}: TreatmentSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Treatment catalog</Text>

      {treatments.map((treatment) => {
        const selected = selectedTreatmentId === treatment.id;

        return (
          <Pressable
            key={treatment.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelectTreatmentId(treatment.id)}
            style={[styles.row, selected && styles.selectedRow]}
          >
            <Text style={styles.name}>{treatment.name}</Text>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: selectedTreatmentId === null }}
        onPress={() => onSelectTreatmentId(null)}
        style={[styles.row, selectedTreatmentId === null && styles.selectedRow]}
      >
        <Text style={styles.name}>Other treatment</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  row: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  selectedRow: {
    backgroundColor: theme.colors.lightBlue,
  },
  name: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
});
