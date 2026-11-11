"use client";
import { useEffect } from "react";
import {
  clearBreadcrumbLabel,
  setBreadcrumbLabel,
} from "@/lib/breadcrumb-labels";

export const BreadcrumbTitle = ({
  href,
  label,
}: {
  href: string;
  label: string;
}) => {
  useEffect(() => {
    setBreadcrumbLabel(href, label);
    return () => clearBreadcrumbLabel(href);
  }, [href, label]);
  return null;
};
