import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

/**
 * A switch, used where a binary setting is toggled in place rather than saved
 * with a form — adding and removing a ticket watcher, for instance.
 *
 * Base UI renders a real hidden checkbox beside the track, so it still works
 * without JavaScript and reads correctly to assistive technology.
 */
function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        // 18px, not a percentage: a percentage here would be a fraction of the
        // 16px thumb, and the two insets would not match.
        className="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-checked:translate-x-[18px] data-unchecked:translate-x-0.5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
