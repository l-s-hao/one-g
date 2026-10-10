"use client";
import { Component, type ReactNode } from "react";

// Keep an optional effect failure local; stable CSS/text artwork lives outside it.
export default class LocalEffectBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}
