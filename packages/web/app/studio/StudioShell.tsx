"use client";

import Canvas from "./components/Canvas";
import DeploySheet from "./components/DeploySheet";
import Header from "./components/Header";
import Inspector from "./components/Inspector";
import SourceRail from "./components/SourceRail";
import StatusBar from "./components/StatusBar";
import Toast from "./components/Toast";
import { StudioContext, useStudioProvider } from "./state/useStudio";
import styles from "./studio.module.css";

export default function StudioShell() {
  const ctx = useStudioProvider();
  return (
    <StudioContext.Provider value={ctx}>
      <div className={styles.app}>
        <Header />
        <SourceRail />
        <Canvas />
        <Inspector />
        <StatusBar />
      </div>
      <DeploySheet />
      <Toast />
    </StudioContext.Provider>
  );
}
