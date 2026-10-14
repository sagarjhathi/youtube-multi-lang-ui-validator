import test, { expect, Locator, Page, TestInfo } from "@playwright/test";

class YtLandingPage {

    private page: Page;

    private testInfo: TestInfo;

    private sideMenu: Locator;

    private sideMenuExpandedList: Locator;

    private settingEllipsesButton: Locator;

    public languageDropdownUnderSettings: Locator;

    private languageList: Locator;

    private ellipsesYtLandingPageTopLeft: Locator;

    private sideMenuCollapsedList: Locator;

    private countryCodeOnYtLogoLandingPage: Locator;

    private settingEllipsesOptionsListLandingPage: Locator;

    
    private languageListUpdated: Locator;

    public searchInputLandinfPage: Locator;

    //Cannot use this directly as this banner wouldnt show if yt does not have a search histroy so to show these recommendation banner
    private horizontalScrollBarLandingPage: Locator;

    private locationDropdownUnderSettings: Locator;

    private locationList: Locator;

    private globalFilterButton: Locator;

    private globalFilterData: Locator;

    private closeButtonGlobalFilterPopup: Locator;

    public spinnerUnderSetting:Locator;

    private centerTitle: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;

        this.sideMenu = page.locator("//div[@class='style-scope ytd-mini-guide-renderer']");
        this.sideMenuExpandedList = page.locator("//ytd-guide-entry-renderer[@class='style-scope ytd-guide-section-renderer']");
     //   this.settingEllipsesButton = page.locator("//ytd-topbar-menu-button-renderer[@class='style-scope ytd-masthead style-default']");
     
        this.settingEllipsesButton = page.locator('ytd-topbar-menu-button-renderer a')

