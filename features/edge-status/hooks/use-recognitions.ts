"use client";
import { useSyncExternalStore } from "react";
import {
  getRecognitions,
  getServerRecognitions,
  subscribeRecognitions,
} from "../lib/recognition-store";

export const useRecognitions = () =>
  useSyncExternalStore(
    subscribeRecognitions,
    getRecognitions,
    getServerRecognitions,
  );
