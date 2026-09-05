import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Topic } from "@/lib/topics";

/** Routes to a topic's hand-built page if it has one, otherwise the generic lesson route. */
export function TopicLink({
  topic,
  className,
  activeProps,
  children,
}: {
  topic: Topic;
  className?: string;
  activeProps?: { className?: string };
  children: ReactNode;
}) {
  const shared = {
    className,
    ...(activeProps ? { activeProps } : {}),
  };

  if (topic.builtIn) {
    return (
      <Link to={topic.builtIn} {...shared}>
        {children}
      </Link>
    );
  }

  return (
    <Link to="/topic/$slug" params={{ slug: topic.slug }} {...shared}>
      {children}
    </Link>
  );
}
