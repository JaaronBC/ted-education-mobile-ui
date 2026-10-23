import { View, Text, Image, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import type { HealthSummaryData } from "@/constants/health/health-summaries";

type SummaryContentProps = {
  data: HealthSummaryData;
};
/*
Data will be passed with a type property that determines 
how the summary is rendered. The summaryRenderers object maps 
the type to the corresponding component for rendering.
*/

// Define a component for rendering text summaries
function TextSummary({ data }: SummaryContentProps) {
  if (data.type !== "text") return null;

  return (
    <View style={styles.content}>
      <Text style={styles.summaryText}>{data.value}</Text>
      {data.description && (
        <Text style={styles.summaryText}>{data.description}</Text>
      )}
    </View>
  );
}
// Define a component for rendering image summaries
function ImageSummary({ data }: SummaryContentProps) {
  if (data.type !== "image") return null;

  return (
    <View style={styles.content}>
      <Image
        source={{ uri: data.uri }}
        style={styles.image}
        resizeMode="cover"
      />
      {data.description && (
        <Text style={styles.summaryText}>{data.description}</Text>
      )}
    </View>
  );
}

// Define a component for comparing images over time
function ImageComparisonSummary({ data }: SummaryContentProps) {
  if (data.type !== "imageComparison") return null;

  return (
    <View style={styles.content}>
      <Text style={styles.comparisonTitle}>{data.title}</Text>

      <View style={styles.imageComparisonRow}>
        {data.images.map((image, index) => (
          <View key={`${image.date}-${index}`} style={styles.comparisonItem}>
            <Image
              source={{ uri: image.uri }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />

            <Text style={styles.imageLabel}>{image.label}</Text>
            <Text style={styles.imageDate}>{image.date}</Text>
          </View>
        ))}
      </View>

      {data.description && (
        <Text style={styles.summaryText}>{data.description}</Text>
      )}
    </View>
  );
}

const summaryRenderers = {
  text: TextSummary,
  image: ImageSummary,
  imageComparison: ImageComparisonSummary,
};
// Main component for rendering health summary cards
export default function HealthSummaryCard({
  data,
}: {
  data: HealthSummaryData;
}) {
  const Content = summaryRenderers[data.type];

  return (
    <View style={styles.card}>
      <Content data={data} />
    </View>
  );
}
// Define styles for the HealthSummaryCard component
const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: theme.spacing.sm,
    backgroundColor: "transparent",
    paddingTop: theme.spacing.sm,
  },
  title: {
    ...theme.typography.subheading,
  },
  summaryText: {
    ...theme.typography.body,
  },
  content: {
    gap: theme.spacing.xs,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: theme.borderRadius.md,
  },
  comparisonTitle: {
    ...theme.typography.subheading,
  },

  imageComparisonRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  // Styles for individual comparison items within the image comparison row
  comparisonItem: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xs,
  },

  comparisonImage: {
    width: "100%",
    height: 120,
    borderRadius: theme.borderRadius.md,
  },

  imageLabel: {
    ...theme.typography.body,
    fontWeight: "600",
  },

  imageDate: {
    ...theme.typography.body,
    color: "#64748B",
    fontSize: 12,
  },
});
