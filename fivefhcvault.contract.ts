import { Config } from "./config.table";
import { Items } from "./items.table";
import { AllowedMinter } from "./minter.table";
import { Contract, Name, print, TableStore } from "proton-tsc";
import { LoyaltyHWMKey, SplitSharePercentKey } from "fivefhc.constant";


@contract
export class fivefhcvault extends Contract {

    private itemTable: TableStore<Items> = Items.GetTable(this.receiver);
    private configTable: TableStore<Config> = Config.GetTable(this.receiver);
    
    @action('withdraw')
    withdraw(actor: Name) {

        //Get the split share
        const splitSharePercent = this.configTable.lowerBound(Name.fromString(SplitSharePercentKey).N);
        if (!splitSharePercent) return
    
        //Get the vaulted amount
        const LoyaltyHWM = this.configTable.lowerBound(Name.fromString(LoyaltyHWMKey).N);
        if (!LoyaltyHWM) return;

        //Get the asset owned by to
        const actorCollection:Items = this.itemTable.getBySecondaryIDX64();
        print(`index,${actorCollection.}`)
        



    }


}