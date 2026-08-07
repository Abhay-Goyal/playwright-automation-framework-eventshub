export class EventsPage{

    constructor(page){
        this.page = page;
        this.search = page.getByPlaceholder("Search events, venues…");
        this.allCategories = page.locator("select.cursor-pointer").nth(0);
        this.allCities = page.locator("select.cursor-pointer").nth(1);
        this.addEvent = page.getByRole('button', { name: 'Add New Event' });
    }

    async searchEvent(eventName){
        await this.search.pressSequentially(eventName ,{delay : 300});
    }

    async selectCountry(categoryName){
       await this.allCategories.selectOption({value : categoryName});
    }

    async selectCity(cityName){
        await this.allCities.selectOption({value : cityName});
    }

    async clickAddEvent(){
        await this.addEvent.click();
    }

}