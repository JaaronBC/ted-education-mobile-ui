import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppIcon from "@/components/ui/app-icon";
import {
  type LabMeasurementDefinition,
  type LabMeasurementId,
} from "@/constants/health/lab-measurements";
import { theme } from "@/constants/theme";

type LabMeasurementSelectorProps = {
  measurements: LabMeasurementDefinition[];
  selectedMeasurementId: LabMeasurementId;
  onSelectMeasurement: (measurementId: LabMeasurementId) => void;
};

export default function LabMeasurementSelector({
  measurements,
  selectedMeasurementId,
  onSelectMeasurement,
}: LabMeasurementSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMeasurement = measurements.find(
    (measurement) => measurement.id === selectedMeasurementId,
  );

  function handleSelect(measurementId: LabMeasurementId) {
    onSelectMeasurement(measurementId);
    setIsOpen(false);
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.dropdownButton}
        onPress={() => setIsOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel="Select measurement"
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={styles.dropdownText}>
          {selectedMeasurement?.name ?? "Select measurement"}
        </Text>

        <AppIcon
          icon={isOpen ? "OpenDropdown" : "Dropdown"}
          size={20}
          color={theme.colors.darkBlue}
          strokeWidth={2}
        />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          {measurements.map((measurement) => {
            const isSelected = measurement.id === selectedMeasurementId;

            return (
              <Pressable
                key={measurement.id}
                style={[
                  styles.dropdownOption,
                  isSelected && styles.dropdownOptionSelected,
                ]}
                onPress={() => handleSelect(measurement.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {measurement.name}
                </Text>

                {isSelected && (
                  <AppIcon
                    icon="select"
                    size={18}
                    color={theme.colors.darkBlue}
                    strokeWidth={2}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  dropdownText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    flex: 1,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  dropdownOptionSelected: {
    backgroundColor: theme.colors.lightBlue,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.darkBlue,
  },
});
