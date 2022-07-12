import { Config } from "./tables/config.table";
import { AllowedAccounts } from "./tables/allowedaccounts.table";
import { Asset, check, Contract, ExtendedAsset, Name, print, Symbol, TableStore } from "proton-tsc";
import { LoyaltyHWMKey, ShareIndexKey, SplitSharePercentKey } from "./fivefhc.constant";
import { sendTransferTokens } from "proton-tsc/token";


@contract
export class fivefhcvault extends Contract {

    private accountTable: TableStore<AllowedAccounts> = AllowedAccounts.GetTable(Name.fromString('fivefhc'));
    private configTable: TableStore<Config> = Config.GetTable(Name.fromString('fivefhc'));
    
    @action('claimincome')
    claimincome(actor: Name):void {

        //Get the split share
        const totalShares = this.configTable.get(Name.fromString(ShareIndexKey).N);
        
        check(!!totalShares, "Config not found: ShareIndexKey")
        if (!totalShares) return
    
        //Get the vaulted amount
        const loyaltyHWM = this.configTable.get(Name.fromString(LoyaltyHWMKey).N);
        check(!!loyaltyHWM, "Config not found: loyaltyHWM")
        if (!loyaltyHWM) return;

        const amntPerShare = loyaltyHWM.value / totalShares.value
        //Get the asset owned by to
        //const actorCollection:Items = this.itemTable.getBySecondaryIDX64();
        const account = this.accountTable.get(actor.N);
        check(!!account, "Unknow account")
        if (!account) return;
        const widthdrawAmount:i64 = (amntPerShare*account.totalrlm)-account.claimedAmnt;
        print(`Claimed amount ${widthdrawAmount}`);
        account.claimedAmnt += widthdrawAmount;
        this.accountTable.update(account,this.receiver);
        sendTransferTokens(Name.fromString('fivefhcvault'),account.key,[new ExtendedAsset(new Asset(widthdrawAmount,new Symbol('XPR',4)),Name.fromString('xtokens'))],'')
        
    }


}