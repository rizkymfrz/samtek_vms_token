"use client";
import { useSyncExternalStore } from "react";
import {
  getAudioFocus,
  getServerAudioFocus,
  subscribeAudioFocus,
} from "../lib/audio-focus";

export const useAudioFocus = () =>
  useSyncExternalStore(subscribeAudioFocus, getAudioFocus, getServerAudioFocus);
