"use client";
import { useSyncExternalStore } from "react";
import { getServerTalk, getTalk, subscribeTalk } from "../lib/talk-store";

export const useTalk = () =>
  useSyncExternalStore(subscribeTalk, getTalk, getServerTalk);
