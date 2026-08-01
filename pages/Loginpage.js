export class LoginPage {
  constructor(page) {
    this.page = page;
    this.Email = page.getByRole("textbox", { name: "Email" });
    this.Password = page.getByRole("textbox", { name: "Password" });
    this.Sign_In = page.getByRole("button", { name: "Sign In" });
    this.Register = page.getByRole("link", { name: "Register" });
    this.NoAccountText = page.locator("//a[text()='Register']/parent::p");
    this.LoginBanner = page.locator("body>div:nth-child(1)>div:nth-child(1)");
  }

  async login(username, password) {
    await this.Email.fill(username);
    await this.Password.fill(password);
    await this.Sign_In.click();
  }

  async navigate_to_register_page(){
    await this.Register.click();
  }

  async navigate_to_login_page(){
   await this.page.goto("/login");
  }

  


}
