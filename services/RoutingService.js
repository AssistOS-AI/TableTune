export class RoutingService {
    constructor() {}
    async navigateToLocation(locationArray = [], appName) {
        const TABLE_TUNE = "table-tune";

       if (locationArray.length === 0 || locationArray[0] === TABLE_TUNE) {
            const pageUrl = `${assistOS.space.id}/${appName}/${TABLE_TUNE}`;
            await assistOS.UI.changeToDynamicPage(TABLE_TUNE, pageUrl);
            return;
        }
         if(locationArray[locationArray.length-1]!== TABLE_TUNE){
         console.error(`Invalid URL: URL must end with ${TABLE_TUNE}`);
            return;
        }
        const webComponentName = locationArray[locationArray.length - 1];
        const pageUrl = `${assistOS.space.id}/${appName}/${locationArray.join("/")}`;
        await assistOS.UI.changeToDynamicPage(webComponentName, pageUrl);
    }
}
