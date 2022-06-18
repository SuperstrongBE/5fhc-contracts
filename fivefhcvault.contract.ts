import { Config } from "./config.table";
import { AllowedAccounts } from "./allowedaccounts.table";
import { Contract, Name, print, TableStore } from "proton-tsc";
import { LoyaltyHWMKey, SplitSharePercentKey } from "fivefhc.constant";


@contract
export class fivefhcvault extends Contract {

    private accountTable: TableStore<AllowedAccounts> = AllowedAccounts.GetTable(this.receiver);
    private configTable: TableStore<Config> = Config.GetTable(this.receiver);
    
    @action('withdraw')
    withdraw(actor: Name) {

        //Get the split share
        const splitSharePercent = this.configTable.lowerBound(Name.fromString(SplitSharePercentKey).N);
        if (!splitSharePercent) return
    
        //Get the vaulted amount
        const loyaltyHWM = this.configTable.lowerBound(Name.fromString(LoyaltyHWMKey).N);
        if (!loyaltyHWM) return;

        const amntPerShare = loyaltyHWM.value * splitSharePercent.value
        //Get the asset owned by to
        //const actorCollection:Items = this.itemTable.getBySecondaryIDX64();
        const account = this.accountTable.lowerBound(actor.N);
        if (!account) return;
        const widthdrawAmount:f32 = amntPerShare*account.totalrlm;
        
    }


}