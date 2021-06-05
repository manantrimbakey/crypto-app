import { LightningElement, api} from 'lwc';

export default class PageHeader extends LightningElement {
    @api heading;
    @api bodyText;
}