        this.languageDropdownUnderSettings = page.locator("(//div[@id='content-icon'])[2]");
        this.languageList = page.locator("//yt-multi-page-menu-section-renderer[@class='style-scope ytd-multi-page-menu-renderer']//ytd-compact-link-renderer").filter({ visible: true });
        this.ellipsesYtLandingPageTopLeft = page.locator("//ytd-topbar-logo-renderer[@id='logo']/preceding-sibling::*[@id='guide-button']");
        this.sideMenuCollapsedList = page.locator("//ytd-mini-guide-renderer[@class='style-scope ytd-app']//ytd-mini-guide-entry-renderer");
        this.countryCodeOnYtLogoLandingPage = page.locator("(//span[@id='country-code'])[1]");
        this.settingEllipsesOptionsListLandingPage = page.locator("//ytd-multi-page-menu-renderer");
        this.languageListUpdated = page.locator("//ytd-multi-page-menu-renderer[@slot='dropdown-content']");
        this.searchInputLandinfPage = page.locator("//input[@class='ytSearchboxComponentInput yt-searchbox-input title']");
        this.horizontalScrollBarLandingPage = page.locator("//div[@id='scroll-container']");
        this.locationDropdownUnderSettings = page.locator("(//div[@id='content-icon'])[4]");
        this.locationList = page.locator("//yt-multi-page-menu-section-renderer[@class='style-scope ytd-multi-page-menu-renderer']//ytd-compact-link-renderer").filter({ visible: true });
        this.globalFilterButton = page.locator("//div[@id='filter-button']");
        this.globalFilterData = page.locator("//ytd-search-filter-options-dialog-renderer[@class='style-scope ytd-popup-container']");
        this.closeButtonGlobalFilterPopup = page.locator("//yt-icon[@icon='close']");
        this.spinnerUnderSetting=page.locator("(//div[@id='spinner']//div[@id='spinnerContainer'])[1]");
        this.centerTitle = page.locator("//h2[@id='title-container']");

    }

    async open(): Promise<void> {
        await this.page.goto("https://www.youtube.com/");
    }

    /** Text of every entry in the collapsed (mini) side menu. */
    async getCollapsedSideMenuTexts(): Promise<string[]> {
        await this.sideMenuCollapsedList.first().waitFor();
        return (await this.sideMenuCollapsedList.allInnerTexts()).map(t => t.trim());
    }

    /** Opens the hamburger menu so the expanded side menu is visible. */
    async expandSideMenu(): Promise<void> {
        await this.ellipsesYtLandingPageTopLeft.click();
        await this.sideMenuExpandedList.first().waitFor();
    }

    /** Text of every entry in the expanded side menu. */
    async getExpandedSideMenuTexts(): Promise<string[]> {
        await this.sideMenuExpandedList.first().waitFor();
        return (await this.sideMenuExpandedList.allInnerTexts()).map(t => t.trim());
    }

    async openSettingsMenu(): Promise<void> {
        await this.settingEllipsesButton.click();
        await this.settingEllipsesOptionsListLandingPage.first().waitFor();
    }

    async openLanguageDropdown(): Promise<void> {
        await this.openSettingsMenu();
        await this.languageDropdownUnderSettings.click();
        await this.languageListUpdated.waitFor();
    }

    /** Text of every language offered in the language dropdown. */
    async getLanguageOptions(): Promise<string[]> {
        await this.languageList.first().waitFor();
        return (await this.languageList.allInnerTexts()).map(t => t.trim());
    }

    /** Picks a language from the open dropdown by its visible name, e.g. "Deutsch". */
    async selectLanguage(languageName: string): Promise<void> {
        await this.languageList.filter({ hasText: languageName }).first().click();
    }

    async getCountryCodee(): Promise<string> {
        return (await this.countryCodeOnYtLogoLandingPage.innerText()).trim();
    }

    async openLocationDropdown(): Promise<void> {
        await this.openSettingsMenu();
        await this.locationDropdownUnderSettings.click();
        await this.locationList.first().waitFor();
    }

    async searchFor(text: string): Promise<void> {
        await this.searchInputLandinfPage.fill(text);
        await this.searchInputLandinfPage.press("Enter");
    }

    async openGlobalFilter(): Promise<void> {
        await this.globalFilterButton.click();
        await this.globalFilterData.waitFor();
    }

    async closeGlobalFilter(): Promise<void> {
        await this.closeButtonGlobalFilterPopup.click();
    }








     public getLanguageElementByName(name:string):Locator {
		let languageLocator:Locator=this.page.locator("//yt-multi-page-menu-section-renderer[@class='style-scope ytd-multi-page-menu-renderer']//yt-formatted-string[@id='label' and text()='" + name + "']");
		console.log("Looking for language element with name: " + name);
		
		return languageLocator;
	}
	
	

		

	public async  clickingUnderSearchInput() :Promise<void>{
		console.log("Clicking into the search bar...");
	
        await this.searchInputLandinfPage.click();
	}

	public async givingInputUnderSearchBar(input :string):Promise<void> {
		console.log("Giving input into the search bar with input as = "+input);
        await this.searchInputLandinfPage.click();
        await this.searchInputLandinfPage.fill(input);
        
	}


	public async clickingGlobalFilterButton():Promise<void> {
		console.log("Clicking on global filter button in landing page..");
        await this.globalFilterButton.click();
	}


	public async clickingLocationDropdownUnderSettings() :Promise<void>{
		console.log("Clicking on location dropdown under settings..");
        await this.locationDropdownUnderSettings.click();


	}





	public async closeGlobalFilterPopup():Promise<void> {
		console.log("Closing the global filter pop-up in landing page..");
        await this.closeButtonGlobalFilterPopup.click();
	}


	public async getLocationList():Promise<Locator[] >{
		console.log("Fetching the location list ...");
		await this.locationList.first().waitFor();
		const allLocations:Locator[] = await this.locationList.all();
		const cleanedList:Locator[] = [];

		for (const location of allLocations) {
			const text = (await location.innerText()).trim();
			if (text !== "") {
				cleanedList.push(location);
			}
		}

		console.log("Fetched the location list, count = " + cleanedList.length);
		return cleanedList;

	}


	/** Waits until the page has finished loading and the top bar is usable. */
	public async waitForPageToLoad() :Promise<void>{
		await this.page.waitForLoadState("load");
		await this.searchInputLandinfPage.waitFor();
		await this.settingEllipsesButton.waitFor();
	}

	public async openingLandingPage():Promise<void> {

		// String url=ConfigManager.get("Url");
		// driver.get(url);
       await this.page.goto('https://www.youtube.com/');
		await this.waitForPageToLoad();
		console.log("Opened YouTube landing page.");
	}


	public async clickingSettingEllipsesButton() :Promise<void> {
		console.log("Clicking settings ellipses button...");
        await this.settingEllipsesButton.click();

	}

	public async clickingLanguageDropdownButton() :Promise<void> {
		console.log("Clicking language dropdown...");
        await this.languageDropdownUnderSettings.click();
	}

	public async gettingLanguageList():Promise<Locator[]> {
		console.log("Fetching available language list...");
		
        await this.languageList.first().waitFor();
        const languageList:Locator[]= await (this.languageList.all());
        const cleanedLanguageList:Locator[]=[];

        for(const language of languageList){
            let text:string= (await language.innerText()).trim();
            if(text!==""){
              cleanedLanguageList.push(language);
            }
        }

        return cleanedLanguageList;

	}


	public async getsettingEllipsesOptionsListLandingPage():Promise<string> {
		console.log("Getting the setting ellipses options");
        const settingEllipsesoptionsListLandingPage:string=(await this.settingEllipsesOptionsListLandingPage.innerText()).trim();
		return settingEllipsesoptionsListLandingPage;
	}


	public async gettingSideMenuExpandedList() :Promise<Locator[]>{
		console.log("Fetching the side menu in expanded view");
        await this.sideMenuExpandedList.first().waitFor();
        const sideMenuList:Locator[]=await this.sideMenuExpandedList.all();
		return sideMenuList;
	}


	public async gettingSideMenuCollapsedList() :Promise<Locator[]>{
		console.log("Fetching the side menu in collapsed view");
        await this.sideMenuCollapsedList.first().waitFor();
        const sideMenuList= await this.sideMenuCollapsedList.all();
		return sideMenuList;
	}


	/** Opens the hamburger menu only if the side menu is not already expanded. */
	public async expandSideMenuIfCollapsed() :Promise<void>{
		if (!(await this.sideMenuExpandedList.first().isVisible())) {
			console.log("Side menu is collapsed, expanding it...");
			await this.ellipsesYtLandingPageTopLeft.click();
		}
	}

	public async clickingLeftEllipses() :Promise<void>{
		console.log("Clicking left ellipses in the landing page");
        await this.ellipsesYtLandingPageTopLeft.click();
	}






	public async getDataFromGlobalFilterPopup() :Promise<string>{
		console.log("Fetching the data from the global filter in landing page");
        const globalFilterData:string =(await this.globalFilterData.innerText()).trim();
		return globalFilterData;
	}





	public async getCountryCode() :Promise<string>{
		console.log("Retrieving country code from YouTube logo...");
        const countryCode=(await this.countryCodeOnYtLogoLandingPage.innerText()).trim();
		console.log("Detected country code: " + countryCode);
		return countryCode;
	}


}
export default YtLandingPage;
