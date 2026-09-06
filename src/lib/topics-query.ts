import { queryOptions } from "@tanstack/react-query";
import { listTopics } from "./topics.functions";

export const topicsQueryOptions = queryOptions({
  queryKey: ["topics"],
  queryFn: () => listTopics(),
  staleTime: 1000 * 60,
});
