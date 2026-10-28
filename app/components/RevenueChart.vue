<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ data: { date: string; revenue: number; orders: number }[] }>()

const maxOrders = computed(() => Math.max(...props.data.map((d) => d.orders), 1))

const option = computed(() => ({
  grid: { left: 8, right: 8, top: 34, bottom: 0, containLabel: true },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (v: number) => new Intl.NumberFormat('lo-LA').format(v),
  },
  legend: {
    right: 0,
    top: 0,
    icon: 'roundRect',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: '#64748b', fontSize: 11 },
    data: ['ລາຍຮັບ (LAK)', 'ຄຳສັ່ງຊື້'],
  },
  xAxis: {
    type: 'category',
    data: props.data.map((d) => d.date.slice(5).replace('-', '/')),
    axisLine: { lineStyle: { color: '#e2e8f0' } },
    axisTick: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 10, interval: Math.ceil(props.data.length / 10) },
  },
  yAxis: [
    {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        formatter: (v: number) => (v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}K` : v),
      },
    },
    {
      type: 'value',
      min: 0,
      max: Math.max(10, maxOrders.value * 3),
      interval: 2,
      splitLine: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
  ],
  series: [
    {
      name: 'ລາຍຮັບ (LAK)',
      type: 'bar',
      barMaxWidth: 14,
      itemStyle: { borderRadius: [4, 4, 0, 0], color: '#3b82f6' },
      data: props.data.map((d) => d.revenue),
    },
    {
      name: 'ຄຳສັ່ງຊື້',
      type: 'line',
      yAxisIndex: 1,
      smooth: false,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2, color: '#22c55e' },
      itemStyle: { color: '#22c55e' },
      data: props.data.map((d) => d.orders),
    },
  ],
}))
</script>

<template>
  <!-- ຈຸດສຳຄັນຢູ່ນີ້: div ຂ້າງນອກລັອກ height ດ້ວຍ style -->
  <div style="height: 256px; width: 100%; position: relative; overflow: hidden;">
    <VChart :option="option" autoresize style="height: 100%; width: 100%;" />
  </div>
</template>