"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface BentoGridProps {
  className?: string
  children?: React.ReactNode
}

interface BentoGridItemProps {
  className?: string
  title: string
  description: string
  header: React.ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {children}
    </div>
  )
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
}: BentoGridItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        className
      )}
    >
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {header}
      </div>
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 tracking-wide">
          {title}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          {description}
        </p>
      </div>
    </motion.div>
  )
}