import type { ReverseParams } from 'named-urls';
import { reverse } from 'named-urls';
import { RoutesMappingUrl } from './RoutesMappingUrl';
import type { NamedRoutes } from './NamedRoutes';
import type { NavigateFunction } from 'react-router-dom';

export class BaseRouterManager {
	constructor(private routes: Record<NamedRoutes, string> = RoutesMappingUrl) {}

	to(
		navigate: NavigateFunction,
		namedUrl: NamedRoutes,
		params?: ReverseParams,
		options?: object,
		extra?: string,
	) {
		return navigate(reverse(`${this.routes[namedUrl]}${extra || ''}`, params), options);
	}

	getUrl(namedUrl: NamedRoutes, params?: ReverseParams, extra?: string) {
		return reverse(`${this.routes[namedUrl]}${extra || ''}`, params);
	}

	goBack(navigate: NavigateFunction) {
		return navigate(-1);
	}
}

export const RouterManager = new BaseRouterManager(RoutesMappingUrl);
