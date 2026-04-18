import { forwardRef } from "react";
import auraOmegaBrand from "@/assets/aura-omega-brand.png";
import { cn } from "@/lib/utils";

type AuraOmegaLogoProps = {
  variant?: "compact" | "default" | "hero";
  subtitle?: string;
  className?: string;
  priority?: "primary" | "muted";
};

export const AuraOmegaLogo = forwardRef<HTMLDivElement, AuraOmegaLogoProps>(
  ({ variant = "default", subtitle, className, priority = "primary" }, ref) => {
    const compact = variant === "compact";
    const hero = variant === "hero";

    return (
      <div ref={ref} className={cn("flex items-center", hero ? "gap-4" : "gap-3", className)}>
        <div
          className={cn(
            "brand-mark relative shrink-0 overflow-hidden",
            compact ? "h-11 w-11 rounded-2xl" : hero ? "h-20 w-20 rounded-[1.75rem]" : "h-12 w-12 rounded-2xl",
          )}
        >
          <img
            src={auraOmegaBrand}
            alt="Aura Omega logo"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="brand-mark-ring pointer-events-none absolute inset-0" aria-hidden="true" />
        </div>

        {!compact && (
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-semibold uppercase leading-none",
                hero ? "text-2xl tracking-[0.24em] md:text-3xl" : "text-sm tracking-[0.22em]",
                priority === "primary" ? "brand-wordmark" : "text-foreground",
              )}
            >
              Aura Omega
            </p>
            {subtitle ? (
              <p
                className={cn(
                  "truncate text-muted-foreground",
                  hero ? "mt-2 text-sm md:text-base" : "mt-1 text-xs",
                )}
              >
                {subtitle}
              </p>
            ) : null}
            <p className={cn("text-muted-foreground/70 italic", hero ? "mt-2 text-xs md:text-sm" : "mt-1 text-[10px]")}>
              Powered by The Grok Father 9.0 aka GROK 9
            </p>
            <p className={cn("text-muted-foreground/50", hero ? "mt-0.5 text-[10px] md:text-xs" : "mt-0.5 text-[9px]")}>
              Made by Ryan Puddy ~ WEB 3 ARCHITECT
            </p>
          </div>
        )}
      </div>
    );
  },
);

AuraOmegaLogo.displayName = "AuraOmegaLogo";
