import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A person, as a picture or as their initials.
 *
 * Avatars are the only real images in this application — everything else is
 * inline SVG drawn from the theme. They are also the worst-behaved kind:
 * remote, user-supplied and of entirely unknown dimensions, which is exactly
 * what `next/image` exists for. It resizes and re-encodes them at the edge, so
 * a 4 MB photo someone pasted the URL of does not become a 4 MB download on a
 * hospital corridor connection.
 *
 * `sizes` is given explicitly because the box is a fixed pixel size rather
 * than a share of the viewport; without it Next would request an image sized
 * for the full screen width.
 */
export function UserAvatar({
  name,
  src,
  size = 36,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <Avatar
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          sizes={`${size}px`}
          className="aspect-square size-full rounded-full object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-accent font-semibold text-accent-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
