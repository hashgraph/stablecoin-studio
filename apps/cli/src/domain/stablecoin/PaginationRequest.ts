/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;

export interface IPaginationRequest {
  page: number;
  limit: number;
}

export default class PaginationRequest implements IPaginationRequest {
  public page: number;
  public limit: number;

  constructor(
    {
      page,
      limit,
    }: {
      page: number;
      limit: number;
    } = { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
  ) {
    this.page = this.validatePage(page);
    this.limit = this.validateLimit(limit);
  }

  private validatePage(page: number): number {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }
    return page;
  }
  private validateLimit(limit: number): number {
    if (limit < 1) {
      throw new Error('Limit must be greater than 0');
    }
    return limit;
  }
}
