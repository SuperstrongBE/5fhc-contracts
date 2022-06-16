import { Contract, Name, TableStore } from "proton-tsc";
import { Config, Item, CURRENT_OWNER_SECONDARY_INDEX } from "./tables";
import { LoyaltyHWMKey, SplitSharePercentKey } from "./fivefhc.constant";

@contract
export class fivefhcvault extends Contract {
    private itemTable: TableStore<Item> = new TableStore<Item>(this.receiver);
    private configTable: TableStore<Config> = new TableStore<Config>(this.receiver);
    
    @action('withdraw')
    withdraw(actor: Name): void {
        // Get the split share
        const splitSharePercent = this.configTable.lowerBound(Name.fromString(SplitSharePercentKey).N);
        if (!splitSharePercent) return
    
        // Get the vaulted amount
        const LoyaltyHWM = this.configTable.lowerBound(Name.fromString(LoyaltyHWMKey).N);
        if (!LoyaltyHWM) return;

        // Get the items owned by actor
        const actorItems: Item[] = this.getCurrentOwnerItems(actor);
    }

    // Note that if there are too many items, trying to fetch all items will fail by taking longer than 30ms on testnet/mainnet
    private getCurrentOwnerItems(owner: Name): Item[] {
        const items: Item[] = []
        let item: Item | null = this.itemTable.getBySecondaryU64(owner.N, CURRENT_OWNER_SECONDARY_INDEX)
    
        while (item != null) {
          items.push(item)
          item = this.itemTable.nextBySecondaryU64(item, CURRENT_OWNER_SECONDARY_INDEX)
        }
        
        return items
    }
}