"use client";
import { useEffect } from "react";
import { startEdgeStatus } from "../lib/edge-status-store";
import { startRecognitionStore } from "../lib/recognition-store";

export const EdgeStatusConnector = () => {
  useEffect(() => {
    startRecognitionStore();
    startEdgeStatus();
  }, []);
  return null;
};
