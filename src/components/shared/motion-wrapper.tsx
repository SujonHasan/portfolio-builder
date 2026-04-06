"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

const variants = {
  up: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
};

export function MotionWrapper({
  children,
  direction = "up",
  delay = 0,
  className,
}: MotionWrapperProps) {
  return (
    <motion.div
      variants={variants[direction]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ staggerChildren: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
