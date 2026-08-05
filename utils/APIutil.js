export class APIutil {
  constructor(request, page) {
    this.request = request;
    this.page = page;
  }

  async waitForResponse(url, method) {
    const response = this.page.waitForResponse((response) => {
      return (
        response.url().includes(url) && response.request().method() === method
      );
    });

    return response;
  }

  async waitForRequest(url, method) {
    const request = this.page.waitForRequest((request) => {
      return request.url().includes(url) && request.method() === method;
    });
    return request;
  }

  async postRequest(url, data = {}, headers = {}) {
     const response= await this.request.post(url , {
      data : data,
      headers : headers
    });

    return response;
  }

  async deleteRequest(url,headers ={}){
    const response = await this.request.delete(url, {
      headers
    });
    return response;
  }
};
