import type { ReverseParams } from "named-urls";
import { reverse } from "named-urls";
import type { History } from "history";
import { RoutesMappingUrl } from "./RoutesMappingUrl";
import { NamedRoutes } from "./NamedRoutes";

export class BaseRouterManager {
  constructor(private routes: Record<NamedRoutes, string> =  RoutesMappingUrl) {
  }

  to(
    history: History,
    namedUrl: NamedRoutes,
    params?: ReverseParams,
    state?: object,
    extra?: string
  ) {
    return history.push(
      reverse(`${this.routes[namedUrl]}${extra || ""}`, params),
      state
    );
  }

  getUrl(namedUrl: NamedRoutes, params?: ReverseParams, extra?: string) {
    return reverse(
      `${this.routes[namedUrl]}${extra || ""}`,
      params
    );
  }
}

export const RouterManager = new BaseRouterManager(RoutesMappingUrl);

