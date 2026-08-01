export class RegistrationPage{

    constructor(page){
        this.page = page;
        this.email = page.getByRole("textbox", {name = "you@email.com"});
        this.password = page.getByRole("textbox" , {name = "Min 8 chars, uppercase, number & symbol"});
        this.password_guidelines = page.locator("ul#password-guidelines li");
        this.confirm_password = page.getByRole("textbox" , {name = "Repeat your password"});
        this.create_account = page.getByRole("button" , {name = "Create Account"});
        this.sign_in = page.getByRole("link" , {name = "Sign in"});
        this.registration_header = page.getByRole("header" , {name = "Create your account"});
        this.already_have_an_account = page.locator("//a[text()='Sign in']/parent::p"); 
        this.email_error_message = page.getByText('Enter a valid email');
        this.password_error_message = page.getByText('Password does not meet the requirements below');
        this.confirm_password_error_message = page.getByText('Passwords do not match');
        this.already_have_an_account_flash = page.locator("div.pointer-events-auto");
        this.already_have_an_account_flash_message = page.locator("div.pointer-events-auto p");

    }

    async navigate_to_registration_page(){
        await this.page.goto("/register");
    };

   async getPasswordGuidelines(){
        return await this.password_guidelines.allTextContents();
    }

    async navigate_to_login_page(){
        await this.sign_in.click();
    }

    async register_user(email, password, confirm_password){
        await this.email.fill(email);
        await this.password.fill(password);
        await this.confirm_password.fill(confirm_password);
        await this.create_account.click();
    }   

    async click_on_create_account_link(){
        await this.sign_in.click();
    }




}