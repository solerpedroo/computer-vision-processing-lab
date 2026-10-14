"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { LabMode } from "@/components/layout/app-sidebar";
import {
  compareOperations,
  computeMetrics,
  getOperations,
  processImage,
  type HistogramChart,
  type MetricsResponse,
  type Operation,
} from "@/lib/api";
import {
  buildCompareRecord,
  buildProcessRecord,
  downloadDataUrl,
  downloadTextFile,
  metricsCsv,
  parseExperimentJson,
  timingCsvProcess,
} from "@/lib/experiment";
import { acceptedImage, loadImageDimensions, MAX_IMAGE_DIMENSION, MAX_UPLOAD_BYTES } from "@/lib/lab-image";
import {
  DEFAULT_OPERATION_A,
  DEFAULT_OPERATION_B,
  filterLabOperations,
  operationDefaults,
  stubOperation,
} from "@/lib/lab-operations";
import { imageMetadata, pngBase64ToFile, type ImageMetadata } from "@/lib/image";

export function clearResultState(setters: {
  setProcessed: (v: string | null) => void;
  setCompareA: (v: string | null) => void;
  setCompareB: (v: string | null) => void;
  setHistogram: (v: HistogramChart | null) => void;
  setOutputSpace: (v: string | null) => void;
  setTiming: (v: { processing: number; request: number } | null) => void;
  setCompareTiming: (v: { a: number; b: number; request: number } | null) => void;
  setMetricsA: (v: MetricsResponse | null) => void;
  setMetricsB: (v: MetricsResponse | null) => void;
}) {
  setters.setProcessed(null);
  setters.setCompareA(null);
  setters.setCompareB(null);
  setters.setHistogram(null);
  setters.setOutputSpace(null);
  setters.setTiming(null);
  setters.setCompareTiming(null);
  setters.setMetricsA(null);
  setters.setMetricsB(null);
}

