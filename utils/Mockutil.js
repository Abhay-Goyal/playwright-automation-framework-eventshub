export class Mockutil {
  constructor(page) {
    this.page = page;
  }

  async mockResonse(url, json = {}, status) {
    this.page.route(`**/*/${url}`, async (route) => {
      await route.fulfill({
        status,
        json,
      });
    });
  }

  async mockNetworkError(url) {
    this.page.route(`**/*/${url}`, async (route) => {
      await route.abort();
    });
  }



  async mockRequest(url , method = "GET"){
     this.page.route(`**/*/${url}`, async (route) => {
      await route.continue({
        method
      });
    })
  }


}
