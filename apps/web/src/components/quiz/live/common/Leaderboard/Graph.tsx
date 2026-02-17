"use client";

import NotchCard from "@/components/ui/NotchCard";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

interface GraphProps {
    className?: string;
    points?: number[];
}

export default function Graph({ className, points = [] }: GraphProps) {
    const series = [
        {
            name: "rank",
            data: points,
        },
    ];

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: "line",
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        markers: {
            size: points.length > 50 ? 0 : 4,
        },
        grid: {
            borderColor: "#e5e5e5",
        },
        xaxis: {
            categories: points.map((_, i) => i + 1),
            labels: {
                show: points.length <= 20,
            },
            tickAmount: Math.min(points.length, 6),
        },
        yaxis: {
            reversed: true,
            min: Math.min(...points, 1),
            max: Math.max(...points, 10),
            decimalsInFloat: 0,
            title: {
                text: "Rank",
            },
        },
        tooltip: {
            theme: "dark",
            x: {
                formatter: (value) => `Question ${value}`,
            },
            y: {
                formatter: (value) => `Rank ${value}`,
            },
        },
    };


    return (
        <NotchCard
            className={cn(
                "w-full h-full text-dark-alpha ",
                className,
            )}
            label={"progress"}
            labelClassname={cn(
                'ml-1'
            )}
        >
            <Chart
                options={options}
                series={series}
                type="line"
                height="100%"
                width="100%"
            />
        </NotchCard>
    );
}
