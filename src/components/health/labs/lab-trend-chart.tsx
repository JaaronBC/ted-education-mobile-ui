import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Polyline,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import {
  formatCollectionDate,
  getRangeStatus,
  type LabReferenceRange,
  type LabTrendPoint,
} from "@/constants/health/lab-measurements";
import { theme } from "@/constants/theme";

type LabTrendChartProps = {
  points: LabTrendPoint[];
  sharedRange: LabReferenceRange | null;
  unit: string;
};

const CHART_HEIGHT = 200;

const PLOT_PADDING = {
  top: 16,
  right: 24,
  bottom: 36,
  left: 90,
};

export default function LabTrendChart({
  points,
  sharedRange,
  unit,
}: LabTrendChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const plot = useMemo(() => {
    if (
      points.length === 0 ||
      chartWidth <= PLOT_PADDING.left + PLOT_PADDING.right
    ) {
      return null;
    }

    const width = chartWidth - PLOT_PADDING.left - PLOT_PADDING.right;

    const height = CHART_HEIGHT - PLOT_PADDING.top - PLOT_PADDING.bottom;

    const values = points.map((point) => point.value);

    const rangeValues = [
      ...values,
      ...(sharedRange?.low !== undefined ? [sharedRange.low] : []),
      ...(sharedRange?.high !== undefined ? [sharedRange.high] : []),
    ];

    let minValue = Math.min(...rangeValues);
    let maxValue = Math.max(...rangeValues);

    if (minValue === maxValue) {
      minValue -= 1;
      maxValue += 1;
    }

    const valueSpan = maxValue - minValue;

    const xForIndex = (index: number) => {
      if (points.length === 1) {
        return PLOT_PADDING.left + width / 2;
      }

      return PLOT_PADDING.left + (index / (points.length - 1)) * width;
    };

    const yForValue = (value: number) => {
      const ratio = (value - minValue) / valueSpan;

      return PLOT_PADDING.top + height - ratio * height;
    };

    const plottedPoints = points.map((point, index) => ({
      ...point,
      x: xForIndex(index),
      y: yForValue(point.value),
    }));

    const linePoints = plottedPoints
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    const referenceRect =
      sharedRange &&
      sharedRange.low !== undefined &&
      sharedRange.high !== undefined
        ? {
            x: PLOT_PADDING.left,
            y: yForValue(sharedRange.high),
            width,
            height: yForValue(sharedRange.low) - yForValue(sharedRange.high),
          }
        : null;

    return {
      plottedPoints,
      linePoints,
      minValue,
      maxValue,
      yForValue,
      width,
      height,
      referenceRect,
    };
  }, [points, sharedRange, chartWidth]);

  if (points.length === 0) {
    return (
      <Text style={styles.emptyMessage}>
        No recorded results for this measurement yet.
      </Text>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.chartFrame}
        onLayout={(event) => {
          setChartWidth(event.nativeEvent.layout.width);
        }}
      >
        {plot && (
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Line
              x1={PLOT_PADDING.left}
              y1={PLOT_PADDING.top}
              x2={PLOT_PADDING.left}
              y2={CHART_HEIGHT - PLOT_PADDING.bottom}
              stroke={theme.colors.border}
              strokeWidth={1}
            />

            <Line
              x1={PLOT_PADDING.left}
              y1={CHART_HEIGHT - PLOT_PADDING.bottom}
              x2={chartWidth - PLOT_PADDING.right}
              y2={CHART_HEIGHT - PLOT_PADDING.bottom}
              stroke={theme.colors.border}
              strokeWidth={1}
            />

            {plot.referenceRect && (
              <Rect
                x={plot.referenceRect.x}
                y={plot.referenceRect.y}
                width={plot.referenceRect.width}
                height={plot.referenceRect.height}
                fill={theme.colors.lightBlue}
                opacity={0.45}
              />
            )}

            {plot.plottedPoints.length > 1 && (
              <Polyline
                points={plot.linePoints}
                fill="none"
                stroke={theme.colors.darkBlue}
                strokeWidth={2}
              />
            )}

            {plot.plottedPoints.map((point) => {
              const status = getRangeStatus({
                value: point.value,
                unit: point.unit,
                referenceRange: point.referenceRange,
              });

              const color =
                status === "within-range"
                  ? theme.colors.success
                  : status === "above-range" || status === "below-range"
                    ? theme.colors.warning
                    : theme.colors.darkBlue;

              return (
                <Circle
                  key={point.reportId}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={color}
                />
              );
            })}

            <SvgText
              x={PLOT_PADDING.left - 10}
              y={PLOT_PADDING.top + 4}
              fontSize={11}
              fill={theme.colors.secondaryText}
              textAnchor="end"
            >
              {`${plot.maxValue.toFixed(2)} ${unit}`}
            </SvgText>

            <SvgText
              x={PLOT_PADDING.left - 10}
              y={CHART_HEIGHT - PLOT_PADDING.bottom + 4}
              fontSize={11}
              fill={theme.colors.secondaryText}
              textAnchor="end"
            >
              {`${plot.minValue.toFixed(2)} ${unit}`}
            </SvgText>

            {plot.plottedPoints.map((point) => (
              <SvgText
                key={`${point.reportId}-date`}
                x={point.x}
                y={CHART_HEIGHT - 10}
                fontSize={10}
                fill={theme.colors.secondaryText}
                textAnchor="middle"
              >
                {formatCollectionDate(point.collectedAt)}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>

      {points.length === 1 && (
        <Text style={styles.emptyMessage}>
          Only one result is available; trend line appears as a single point.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm,
  },
  chartFrame: {
    width: "100%",
    minHeight: CHART_HEIGHT,
  },
  emptyMessage: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
});
