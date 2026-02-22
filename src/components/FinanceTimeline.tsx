"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { MonthlySnapshot } from "@/lib/types";
import styles from "./FinanceTimeline.module.css";

interface Props {
  data: MonthlySnapshot[];
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 60 };
const TRANSITION_MS = 500;

export default function FinanceTimeline({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const initialRender = useRef(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    snapshot: MonthlySnapshot;
  } | null>(null);

  const formatCurrency = useCallback((value: number) => {
    const abs = Math.abs(value);
    const formatted =
      abs >= 1000
        ? `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`
        : abs.toFixed(0);
    return value < 0 ? `-\u00a3${formatted}` : `\u00a3${formatted}`;
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const isFirst = initialRender.current;
    initialRender.current = false;
    const dur = isFirst ? 0 : TRANSITION_MS;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.min(400, width * 0.5);
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Build structure on first render only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let g: d3.Selection<any, unknown, null, undefined> =
      svg.select("g.chart-group");
    if (g.empty()) {
      g = svg
        .append("g")
        .attr("class", "chart-group")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
      g.append("g").attr("class", "grid");
      g.append("line").attr("class", "zero-line");
      g.append("path").attr("class", "area-positive");
      g.append("path").attr("class", "area-negative");
      g.append("path").attr("class", "line");
      g.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${innerHeight})`);
      g.append("g").attr("class", "axis axis-y");
      const hoverGroup = g
        .append("g")
        .attr("class", "hover-group")
        .style("display", "none");
      hoverGroup.append("circle").attr("class", "tooltip-dot").attr("r", 5);
      g.append("rect").attr("class", "overlay");
    }

    // Scales
    const x = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const balanceExtent = d3.extent(data, (d) => d.balance) as [
      number,
      number,
    ];
    const yMin = Math.min(balanceExtent[0], 0);
    const yMax = Math.max(balanceExtent[1], 0);
    const yPadding = (yMax - yMin) * 0.1 || 100;

    const y = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([innerHeight, 0]);

    // Grid — use .call on selection, then transition separately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gridAxis = d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => "") as any;
    g.select("g.grid").transition().duration(dur).call(gridAxis);

    // Zero line
    g.select("line.zero-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .transition()
      .duration(dur)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .style("opacity", yMin < 0 ? 1 : 0);

    // Area generators
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

    // Morph areas
    g.select("path.area-positive")
      .datum(data)
      .transition()
      .duration(dur)
      .attr("d", areaAboveZero as unknown as string);

    g.select("path.area-negative")
      .datum(data)
      .transition()
      .duration(dur)
      .attr("d", areaBelowZero as unknown as string);

    // Line
    const line = d3
      .line<MonthlySnapshot>()
      .x((d) => x(d.label)!)
      .y((d) => y(d.balance))
      .curve(d3.curveMonotoneX);

    const lastBalance = data[data.length - 1]?.balance ?? 0;
    const lineSel = g
      .select("path.line")
      .datum(data)
      .classed("line-positive", lastBalance >= 0)
      .classed("line-negative", lastBalance < 0);

    if (isFirst) {
      lineSel.attr("d", line as unknown as string);
      const pathNode = lineSel.node() as SVGPathElement | null;
      if (pathNode) {
        const totalLength = pathNode.getTotalLength();
        lineSel
          .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(800)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0)
          .on("end", function () {
            d3.select(this).attr("stroke-dasharray", null);
          });
      }
    } else {
      lineSel
        .transition()
        .duration(dur)
        .ease(d3.easeCubicOut)
        .attr("d", line as unknown as string);
    }

    // Axes
    const tickLabels = data
      .filter(
        (_, i) =>
          i % Math.ceil(data.length / 6) === 0 || i === data.length - 1
      )
      .map((d) => d.label);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    g.select("g.axis-x").transition().duration(dur).call(d3.axisBottom(x).tickValues(tickLabels) as any);
    g.select("g.axis-y")
      .transition()
      .duration(dur)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => formatCurrency(d as number)) as any);

    // Hover overlay
    const overlay = g
      .select("rect.overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    const hoverGroup = g.select("g.hover-group");
    const domain = x.domain();

    overlay.on("mousemove", (event: MouseEvent) => {
      const [mx] = d3.pointer(event);
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
        .attr(
          "fill",
          d.balance >= 0 ? "var(--color-positive)" : "var(--color-negative)"
        );

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