export function useLabSession() {
  const inputRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<LabMode>("process");
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [operations, setOperations] = useState<readonly Operation[]>([]);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [operationId, setOperationId] = useState(DEFAULT_OPERATION_A);
  const [params, setParams] = useState<Record<string, number | string>>({});
  const [operationIdB, setOperationIdB] = useState(DEFAULT_OPERATION_B);
  const [paramsB, setParamsB] = useState<Record<string, number | string>>({});
  const [histogram, setHistogram] = useState<HistogramChart | null>(null);
  const [outputSpace, setOutputSpace] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [timing, setTiming] = useState<{ processing: number; request: number } | null>(null);
  const [compareTiming, setCompareTiming] = useState<{
    a: number;
    b: number;
    request: number;
  } | null>(null);
  const [metricsA, setMetricsA] = useState<MetricsResponse | null>(null);
  const [metricsB, setMetricsB] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const clearOutputs = useCallback(() => {
    clearResultState({
      setProcessed,
      setCompareA,
      setCompareB,
      setHistogram,
      setOutputSpace,
      setTiming,
      setCompareTiming,
      setMetricsA,
      setMetricsB,
    });
  }, []);

  const syncParamsFromRegistry = useCallback((items: readonly Operation[], opAId: string, opBId: string) => {
    const opA = items.find((item) => item.id === opAId) ?? items.find((item) => item.id === DEFAULT_OPERATION_A);
    const opB = items.find((item) => item.id === opBId) ?? items.find((item) => item.id === DEFAULT_OPERATION_B);
    if (opA) setParams(operationDefaults(opA));
    if (opB) setParamsB(operationDefaults(opB));
  }, []);

  const loadRegistry = useCallback(async () => {
    setRegistryLoading(true);
    setRegistryError(null);
    try {
      const response = await getOperations();
      const items = filterLabOperations(response.operations);
      setOperations(items);
      syncParamsFromRegistry(items, operationId, operationIdB);
    } catch {
      setOperations([]);
      setRegistryError("The operation registry is unavailable.");
    } finally {
      setRegistryLoading(false);
    }
  }, [operationId, operationIdB, syncParamsFromRegistry]);

  useEffect(() => {
    // Registry bootstrap on mount (retry uses loadRegistry).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time API hydration
    void loadRegistry();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  const selectedOperation = operations.find((item) => item.id === operationId) ?? stubOperation(operationId);
  const selectedOperationB = operations.find((item) => item.id === operationIdB) ?? stubOperation(operationIdB);

  const apply = useCallback(
    async (selectedFile: File, nextOperation = operationId, nextParams = params) => {
      setBusy(true);
      setError(null);
      setProcessed(null);
      setHistogram(null);
      setOutputSpace(null);
      setTiming(null);
      try {
        const response = await processImage(selectedFile, nextOperation, nextParams);
        setProcessed(`data:image/png;base64,${response.output_image}`);
        setHistogram(response.histogram);
        setOutputSpace(response.metadata.output_color_space);
        setTiming({ processing: response.processing_ms, request: response.request_ms });
      } catch (reason) {
        setHistogram(null);
        setError(reason instanceof Error ? reason.message : "Image processing failed.");
      } finally {
        setBusy(false);
      }
    },
    [operationId, params],
  );

  const runCompare = useCallback(
    async (selectedFile: File) => {
      setBusy(true);
      setError(null);
      setCompareA(null);
      setCompareB(null);
      setMetricsA(null);
      setMetricsB(null);
      setCompareTiming(null);
      try {
        const response = await compareOperations(
          selectedFile,
          { operation_id: operationId, params },
          { operation_id: operationIdB, params: paramsB },
        );
        setCompareA(`data:image/png;base64,${response.result_a.output_image}`);
        setCompareB(`data:image/png;base64,${response.result_b.output_image}`);
        setCompareTiming({
          a: response.result_a.processing_ms,
          b: response.result_b.processing_ms,
          request: response.request_ms,
        });
        const candidateA = pngBase64ToFile(response.result_a.output_image, "compare-a.png");
        const candidateB = pngBase64ToFile(response.result_b.output_image, "compare-b.png");
        const [metricA, metricB] = await Promise.all([
          computeMetrics(selectedFile, candidateA),
          computeMetrics(selectedFile, candidateB),
        ]);
        setMetricsA(metricA);
        setMetricsB(metricB);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Comparison failed.");
      } finally {
        setBusy(false);
      }
    },
    [operationId, operationIdB, params, paramsB],
  );

  const selectFile = useCallback(
    async (nextFile: File | undefined) => {
      if (!nextFile) {
        setBusy(false);
        return;
      }
      if (!acceptedImage(nextFile)) {
        setError("Choose a PNG or JPEG image.");
        setBusy(false);
        return;
      }
      if (nextFile.size > MAX_UPLOAD_BYTES) {
        setError("Choose an image smaller than 10 MiB.");
        setBusy(false);
        return;
      }
      const preview = URL.createObjectURL(nextFile);
      try {
        const size = await loadImageDimensions(preview);
        if (size.width > MAX_IMAGE_DIMENSION || size.height > MAX_IMAGE_DIMENSION) {
          throw new Error(`Choose an image no larger than ${MAX_IMAGE_DIMENSION} × ${MAX_IMAGE_DIMENSION} pixels.`);
        }

        clearOutputs();

        setOriginal((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return preview;
        });
        setFile(nextFile);
        setMetadata(imageMetadata(nextFile, size));
        setZoom(100);
        setError(null);

        if (mode === "process") {
          await apply(nextFile);
        } else {
          setBusy(false);
        }
      } catch (reason) {
        URL.revokeObjectURL(preview);
        setError(reason instanceof Error ? reason.message : "Image processing failed.");
        setBusy(false);
      }
    },
    [apply, clearOutputs, mode],
  );

  const selectOperation = useCallback(
    (nextId: string) => {
      const nextOperation = operations.find((item) => item.id === nextId);
      setOperationId(nextId);
      setParams(operationDefaults(nextOperation ?? stubOperation(nextId)));
    },
    [operations],
  );

  const selectOperationB = useCallback(
    (nextId: string) => {
      const nextOperation = operations.find((item) => item.id === nextId);
      setOperationIdB(nextId);
      setParamsB(operationDefaults(nextOperation ?? stubOperation(nextId)));
    },
    [operations],
  );

  const exportProcessExperiment = useCallback(() => {
    if (!metadata || !timing) return;
    const record = buildProcessRecord({
      metadata,
      operationId,
      params,
      timing,
      outputColorSpace: outputSpace,
    });
    downloadTextFile(JSON.stringify(record, null, 2), "experiment-record.json", "application/json");
    downloadTextFile(timingCsvProcess(record), "experiment-timing.csv", "text/csv");
    if (original) downloadDataUrl(original, "original.png");
    if (processed) downloadDataUrl(processed, "processed.png");
  }, [metadata, timing, operationId, params, outputSpace, original, processed]);

  const exportCompareExperiment = useCallback(() => {
    if (!metadata || !compareTiming || !metricsA || !metricsB) return;
    const record = buildCompareRecord({
      metadata,
      operationId,
      params,
      operationIdB,
      paramsB,
      timing: compareTiming,
      metricsA,
      metricsB,
    });
    downloadTextFile(JSON.stringify(record, null, 2), "experiment-record.json", "application/json");
    downloadTextFile(metricsCsv(record), "experiment-metrics.csv", "text/csv");
    if (original) downloadDataUrl(original, "original.png");
    if (compareA) downloadDataUrl(compareA, "result-a.png");
    if (compareB) downloadDataUrl(compareB, "result-b.png");
  }, [
    metadata,
    compareTiming,
    metricsA,
    metricsB,
    operationId,
    params,
    operationIdB,
    paramsB,
    original,
    compareA,
    compareB,
  ]);

  const importExperimentFile = useCallback(async (nextFile: File | undefined) => {
    if (!nextFile) return;
    setImportNotice(null);
    setError(null);
    try {
      const imported = parseExperimentJson(await nextFile.text());
      setMode(imported.mode);
      setOperationId(imported.operationId);
      setParams(imported.params);
      if (imported.mode === "compare" && imported.operationIdB && imported.paramsB) {
        setOperationIdB(imported.operationIdB);
        setParamsB(imported.paramsB);
      }
      setImportNotice(
        `Loaded ${imported.mode} configuration for "${imported.imageHint.fileName}". Re-upload the same image to reproduce results.`,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not import experiment file.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }, []);

  const reset = useCallback(() => {
    if (original) URL.revokeObjectURL(original);
    setImportNotice(null);
    setFile(null);
    setOriginal(null);
    clearOutputs();
    setMetadata(null);
    setError(null);
    setZoom(100);
    if (inputRef.current) inputRef.current.value = "";
  }, [clearOutputs, original]);

  const openImagePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const openImportPicker = useCallback(() => {
    importRef.current?.click();
  }, []);

  return {
    inputRef,
    importRef,
    importNotice,
    mode,
    setMode,
    file,
    original,
    processed,
    compareA,
    compareB,
    metadata,
    operations,
    registryError,
    registryLoading,
    operationId,
    params,
    setParams,
    operationIdB,
    paramsB,
    setParamsB,
    histogram,
    outputSpace,
    zoom,
    setZoom,
    timing,
    compareTiming,
    metricsA,
    metricsB,
    error,
    busy,
    dragOver,
    setDragOver,
    setBusy,
    selectedOperation,
    selectedOperationB,
    loadRegistry,
    apply,
    runCompare,
    selectFile,
    selectOperation,
    selectOperationB,
    exportProcessExperiment,
    exportCompareExperiment,
    importExperimentFile,
    reset,
    openImagePicker,
    openImportPicker,
  };
}
