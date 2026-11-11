"use client";
import { useSyncExternalStore } from "react";
import {
  getBreadcrumbLabels,
  getServerBreadcrumbLabels,
  subscribeBreadcrumbLabels,
} from "@/lib/breadcrumb-labels";

export const useBreadcrumbLabels = () =>
  useSyncExternalStore(
    subscribeBreadcrumbLabels,
    getBreadcrumbLabels,
    getServerBreadcrumbLabels,
  );
