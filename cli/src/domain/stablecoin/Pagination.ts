const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;

export default class Pagination {
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

  public next(): Pagination {
    return new Pagination({
      page: this.page + 1,
      limit: this.limit,
    });
  }
  public previous(): Pagination {
    return new Pagination({
      page: this.page - 1,
      limit: this.limit,
    });
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
