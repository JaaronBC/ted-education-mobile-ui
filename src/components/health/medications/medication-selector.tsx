import { Pressable, StyleSheet, Text, View } from "react-native";
import AppCard from "@/components/ui/app-card";
import type { MedicationDefinition } from "@/constants/health/medications";
import { medicationCategories } from "@/constants/health/medications";
import { theme } from "@/constants/theme";

type MedicationSelectorProps = {
  medications: MedicationDefinition[];
  selectedMedicationId: string | null;
  onSelectMedicationId: (medicationId: string | null) => void;
};

export default function MedicationSelector({
  medications,
  selectedMedicationId,
  onSelectMedicationId,
}: MedicationSelectorProps) {
  return (
    <View style={styles.container}>
      {medicationCategories.map((category) => {
        const items = medications.filter(
          (item) => item.category === category.id,
        );

        if (items.length === 0) {
          return null;
        }

        return (
          <View key={category.id} style={styles.group}>
            <Text style={styles.groupTitle}>{category.label}</Text>
            {items.map((item) => {
              const isSelected = selectedMedicationId === item.id;

              return (
                <Pressable
                  key={item.id}
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => onSelectMedicationId(item.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowSubtitle}>
                    {item.brandNames.length > 0
                      ? item.brandNames.join(", ")
                      : "No listed brand names"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      <Pressable
        style={[
          styles.row,
          selectedMedicationId === null && styles.rowSelected,
        ]}
        onPress={() => onSelectMedicationId(null)}
        accessibilityRole="button"
        accessibilityState={{ selected: selectedMedicationId === null }}
      >
        <Text style={styles.rowTitle}>Other medication</Text>
        <Text style={styles.rowSubtitle}>Enter a custom medication name</Text>
      </Pressable>

      {medications.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>No medications available.</Text>
        </AppCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  group: {
    gap: theme.spacing.xs,
  },
  groupTitle: {
    ...theme.typography.subheading,
    color: theme.colors.primaryText,
  },
  row: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  rowSelected: {
    backgroundColor: theme.colors.lightBlue,
  },
  rowTitle: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
  },
  rowSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
  emptyCard: {
    padding: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
});
