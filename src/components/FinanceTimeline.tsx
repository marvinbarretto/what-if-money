"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { MonthlySnapshot } from "@/lib/types";
import styles from "./FinanceTimeline.module.css";

interface Props {
  data: MonthlySnapshot[];
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 60 };

export default function FinanceTimeline({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    snapshot: MonthlySnapshot;
  } | null>(null);

  const formatCurrency = useCallback((value: number) => {
    const abs = Math.abs(value);
    const formatted = abs >= 1000
      ? `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`
      : abs.toFixed(0);
    return value < 0 ? `-\u00a3${formatted}` : `\u00a3${formatted}`;
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.min(400, width * 0.5);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Scales
    const x = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const balanceExtent = d3.extent(data, (d) => d.balance) as [number, number];
    const yMin = Math.min(balanceExtent[0], 0);
    const yMax = Math.max(balanceExtent[1], 0);
    const yPadding = (yMax - yMin) * 0.1 || 100;

    const y = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([innerHeight, 0]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      );

    // Zero line
    if (yMin < 0) {
      g.append("line")
        .attr("class", "zero-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", y(0))
        .attr("y2", y(0));
    }

    // Area — split positive/negative
    const areaPositive = d3
      .area<MonthlySnapshot>()
      .x((d) => x(d.label)!)
      .y0((d) => y(Math.min(d.balance, 0)))
      .y1((d) => y(Math.max(d.balance, 0)))
      .curve(d3.curveMonotoneX);

    // Clip areas: positive above zero, negative below
    const areaAboveZero = d3
      .area<MonthlySnapshot>()
      .x((d) => x(d.label)!)
      .y0(y(0))
      .y1((d) => y(Math.max(d.balance, 0)))
      .curve(d3.curveMonotoneX);

    const areaBelowZero = d3
      .area<MonthlySnapshot>()
      .x((d) => x(d.label)!)
      .y0(y(0))
      .y1((d) => y(Math.min(d.balance, 0)))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("class", "area-positive")
      .attr("d", areaAboveZero)
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .attr("opacity", 1);

    g.append("path")
      .datum(data)
      .attr("class", "area-negative")
      .attr("d", areaBelowZero)
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .attr("opacity", 1);

    // Line
    const line = d3
      .line<MonthlySnapshot>()
      .x((d) => x(d.label)!)
      .y((d) => y(d.balance))
      .curve(d3.curveMonotoneX);

    // We draw segments colored by whether balance is positive or negative
    const linePath = g
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    // Color the line based on final balance trend
    const lastBalance = data[data.length - 1]?.balance ?? 0;
    linePath.classed("line-positive", lastBalance >= 0);
    linePath.classed("line-negative", lastBalance < 0);

    // Animate line drawing
    const pathNode = linePath.node();
    if (pathNode) {
      const totalLength = pathNode.getTotalLength();
      linePath
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    // Axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x).tickValues(
          data
            .filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1)
            .map((d) => d.label)
        )
      );

    g.append("g")
      .attr("class", "axis")
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickFormat((d) => formatCurrency(d as number))
      );

    // Hover interaction
    const hoverGroup = g.append("g").style("display", "none");

    hoverGroup
      .append("circle")
      .attr("class", "tooltip-dot")
      .attr("r", 5);

    const overlay = g
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    const domain = x.domain();
    const step = x.step();

    overlay.on("mousemove", (event: MouseEvent) => {
      const [mx] = d3.pointer(event);
      // Find closest data point
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const px = x(domain[i])!;
        const dist = Math.abs(mx - px);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      const d = data[closestIdx];
      const cx = x(d.label)!;
      const cy = y(d.balance);

      hoverGroup.style("display", null);
      hoverGroup
        .select("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("fill", d.balance >= 0 ? "var(--color-positive)" : "var(--color-negative)");

      const svgRect = svgRef.current!.getBoundingClientRect();
      setTooltip({
        x: svgRect.left + MARGIN.left + cx,
        y: svgRect.top + MARGIN.top + cy,
        snapshot: d,
      });
    });

    overlay.on("mouseleave", () => {
      hoverGroup.style("display", "none");
      setTooltip(null);
    });
  }, [data, formatCurrency]);

  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>
          Enter your income and expenses to see your financial timeline
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.title}>12-Month Balance Projection</div>
      <svg ref={svgRef} className={styles.chart} />
      {tooltip && (
        <div
          className={`${styles.tooltip} ${styles.tooltipVisible}`}
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 60,
            transform: "translateX(-50%)",
          }}
        >
          <div className={styles.tooltipLabel}>{tooltip.snapshot.label}</div>
          <div className={styles.tooltipValue}>
            Balance: {formatCurrency(tooltip.snapshot.balance)}
          </div>
          <div className={styles.tooltipValue}>
            Net: {formatCurrency(tooltip.snapshot.net)}/mo
          </div>
        </div>
      )}
    </div>
  );
}
