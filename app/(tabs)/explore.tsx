import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Msg =
  | { type: "number"; value: number }
  | { type: "error"; message: string };

const { width } = Dimensions.get('window');

export default function EnergyDashboard() {
  const latestValue = useRef("shiballlll");
  const [timeRange, setTimeRange] = useState('24h');
  const [message, setMessage] = useState("shiballlll");

  useEffect(() => {
    var ws = new WebSocket("ws://localhost:8000/api");

    ws.onmessage = (event) => {
      const numberz = JSON.parse(event.data);
      latestValue.current = numberz.value;
      console.log(typeof latestValue.current);

      console.log("Received message:", latestValue.current);
    };

    const interval = setInterval(() => {
      setMessage(latestValue.current);
    }, 1000);
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);


  // Sample data
  const currentUsage = 2.4;
  const todayConsumption = 18.5;
  const monthlyCost = 127.8;
  const co2Saved = 12;

  const hourlyData = [
    1.2, 1.1, 0.9, 0.8, 0.9, 1.5, 2.1, 2.8, 3.2, 2.9, 2.5, 2.7,
    3.1, 2.8, 2.6, 2.4, 2.8, 3.5, 4.2, 3.8, 3.2, 2.8, 2.1, 1.8,
  ];

  const breakdown = [
    { name: 'Heating/Cooling', value: 45, color: '#ef4444' },
    { name: 'Appliances', value: 25, color: '#f59e0b' },
    { name: 'Lighting', value: 15, color: '#10b981' },
    { name: 'Electronics', value: 15, color: '#3b82f6' },
  ];

  const recentActivity = [
    { device: 'Air Conditioner', status: 'on', time: '2:34 PM', power: '2.1 kW' },
    { device: 'Dishwasher', status: 'off', time: '1:15 PM', power: '0 kW' },
    { device: 'Water Heater', status: 'on', time: '12:45 PM', power: '1.8 kW' },
    { device: 'Washing Machine', status: 'off', time: '11:20 AM', power: '0 kW' },
  ];

  const maxValue = Math.max(...hourlyData);

  type MetricCardProps = {
    icon: React.ComponentProps<typeof IconSymbol>['name'];
    label: string;
    value: number | string;
    unit: string;
    color: string;
    bgColor: string;
  };

  const MetricCard = ({ icon, label, value, unit, color, bgColor }: MetricCardProps) => (
    <ThemedView style={[styles.metricCard, { backgroundColor: '#ffffff' }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <IconSymbol name={icon} size={20} color={color} />
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#2563eb', dark: '#1e40af' }}
      headerImage={
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Energy Dashboard</Text>
            <Text style={styles.headerSubtitle}>Saturday, Feb 14, 2026</Text>
          </View>
          <IconSymbol name="bolt.fill" size={40} color="#ffffff" />
        </View>
      }>

      {/* Metric Cards */}
      <ThemedView style={styles.section}>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="bolt.fill"
            label="Current"
            value={currentUsage}
            unit="kW"
            color="#dc2626"
            bgColor="#fee2e2"
          />
          <MetricCard
            icon="battery.100"
            label="Today"
            value={todayConsumption}
            unit="kWh"
            color="#2563eb"
            bgColor="#dbeafe"
          />
          <MetricCard
            icon="dollarsign.circle"
            label="Monthly"
            value={`$${monthlyCost}`}
            unit="this month"
            color="#ca8a04"
            bgColor="#fef3c7"
          />
          <MetricCard
            icon="leaf.fill"
            label="CO₂ Saved"
            value={co2Saved}
            unit="kg today"
            color="#16a34a"
            bgColor="#dcfce7"
          />
        </View>
      </ThemedView>

      {/* Usage Chart */}
      <ThemedView style={styles.card}>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle">Usage Today</ThemedText>
          <View style={styles.timeRangeButtons}>
            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === '24h' && styles.timeButtonActive,
              ]}
              onPress={() => setTimeRange('24h')}>
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === '24h' && styles.timeButtonTextActive,
                ]}>
                24h
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === '7d' && styles.timeButtonActive,
              ]}
              onPress={() => setTimeRange('7d')}>
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === '7d' && styles.timeButtonTextActive,
                ]}>
                7d
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.chartContainer}>
          {hourlyData.map((value, index) => (
            <View
              key={index}
              style={[styles.bar, { height: ((value / maxValue) * 160) }]}
            />
          ))}
        </View>

        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>12 AM</Text>
          <Text style={styles.chartLabel}>6 AM</Text>
          <Text style={styles.chartLabel}>12 PM</Text>
          <Text style={styles.chartLabel}>6 PM</Text>
          <Text style={styles.chartLabel}>Now</Text>
        </View>
      </ThemedView>

      {/* Energy Breakdown */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Energy Breakdown
        </ThemedText>
        <View style={styles.breakdownContainer}>
          {breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <ThemedText style={styles.breakdownLabel}>{item.name}</ThemedText>
                <ThemedText type="defaultSemiBold">{item.value}%</ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.value}%` as const,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Recent Activity */}
      <ThemedView style={styles.card}>
        <View style={styles.activityHeader}>
          <IconSymbol name="chart.line.downtrend.xyaxis" size={20} color="#374151" />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Recent Activity
          </ThemedText>
        </View>
        <View style={styles.activityList}>
          {recentActivity.map((item, index) => (
            <View
              key={index}
              style={[
                styles.activityItem,
                index !== recentActivity.length - 1 && styles.activityItemBorder,
              ]}>
              <View style={styles.activityLeft}>
                <View
                  style={[
                    styles.activityIcon,
                    item.status === 'on'
                      ? styles.activityIconOn
                      : styles.activityIconOff,
                  ]}>
                  <IconSymbol
                    name="power"
                    size={16}
                    color={item.status === 'on' ? '#16a34a' : '#9ca3af'}
                  />
                </View>
                <View>
                  <ThemedText type="defaultSemiBold" style={styles.activityDevice}>
                    {item.device}
                  </ThemedText>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </View>
              <View style={styles.activityRight}>
                <Text
                  style={[
                    styles.activityStatus,
                    item.status === 'on'
                      ? styles.activityStatusOn
                      : styles.activityStatusOff,
                  ]}>
                  {item.status.toUpperCase()}
                </Text>
                <Text style={styles.activityPower}>{item.power}</Text>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    position: 'absolute',
    top: 50,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  section: {
    marginTop: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 12,
    color: '#9ca3af',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 0,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  timeButtonActive: {
    backgroundColor: '#2563eb',
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeButtonTextActive: {
    color: '#ffffff',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: 12,
  },
  bar: {
    width: (width - 120) / 24,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  breakdownContainer: {
    marginTop: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activityList: {
    marginTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    padding: 8,
    borderRadius: 20,
  },
  activityIconOn: {
    backgroundColor: '#dcfce7',
  },
  activityIconOff: {
    backgroundColor: '#f3f4f6',
  },
  activityDevice: {
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityStatusOn: {
    color: '#16a34a',
  },
  activityStatusOff: {
    color: '#9ca3af',
  },
  activityPower: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});