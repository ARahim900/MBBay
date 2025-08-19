import { useMemo } from 'react';
import { waterData } from '../constants';
import { Meter, Metrics, DailyTrend, ZonePerformance } from '../types';

const sumDaily = (meters: Omit<Meter, 'level'>[]) => meters.reduce((sum, meter) => sum + meter.daily.reduce((daySum, val) => daySum + (val || 0), 0), 0);

export const useWaterData = () => {
    const metrics: Metrics = useMemo(() => {
        const a1 = sumDaily(waterData.L1);
        const l2Total = sumDaily(waterData.L2);
        const dcTotal = sumDaily(waterData.DC);
        const a2 = l2Total + dcTotal;

        const l3Total = sumDaily(waterData.L3);
        const a3Bulk = l3Total + dcTotal;

        const l4Total = sumDaily(waterData.L4);
        const a3Individual = l3Total + l4Total + dcTotal;

        const stage1Loss = a1 - a2;
        const stage2LossBulk = a2 - a3Bulk;
        const stage2LossIndividual = a2 - a3Individual;
        const stage3Loss = a3Bulk - a3Individual;
        const totalLoss = stage1Loss + stage2LossIndividual;
        
        const lossPercentage = a1 > 0 ? (totalLoss / a1) * 100 : 0;
        const efficiency = a1 > 0 ? (a3Individual / a1) * 100 : 0;

        return {
            a1, a2, a3Bulk, a3Individual,
            stage1Loss, stage2LossBulk, stage2LossIndividual, stage3Loss,
            totalLoss, lossPercentage, efficiency
        };
    }, []);

    const dailyTrends: DailyTrend[] = useMemo(() => {
        // Updated to handle 6 data points (months) instead of 30 (days)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return Array.from({ length: 6 }, (_, i) => {
            const consumption = waterData.L1[0]?.daily[i] || 0;
            const distributed = (waterData.L2.reduce((sum, m) => sum + (m.daily[i] || 0), 0) +
                waterData.DC.reduce((sum, m) => sum + (m.daily[i] || 0), 0));
            const loss = consumption - distributed;
            return { day: i + 1, consumption, distributed, loss, month: months[i] };
        });
    }, []);
    
    // Updated static data to reflect new zones from L2 meters. Values are illustrative.
    const zonePerformance: ZonePerformance[] = useMemo(() => [
        { zone: 'Zone_01_(FM)', input: 1880, output: 1692, loss: 188, lossPercent: 10 },
        { zone: 'Zone_03_(A)', input: 4273, output: 3418, loss: 855, lossPercent: 20 },
        { zone: 'Zone_03_(B)', input: 3256, output: 2605, loss: 651, lossPercent: 20 },
        { zone: 'Zone_05', input: 4231, output: 3596, loss: 635, lossPercent: 15 },
        { zone: 'Zone_VS', input: 21, output: 17, loss: 4, lossPercent: 19 },
        { zone: 'Zone_SC', input: 76, output: 65, loss: 11, lossPercent: 14 },
        { zone: 'Zone_08', input: 3203, output: 2562, loss: 641, lossPercent: 20 },
    ], []);

    const allMeters: Meter[] = useMemo(() => [
        ...waterData.L1.map(m => ({ ...m, level: 'L1' })),
        ...waterData.L2.map(m => ({ ...m, level: 'L2' })),
        ...waterData.DC.map(m => ({ ...m, level: 'DC' })),
        ...waterData.L3.map(m => ({ ...m, level: 'L3' })),
        ...waterData.L4.map(m => ({ ...m, level: 'L4' }))
    ], []);

    const uniqueZones: string[] = useMemo(() => [...new Set(allMeters.map(m => m.zone).filter(z => z))].sort(), [allMeters]);

    return { metrics, dailyTrends, zonePerformance, allMeters, uniqueZones };
};