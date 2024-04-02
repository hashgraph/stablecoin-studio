import PaginationRequest from './PaginationRequest';

export interface IPaginationResponse {
  itemCount: number;
  totalItems?: number;
  itemsPerPage: number;
  totalPages?: number;
  currentPage: number;
}

export default class PaginationResponse implements IPaginationResponse {
  public itemCount: number;
  public totalItems?: number;
  public itemsPerPage: number;
  public totalPages?: number;
  public currentPage: number;

  constructor({
    itemCount,
    totalItems,
    itemsPerPage,
    totalPages,
    currentPage,
  }: IPaginationResponse) {
    this.itemsPerPage = this.validateItemsPerPage(itemsPerPage);
    this.totalItems = this.validateTotalItems(totalItems);
    this.totalPages = this.validateTotalPages(totalPages);
    this.itemCount = this.validateItemCount(itemCount, itemsPerPage);
    this.currentPage = this.validateCurrentPage(currentPage, totalPages);
  }

  public next(): PaginationRequest {
    return new PaginationRequest({
      page: this.currentPage + 1,
      limit: this.itemsPerPage,
    });
  }

  public previous(): PaginationRequest {
    return new PaginationRequest({
      page: this.currentPage - 1,
      limit: this.itemsPerPage,
    });
  }

  private validateItemCount(itemCount: number, itemsPerPage: number): number {
    if (itemCount < 1) {
      throw new Error('Item count must be greater than 0');
    }
    if (itemCount > itemsPerPage) {
      throw new Error(
        'Item count must be less than or equal to items per page',
      );
    }
    return itemCount;
  }

  private validateTotalItems(totalItems?: number): number {
    if (totalItems && totalItems < 1) {
      throw new Error('Total items must be greater than 0');
    }
    return totalItems;
  }

  private validateItemsPerPage(itemsPerPage: number): number {
    if (itemsPerPage < 1) {
      throw new Error('Items per page must be greater than 0');
    }
    return itemsPerPage;
  }

  private validateTotalPages(totalPages?: number): number {
    if (totalPages && totalPages < 1) {
      throw new Error('Total pages must be greater than 0');
    }
    return totalPages;
  }

  private validateCurrentPage(
    currentPage: number,
    totalPages?: number,
  ): number {
    if (currentPage < 1) {
      throw new Error('Current page must be greater than 0');
    }
    if (totalPages && currentPage > totalPages) {
      throw new Error('Current page must be less than or equal to total pages');
    }
    return currentPage;
  }
}
