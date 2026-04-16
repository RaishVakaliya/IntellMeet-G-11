"use client"

import * as React from "react"
<<<<<<< HEAD
import * as SeparatorPrimitive from "@radix-ui/react-separator"
=======
import { Separator as SeparatorPrimitive } from "radix-ui"
>>>>>>> 0bcab1727e0ddebe55990aaaa6b42b86e922bf4a

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
